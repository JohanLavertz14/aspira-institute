'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitQuizAction, type QuizResult } from '@/app/actions/learn';

type QuizData = {
  id: string;
  title: string;
  description: string | null;
  passScore: number;
  questions: {
    id: string;
    text: string;
    choices: { id: string; text: string }[];
  }[];
};

function SubmitButton({ hasResult }: { hasResult: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary mt-6" disabled={pending}>
      {pending ? 'กำลังตรวจคำตอบ...' : hasResult ? 'ส่งคำตอบอีกครั้ง' : 'ส่งคำตอบ'}
    </button>
  );
}

export function QuizBox({ quiz, lastScore }: { quiz: QuizData; lastScore?: { score: number; total: number } | null }) {
  const [result, formAction] = useActionState<QuizResult, FormData>(submitQuizAction, null);
  const detailMap = new Map((result?.detail ?? []).map((d) => [d.questionId, d]));

  return (
    <section className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{quiz.title}</h2>
          {quiz.description && <p className="mt-1 text-sm text-ink-soft">{quiz.description}</p>}
        </div>
        {lastScore && !result && (
          <span className="badge-gray">
            ครั้งก่อนได้ {lastScore.score}/{lastScore.total}
          </span>
        )}
      </div>

      {result?.score !== undefined && (
        <div
          className={`mt-5 rounded-xl px-4 py-3.5 text-sm ${
            result.passed ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
          }`}
        >
          <p className="font-semibold">
            ได้ {result.score} จาก {result.total} ข้อ
            {result.passed ? ' ผ่านเกณฑ์แล้ว' : ` (เกณฑ์ผ่าน ${quiz.passScore}%)`}
          </p>
          <p className="mt-1">
            {result.passed
              ? 'ระบบบันทึกว่าเรียนบทนี้จบแล้ว ไปบทถัดไปได้เลย'
              : 'ลองทบทวนคำอธิบายด้านล่างแล้วทำใหม่อีกครั้งได้'}
          </p>
        </div>
      )}

      {result?.error && (
        <p className="mt-5 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{result.error}</p>
      )}

      <form action={formAction} className="mt-6">
        <input type="hidden" name="quizId" value={quiz.id} />

        <ol className="space-y-6">
          {quiz.questions.map((q, qi) => {
            const d = detailMap.get(q.id);
            return (
              <li key={q.id}>
                <p className="font-medium text-ink">
                  {qi + 1}. {q.text}
                </p>

                <div className="mt-3 space-y-2">
                  {q.choices.map((c) => {
                    const isCorrectChoice = d?.correctChoiceId === c.id;
                    const isSelected = d?.selectedChoiceId === c.id;
                    let cls = 'border-ink-line hover:border-brand-200';
                    if (d && isCorrectChoice) cls = 'border-emerald-300 bg-emerald-50';
                    else if (d && isSelected) cls = 'border-red-300 bg-red-50';

                    return (
                      <label
                        key={c.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${cls}`}
                      >
                        <input
                          type="radio"
                          name={`q_${q.id}`}
                          value={c.id}
                          defaultChecked={isSelected}
                          className="mt-0.5 accent-brand-600"
                        />
                        <span className="text-ink">{c.text}</span>
                        {d && isCorrectChoice && (
                          <span className="ml-auto shrink-0 text-xs font-medium text-emerald-700">
                            คำตอบที่ถูก
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>

                {d?.explanation && (
                  <p className="mt-2.5 rounded-xl bg-brand-50 px-3.5 py-2.5 text-sm leading-relaxed text-ink-soft">
                    <span className="font-medium text-ink">คำอธิบาย: </span>
                    {d.explanation}
                  </p>
                )}
              </li>
            );
          })}
        </ol>

        <SubmitButton hasResult={!!result?.detail} />
      </form>
    </section>
  );
}
