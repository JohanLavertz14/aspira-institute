import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { readSession } from '@/lib/auth';
import { getSiteSettings } from '@/lib/settings';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { formatBaht, formatThaiDate, ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from '@/lib/format';
import { PaymentForm } from './payment-form';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'รายละเอียดคำสั่งซื้อ' };

const STEPS = [
  { key: 'PENDING', label: 'สร้างคำสั่งซื้อ' },
  { key: 'WAITING_REVIEW', label: 'แจ้งชำระเงิน' },
  { key: 'PAID', label: 'อนุมัติและเปิดสิทธิ์เรียน' },
];

export default async function OrderDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const session = await readSession();
  if (!session) redirect(`/login?redirectTo=/orders/${code}`);

  const order = await prisma.order.findUnique({
    where: { code },
    include: {
      course: true,
      payments: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!order || (order.userId !== session.userId && session.role !== 'ADMIN')) notFound();

  const settings = await getSiteSettings();
  const currentStep = order.status === 'PAID' ? 2 : order.status === 'WAITING_REVIEW' ? 1 : 0;
  const latestPayment = order.payments[0];

  return (
    <>
      <SiteHeader />

      <main className="container-page py-12">
        <nav className="text-sm text-ink-soft">
          <Link href="/orders" className="hover:text-brand-700">
            ← กลับไปหน้าคำสั่งซื้อ
          </Link>
        </nav>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">คำสั่งซื้อ {order.code}</h1>
          <span
            className={
              order.status === 'PAID'
                ? 'badge-green'
                : order.status === 'WAITING_REVIEW'
                  ? 'badge-amber'
                  : order.status === 'REJECTED'
                    ? 'badge-red'
                    : 'badge-gray'
            }
          >
            {ORDER_STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>

        {/* ขั้นตอน */}
        <ol className="mt-8 grid gap-3 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li
              key={s.key}
              className={`card p-4 ${i <= currentStep ? 'border-brand-200 bg-brand-50/50' : ''}`}
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-full text-sm font-semibold ${
                  i <= currentStep ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {i + 1}
              </span>
              <p className="mt-3 text-sm font-medium text-ink">{s.label}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            {order.status === 'PAID' && (
              <div className="card border-emerald-200 bg-emerald-50/60 p-6">
                <h2 className="font-semibold text-emerald-800">อนุมัติเรียบร้อยแล้ว</h2>
                <p className="mt-1.5 text-sm text-emerald-700">
                  เปิดสิทธิ์เรียนให้คุณแล้ว เริ่มเรียนได้ทันที
                </p>
                <Link href={`/learn/${order.course.slug}`} className="btn-primary mt-4">
                  เข้าเรียนคอร์สนี้
                </Link>
              </div>
            )}

            {order.status === 'REJECTED' && (
              <div className="card border-red-200 bg-red-50/60 p-6">
                <h2 className="font-semibold text-red-700">การชำระเงินไม่ผ่านการตรวจสอบ</h2>
                <p className="mt-1.5 text-sm text-red-600">
                  {latestPayment?.rejectReason || 'กรุณาตรวจสอบสลิปและแจ้งชำระเงินอีกครั้ง'}
                </p>
              </div>
            )}

            {order.status === 'WAITING_REVIEW' && (
              <div className="card border-amber-200 bg-amber-50/60 p-6">
                <h2 className="font-semibold text-amber-800">รอแอดมินตรวจสอบสลิป</h2>
                <p className="mt-1.5 text-sm text-amber-700">
                  ได้รับข้อมูลการแจ้งชำระเงินแล้ว โดยปกติจะตรวจสอบภายในเวลาทำการ
                  เมื่ออนุมัติแล้วระบบจะเปิดสิทธิ์เรียนให้อัตโนมัติ
                </p>
              </div>
            )}

            {/* ข้อมูลบัญชีสำหรับโอน */}
            {(order.status === 'PENDING' || order.status === 'REJECTED') && (
              <>
                <div className="card mt-6 p-6">
                  <h2 className="text-lg font-semibold">ช่องทางชำระเงิน</h2>
                  <p className="mt-1.5 text-sm text-ink-soft">
                    โอนยอด {formatBaht(order.amount)} มาที่ช่องทางด้านล่าง แล้วแจ้งชำระเงินพร้อมแนบสลิป
                  </p>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-ink-line p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                        โอนผ่านธนาคาร
                      </p>
                      <dl className="mt-3 space-y-1.5 text-sm">
                        <div className="flex justify-between gap-3">
                          <dt className="text-ink-soft">ธนาคาร</dt>
                          <dd className="text-right font-medium">{settings.bankName || '-'}</dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-ink-soft">เลขที่บัญชี</dt>
                          <dd className="text-right font-mono font-medium">
                            {settings.bankAccountNo || '-'}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-ink-soft">ชื่อบัญชี</dt>
                          <dd className="text-right font-medium">{settings.bankAccountName || '-'}</dd>
                        </div>
                        {settings.bankBranch && (
                          <div className="flex justify-between gap-3">
                            <dt className="text-ink-soft">สาขา</dt>
                            <dd className="text-right font-medium">{settings.bankBranch}</dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    <div className="rounded-xl border border-ink-line p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                        พร้อมเพย์
                      </p>
                      {settings.promptpayQrUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={settings.promptpayQrUrl}
                          alt="QR พร้อมเพย์"
                          className="mt-3 h-40 w-40 rounded-lg border border-ink-line object-contain"
                        />
                      ) : (
                        <div className="mt-3 grid h-40 w-40 place-items-center rounded-lg border border-dashed border-ink-line text-center text-xs text-ink-soft/70">
                          ยังไม่ได้อัปโหลด
                          <br />
                          รูป QR พร้อมเพย์
                        </div>
                      )}
                      <p className="mt-3 text-sm">
                        <span className="text-ink-soft">พร้อมเพย์ </span>
                        <span className="font-mono font-medium">{settings.promptpayId || '-'}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <PaymentForm code={order.code} amount={order.amount} />
              </>
            )}

            {/* ประวัติการแจ้งชำระเงิน */}
            {order.payments.length > 0 && (
              <div className="card mt-6 p-6">
                <h2 className="text-lg font-semibold">ประวัติการแจ้งชำระเงิน</h2>
                <ul className="mt-4 space-y-4">
                  {order.payments.map((p) => (
                    <li key={p.id} className="flex flex-wrap gap-4 border-b border-ink-line pb-4 last:border-0 last:pb-0">
                      {p.slipUrl ? (
                        <a href={p.slipUrl} target="_blank" rel="noreferrer" className="shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.slipUrl}
                            alt="สลิปการโอน"
                            className="h-24 w-20 rounded-lg border border-ink-line object-cover"
                          />
                        </a>
                      ) : (
                        <div className="grid h-24 w-20 shrink-0 place-items-center rounded-lg border border-dashed border-ink-line text-[11px] text-ink-soft/70">
                          ไม่มีสลิป
                        </div>
                      )}
                      <div className="min-w-0 flex-1 text-sm">
                        <p className="font-medium">
                          {formatBaht(p.amount)} · โอนเมื่อ {formatThaiDate(p.paidAt, true)}
                        </p>
                        {p.payerNote && <p className="mt-1 text-ink-soft">{p.payerNote}</p>}
                        <p className="mt-1.5">
                          <span
                            className={
                              p.status === 'APPROVED'
                                ? 'badge-green'
                                : p.status === 'REJECTED'
                                  ? 'badge-red'
                                  : 'badge-amber'
                            }
                          >
                            {p.status === 'APPROVED'
                              ? 'อนุมัติแล้ว'
                              : p.status === 'REJECTED'
                                ? 'ไม่อนุมัติ'
                                : 'รอตรวจสอบ'}
                          </span>
                        </p>
                        {p.rejectReason && (
                          <p className="mt-1.5 text-xs text-red-600">เหตุผล: {p.rejectReason}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <h2 className="text-lg font-semibold">สรุปคำสั่งซื้อ</h2>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-soft">คอร์ส</dt>
                  <dd className="text-right font-medium">{order.course.title}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-soft">วิธีชำระเงิน</dt>
                  <dd className="text-right">{PAYMENT_METHOD_LABEL[order.method] ?? order.method}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-soft">วันที่สั่งซื้อ</dt>
                  <dd className="text-right">{formatThaiDate(order.createdAt, true)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-soft">อายุคอร์ส</dt>
                  <dd className="text-right">{order.course.accessDays} วัน</dd>
                </div>
                <div className="flex justify-between border-t border-ink-line pt-3 text-base font-semibold">
                  <dt>ยอดรวม</dt>
                  <dd className="text-brand-700">{formatBaht(order.amount)}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
