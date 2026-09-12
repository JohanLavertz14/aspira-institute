import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { readSession } from '@/lib/auth';
import { hasCourseAccess } from '@/lib/access';
import { formatDuration, formatThaiDate } from '@/lib/format';
import { VideoPlayer } from '@/components/video-player';
import { QuizBox } from '@/components/quiz-box';
import { CommentSection, type CommentNode } from '@/components/comment-section';
import { MarkComplete } from '@/components/mark-complete';
import { Logo } from '@/components/logo';
import { getSiteSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const session = await readSession();

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      subject: true,
      chapters: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: { attachments: true, quiz: { select: { id: true } } },
          },
        },
      },
    },
  });
  if (!course) notFound();

  const allLessons = course.chapters.flatMap((c) => c.lessons);
  const lesson = allLessons.find((l) => l.id === lessonId);
  if (!lesson) notFound();

  const hasAccess = await hasCourseAccess(session?.userId ?? null, course.id);

  // บทเรียนที่ไม่ใช่ตัวอย่างต้องซื้อคอร์สก่อน
  if (!hasAccess && !lesson.isPreview) {
    if (!session) redirect(`/login?redirectTo=/learn/${slug}/${lessonId}`);
    redirect(`/courses/${slug}`);
  }

  const settings = await getSiteSettings();

  const [progressRows, lessonDetail, lastAttempt, rawComments] = await Promise.all([
    session
      ? prisma.lessonProgress.findMany({
          where: { userId: session.userId, lessonId: { in: allLessons.map((l) => l.id) } },
        })
      : Promise.resolve([]),
    prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        attachments: true,
        quiz: { include: { questions: { orderBy: { order: 'asc' }, include: { choices: { orderBy: { order: 'asc' } } } } } },
      },
    }),
    session
      ? prisma.quizAttempt.findFirst({
          where: { userId: session.userId, quiz: { lessonId } },
          orderBy: { createdAt: 'desc' },
        })
      : Promise.resolve(null),
    prisma.comment.findMany({
      where: { lessonId, isHidden: false },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { name: true, role: true, id: true } } },
    }),
  ]);

  const doneSet = new Set(progressRows.filter((p) => p.completed).map((p) => p.lessonId));
  const percent = allLessons.length ? Math.round((doneSet.size / allLessons.length) * 100) : 0;

  const index = allLessons.findIndex((l) => l.id === lessonId);
  const prev = index > 0 ? allLessons[index - 1] : null;
  const next = index < allLessons.length - 1 ? allLessons[index + 1] : null;

  // จัดคอมเมนต์เป็นโครงสร้างต้นไม้ (คำถามหลัก + คำตอบ)
  const nodeMap = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];
  for (const c of rawComments) {
    nodeMap.set(c.id, {
      id: c.id,
      body: c.body,
      createdAt: formatThaiDate(c.createdAt, true),
      authorName: c.user.name,
      authorRole: c.user.role,
      canDelete: !!session && (session.userId === c.user.id || session.role === 'ADMIN'),
      replies: [],
    });
  }
  for (const c of rawComments) {
    const node = nodeMap.get(c.id)!;
    if (c.parentId && nodeMap.has(c.parentId)) nodeMap.get(c.parentId)!.replies.push(node);
    else roots.push(node);
  }

  return (
    <div className="flex min-h-screen flex-col bg-brand-50/30">
      {/* แถบบนของหน้าเรียน */}
      <header className="sticky top-0 z-30 border-b border-ink-line bg-white">
        <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center gap-4 px-4">
          <Link href="/" className="hidden sm:block">
            <Logo logoUrl={settings.logoUrl} siteName={settings.siteName} size="sm" />
          </Link>
          <div className="min-w-0 flex-1 border-l border-ink-line pl-4 sm:ml-2">
            <p className="truncate text-sm font-medium text-ink">{course.title}</p>
            <p className="truncate text-xs text-ink-soft">
              {doneSet.size}/{allLessons.length} บท · {percent}%
            </p>
          </div>
          <Link href="/my-courses" className="btn-ghost btn-sm shrink-0">
            คอร์สของฉัน
          </Link>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1500px] flex-1 gap-6 px-4 py-6 lg:grid-cols-[1fr_340px]">
        {/* เนื้อหาหลัก */}
        <main className="min-w-0 space-y-6">
          {!hasAccess && lesson.isPreview && (
            <div className="card border-brand-200 bg-brand-50 p-4 text-sm">
              <p className="font-medium text-ink">คุณกำลังดูบทเรียนตัวอย่างฟรี</p>
              <p className="mt-1 text-ink-soft">
                ซื้อคอร์สนี้เพื่อดูครบทุกบท พร้อมชีทและแบบทดสอบท้ายบท
              </p>
              <Link href={`/checkout/${course.slug}`} className="btn-primary btn-sm mt-3">
                สมัครเรียนคอร์สนี้
              </Link>
            </div>
          )}

          <VideoPlayer
            provider={lesson.videoProvider}
            videoId={lesson.videoId}
            videoUrl={lesson.videoUrl}
            title={lesson.title}
          />

          <section className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">{lesson.title}</h1>
                <p className="mt-1.5 text-sm text-ink-soft">
                  {formatDuration(lesson.durationMin)}
                  {lesson.isPreview && ' · บทเรียนตัวอย่าง'}
                </p>
              </div>
              {hasAccess && <MarkComplete lessonId={lesson.id} completed={doneSet.has(lesson.id)} />}
            </div>

            {lesson.description && (
              <p className="mt-4 whitespace-pre-line leading-relaxed text-ink-soft">
                {lesson.description}
              </p>
            )}

            {/* ชีทประกอบบทเรียน */}
            {lessonDetail && lessonDetail.attachments.length > 0 && (
              <div className="mt-6 border-t border-ink-line pt-5">
                <h2 className="text-sm font-semibold text-ink">เอกสารประกอบบทเรียน</h2>
                <ul className="mt-3 space-y-2">
                  {lessonDetail.attachments.map((a) => (
                    <li key={a.id}>
                      <a
                        href={hasAccess ? a.fileUrl : `/checkout/${course.slug}`}
                        target={hasAccess ? '_blank' : undefined}
                        rel="noreferrer"
                        download={hasAccess ? true : undefined}
                        className="flex items-center gap-3 rounded-xl border border-ink-line px-4 py-3 text-sm transition hover:border-brand-300 hover:bg-brand-50"
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-100 text-[11px] font-bold text-brand-700">
                          {a.fileType}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-ink">{a.title}</span>
                          {a.sizeLabel && (
                            <span className="block text-xs text-ink-soft">{a.sizeLabel}</span>
                          )}
                        </span>
                        <span className="shrink-0 text-xs font-medium text-brand-700">
                          {hasAccess ? 'ดาวน์โหลด' : 'ต้องซื้อคอร์ส'}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ปุ่มไปบทก่อนหน้า/ถัดไป */}
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-ink-line pt-5">
              {prev ? (
                <Link href={`/learn/${course.slug}/${prev.id}`} className="btn-outline btn-sm">
                  ← บทก่อนหน้า
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link href={`/learn/${course.slug}/${next.id}`} className="btn-primary btn-sm">
                  บทถัดไป →
                </Link>
              ) : (
                <span className="text-sm text-ink-soft">บทสุดท้ายของคอร์สแล้ว</span>
              )}
            </div>
          </section>

          {/* แบบทดสอบท้ายบท */}
          {lessonDetail?.quiz && hasAccess && (
            <QuizBox
              quiz={{
                id: lessonDetail.quiz.id,
                title: lessonDetail.quiz.title,
                description: lessonDetail.quiz.description,
                passScore: lessonDetail.quiz.passScore,
                questions: lessonDetail.quiz.questions.map((q) => ({
                  id: q.id,
                  text: q.text,
                  choices: q.choices.map((c) => ({ id: c.id, text: c.text })),
                })),
              }}
              lastScore={lastAttempt ? { score: lastAttempt.score, total: lastAttempt.total } : null}
            />
          )}

          <CommentSection lessonId={lesson.id} comments={roots} canPost={hasAccess} />
        </main>

        {/* รายการบทเรียน */}
        <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto scroll-thin">
          {course.materialUrl && hasAccess && (
            <a
              href={course.materialUrl}
              target="_blank"
              rel="noreferrer"
              download
              className="card mb-4 flex items-center gap-3 p-4 transition hover:border-brand-300 hover:bg-brand-50"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-[11px] font-bold text-brand-700">
                PDF
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-ink">
                  {course.materialTitle || 'เอกสารประกอบคอร์ส'}
                </span>
                <span className="block text-xs text-ink-soft">กดเพื่อดาวน์โหลดชีททั้งเล่ม</span>
              </span>
            </a>
          )}

          <div className="card p-4">
            <div className="px-1 pb-3">
              <div className="flex items-center justify-between text-xs text-ink-soft">
                <span>ความคืบหน้า</span>
                <span className="font-medium text-brand-700">{percent}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-brand-100">
                <div className="h-full rounded-full bg-brand-600" style={{ width: `${percent}%` }} />
              </div>
            </div>

            <div className="space-y-4">
              {course.chapters.map((ch) => (
                <div key={ch.id}>
                  <p className="px-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    {ch.title}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {ch.lessons.map((l) => {
                      const active = l.id === lessonId;
                      const done = doneSet.has(l.id);
                      const locked = !hasAccess && !l.isPreview;
                      return (
                        <li key={l.id}>
                          <Link
                            href={locked ? `/courses/${course.slug}` : `/learn/${course.slug}/${l.id}`}
                            className={`flex items-start gap-2.5 rounded-xl px-3 py-2.5 text-sm transition ${
                              active ? 'bg-brand-600 text-white' : 'hover:bg-brand-50'
                            }`}
                          >
                            <span
                              className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                                active
                                  ? 'bg-white/25 text-white'
                                  : done
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {done ? '✓' : locked ? '🔒' : ''}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className={`block ${active ? 'font-medium' : 'text-ink'}`}>
                                {l.title}
                              </span>
                              <span
                                className={`mt-0.5 block text-xs ${active ? 'text-white/75' : 'text-ink-soft'}`}
                              >
                                {formatDuration(l.durationMin)}
                                {l.quiz && ' · มีแบบทดสอบ'}
                              </span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
