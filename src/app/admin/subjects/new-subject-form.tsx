'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createSubjectAction, type AdminState } from '@/app/actions/admin';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary btn-sm" disabled={pending}>
      {pending ? 'กำลังเพิ่ม...' : '+ เพิ่มวิชา'}
    </button>
  );
}

export function NewSubjectForm() {
  const [state, formAction] = useActionState<AdminState, FormData>(createSubjectAction, null);

  return (
    <form action={formAction} className="card space-y-4 p-6">
      <h2 className="text-lg font-semibold">เพิ่มวิชาใหม่</h2>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-16">
          <label className="label text-xs">สี</label>
          <input name="colorHex" type="color" defaultValue="#f43f74" className="input h-10 p-1" />
        </div>
        <div className="min-w-[160px] flex-1">
          <label className="label text-xs">ชื่อวิชา</label>
          <input name="name" required className="input" placeholder="เช่น ฟิสิกส์" />
        </div>
        <div className="min-w-[200px] flex-[2]">
          <label className="label text-xs">คำอธิบาย</label>
          <input name="description" className="input" />
        </div>
        <div className="w-40">
          <label className="label text-xs">slug (ไม่บังคับ)</label>
          <input name="slug" className="input" placeholder="physics" />
        </div>
        <SubmitButton />
      </div>

      {state?.error && (
        <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">{state.success}</p>
      )}
    </form>
  );
}
