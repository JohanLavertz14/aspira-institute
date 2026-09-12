'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { hasCourseAccess } from '@/lib/access';

/** ตรวจสิทธิ์เข้าถึงบทเรียน (ต้องซื้อคอร์สแล้ว หรือเป็นบทเรียนตัวอย่าง) */
async function assertLessonAccess(userId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { chapter: { include: { course: true } } },
  });
  if (!lesson) throw new Error('ไม่พบบทเรียนนี้');

  const allowed = lesson.isPreview || (await hasCourseAccess(userId, lesson.chapter.courseId));
  if (!allowed) throw new Error('คุณยังไม่มีสิทธิ์เรียนบทเรียนนี้');

  return lesson;
}

/** ทำเครื่องหมายว่าเรียนบทนี้จบแล้วหรือยกเลิก */
export async function toggleLessonCompleteAction(formData: FormData) {
  const user = await requireUser();
  const lessonId = String(formData.get('lessonId') ?? '');
  const completed = String(formData.get('completed') ?? '') === 'true';

  const lesson = await assertLessonAccess(user.id, lessonId);

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    create: {
      userId: user.id,
      lessonId,
      completed,
      secondsWatched: completed ? lesson.durationMin * 60 : 0,
    },
    update: { completed, lastViewedAt: new Date() },
  });

  revalidatePath(`/learn/${lesson.chapter.course.slug}/${lessonId}`);
  revalidatePath('/my-courses');
}

export type QuizResult = {
  error?: string;
  score?: number;
  total?: number;
  passed?: boolean;
  detail?: {
    questionId: string;
    correct: boolean;
    selectedChoiceId: string | null;
    correctChoiceId: string;
    explanation: string | null;
  }[];
} | null;

/** ส่งคำตอบแบบทดสอบและตรวจให้อัตโนมัติ */
export async function submitQuizAction(_prev: QuizResult, formData: FormData): Promise<QuizResult> {
  try {
    const user = await requireUser();
    const quizId = String(formData.get('quizId') ?? '');

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: { orderBy: { order: 'asc' }, include: { choices: true } },
        lesson: { include: { chapter: true } },
      },
    });
    if (!quiz) return { error: 'ไม่พบแบบทดสอบนี้' };

    await assertLessonAccess(user.id, quiz.lessonId);

    const detail = quiz.questions.map((q) => {
      const selectedChoiceId = (formData.get(`q_${q.id}`) as string) || null;
      const correctChoice = q.choices.find((c) => c.isCorrect);
      return {
        questionId: q.id,
        correct: !!selectedChoiceId && selectedChoiceId === correctChoice?.id,
        selectedChoiceId,
        correctChoiceId: correctChoice?.id ?? '',
        explanation: q.explanation,
      };
    });

    const score = detail.filter((d) => d.correct).length;
    const total = quiz.questions.length;
    const percent = total === 0 ? 0 : Math.round((score / total) * 100);
    const passed = percent >= quiz.passScore;

    await prisma.quizAttempt.create({
      data: {
        quizId,
        userId: user.id,
        score,
        total,
        passed,
        answersJson: JSON.stringify(
          Object.fromEntries(detail.map((d) => [d.questionId, d.selectedChoiceId])),
        ),
      },
    });

    // ทำแบบทดสอบผ่านแล้วถือว่าเรียนบทนี้จบ
    if (passed) {
      await prisma.lessonProgress.upsert({
        where: { userId_lessonId: { userId: user.id, lessonId: quiz.lessonId } },
        create: { userId: user.id, lessonId: quiz.lessonId, completed: true },
        update: { completed: true, lastViewedAt: new Date() },
      });
    }

    return { score, total, passed, detail };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'ส่งคำตอบไม่สำเร็จ' };
  }
}

export type CommentState = { error?: string; success?: string } | null;

/** ตั้งคำถามหรือตอบกลับใต้คลิป */
export async function addCommentAction(_prev: CommentState, formData: FormData): Promise<CommentState> {
  try {
    const user = await requireUser();
    const lessonId = String(formData.get('lessonId') ?? '');
    const parentId = (formData.get('parentId') as string) || null;
    const body = String(formData.get('body') ?? '').trim();

    if (body.length < 2) return { error: 'กรุณาพิมพ์ข้อความก่อนส่ง' };
    if (body.length > 2000) return { error: 'ข้อความยาวเกินไป' };

    const lesson = await assertLessonAccess(user.id, lessonId);

    await prisma.comment.create({
      data: { lessonId, userId: user.id, parentId, body },
    });

    revalidatePath(`/learn/${lesson.chapter.course.slug}/${lessonId}`);
    return { success: 'ส่งข้อความเรียบร้อย' };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'ส่งข้อความไม่สำเร็จ' };
  }
}

/** ลบข้อความของตัวเอง หรือแอดมินลบข้อความใดก็ได้ */
export async function deleteCommentAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get('commentId') ?? '');

  const comment = await prisma.comment.findUnique({
    where: { id },
    include: { lesson: { include: { chapter: { include: { course: true } } } } },
  });
  if (!comment) return;
  if (comment.userId !== user.id && user.role !== 'ADMIN') return;

  await prisma.comment.delete({ where: { id } });
  revalidatePath(`/learn/${comment.lesson.chapter.course.slug}/${comment.lessonId}`);
}
