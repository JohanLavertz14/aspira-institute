'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { registerAction, type FormState } from '@/app/actions/auth';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
    </button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState<FormState, FormData>(registerAction, null);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <div>
        <label className="label" htmlFor="name">
          ชื่อ-นามสกุล
        </label>
        <input id="name" name="name" required className="input" placeholder="เช่น ณิชา ใจดี" />
      </div>

      <div>
        <label className="label" htmlFor="email">
          อีเมล
        </label>
        <input id="email" name="email" type="email" required className="input" placeholder="you@example.com" />
      </div>

      <div>
        <label className="label" htmlFor="password">
          รหัสผ่าน
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="input"
          placeholder="อย่างน้อย 8 ตัวอักษร"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="phone">
            เบอร์โทร <span className="font-normal text-ink-soft">(ไม่บังคับ)</span>
          </label>
          <input id="phone" name="phone" className="input" placeholder="08x-xxx-xxxx" />
        </div>
        <div>
          <label className="label" htmlFor="gradeLevel">
            ระดับชั้น <span className="font-normal text-ink-soft">(ไม่บังคับ)</span>
          </label>
          <select id="gradeLevel" name="gradeLevel" className="select" defaultValue="">
            <option value="">เลือกระดับชั้น</option>
            {['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6', 'เด็กซิ่ว', 'อื่นๆ'].map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="school">
          โรงเรียน <span className="font-normal text-ink-soft">(ไม่บังคับ)</span>
        </label>
        <input id="school" name="school" className="input" placeholder="ชื่อโรงเรียน" />
      </div>

      {state?.error && (
        <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{state.error}</p>
      )}

      <SubmitButton />
    </form>
  );
}
