'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { addCommentAction, deleteCommentAction, type CommentState } from '@/app/actions/learn';

export type CommentNode = {
  id: string;
  body: string;
  createdAt: string;
  authorName: string;
  authorRole: string;
  canDelete: boolean;
  replies: CommentNode[];
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary btn-sm" disabled={pending}>
      {pending ? 'กำลังส่ง...' : label}
    </button>
  );
}

function Avatar({ name, role }: { name: string; role: string }) {
  return (
    <span
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold ${
        role === 'ADMIN' ? 'bg-brand-600 text-white' : 'bg-brand-100 text-brand-700'
      }`}
    >
      {name.slice(0, 1)}
    </span>
  );
}

function CommentItem({ comment, lessonId }: { comment: CommentNode; lessonId: string }) {
  const [replying, setReplying] = useState(false);
  const [replyState, replyAction] = useActionState<CommentState, FormData>(addCommentAction, null);

  return (
    <li className="flex gap-3">
      <Avatar name={comment.authorName} role={comment.authorRole} />

      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium text-ink">{comment.authorName}</span>
          {comment.authorRole === 'ADMIN' && <span className="badge-brand">ทีมผู้สอน</span>}
          <span className="text-xs text-ink-soft">{comment.createdAt}</span>
        </p>

        <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{comment.body}</p>

        <div className="mt-1.5 flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => setReplying((v) => !v)}
            className="text-brand-700 hover:underline"
          >
            {replying ? 'ยกเลิก' : 'ตอบกลับ'}
          </button>
          {comment.canDelete && (
            <form action={deleteCommentAction}>
              <input type="hidden" name="commentId" value={comment.id} />
              <button type="submit" className="text-ink-soft hover:text-red-600">
                ลบ
              </button>
            </form>
          )}
        </div>

        {replying && (
          <form action={replyAction} className="mt-3 space-y-2">
            <input type="hidden" name="lessonId" value={lessonId} />
            <input type="hidden" name="parentId" value={comment.id} />
            <textarea
              name="body"
              required
              className="textarea min-h-[80px]"
              placeholder="พิมพ์คำตอบ..."
            />
            {replyState?.error && <p className="text-xs text-red-600">{replyState.error}</p>}
            <SubmitButton label="ส่งคำตอบ" />
          </form>
        )}

        {comment.replies.length > 0 && (
          <ul className="mt-4 space-y-4 border-l-2 border-ink-line pl-4">
            {comment.replies.map((r) => (
              <CommentItem key={r.id} comment={r} lessonId={lessonId} />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

export function CommentSection({
  lessonId,
  comments,
  canPost,
}: {
  lessonId: string;
  comments: CommentNode[];
  canPost: boolean;
}) {
  const [state, formAction] = useActionState<CommentState, FormData>(addCommentAction, null);

  return (
    <section className="card p-6">
      <h2 className="text-lg font-semibold">กระดานถาม-ตอบ</h2>
      <p className="mt-1 text-sm text-ink-soft">
        สงสัยตรงไหนถามได้เลย ครูและเพื่อนร่วมคอร์สเห็นคำถามนี้
      </p>

      {canPost ? (
        <form action={formAction} className="mt-5 space-y-2">
          <input type="hidden" name="lessonId" value={lessonId} />
          <textarea
            name="body"
            required
            className="textarea"
            placeholder="เช่น ตรงนาทีที่ 12 ทำไมถึงย้ายข้างแล้วเครื่องหมายไม่เปลี่ยนคะ"
          />
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          {state?.success && <p className="text-sm text-emerald-700">{state.success}</p>}
          <SubmitButton label="ส่งคำถาม" />
        </form>
      ) : (
        <p className="mt-5 rounded-xl bg-brand-50 px-4 py-3 text-sm text-ink-soft">
          ซื้อคอร์สนี้แล้วจึงจะถามคำถามใต้คลิปได้
        </p>
      )}

      {comments.length > 0 ? (
        <ul className="mt-8 space-y-6">
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} lessonId={lessonId} />
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-sm text-ink-soft">ยังไม่มีคำถามในบทเรียนนี้ เป็นคนแรกได้เลย</p>
      )}
    </section>
  );
}
