import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { readSession } from '@/lib/auth';
import { getCourseProgress } from '@/lib/access';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { daysLeft, formatThaiDate } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'คอร์สของฉัน' };

export default async function MyCoursesPage() {
  const session = await readSession();
  if (!session) redirect('/login?redirectTo=/my-courses');

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    include: { course: { include: { subject: true } } },
  });

  const withProgress = await Promise.all(
    enrollments.map(async (e) => ({
      enrollment: e,
      progress: await getCourseProgress(session.userId, e.courseId),
      expired: e.expiresAt <= new Date() || !e.isActive,
    })),
  );

  const pendingOrders = await prisma.order.count({
    where: { userId: session.userId, status: { in: ['PENDING', 'WAITING_REVIEW'] } },
  });

  return (
    <>
      <SiteHeader />

      <main className="container-page py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">คอร์สของฉัน</h1>
            <p className="mt-2 text-ink-soft">สวัสดี {session.name} เรียนต่อจากที่ค้างไว้ได้เลย</p>
          </div>
          <Link href="/orders" className="btn-outline btn-sm">
            คำสั่งซื้อของฉัน
            {pendingOrders > 0 && (
              <span className="ml-1 rounded-full bg-brand-600 px-2 py-0.5 text-[11px] text-white">
                {pendingOrders}
              </span>
            )}
          </Link>
        </div>

        {withProgress.length === 0 ? (
          <div className="card mt-8 p-12 text-center">
            <p className="font-medium text-ink">ยังไม่มีคอร์สที่เปิดสิทธิ์เรียน</p>
            <p className="mt-1.5 text-sm text-ink-soft">
              ถ้าเพิ่งแจ้งชำระเงินไป กรุณารอแอดมินตรวจสอบสักครู่
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/courses" className="btn-primary">
                เลือกคอร์ส
              </Link>
              <Link href="/orders" className="btn-outline">
                ดูสถานะคำสั่งซื้อ
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {withProgress.map(({ enrollment: e, progress, expired }) => (
              <div key={e.id} className="card overflow-hidden">
                <div
                  className="h-24"
                  style={{
                    background: `linear-gradient(135deg, ${e.course.subject.colorHex} 0%, rgba(28,20,32,0.85) 130%)`,
                  }}
                />
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge-brand">{e.course.subject.name}</span>
                    {expired ? (
                      <span className="badge-red">หมดอายุแล้ว</span>
                    ) : (
                      <span className="badge-green">เหลือ {daysLeft(e.expiresAt)} วัน</span>
                    )}
                  </div>

                  <h2 className="mt-3 font-semibold text-ink">{e.course.title}</h2>
                  <p className="mt-1 text-sm text-ink-soft">{e.course.subtitle}</p>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-ink-soft">
                      <span>
                        เรียนแล้ว {progress.done} จาก {progress.total} บท
                      </span>
                      <span className="font-medium text-brand-700">{progress.percent}%</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-brand-100">
                      <div
                        className="h-full rounded-full bg-brand-600 transition-all"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-ink-soft">
                    ใช้เรียนได้ถึง {formatThaiDate(e.expiresAt)}
                  </p>

                  <div className="mt-4 flex gap-2">
                    {expired ? (
                      <Link href={`/checkout/${e.course.slug}`} className="btn-outline btn-sm">
                        ต่ออายุคอร์ส
                      </Link>
                    ) : (
                      <Link href={`/learn/${e.course.slug}`} className="btn-primary btn-sm">
                        {progress.done > 0 ? 'เรียนต่อ' : 'เริ่มเรียน'}
                      </Link>
                    )}
                    <Link href={`/courses/${e.course.slug}`} className="btn-ghost btn-sm">
                      รายละเอียดคอร์ส
                    </Link>
                    {e.course.materialUrl && !expired && (
                      <a
                        href={e.course.materialUrl}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="btn-ghost btn-sm"
                      >
                        ดาวน์โหลดชีท
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
