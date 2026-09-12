import Link from 'next/link';
import { prisma } from '@/lib/db';
import { getSiteSettings } from '@/lib/settings';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CourseCard, type CourseCardData } from '@/components/course-card';

export const dynamic = 'force-dynamic';

const STEPS = [
  {
    title: 'สมัครสมาชิก',
    desc: 'ใช้อีเมลและรหัสผ่าน สมัครฟรีไม่มีค่าใช้จ่าย',
  },
  {
    title: 'เลือกคอร์สและชำระเงิน',
    desc: 'โอนผ่านธนาคารหรือพร้อมเพย์ แล้วแจ้งชำระเงินพร้อมแนบสลิปในระบบ',
  },
  {
    title: 'รอแอดมินอนุมัติ',
    desc: 'เมื่อตรวจสอบสลิปแล้ว ระบบจะเปิดสิทธิ์เรียนให้อัตโนมัติ',
  },
  {
    title: 'เรียนได้ทันที',
    desc: 'ดูคลิป โหลดชีท ทำแบบทดสอบ และถามครูใต้คลิปได้ตลอดอายุคอร์ส',
  },
];

export default async function HomePage() {
  const [settings, subjects, featured, courseCount, lessonCount] = await Promise.all([
    getSiteSettings(),
    prisma.subject.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: { _count: { select: { courses: { where: { isPublished: true } } } } },
    }),
    prisma.course.findMany({
      where: { isPublished: true, isFeatured: true },
      orderBy: { order: 'asc' },
      take: 6,
      include: {
        subject: true,
        chapters: { include: { _count: { select: { lessons: true } } } },
      },
    }),
    prisma.course.count({ where: { isPublished: true } }),
    prisma.lesson.count(),
  ]);

  const featuredCards: CourseCardData[] = featured.map((c) => ({
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle,
    price: c.price,
    comparePrice: c.comparePrice,
    level: c.level,
    totalHours: c.totalHours,
    coverImage: c.coverImage,
    teacherName: c.teacherName,
    lessonCount: c.chapters.reduce((sum, ch) => sum + ch._count.lessons, 0),
    subject: { name: c.subject.name, colorHex: c.subject.colorHex },
  }));

  return (
    <>
      <SiteHeader />

      <main>
        {/* ส่วนหัวหน้าแรก */}
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
          <div className="container-page grid items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
            <div>
              <span className="badge-brand">คอร์สเรียนออนไลน์</span>
              <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
                เรียนกับ{' '}
                <span className="bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
                  {settings.siteName}
                </span>
                <br />
                ทบทวนซ้ำได้ทุกที่ทุกเวลา
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
                {settings.tagline ||
                  'คอร์สเรียนออนไลน์ที่ออกแบบจากห้องเรียนจริง พร้อมชีทสรุป แบบฝึกหัด และแบบทดสอบท้ายบททุกบท'}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/courses" className="btn-primary">
                  ดูคอร์สทั้งหมด
                </Link>
                <Link href="/register" className="btn-outline">
                  สมัครสมาชิกฟรี
                </Link>
              </div>

              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-ink-line pt-6">
                {[
                  ['คอร์สที่เปิดสอน', `${courseCount} คอร์ส`],
                  ['บทเรียนทั้งหมด', `${lessonCount} บท`],
                  ['วิชาที่เปิดสอน', `${subjects.length} วิชา`],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-ink-soft">{label}</dt>
                    <dd className="mt-1 text-xl font-semibold text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative">
              <div className="card overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 p-6 text-white">
                  <div className="flex h-full flex-col justify-between">
                    <span className="text-xs uppercase tracking-[0.2em] text-white/70">
                      ตัวอย่างหน้าเรียน
                    </span>
                    <div>
                      <p className="text-lg font-semibold">บทที่ 1 เซต</p>
                      <p className="text-sm text-white/80">ความหมายของเซตและการเขียนเซต</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 p-5">
                  {[
                    ['ความหมายของเซตและการเขียนเซต', 'เรียนจบแล้ว'],
                    ['ยูเนียน อินเตอร์เซกชัน คอมพลีเมนต์', 'กำลังเรียน'],
                    ['โจทย์ประยุกต์ด้วยแผนภาพเวนน์', 'ยังไม่เริ่ม'],
                  ].map(([title, status], i) => (
                    <div key={title} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2.5 text-sm text-ink">
                        <span
                          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${
                            i === 0
                              ? 'bg-emerald-100 text-emerald-700'
                              : i === 1
                                ? 'bg-brand-100 text-brand-700'
                                : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {i + 1}
                        </span>
                        <span className="line-clamp-1">{title}</span>
                      </span>
                      <span className="shrink-0 text-xs text-ink-soft">{status}</span>
                    </div>
                  ))}
                  <div className="pt-2">
                    <div className="h-2 overflow-hidden rounded-full bg-brand-100">
                      <div className="h-full w-1/3 rounded-full bg-brand-600" />
                    </div>
                    <p className="mt-2 text-xs text-ink-soft">ความคืบหน้า 33%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* วิชาที่เปิดสอน */}
        <section id="subjects" className="container-page py-16">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">วิชาที่เปิดสอน</h2>
          <p className="mt-2 text-ink-soft">เลือกวิชาที่สนใจเพื่อดูคอร์สทั้งหมดในวิชานั้น</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((s) => (
              <Link
                key={s.id}
                href={`/courses?subject=${s.slug}`}
                className="card flex items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span
                  className="mt-0.5 h-10 w-10 shrink-0 rounded-xl"
                  style={{ background: `${s.colorHex}1a`, border: `1px solid ${s.colorHex}40` }}
                />
                <span>
                  <span className="block font-semibold text-ink">{s.name}</span>
                  <span className="mt-1 block text-sm text-ink-soft">{s.description}</span>
                  <span className="mt-2 block text-xs text-brand-700">
                    {s._count.courses} คอร์ส
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* คอร์สแนะนำ */}
        <section className="bg-brand-50/40 py-16">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">คอร์สแนะนำ</h2>
                <p className="mt-2 text-ink-soft">คอร์สที่นักเรียนเลือกเรียนมากที่สุดในตอนนี้</p>
              </div>
              <Link href="/courses" className="btn-outline btn-sm">
                ดูทั้งหมด
              </Link>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCards.map((c) => (
                <CourseCard key={c.slug} course={c} />
              ))}
            </div>
          </div>
        </section>

        {/* ขั้นตอนการสมัครเรียน */}
        <section id="how" className="container-page py-16">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">เรียนกับเราอย่างไร</h2>
          <p className="mt-2 text-ink-soft">ตั้งแต่สมัครจนถึงเริ่มเรียน ใช้เวลาไม่นาน</p>

          <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="card p-5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold text-ink">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{step.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* เกี่ยวกับสถาบัน */}
        {settings.aboutText && (
          <section className="container-page pb-8">
            <div className="card bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white sm:p-12">
              <h2 className="text-2xl font-semibold tracking-tight">เกี่ยวกับ {settings.siteName}</h2>
              <p className="mt-4 max-w-3xl leading-relaxed text-white/85">{settings.aboutText}</p>
              <Link
                href="/courses"
                className="btn mt-8 bg-white text-brand-700 hover:bg-brand-50"
              >
                เริ่มเลือกคอร์ส
              </Link>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
