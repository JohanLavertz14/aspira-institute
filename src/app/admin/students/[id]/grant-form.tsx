'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { grantEnrollmentAction, type AdminState } from '@/app/actions/admin';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary btn-sm" disabled={pending}>
      {pending ? 'กำลังบันทึก...' : 'เปิดสิทธิ์เรียน'}
    </button>
  );
}

export function GrantEnrollmentForm({
  userId,
  courses,
}: {
  userId: string;
  courses: { id: string; title: string; accessDays: number }[];
}) {
  const [state, formAction] = useActionState<AdminState, FormData>(grantEnrollmentAction, null);

  return (
    <form action={formAction} className="mt-6 space-y-3 border-t border-ink-line pt-6">
      <input type="hidden" name="userId" value={userId} />
      <h3 className="font-semibold text-ink">เปิดสิทธิ์เรียนด้วยมือ</h3>
      <p className="text-sm text-ink-soft">
        ใช้กรณีนักเรียนชำระเงินที่สถาบันหรือได้รับสิทธิ์พิเศษ ถ้ามีสิทธิ์อยู่แล้วระบบจะต่ออายุให้
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[240px] flex-1">
          <label className="label text-xs">คอร์ส</label>
          <select name="courseId" required className="select">
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <div className="w-40">
          <label className="label text-xs">จำนวนวัน (เว้นว่างใช้ค่าของคอร์ส)</label>
          <input name="days" type="number" min={1} className="input" placeholder="180" />
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
