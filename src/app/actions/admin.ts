'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { saveUploadedFile } from '@/lib/upload';

export type AdminState = { error?: string; success?: string } | null;

const str = (fd: FormData, key: string) => String(fd.get(key) ?? '').trim();
const num = (fd: FormData, key: string, fallback = 0) => {
  const v = Number(fd.get(key));
  return Number.isFinite(v) ? v : fallback;
};
const bool = (fd: FormData, key: string) => fd.get(key) === 'on' || fd.get(key) === 'true';

function slugify(input: string) {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9ก-๙\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 60) || `course-${Date.now()}`
  );
}

/* ---------------------------------- คอร์ส --------------------------------- */

export async function createCourseAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  let newId: string;
  try {
    await requireAdmin();
    const title = str(formData, 'title');
    if (!title) return { error: 'กรุณากรอกชื่อคอร์ส' };

    const subjectId = str(formData, 'subjectId');
    if (!subjectId) return { error: 'กรุณาเลือกวิชา' };

    let slug = str(formData, 'slug') || slugify(title);
    if (await prisma.course.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        subtitle: str(formData, 'subtitle') || null,
        description: str(formData, 'description'),
        subjectId,
        level: str(formData, 'level') || 'ม.ปลาย',
        price: num(formData, 'price'),
        comparePrice: num(formData, 'comparePrice') || null,
        accessDays: num(formData, 'accessDays', 180),
        teacherName: str(formData, 'teacherName'),
        teacherBio: str(formData, 'teacherBio') || null,
        totalHours: num(formData, 'totalHours'),
        isPublished: bool(formData, 'isPublished'),
        isFeatured: bool(formData, 'isFeatured'),
      },
    });
    newId = course.id;
  } catch {
    return { error: 'สร้างคอร์สไม่สำเร็จ' };
  }

  revalidatePath('/admin/courses');
  redirect(`/admin/courses/${newId}`);
}

export async function updateCourseAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  try {
    await requireAdmin();
    const id = str(formData, 'id');
    const cover = formData.get('coverImage') as File | null;
    const coverUrl = cover && cover.size > 0 ? await saveUploadedFile(cover, 'branding') : undefined;

    // เอกสารประกอบคอร์สทั้งเล่ม ที่นักเรียนดาวน์โหลดได้ก่อนเริ่มเรียน
    const material = formData.get('material') as File | null;
    const materialUrl =
      material && material.size > 0 ? await saveUploadedFile(material, 'sheets') : undefined;

    await prisma.course.update({
      where: { id },
      data: {
        title: str(formData, 'title'),
        subtitle: str(formData, 'subtitle') || null,
        description: str(formData, 'description'),
        subjectId: str(formData, 'subjectId'),
        level: str(formData, 'level'),
        price: num(formData, 'price'),
        comparePrice: num(formData, 'comparePrice') || null,
        accessDays: num(formData, 'accessDays', 180),
        teacherName: str(formData, 'teacherName'),
        teacherBio: str(formData, 'teacherBio') || null,
        totalHours: num(formData, 'totalHours'),
        isPublished: bool(formData, 'isPublished'),
        isFeatured: bool(formData, 'isFeatured'),
        materialTitle: str(formData, 'materialTitle') || null,
        ...(coverUrl ? { coverImage: coverUrl } : {}),
        ...(materialUrl ? { materialUrl } : {}),
      },
    });

    revalidatePath(`/admin/courses/${id}`);
    revalidatePath('/admin/courses');
    return { success: 'บันทึกข้อมูลคอร์สแล้ว' };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ' };
  }
}

export async function deleteCourseAction(formData: FormData) {
  await requireAdmin();
  await prisma.course.delete({ where: { id: str(formData, 'id') } });
  revalidatePath('/admin/courses');
  redirect('/admin/courses');
}

/* ----------------------------------- บท ----------------------------------- */

export async function createChapterAction(formData: FormData) {
  await requireAdmin();
  const courseId = str(formData, 'courseId');
  const count = await prisma.chapter.count({ where: { courseId } });

  await prisma.chapter.create({
    data: {
      courseId,
      title: str(formData, 'title') || `บทที่ ${count + 1}`,
      summary: str(formData, 'summary') || null,
      order: count,
    },
  });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function updateChapterAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, 'id');
  const chapter = await prisma.chapter.update({
    where: { id },
    data: {
      title: str(formData, 'title'),
      summary: str(formData, 'summary') || null,
      order: num(formData, 'order'),
    },
  });
  revalidatePath(`/admin/courses/${chapter.courseId}`);
}

