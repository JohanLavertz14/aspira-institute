import Link from 'next/link';
import { prisma } from '@/lib/db';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CourseCard, type CourseCardData } from '@/components/course-card';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'คอร์สเรียนทั้งหมด' };

const LEVELS = ['ม.ต้น', 'ม.ปลาย'];

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; level?: string; q?: string }>;
}) {
  const { subject, level, q } = await searchParams;

  const subjects = await prisma.subject.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  const courses = await prisma.course.findMany({
    where: {
      isPublished: true,
      ...(subject ? { subject: { slug: subject } } : {}),
      ...(level ? { level } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { subtitle: { contains: q } },
              { description: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }],
    include: {
      subject: true,
      chapters: { include: { _count: { select: { lessons: true } } } },
    },
  });

  const cards: CourseCardData[] = courses.map((c) => ({
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

  const buildHref = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { subject, level, q, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const qs = params.toString();
    return qs ? `/courses?${qs}` : '/courses';
  };

  return (
    <>
      <SiteHeader />

      <main className="container-page py-12">
        <h1 className="text-3xl font-semibold tracking-tight">คอร์สเรียนทั้งหมด</h1>
        <p className="mt-2 text-ink-soft">
          พบ {cards.length} คอร์ส {subject && `ในวิชาที่เลือก`}
        </p>

        {/* ตัวกรอง */}
        <div className="mt-8 space-y-4">
          <form className="flex gap-2" action="/courses">
            {subject && <input type="hidden" name="subject" value={subject} />}
            {level && <input type="hidden" name="level" value={level} />}
            <input
              name="q"
              defaultValue={q ?? ''}
              className="input max-w-sm"
              placeholder="ค้นหาชื่อคอร์ส เช่น เคมี ม.4"
            />
            <button type="submit" className="btn-primary">
              ค้นหา
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            <Link
              href={buildHref({ subject: undefined })}
              className={!subject ? 'badge-brand' : 'badge-gray hover:bg-brand-50'}
            >
              ทุกวิชา
            </Link>
            {subjects.map((s) => (
              <Link
                key={s.id}
                href={buildHref({ subject: s.slug })}
                className={subject === s.slug ? 'badge-brand' : 'badge-gray hover:bg-brand-50'}
              >
                {s.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={buildHref({ level: undefined })}
              className={!level ? 'badge-brand' : 'badge-gray hover:bg-brand-50'}
            >
              ทุกระดับชั้น
            </Link>
            {LEVELS.map((l) => (
              <Link
                key={l}
                href={buildHref({ level: l })}
                className={level === l ? 'badge-brand' : 'badge-gray hover:bg-brand-50'}
              >
                {l}
              </Link>
            ))}
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="card mt-10 p-12 text-center">
            <p className="font-medium text-ink">ยังไม่มีคอร์สที่ตรงกับเงื่อนไขนี้</p>
            <p className="mt-1.5 text-sm text-ink-soft">ลองเปลี่ยนวิชาหรือคำค้นหาดูอีกครั้ง</p>
            <Link href="/courses" className="btn-outline mt-6">
              ล้างตัวกรอง
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <CourseCard key={c.slug} course={c} />
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
