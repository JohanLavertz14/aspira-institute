'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  addAttachmentAction,
  addQuestionAction,
  updateLessonAction,
  type AdminState,
} from '@/app/actions/admin';

function Submit({ label, className = 'btn-primary' }: { label: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? 'กำลังบันทึก...' : label}
    </button>
  );
}

function Message({ state }: { state: AdminState }) {
  if (state?.error)
    return <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{state.error}</p>;
  if (state?.success)
    return (
      <p className="rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">{state.success}</p>
    );
  return null;
}

/* ------------------------------ แก้ไขบทเรียน ------------------------------ */

type LessonForm = {
  id: string;
  title: string;
  description: string;
  videoProvider: string;
  videoId: string;
  videoUrl: string;
  durationMin: number;
  isPreview: boolean;
  order: number;
};

export function EditLessonForm({ lesson }: { lesson: LessonForm }) {
  const [state, formAction] = useActionState<AdminState, FormData>(updateLessonAction, null);
  const [provider, setProvider] = useState(lesson.videoProvider);

  return (
    <form action={formAction} className="card space-y-5 p-6">
      <input type="hidden" name="id" value={lesson.id} />
      <h2 className="text-lg font-semibold">ข้อมูลบทเรียน</h2>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">ชื่อบทเรียน</label>
          <input name="title" required defaultValue={lesson.title} className="input" />
        </div>

        <div>
          <label className="label">แหล่งวิดีโอ</label>
          <select
            name="videoProvider"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="select"
          >
            <option value="VIMEO">Vimeo (แนะนำสำหรับคอร์สที่ขาย)</option>
            <option value="YOUTUBE">YouTube (แบบไม่เป็นสาธารณะ)</option>
            <option value="FILE">ไฟล์วิดีโอ / ลิงก์เต็ม</option>
          </select>
        </div>

        <div>
          <label className="label">
            {provider === 'FILE' ? 'ลิงก์ไฟล์วิดีโอ' : 'รหัสวิดีโอ'}
          </label>
          {provider === 'FILE' ? (
            <input
              name="videoUrl"
              defaultValue={lesson.videoUrl}
              className="input"
              placeholder="https://..."
            />
          ) : (
            <input
              name="videoId"
              defaultValue={lesson.videoId}
              className="input"
              placeholder={provider === 'VIMEO' ? 'เช่น 76979871' : 'เช่น dQw4w9WgXcQ'}
            />
          )}
          {provider !== 'FILE' && (
            <input type="hidden" name="videoUrl" value={lesson.videoUrl} />
          )}
          {provider === 'FILE' && <input type="hidden" name="videoId" value={lesson.videoId} />}
        </div>

        <div>
          <label className="label">ความยาว (นาที)</label>
          <input
            name="durationMin"
            type="number"
            min={0}
            defaultValue={lesson.durationMin}
            className="input"
          />
        </div>

        <div>
          <label className="label">ลำดับในบท</label>
          <input name="order" type="number" min={0} defaultValue={lesson.order} className="input" />
        </div>

        <div className="sm:col-span-2">
          <label className="label">คำอธิบายบทเรียน</label>
          <textarea name="description" defaultValue={lesson.description} className="textarea" />
        </div>
      </div>

      <label className="flex items-center gap-2 border-t border-ink-line pt-5 text-sm">
        <input
          type="checkbox"
          name="isPreview"
          defaultChecked={lesson.isPreview}
          className="accent-brand-600"
        />
        เปิดให้ดูฟรีเป็นบทเรียนตัวอย่าง (ไม่ต้องซื้อคอร์ส)
      </label>

      <Message state={state} />
      <Submit label="บันทึกบทเรียน" />
    </form>
  );
}

/* ------------------------------ เพิ่มไฟล์ชีท ------------------------------ */

export function AddAttachmentForm({ lessonId }: { lessonId: string }) {
  const [state, formAction] = useActionState<AdminState, FormData>(addAttachmentAction, null);

  return (
    <form action={formAction} className="mt-5 space-y-4 border-t border-ink-line pt-5">
      <input type="hidden" name="lessonId" value={lessonId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label text-xs">ชื่อไฟล์ที่จะแสดง</label>
          <input name="title" required className="input" placeholder="เช่น ชีทสรุป บทที่ 1" />
        </div>
        <div>
          <label className="label text-xs">อัปโหลดไฟล์ PDF</label>
          <input name="file" type="file" accept="application/pdf,image/*" className="input py-2" />
        </div>
        <div className="sm:col-span-2">
          <label className="label text-xs">หรือใส่ลิงก์ไฟล์ภายนอก (ถ้าไม่อัปโหลด)</label>
          <input name="fileUrl" className="input" placeholder="https://drive.google.com/..." />
        </div>
      </div>

      <Message state={state} />
      <Submit label="+ เพิ่มไฟล์" className="btn-primary btn-sm" />
    </form>
  );
}

/* ------------------------------ เพิ่มข้อสอบ ------------------------------ */

export function AddQuestionForm({ quizId }: { quizId: string }) {
  const [state, formAction] = useActionState<AdminState, FormData>(addQuestionAction, null);

  return (
    <form action={formAction} className="mt-6 space-y-4 rounded-2xl border border-dashed border-ink-line p-5">
      <input type="hidden" name="quizId" value={quizId} />
      <h3 className="font-semibold text-ink">เพิ่มข้อสอบใหม่</h3>

      <div>
        <label className="label text-xs">โจทย์</label>
        <textarea name="text" required className="textarea min-h-[70px]" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <label className="label text-xs">
              ตัวเลือกที่ {i + 1} {i > 1 && <span className="font-normal text-ink-soft">(ไม่บังคับ)</span>}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="correctIndex"
                value={i}
                defaultChecked={i === 0}
                className="accent-brand-600"
                title="เลือกข้อที่ถูก"
              />
              <input name={`choice${i}`} className="input" required={i < 2} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-ink-soft">กดวงกลมหน้าตัวเลือกเพื่อระบุคำตอบที่ถูกต้อง</p>

      <div>
        <label className="label text-xs">คำอธิบายเฉลย (ไม่บังคับ)</label>
        <textarea name="explanation" className="textarea min-h-[60px]" />
      </div>

      <Message state={state} />
      <Submit label="+ เพิ่มข้อสอบ" className="btn-primary btn-sm" />
    </form>
  );
}
