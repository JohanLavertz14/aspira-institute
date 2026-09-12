import Link from 'next/link';
import { prisma } from '@/lib/db';
import { formatBaht, formatNumber, formatThaiDate, ORDER_STATUS_LABEL } from '@/lib/format';

export const dynamic = 'force-dynamic';

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-ink-soft">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}

export default async function AdminDashboard() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [paidOrders, monthOrders, studentCount, publishedCount, waitingPayments, recentOrders, topCourses] =
    await Promise.all([
      prisma.order.findMany({ where: { status: 'PAID' }, select: { amount: true, createdAt: true } }),
      prisma.order.aggregate({
        where: { status: 'PAID', createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.payment.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
        take: 5,
        include: { order: { include: { user: true, course: true } } },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { user: true, course: true },
      }),
      prisma.enrollment.groupBy({
        by: ['courseId'],
        _count: { courseId: true },
        orderBy: { _count: { courseId: 'desc' } },
        take: 5,
      }),
    ]);

  const totalRevenue = paidOrders.reduce((s, o) => s + o.amount, 0);

  // ยอดขาย 6 เดือนล่าสุด
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: new Intl.DateTimeFormat('th-TH', { month: 'short' }).format(d),
      total: 0,
    };
  });
  for (const o of paidOrders) {
    const key = `${o.createdAt.getFullYear()}-${o.createdAt.getMonth()}`;
    const m = months.find((x) => x.key === key);
    if (m) m.total += o.amount;
  }
  const maxMonth = Math.max(1, ...months.map((m) => m.total));

  const courseTitles = await prisma.course.findMany({
    where: { id: { in: topCourses.map((t) => t.courseId) } },
    select: { id: true, title: true },
  });
  const titleById = new Map(courseTitles.map((c) => [c.id, c.title]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">ภาพรวม</h1>
        <p className="mt-1.5 text-sm text-ink-soft">สรุปยอดขายและงานที่ต้องจัดการวันนี้</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="ยอดขายสะสม" value={formatBaht(totalRevenue)} hint={`${paidOrders.length} คำสั่งซื้อ`} />
        <StatCard
          label="ยอดขายเดือนนี้"
          value={formatBaht(monthOrders._sum.amount ?? 0)}
          hint={`${monthOrders._count} คำสั่งซื้อ`}
        />
        <StatCard label="นักเรียนทั้งหมด" value={`${formatNumber(studentCount)} คน`} />
        <StatCard label="คอร์สที่เผยแพร่" value={`${publishedCount} คอร์ส`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* กราฟยอดขาย */}
        <section className="card p-6">
          <h2 className="text-lg font-semibold">ยอดขาย 6 เดือนล่าสุด</h2>
          <div className="mt-6 flex h-48 items-end gap-3">
            {months.map((m) => (
              <div key={m.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-[11px] text-ink-soft">
                  {m.total > 0 ? formatNumber(m.total) : ''}
                </span>
                <div
                  className="w-full rounded-t-lg bg-brand-500 transition-all"
                  style={{ height: `${Math.max(2, (m.total / maxMonth) * 82)}%` }}
                  title={formatBaht(m.total)}
                />
                <span className="text-xs text-ink-soft">{m.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* คอร์สยอดนิยม */}
        <section className="card p-6">
          <h2 className="text-lg font-semibold">คอร์สที่มีนักเรียนมากที่สุด</h2>
          {topCourses.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">ยังไม่มีข้อมูลการลงทะเบียน</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {topCourses.map((t) => (
                <li key={t.courseId} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 flex-1 truncate">{titleById.get(t.courseId) ?? '-'}</span>
                  <span className="badge-brand shrink-0">{t._count.courseId} คน</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* รอตรวจสอบ */}
      <section className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">รอตรวจสอบการชำระเงิน</h2>
          <Link href="/admin/payments" className="btn-outline btn-sm">
            ดูทั้งหมด
          </Link>
        </div>

        {waitingPayments.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">ไม่มีรายการค้างตรวจสอบ</p>
        ) : (
          <ul className="mt-4 divide-y divide-ink-line">
            {waitingPayments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink">{p.order.user.name}</span>
                  <span className="block text-xs text-ink-soft">
                    {p.order.course.title} · {p.order.code}
                  </span>
                </span>
                <span className="text-sm font-medium">{formatBaht(p.amount)}</span>
                <Link href="/admin/payments" className="btn-primary btn-sm">
                  ตรวจสอบ
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* คำสั่งซื้อล่าสุด */}
      <section className="card overflow-hidden">
        <div className="border-b border-ink-line p-6">
          <h2 className="text-lg font-semibold">คำสั่งซื้อล่าสุด</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table-basic">
            <thead>
              <tr>
                <th>เลขที่</th>
                <th>นักเรียน</th>
                <th>คอร์ส</th>
                <th>ยอด</th>
                <th>วันที่</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td className="font-mono text-xs">{o.code}</td>
                  <td>{o.user.name}</td>
                  <td className="max-w-[220px] truncate">{o.course.title}</td>
                  <td>{formatBaht(o.amount)}</td>
                  <td className="whitespace-nowrap text-ink-soft">{formatThaiDate(o.createdAt)}</td>
                  <td>
                    <span
                      className={
                        o.status === 'PAID'
                          ? 'badge-green'
                          : o.status === 'WAITING_REVIEW'
                            ? 'badge-amber'
                            : o.status === 'REJECTED'
                              ? 'badge-red'
                              : 'badge-gray'
                      }
                    >
                      {ORDER_STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