export async function deleteChapterAction(formData: FormData) {
  await requireAdmin();
  const chapter = await prisma.chapter.delete({ where: { id: str(formData, 'id') } });
  revalidatePath(`/admin/courses/${chapter.courseId}`);
}

/* -------------------------------- บทเรียน -------------------------------- */

export async function createLessonAction(formData: FormData) {
  await requireAdmin();
  const chapterId = str(formData, 'chapterId');
  const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });
  if (!chapter) return;

  const count = await prisma.lesson.count({ where: { chapterId } });
  const lesson = await prisma.lesson.create({
    data: {
      chapterId,
      title: str(formData, 'title') || `บทเรียนที่ ${count + 1}`,
      videoProvider: str(formData, 'videoProvider') || 'VIMEO',
      videoId: str(formData, 'videoId'),
      durationMin: num(formData, 'durationMin'),
      order: count,
    },
  });

  revalidatePath(`/admin/courses/${chapter.courseId}`);
  redirect(`/admin/lessons/${lesson.id}`);
}

export async function updateLessonAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  try {
    await requireAdmin();
    const id = str(formData, 'id');
    await prisma.lesson.update({
      where: { id },
      data: {
        title: str(formData, 'title'),
        description: str(formData, 'description') || null,
        videoProvider: str(formData, 'videoProvider'),
        videoId: str(formData, 'videoId'),
        videoUrl: str(formData, 'videoUrl') || null,
        durationMin: num(formData, 'durationMin'),
        isPreview: bool(formData, 'isPreview'),
        order: num(formData, 'order'),
      },
    });
    revalidatePath(`/admin/lessons/${id}`);
    return { success: 'บันทึกบทเรียนแล้ว' };
  } catch {
    return { error: 'บันทึกไม่สำเร็จ' };
  }
}

export async function deleteLessonAction(formData: FormData) {
  await requireAdmin();
  const lesson = await prisma.lesson.delete({
    where: { id: str(formData, 'id') },
    include: { chapter: true },
  });
  revalidatePath(`/admin/courses/${lesson.chapter.courseId}`);
  redirect(`/admin/courses/${lesson.chapter.courseId}`);
}

/* ------------------------------ ชีทประกอบ ------------------------------ */

export async function addAttachmentAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  try {
    await requireAdmin();
    const lessonId = str(formData, 'lessonId');
    const title = str(formData, 'title');
    const file = formData.get('file') as File | null;
    const externalUrl = str(formData, 'fileUrl');

    if (!title) return { error: 'กรุณากรอกชื่อไฟล์' };

    let fileUrl = externalUrl;
    if (file && file.size > 0) {
      fileUrl = (await saveUploadedFile(file, 'sheets')) ?? '';
    }
    if (!fileUrl) return { error: 'กรุณาอัปโหลดไฟล์ หรือใส่ลิงก์ไฟล์' };

    const sizeLabel = file && file.size > 0 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : null;

    await prisma.attachment.create({
      data: { lessonId, title, fileUrl, fileType: 'PDF', sizeLabel },
    });

    revalidatePath(`/admin/lessons/${lessonId}`);
    return { success: 'เพิ่มไฟล์เรียบร้อย' };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'เพิ่มไฟล์ไม่สำเร็จ' };
  }
}

export async function deleteAttachmentAction(formData: FormData) {
  await requireAdmin();
  const a = await prisma.attachment.delete({ where: { id: str(formData, 'id') } });
  revalidatePath(`/admin/lessons/${a.lessonId}`);
}

/* ------------------------------- แบบทดสอบ ------------------------------- */

export async function upsertQuizAction(formData: FormData) {
  await requireAdmin();
  const lessonId = str(formData, 'lessonId');
  const title = str(formData, 'title') || 'แบบทดสอบท้ายบท';
  const passScore = num(formData, 'passScore', 60);

  await prisma.quiz.upsert({
    where: { lessonId },
    create: { lessonId, title, passScore },
    update: { title, passScore },
  });
  revalidatePath(`/admin/lessons/${lessonId}`);
}

