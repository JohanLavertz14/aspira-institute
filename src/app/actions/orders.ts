'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { generateOrderCode } from '@/lib/access';
import { saveUploadedFile } from '@/lib/upload';

export type ActionState = { error?: string; success?: string } | null;

/** สร้างคำสั่งซื้อคอร์ส แล้วพาไปหน้าชำระเงิน */
export async function createOrderAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let code: string;

  try {
    const user = await requireUser();
    const slug = String(formData.get('slug') ?? '');
    const method = String(formData.get('method') ?? 'BANK_TRANSFER');

    const course = await prisma.course.findUnique({ where: { slug } });
    if (!course || !course.isPublished) return { error: 'ไม่พบคอร์สนี้' };

    // ถ้าซื้อไปแล้วและยังไม่หมดอายุ ไม่ต้องสร้างคำสั่งซื้อซ้ำ
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
    });
    if (enrollment && enrollment.isActive && enrollment.expiresAt > new Date()) {
      return { error: 'คุณมีสิทธิ์เรียนคอร์สนี้อยู่แล้ว' };
    }

    // ถ้ามีคำสั่งซื้อค้างอยู่ ให้ใช้ใบเดิม
    const existing = await prisma.order.findFirst({
      where: {
        userId: user.id,
        courseId: course.id,
        status: { in: ['PENDING', 'WAITING_REVIEW'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      code = existing.code;
    } else {
      const order = await prisma.order.create({
        data: {
          code: generateOrderCode(),
          userId: user.id,
          courseId: course.id,
          amount: course.price,
          method,
          status: 'PENDING',
        },
      });
      code = order.code;
    }
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') redirect('/login');
    return { error: 'สร้างคำสั่งซื้อไม่สำเร็จ กรุณาลองใหม่' };
  }

  redirect(`/orders/${code}`);
}

/** นักเรียนแจ้งชำระเงินพร้อมแนบสลิป */
export async function submitPaymentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const code = String(formData.get('code') ?? '');
    const payerNote = String(formData.get('payerNote') ?? '').trim();
    const paidAtRaw = String(formData.get('paidAt') ?? '');
    const slip = formData.get('slip') as File | null;

    const order = await prisma.order.findUnique({ where: { code } });
    if (!order || order.userId !== user.id) return { error: 'ไม่พบคำสั่งซื้อนี้' };
    if (order.status === 'PAID') return { error: 'คำสั่งซื้อนี้ชำระเงินเรียบร้อยแล้ว' };

    if (!slip || slip.size === 0) return { error: 'กรุณาแนบสลิปการโอนเงิน' };
    const slipUrl = await saveUploadedFile(slip, 'slips');

    const paidAt = paidAtRaw ? new Date(paidAtRaw) : new Date();
    if (Number.isNaN(paidAt.getTime())) return { error: 'วันที่และเวลาที่โอนไม่ถูกต้อง' };

    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.amount,
        slipUrl,
        paidAt,
        payerNote: payerNote || null,
        status: 'PENDING',
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'WAITING_REVIEW' },
    });

    revalidatePath(`/orders/${code}`);
    revalidatePath('/orders');
    return { success: 'แจ้งชำระเงินเรียบร้อย รอแอดมินตรวจสอบสลิป' };
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') redirect('/login');
    return { error: e instanceof Error ? e.message : 'แจ้งชำระเงินไม่สำเร็จ' };
  }
}

/** ยกเลิกคำสั่งซื้อที่ยังไม่ได้ชำระ */
export async function cancelOrderAction(formData: FormData) {
  const user = await requireUser();
  const code = String(formData.get('code') ?? '');

  const order = await prisma.order.findUnique({ where: { code } });
  if (!order || order.userId !== user.id) return;
  if (order.status !== 'PENDING') return;

  await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } });
  revalidatePath('/orders');
  redirect('/orders');
}
