import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { readSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** พาไปยังบทเรียนที่ค้างอยู่ ถ้ายังไม่เคยเรียนให้เริ่มจากบทแรก */
export default async function LearnEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await readSession();

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      chapters: { orderBy: { order: 'asc' }, include: { lessons: { orderBy: { order: 'asc' } } } },
    },
  });
  if (!course) notFound();

  const lessons = course.chapters.flatMap((c) => c.lessons);
  if (lessons.length === 0) notFound();

  if (!session) redirect(`/login?redirectTo=/learn/${slug}`);

  const completed = await prisma.lessonProgress.findMany({
    where: { userId: session.userId, completed: true, lessonId: { in: lessons.map((l) => l.id) } },
    select: { lessonId: true },
  });
  const doneSet = new Set(completed.map((c) => c.lessonId));
  const next = lessons.find((l) => !doneSet.has(l.id)) ?? lessons[0];

  redirect(`/learn/${slug}/${next.id}`);
}
