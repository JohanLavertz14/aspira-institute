import Link from 'next/link';
import { prisma } from '@/lib/db';
import { formatBaht, formatThaiDate } from '@/lib/format';
import { PaymentActions } from './payment-actions';

export const dynamic = 'force-dynamic';

const TABS = [
  { key: 'PENDING', label: 'รอตรวจสอบ' },
  { key: 'APPROVED', label: 'อนุมัติแล้ว' },
  { key: 'REJECTED', label: 'ไม่อนุมัติ' },
  { key: 'ALL', label: 'ทั้งหมด' },
];

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = 'PENDING' } = await searchParams;

  const payments = await prisma.payment.findMany({
    where: status === 'ALL' ? {} : { status },
    orderBy: { createdAt: 'desc' },
    include: {
      order: { include: { user: true, course: true } },
      reviewedBy: { select: { name: true } },
    },
  });

  const counts = await prisma.payment.groupBy({ by: ['status'], _count: true });
  const countOf = (key: string) =>
    key === 'ALL'
      ? counts.reduce((s, c) => s + c._count, 0)
      : (counts.find((c) => c.status === key)?._count ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">ตรวจสอบการชำระเงิน</h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          กดอนุมัติเพื่อเปิดสิทธิ์เรียนให้นักเรียนโดยอัตโนมัติตามจำนวนวันของคอร์ส
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/payments?status=${t.key}`}
            className={status === t.key ? 'badge-brand' : 'badge-gray hover:bg-brand-50'}
          >
            {t.label} ({countOf(t.key)})
          </Link>
        ))}
      </div>

      {payments.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="font-medium text-ink">ไม่มีรายการในหมวดนี้</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((p) => (
            <div key={p.id} className="card p-5">
              <div className="flex flex-wrap gap-5">
                {/* สลิป */}
                {p.slipUrl ? (
                  <a href={p.slipUrl} target="_blank" rel="noreferrer" className="shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.slipUrl}
                      alt="สลิปการโอน"
                      className="h-40 w-32 rounded-xl border border-ink-line object-cover transition hover:opacity-90"
                    />
                    <span className="mt-1.5 block text-center text-xs text-brand-700">
                      กดเพื่อดูเต็ม
                    </span>
                  </a>
                ) : (
                  <div className="grid h-40 w-32 shrink-0 place-items-center rounded-xl border border-dashed border-ink-line text-center text-xs text-ink-soft/70">
                    ไม่มีสลิป
                    <br />
                    (บันทึกโดยแอดมิน)
                  </div>
                )}

                {/* ข้อมูล */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-ink-soft">{p.order.code}</span>
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
                  </div>

                  <h2 className="mt-2 font-semibold text-ink">{p.order.course.title}</h2>

                  <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                    <div className="flex gap-2">
                      <dt className="w-24 shrink-0 text-ink-soft">นักเรียน</dt>
                      <dd>
                        <Link
                          href={`/admin/students/${p.order.userId}`}
                          className="text-brand-700 hover:underline"
                        >
                          {p.order.user.name}
                        </Link>
                      </dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-24 shrink-0 text-ink-soft">อีเมล</dt>
                      <dd className="truncate">{p.order.user.email}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-24 shrink-0 text-ink-soft">ยอดที่ต้องชำระ</dt>
                      <dd className="font-medium">{formatBaht(p.order.amount)}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-24 shrink-0 text-ink-soft">ยอดที่แจ้ง</dt>
                      <dd className="font-medium">{formatBaht(p.amount)}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-24 shrink-0 text-ink-soft">เวลาที่โอน</dt>
                      <dd>{formatThaiDate(p.paidAt, true)}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-24 shrink-0 text-ink-soft">แจ้งเมื่อ</dt>
                      <dd>{formatThaiDate(p.createdAt, true)}</dd>
                    </div>
                  </dl>

                  {p.payerNote && (
                    <p className="mt-3 rounded-xl bg-brand-50 px-3.5 py-2.5 text-sm text-ink-soft">
                      หมายเหตุจากนักเรียน: {p.payerNote}
                    </p>
                  )}

                  {p.status !== 'PENDING' && (
                    <p className="mt-3 text-xs text-ink-soft">
                      ตรวจสอบโดย {p.reviewedBy?.name ?? '-'} เมื่อ{' '}
                      {p.reviewedAt ? formatThaiDate(p.reviewedAt, true) : '-'}
                      {p.rejectReason && ` · เหตุผล: ${p.rejectReason}`}
                    </p>
                  )}

                  {p.status === 'PENDING' && <PaymentActions paymentId={p.id} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
