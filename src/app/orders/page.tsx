import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { readSession } from '@/lib/auth';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { formatBaht, formatThaiDate, ORDER_STATUS_LABEL } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'คำสั่งซื้อของฉัน' };

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'PAID'
      ? 'badge-green'
      : status === 'WAITING_REVIEW'
        ? 'badge-amber'
        : status === 'REJECTED'
          ? 'badge-red'
          : 'badge-gray';
  return <span className={cls}>{ORDER_STATUS_LABEL[status] ?? status}</span>;
}

export default async function OrdersPage() {
  const session = await readSession();
  if (!session) redirect('/login?redirectTo=/orders');

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    include: { course: true },
  });

  return (
    <>
      <SiteHeader />

      <main className="container-page py-12">
        <h1 className="text-3xl font-semibold tracking-tight">คำสั่งซื้อของฉัน</h1>
        <p className="mt-2 text-ink-soft">ติดตามสถานะการชำระเงินและการอนุมัติของแต่ละคอร์ส</p>

        {orders.length === 0 ? (
          <div className="card mt-8 p-12 text-center">
            <p className="font-medium text-ink">ยังไม่มีคำสั่งซื้อ</p>
            <p className="mt-1.5 text-sm text-ink-soft">เลือกคอร์สที่สนใจแล้วเริ่มเรียนได้เลย</p>
            <Link href="/courses" className="btn-primary mt-6">
              ดูคอร์สทั้งหมด
            </Link>
          </div>
        ) : (
          <div className="card mt-8 overflow-x-auto">
            <table className="table-basic">
              <thead>
                <tr>
                  <th>เลขที่</th>
                  <th>คอร์ส</th>
                  <th>ยอดชำระ</th>
                  <th>วันที่สั่งซื้อ</th>
                  <th>สถานะ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="font-mono text-xs">{o.code}</td>
                    <td className="min-w-[220px] font-medium">{o.course.title}</td>
                    <td>{formatBaht(o.amount)}</td>
                    <td className="whitespace-nowrap text-ink-soft">{formatThaiDate(o.createdAt)}</td>
                    <td>
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="text-right">
                      <Link href={`/orders/${o.code}`} className="btn-outline btn-sm">
                        {o.status === 'PENDING' ? 'แจ้งชำระเงิน' : 'ดูรายละเอียด'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
