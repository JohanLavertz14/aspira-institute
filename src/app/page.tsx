import Link from 'next/link';
import { prisma } from '@/lib/db';
import { getSiteSettings } from '@/lib/settings';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CourseCard, type CourseCardData } from '@/components/course-card';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import { HeroPreview } from '@/components/hero-preview';

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
        {/* ส่วนหัวหน้าแรก กรอบอุปกรณ์จะค่อย ๆ ตั้งตรงขึ้นเมื่อเลื่อนหน้าจอ */}
        <section className="relative overflow-hidden bg-brand-gradient-soft">
          {/* ดวงแสงเบลอเป็นพื้นหลัง ชมพูคู่ส้ม ให้ภาพรวมอบอุ่นและดูมีมิติ */}
          <span className="blob -left-24 -top-28 h-80 w-80 bg-brand-300/45 animate-float" aria-hidden />
          <span
            className="blob -right-16 top-10 h-96 w-96 bg-accent-300/40 animate-float"
            style={{ animationDelay: '2.5s' }}
            aria-hidden
          />
          <span className="blob bottom-32 left-1/3 h-72 w-72 bg-brand-200/40" aria-hidden />

          <div className="container-page relative">
            <ContainerScroll
              titleComponent={
                <div className="px-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-brand-200/70 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-brand-700 shadow-sm backdrop-blur">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
                    </span>
                    เปิดรับสมัครแล้ว คอร์สเรียนออนไลน์
                  </span>

                  <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
                    เรียนกับ <span className="text-gradient">{settings.siteName}</span>
                    <br />
                    ทบทวนซ้ำได้ทุกที่ทุกเวลา
                  </h1>

                  <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-soft">
                    {settings.tagline ||
                      'คอร์สเรียนออนไลน์ที่ออกแบบจากห้องเรียนจริง พร้อมชีทสรุป แบบฝึกหัด และแบบทดสอบท้ายบททุกบท'}
                  </p>

                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link href="/courses" className="btn-primary">
                      ดูคอร์สทั้งหมด
                    </Link>
                    <Link href="/register" className="btn-outline">
                      สมัครสมาชิกฟรี
                    </Link>
                  </div>

                  <dl className="mx-auto mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-brand-200/60 pt-6">
                    {[
                      ['คอร์สที่เปิดสอน', `${courseCount} คอร์ส`],
                      ['บทเรียนทั้งหมด', `${lessonCount} บท`],
                      ['วิชาที่เปิดสอน', `${subjects.length} วิชา`],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-xs text-ink-soft">{label}</dt>
                        <dd className="mt-1 text-xl font-semibold text-gradient">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              }
            >
              <HeroPreview />
            </ContainerScroll>
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
                className="card-interactive flex items-start gap-4 p-5"
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
        <section className="bg-brand-gradient-soft py-16">
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
              <li key={step.title} className="card-interactive p-5">
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
            <div className="card overflow-hidden bg-brand-gradient p-8 text-white sm:p-12">
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
