'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { createOrderAction, type ActionState } from '@/app/actions/orders';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary mt-6 w-full" disabled={pending}>
      {pending ? 'กำลังสร้างคำสั่งซื้อ...' : 'ยืนยันและไปหน้าชำระเงิน'}
    </button>
  );
}

const METHODS = [
  {
    value: 'BANK_TRANSFER',
    title: 'โอนผ่านธนาคาร',
    desc: 'โอนเข้าบัญชีของสถาบัน แล้วอัปโหลดสลิปในระบบ',
  },
  {
    value: 'PROMPTPAY',
    title: 'พร้อมเพย์ (QR)',
    desc: 'สแกน QR พร้อมเพย์ แล้วอัปโหลดสลิปในระบบ',
  },
];

export function CheckoutForm({ slug, cardEnabled }: { slug: string; cardEnabled: boolean }) {
  const [state, formAction] = useActionState<ActionState, FormData>(createOrderAction, null);
  const [method, setMethod] = useState('BANK_TRANSFER');

  return (
    <form action={formAction} className="card mt-6 p-6">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="method" value={method} />

      <h2 className="text-lg font-semibold">เลือกวิธีชำระเงิน</h2>

      <div className="mt-4 space-y-3">
        {METHODS.map((m) => (
          <label
            key={m.value}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
              method === m.value
                ? 'border-brand-400 bg-brand-50/60 ring-4 ring-brand-100'
                : 'border-ink-line hover:border-brand-200'
            }`}
          >
            <input
              type="radio"
              name="methodChoice"
              className="mt-1 accent-brand-600"
              checked={method === m.value}
              onChange={() => setMethod(m.value)}
            />
            <span>
              <span className="block text-sm font-medium text-ink">{m.title}</span>
              <span className="mt-0.5 block text-xs text-ink-soft">{m.desc}</span>
            </span>
          </label>
        ))}

        {/* ช่องสำหรับบัตรเครดิต เตรียมไว้ให้ต่อระบบชำระเงินภายหลัง */}
        <label
          className={`flex items-start gap-3 rounded-xl border border-dashed border-ink-line p-4 ${
            cardEnabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
          }`}
        >
          <input
            type="radio"
            name="methodChoice"
            className="mt-1 accent-brand-600"
            disabled={!cardEnabled}
            checked={method === 'CARD'}
            onChange={() => setMethod('CARD')}
          />
          <span>
            <span className="block text-sm font-medium text-ink">
              บัตรเครดิต/เดบิต{' '}
              {!cardEnabled && <span className="badge-gray ml-1">ยังไม่เปิดใช้งาน</span>}
            </span>
            <span className="mt-0.5 block text-xs text-ink-soft">
              เตรียมช่องทางไว้แล้ว เปิดใช้ได้เมื่อเชื่อมต่อผู้ให้บริการรับชำระเงิน
            </span>
          </span>
        </label>
      </div>

      {state?.error && (
        <p className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{state.error}</p>
      )}

      <SubmitButton />
    </form>
  );
}
