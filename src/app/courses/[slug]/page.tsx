import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { readSession } from '@/lib/auth';
import { getEnrollment } from '@/lib/access';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { formatBaht, formatDuration, daysLeft } from '@/lib/format';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug } });
  return { title: course?.title ?? 'ไม่พบคอร์ส' };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      subject: true,
      chapters: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: { attachments: true, quiz: true },
          },
        },
      },
    },
  });

  if (!course || !course.isPublished) notFound();

  const session = await readSession();
  const enrollment = await getEnrollment(session?.userId ?? null, course.id);
  const isActiveEnrollment = !!enrollment && enrollment.isActive && enrollment.expiresAt > new Date();

  const pendingOrder = session
    ? await prisma.order.findFirst({
        where: {
          userId: session.userId,
          courseId: course.id,
          status: { in: ['PENDING', 'WAITING_REVIEW'] },
        },
        orderBy: { createdAt: 'desc' },
      })
    : null;

  const lessons = course.chapters.flatMap((ch) => ch.lessons);
  const totalMinutes = lessons.reduce((s, l) => s + l.durationMin, 0);
  const sheetCount = lessons.reduce((s, l) => s + l.attachments.length, 0);
  const quizCount = lessons.filter((l) => l.quiz).length;
  const firstLesson = lessons[0];

  return (
    <>
      <SiteHeader />

      <main>
        {/* ส่วนหัวคอร์ส */}
        <section
          className="text-white"
          style={{
            background: `linear-gradient(135deg, ${course.subject.colorHex} 0%, #1c1420 120%)`,
          }}
        >
          <div className="container-page py-12 lg:py-16">
            <nav className="mb-6 text-sm text-white/70">
              <Link href="/courses" className="hover:text-white">
                คอร์สทั้งหมด
              </Link>
              <span className="mx-2">/</span>
              <Link href={`/courses?subject=${course.subject.slug}`} className="hover:text-white">
                {course.subject.name}
              </Link>
            </nav>

            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-2">
                <span className="badge bg-white/15 text-white">{course.subject.name}</span>
                <span className="badge bg-white/15 text-white">{course.level}</span>
              </div>
              <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">{course.title}</h1>
              {course.subtitle && <p className="mt-3 text-lg text-white/85">{course.subtitle}</p>}
              <p className="mt-5 text-sm text-white/75">
                สอนโดย {course.teacherName || 'ทีมผู้สอน'} · {lessons.length} บทเรียน ·{' '}
                {formatDuration(totalMinutes)}
              </p>
            </div>
          </div>
        </section>

        <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_360px]">
          {/* เนื้อหา */}
          <div>
            <section>
              <h2 className="text-xl font-semibold">รายละเอียดคอร์ส</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-soft">
                {course.description}
              </p>
            </section>

            <section className="mt-10">
              <h2 className="text-xl font-semibold">สิ่งที่ได้รับ</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  `คลิปบทเรียน ${lessons.length} บท รวม ${formatDuration(totalMinutes)}`,
                  ...(course.materialUrl ? ['เอกสารประกอบคอร์สทั้งเล่ม ดาวน์โหลดได้ก่อนเริ่มเรียน'] : []),
                  ...(sheetCount > 0 ? [`ชีทสรุปและแบบฝึกหัดรายบท ${sheetCount} ไฟล์`] : []),
                  `แบบทดสอบท้ายบท ${quizCount} ชุด ตรวจคำตอบอัตโนมัติ`,
                  `เรียนซ้ำได้ ${course.accessDays} วันนับจากวันที่อนุมัติ`,
                  'ถามครูใต้คลิปได้ทุกบทเรียน',
                  'ระบบบันทึกความคืบหน้าให้อัตโนมัติ',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ink-soft">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {course.materialUrl && (
              <section className="mt-10">
                <h2 className="text-xl font-semibold">เอกสารประกอบคอร์ส</h2>
                <p className="mt-1.5 text-sm text-ink-soft">
                  ดาวน์โหลดไว้ก่อนเริ่มเรียน แล้วเปิดอ่านตามไปพร้อมคลิปได้เลย
                </p>

                <div className="card mt-4 flex flex-wrap items-center gap-4 p-5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-100 text-xs font-bold text-brand-700">
                    PDF
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-ink">
                      {course.materialTitle || 'เอกสารประกอบคอร์ส'}
                    </span>
                    <span className="mt-0.5 block text-sm text-ink-soft">
                      {isActiveEnrollment
                        ? 'ดาวน์โหลดได้ไม่จำกัดตลอดอายุคอร์ส'
                        : 'ดาวน์โหลดได้หลังสมัครเรียนคอร์สนี้'}
                    </span>
                  </span>
                  {isActiveEnrollment ? (
                    <a
                      href={course.materialUrl}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="btn-primary btn-sm shrink-0"
                    >
                      ดาวน์โหลด
                    </a>
                  ) : (
                    <Link href={`/checkout/${course.slug}`} className="btn-outline btn-sm shrink-0">
                      สมัครเรียนเพื่อดาวน์โหลด
                    </Link>
                  )}
                </div>
              </section>
            )}

            <section className="mt-10">
              <h2 className="text-xl font-semibold">เนื้อหาในคอร์ส</h2>
              <p className="mt-1.5 text-sm text-ink-soft">
                {course.chapters.length} บท · {lessons.length} บทเรียน
              </p>

              <div className="mt-5 space-y-4">
                {course.chapters.map((ch) => (
                  <div key={ch.id} className="card overflow-hidden">
                    <div className="border-b border-ink-line bg-brand-50/50 px-5 py-4">
                      <h3 className="font-semibold text-ink">{ch.title}</h3>
                      {ch.summary && <p className="mt-1 text-sm text-ink-soft">{ch.summary}</p>}
                    </div>
                    <ul className="divide-y divide-ink-line/70">
                      {ch.lessons.map((l) => (
                        <li key={l.id} className="flex items-center gap-3 px-5 py-3.5">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-ink">
                              {l.title}
                            </span>
                            <span className="mt-0.5 block text-xs text-ink-soft">
                              {formatDuration(l.durationMin)}
                              {l.attachments.length > 0 && ` · ชีท ${l.attachments.length} ไฟล์`}
                              {l.quiz && ' · มีแบบทดสอบ'}
                            </span>
                          </span>
                          {l.isPreview ? (
                            <Link
                              href={`/learn/${course.slug}/${l.id}`}
                              className="badge-green shrink-0 hover:bg-emerald-100"
                            >
                              ดูตัวอย่างฟรี
                            </Link>
                          ) : (
                            <span className="shrink-0 text-ink-soft/60" title="ต้องซื้อคอร์สก่อน">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="4" y="10" width="16" height="10" rx="2" />
                                <path d="M8 10V7a4 4 0 018 0v3" />
                              </svg>
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {course.teacherBio && (
              <section className="mt-10">
                <h2 className="text-xl font-semibold">ผู้สอน</h2>
                <div className="card mt-4 flex gap-4 p-5">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700">
                    {course.teacherName.slice(0, 1) || 'A'}
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{course.teacherName}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{course.teacherBio}</p>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* กล่องราคาและปุ่มสมัคร */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <div className="flex items-end gap-3">
                <span className="text-3xl font-semibold text-brand-700">{formatBaht(course.price)}</span>
                {course.comparePrice && course.comparePrice > course.price && (
                  <span className="pb-1 text-sm text-ink-soft line-through">
                    {formatBaht(course.comparePrice)}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm text-ink-soft">
                เรียนได้ {course.accessDays} วันนับจากวันที่อนุมัติการชำระเงิน
              </p>

              <div className="mt-6">
                {isActiveEnrollment ? (
                  <>
                    <Link href={`/learn/${course.slug}`} className="btn-primary w-full">
                      เข้าเรียนต่อ
                    </Link>
                    <p className="mt-3 text-center text-xs text-ink-soft">
                      เหลือเวลาเรียนอีก {daysLeft(enrollment!.expiresAt)} วัน
                    </p>
                  </>
                ) : pendingOrder ? (
                  <>
                    <Link href={`/orders/${pendingOrder.code}`} className="btn-primary w-full">
                      {pendingOrder.status === 'PENDING' ? 'ไปหน้าชำระเงิน' : 'ดูสถานะการตรวจสอบ'}
                    </Link>
                    <p className="mt-3 text-center text-xs text-ink-soft">
                      คุณมีคำสั่งซื้อคอร์สนี้อยู่แล้ว ({pendingOrder.code})
                    </p>
                  </>
                ) : session ? (
                  <Link href={`/checkout/${course.slug}`} className="btn-primary w-full">
                    สมัครเรียนคอร์สนี้
                  </Link>
                ) : (
                  <>
                    <Link
                      href={`/login?redirectTo=/checkout/${course.slug}`}
                      className="btn-primary w-full"
                    >
                      เข้าสู่ระบบเพื่อสมัครเรียน
                    </Link>
                    <p className="mt-3 text-center text-xs text-ink-soft">
                      ยังไม่มีบัญชี{' '}
                      <Link href="/register" className="text-brand-700 hover:underline">
                        สมัครสมาชิกฟรี
                      </Link>
                    </p>
                  </>
                )}
              </div>

              {firstLesson?.isPreview && !isActiveEnrollment && (
                <Link
                  href={`/learn/${course.slug}/${firstLesson.id}`}
                  className="btn-outline mt-3 w-full"
                >
                  ดูตัวอย่างบทเรียนฟรี
                </Link>
              )}

              <dl className="mt-6 space-y-2.5 border-t border-ink-line pt-5 text-sm">
                {[
                  ['จำนวนบทเรียน', `${lessons.length} บท`],
                  ['ความยาวรวม', formatDuration(totalMinutes)],
                  ['ชีทประกอบ', `${sheetCount} ไฟล์`],
                  ['แบบทดสอบ', `${quizCount} ชุด`],
                  ['ระดับชั้น', course.level],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-ink-soft">{k}</dt>
                    <dd className="font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
