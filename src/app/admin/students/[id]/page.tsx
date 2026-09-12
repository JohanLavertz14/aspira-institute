import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getCourseProgress } from '@/lib/access';
import { daysLeft, formatBaht, formatThaiDate, ORDER_STATUS_LABEL } from '@/lib/format';
import { revokeEnrollmentAction, toggleStudentActiveAction } from '@/app/actions/admin';
import { GrantEnrollmentForm } from './grant-form';

export const dynamic = 'force-dynamic';

export default async function AdminStudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const student = await prisma.user.findUnique({
    where: { id },
    include: {
      enrollments: { include: { course: true }, orderBy: { createdAt: 'desc' } },
      orders: { include: { course: true }, orderBy: { createdAt: 'desc' } },
      attempts: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { quiz: { include: { lesson: true } } },
      },
    },
  });

  if (!student) notFound();

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { title: 'asc' },
    select: { id: true, title: true, accessDays: true },
  });

  const progressList = await Promise.all(
    student.enrollments.map(async (e) => ({
      enrollment: e,
      progress: await getCourseProgress(student.id, e.courseId),
    })),
  );

  return (
    <div className="space-y-6">
      <nav className="text-sm text-ink-soft">
        <Link href="/admin/students" className="hover:text-brand-700">
          ← กลับไปหน้ารายชื่อนักเรียน
        </Link>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{student.name}</h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            {student.email}
            {student.phone && ` · ${student.phone}`}
            {student.gradeLevel && ` · ${student.gradeLevel}`}
            {student.school && ` · ${student.school}`}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            สมัครเมื่อ {formatThaiDate(student.createdAt, true)}
          </p>
        </div>

        <form action={toggleStudentActiveAction}>
          <input type="hidden" name="id" value={student.id} />
          <button type="submit" className={student.isActive ? 'btn-danger btn-sm' : 'btn-primary btn-sm'}>
            {student.isActive ? 'ระงับบัญชีนี้' : 'เปิดใช้งานบัญชีนี้'}
          </button>
        </form>
      </div>

      {/* สิทธิ์เรียนและความคืบหน้า */}
      <section className="card p-6">
        <h2 className="text-lg font-semibold">คอร์สที่มีสิทธิ์เรียน</h2>

        {progressList.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">ยังไม่มีคอร์ส</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {progressList.map(({ enrollment: e, progress }) => {
              const expired = e.expiresAt <= new Date() || !e.isActive;
              return (
                <li key={e.id} className="rounded-2xl border border-ink-line p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{e.course.title}</p>
                      <p className="mt-0.5 text-xs text-ink-soft">
                        หมดอายุ {formatThaiDate(e.expiresAt)}
                        {!expired && ` (เหลือ ${daysLeft(e.expiresAt)} วัน)`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {expired ? (
                        <span className="badge-red">หมดอายุ/ปิดสิทธิ์</span>
                      ) : (
                        <span className="badge-green">ใช้งานอยู่</span>
                      )}
                      {!expired && (
                        <form action={revokeEnrollmentAction}>
                          <input type="hidden" name="id" value={e.id} />
                          <button type="submit" className="btn-danger btn-sm">
                            ปิดสิทธิ์
                          </button>
                        </form>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-ink-soft">
                      <span>
                        เรียนแล้ว {progress.done}/{progress.total} บท
                      </span>
                      <span className="font-medium text-brand-700">{progress.percent}%</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-brand-100">
                      <div
                        className="h-full rounded-full bg-brand-600"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <GrantEnrollmentForm userId={student.id} courses={courses} />
      </section>

      {/* คำสั่งซื้อ */}
      <section className="card overflow-hidden">
        <div className="border-b border-ink-line p-6">
          <h2 className="text-lg font-semibold">คำสั่งซื้อ</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table-basic">
            <thead>
              <tr>
                <th>เลขที่</th>
                <th>คอร์ส</th>
                <th>ยอด</th>
                <th>วันที่</th>
                <th>สถานะ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {student.orders.map((o) => (
                <tr key={o.id}>
                  <td className="font-mono text-xs">{o.code}</td>
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
                  <td className="text-right">
                    <Link href={`/orders/${o.code}`} className="btn-ghost btn-sm">
                      ดูใบสั่งซื้อ
                    </Link>
                  </td>
                </tr>
              ))}
              {student.orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-soft">
                    ยังไม่มีคำสั่งซื้อ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ผลแบบทดสอบล่าสุด */}
      <section className="card p-6">
        <h2 className="text-lg font-semibold">ผลแบบทดสอบล่าสุด</h2>
        {student.attempts.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">ยังไม่มีการทำแบบทดสอบ</p>
        ) : (
          <ul className="mt-4 divide-y divide-ink-line">
            {student.attempts.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-ink">{a.quiz.title}</span>
                  <span className="block text-xs text-ink-soft">{a.quiz.lesson.title}</span>
                </span>
                <span className="text-ink-soft">{formatThaiDate(a.createdAt, true)}</span>
                <span className={a.passed ? 'badge-green' : 'badge-amber'}>
                  {a.score}/{a.total} {a.passed ? 'ผ่าน' : 'ไม่ผ่าน'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