export async function deleteQuizAction(formData: FormData) {
  await requireAdmin();
  const quiz = await prisma.quiz.delete({ where: { id: str(formData, 'quizId') } });
  revalidatePath(`/admin/lessons/${quiz.lessonId}`);
}

export async function addQuestionAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  try {
    await requireAdmin();
    const quizId = str(formData, 'quizId');
    const text = str(formData, 'text');
    if (!text) return { error: 'กรุณากรอกโจทย์' };

    const choices = [0, 1, 2, 3]
      .map((i) => str(formData, `choice${i}`))
      .map((t, i) => ({ text: t, index: i }))
      .filter((c) => c.text);

    if (choices.length < 2) return { error: 'ต้องมีตัวเลือกอย่างน้อย 2 ข้อ' };

    const correctIndex = num(formData, 'correctIndex', 0);
    if (!choices.some((c) => c.index === correctIndex)) {
      return { error: 'กรุณาเลือกข้อที่เป็นคำตอบที่ถูกต้อง' };
    }

    const order = await prisma.question.count({ where: { quizId } });

    await prisma.question.create({
      data: {
        quizId,
        text,
        explanation: str(formData, 'explanation') || null,
        order,
        choices: {
          create: choices.map((c, i) => ({
            text: c.text,
            isCorrect: c.index === correctIndex,
            order: i,
          })),
        },
      },
    });

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (quiz) revalidatePath(`/admin/lessons/${quiz.lessonId}`);
    return { success: 'เพิ่มข้อสอบเรียบร้อย' };
  } catch {
    return { error: 'เพิ่มข้อสอบไม่สำเร็จ' };
  }
}

export async function deleteQuestionAction(formData: FormData) {
  await requireAdmin();
  const q = await prisma.question.delete({
    where: { id: str(formData, 'id') },
    include: { quiz: true },
  });
  revalidatePath(`/admin/lessons/${q.quiz.lessonId}`);
}

/* --------------------------- การชำระเงิน --------------------------- */

export async function approvePaymentAction(formData: FormData) {
  const admin = await requireAdmin();
  const paymentId = str(formData, 'paymentId');

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: { include: { course: true } } },
  });
  if (!payment) return;

  const { order } = payment;
  const now = new Date();

  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'APPROVED', reviewedById: admin.id, reviewedAt: now, rejectReason: null },
  });

  await prisma.order.update({ where: { id: order.id }, data: { status: 'PAID' } });

  // เปิดสิทธิ์เรียน ถ้ามีอยู่แล้วให้ต่ออายุจากวันหมดอายุเดิม
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: order.userId, courseId: order.courseId } },
  });

  const base = existing && existing.expiresAt > now ? existing.expiresAt : now;
  const expiresAt = new Date(base.getTime() + order.course.accessDays * 24 * 60 * 60 * 1000);

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: order.userId, courseId: order.courseId } },
    create: {
      userId: order.userId,
      courseId: order.courseId,
      orderId: order.id,
      startsAt: now,
      expiresAt,
      isActive: true,
    },
    update: { expiresAt, isActive: true, orderId: order.id },
  });

  revalidatePath('/admin/payments');
  revalidatePath('/admin');
}

export async function rejectPaymentAction(formData: FormData) {
  const admin = await requireAdmin();
  const paymentId = str(formData, 'paymentId');
  const reason = str(formData, 'reason') || 'ข้อมูลการโอนไม่ตรงกับยอดที่ต้องชำระ';

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return;

  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'REJECTED', rejectReason: reason, reviewedById: admin.id, reviewedAt: new Date() },
  });
  await prisma.order.update({ where: { id: payment.orderId }, data: { status: 'REJECTED' } });

  revalidatePath('/admin/payments');
}

/* ------------------------------ นักเรียน ------------------------------ */

export async function toggleStudentActiveAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, 'id');
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return;

  await prisma.user.update({ where: { id }, data: { isActive: !user.isActive } });
  revalidatePath('/admin/students');
  revalidatePath(`/admin/students/${id}`);
}

