'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { loginAction, type FormState } from '@/app/actions/auth';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
    </button>
  );
}

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction] = useActionState<FormState, FormData>(loginAction, null);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo ?? ''} />

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
        <input id="password" name="password" type="password" required className="input" placeholder="••••••••" />
      </div>

      {state?.error && (
        <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{state.error}</p>
      )}

      <SubmitButton />
    </form>
  );
}
