import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import {
  deleteAttachmentAction,
  deleteLessonAction,
  deleteQuestionAction,
  deleteQuizAction,
  upsertQuizAction,
} from '@/app/actions/admin';
import { AddAttachmentForm, AddQuestionForm, EditLessonForm } from './lesson-forms';

export const dynamic = 'force-dynamic';

export default async function AdminLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      chapter: { include: { course: true } },
      attachments: { orderBy: { createdAt: 'asc' } },
      quiz: {
        include: {
          questions: { orderBy: { order: 'asc' }, include: { choices: { orderBy: { order: 'asc' } } } },
          _count: { select: { attempts: true } },
        },
      },
    },
  });

  if (!lesson) notFound();

  return (
    <div className="space-y-6">
      <nav className="text-sm text-ink-soft">
        <Link href={`/admin/courses/${lesson.chapter.courseId}`} className="hover:text-brand-700">
          ← กลับไปที่ {lesson.chapter.course.title}
        </Link>
      </nav>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{lesson.title}</h1>
        <p className="mt-1.5 text-sm text-ink-soft">{lesson.chapter.title}</p>
      </div>

      <EditLessonForm
        lesson={{
          id: lesson.id,
          title: lesson.title,
          description: lesson.description ?? '',
          videoProvider: lesson.videoProvider,
          videoId: lesson.videoId,
          videoUrl: lesson.videoUrl ?? '',
          durationMin: lesson.durationMin,
          isPreview: lesson.isPreview,
          order: lesson.order,
        }}
      />

      {/* ชีทประกอบ */}
      <section className="card p-6">
        <h2 className="text-lg font-semibold">เอกสารประกอบบทเรียน</h2>
        <p className="mt-1.5 text-sm text-ink-soft">
          อัปโหลดไฟล์ PDF ของชีทหรือแบบฝึกหัด นักเรียนที่ซื้อคอร์สแล้วจึงจะดาวน์โหลดได้
        </p>

        {lesson.attachments.length > 0 && (
          <ul className="mt-4 divide-y divide-ink-line">
            {lesson.attachments.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-100 text-[11px] font-bold text-brand-700">
                  {a.fileType}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{a.title}</span>
                  <a
                    href={a.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-xs text-brand-700 hover:underline"
                  >
                    {a.fileUrl}
                  </a>
                </span>
                {a.sizeLabel && <span className="text-xs text-ink-soft">{a.sizeLabel}</span>}
                <form action={deleteAttachmentAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <button type="submit" className="btn-danger btn-sm">
                    ลบ
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <AddAttachmentForm lessonId={lesson.id} />
      </section>

      {/* แบบทดสอบท้ายบท */}
      <section className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">แบบทดสอบท้ายบท</h2>
          {lesson.quiz && (
            <span className="badge-gray">ทำไปแล้ว {lesson.quiz._count.attempts} ครั้ง</span>
          )}
        </div>

        <form action={upsertQuizAction} className="mt-4 flex flex-wrap items-end gap-3">
          <input type="hidden" name="lessonId" value={lesson.id} />
          <div className="min-w-[240px] flex-1">
            <label className="label text-xs">ชื่อแบบทดสอบ</label>
            <input
              name="title"
              className="input"
              defaultValue={lesson.quiz?.title ?? 'แบบทดสอบท้ายบท'}
            />
          </div>
          <div className="w-40">
            <label className="label text-xs">เกณฑ์ผ่าน (%)</label>
            <input
              name="passScore"
              type="number"
              min={0}
              max={100}
              className="input"
              defaultValue={lesson.quiz?.passScore ?? 60}
            />
          </div>
          <button type="submit" className="btn-primary btn-sm">
            {lesson.quiz ? 'บันทึกแบบทดสอบ' : 'สร้างแบบทดสอบ'}
          </button>
        </form>

        {lesson.quiz && (
          <>
            <ol className="mt-6 space-y-4">
              {lesson.quiz.questions.map((q, i) => (
                <li key={q.id} className="rounded-2xl border border-ink-line p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-ink">
                      {i + 1}. {q.text}
                    </p>
                    <form action={deleteQuestionAction}>
                      <input type="hidden" name="id" value={q.id} />
                      <button type="submit" className="shrink-0 text-xs text-ink-soft hover:text-red-600">
                        ลบข้อนี้
                      </button>
                    </form>
                  </div>

                  <ul className="mt-3 space-y-1.5 text-sm">
                    {q.choices.map((c) => (
                      <li
                        key={c.id}
                        className={`rounded-lg px-3 py-2 ${
                          c.isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-50 text-ink-soft'
                        }`}
                      >
                        {c.text}
                        {c.isCorrect && <span className="ml-2 text-xs font-medium">(คำตอบที่ถูก)</span>}
                      </li>
                    ))}
                  </ul>

                  {q.explanation && (
                    <p className="mt-3 text-sm text-ink-soft">คำอธิบาย: {q.explanation}</p>
                  )}
                </li>
              ))}
              {lesson.quiz.questions.length === 0 && (
                <li className="text-sm text-ink-soft">ยังไม่มีข้อสอบในแบบทดสอบนี้</li>
              )}
            </ol>

            <AddQuestionForm quizId={lesson.quiz.id} />

            <form action={deleteQuizAction} className="mt-5 border-t border-ink-line pt-5">
              <input type="hidden" name="quizId" value={lesson.quiz.id} />
              <button type="submit" className="text-xs text-ink-soft hover:text-red-600">
                ลบแบบทดสอบทั้งชุด
              </button>
            </form>
          </>
        )}
      </section>

      {/* ลบบทเรียน */}
      <section className="card border-red-100 p-6">
        <h2 className="text-lg font-semibold text-red-600">ลบบทเรียนนี้</h2>
        <form action={deleteLessonAction} className="mt-4">
          <input type="hidden" name="id" value={lesson.id} />
          <button type="submit" className="btn-danger btn-sm">
            ลบบทเรียนถาวร
          </button>
        </form>
      </section>
    </div>
  );
}