/** เปิดสิทธิ์เรียนให้นักเรียนด้วยมือ เช่น กรณีชำระเงินหน้าสถาบัน */
export async function grantEnrollmentAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  try {
    await requireAdmin();
    const userId = str(formData, 'userId');
    const courseId = str(formData, 'courseId');
    if (!courseId) return { error: 'กรุณาเลือกคอร์ส' };

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return { error: 'ไม่พบคอร์ส' };

    const days = num(formData, 'days', course.accessDays) || course.accessDays;
    const now = new Date();
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    const base = existing && existing.expiresAt > now ? existing.expiresAt : now;
    const expiresAt = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId, startsAt: now, expiresAt, isActive: true },
      update: { expiresAt, isActive: true },
    });

    revalidatePath(`/admin/students/${userId}`);
    return { success: `เปิดสิทธิ์เรียนแล้ว ${days} วัน` };
  } catch {
    return { error: 'เปิดสิทธิ์ไม่สำเร็จ' };
  }
}

export async function revokeEnrollmentAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, 'id');
  const enrollment = await prisma.enrollment.update({
    where: { id },
    data: { isActive: false },
  });
  revalidatePath(`/admin/students/${enrollment.userId}`);
}

/* ------------------------------- ตั้งค่าเว็บ ------------------------------- */

export async function updateSettingsAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  try {
    await requireAdmin();

    const logo = formData.get('logo') as File | null;
    const qr = formData.get('promptpayQr') as File | null;
    const logoUrl = logo && logo.size > 0 ? await saveUploadedFile(logo, 'branding') : undefined;
    const qrUrl = qr && qr.size > 0 ? await saveUploadedFile(qr, 'branding') : undefined;

    await prisma.siteSetting.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton' },
      update: {},
    });

    await prisma.siteSetting.update({
      where: { id: 'singleton' },
      data: {
        siteName: str(formData, 'siteName') || 'Aspira Institute',
        tagline: str(formData, 'tagline'),
        aboutText: str(formData, 'aboutText'),
        contactPhone: str(formData, 'contactPhone'),
        contactEmail: str(formData, 'contactEmail'),
        contactLine: str(formData, 'contactLine'),
        contactAddress: str(formData, 'contactAddress'),
        facebookUrl: str(formData, 'facebookUrl'),
        bankName: str(formData, 'bankName'),
        bankBranch: str(formData, 'bankBranch'),
        bankAccountNo: str(formData, 'bankAccountNo'),
        bankAccountName: str(formData, 'bankAccountName'),
        promptpayId: str(formData, 'promptpayId'),
        cardEnabled: bool(formData, 'cardEnabled'),
        ...(logoUrl ? { logoUrl } : {}),
        ...(qrUrl ? { promptpayQrUrl: qrUrl } : {}),
      },
    });

    revalidatePath('/', 'layout');
    return { success: 'บันทึกการตั้งค่าเรียบร้อย' };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ' };
  }
}

/* --------------------------------- วิชา --------------------------------- */

export async function createSubjectAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  try {
    await requireAdmin();
    const name = str(formData, 'name');
    if (!name) return { error: 'กรุณากรอกชื่อวิชา' };

    let slug = str(formData, 'slug') || slugify(name);
    if (await prisma.subject.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;

    const count = await prisma.subject.count();
    await prisma.subject.create({
      data: {
        name,
        slug,
        description: str(formData, 'description') || null,
        colorHex: str(formData, 'colorHex') || '#f43f74',
        order: count,
      },
    });

    revalidatePath('/admin/subjects');
    return { success: 'เพิ่มวิชาเรียบร้อย' };
  } catch {
    return { error: 'เพิ่มวิชาไม่สำเร็จ' };
  }
}

export async function updateSubjectAction(formData: FormData) {
  await requireAdmin();
  await prisma.subject.update({
    where: { id: str(formData, 'id') },
    data: {
      name: str(formData, 'name'),
      description: str(formData, 'description') || null,
      colorHex: str(formData, 'colorHex'),
      isActive: bool(formData, 'isActive'),
      order: num(formData, 'order'),
    },
  });
  revalidatePath('/admin/subjects');
}

export async function deleteSubjectAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, 'id');
  const courses = await prisma.course.count({ where: { subjectId: id } });
  if (courses > 0) return; // ยังมีคอร์สอยู่ในวิชานี้ ลบไม่ได้

  await prisma.subject.delete({ where: { id } });
  revalidatePath('/admin/subjects');
}
