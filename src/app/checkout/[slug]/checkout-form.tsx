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

/** จุดกลมแสดงตัวเลือกที่เลือกอยู่ แนวเดียวกับคอมโพเนนต์ของ 21st.dev */
function Dot({ selected }: { selected: boolean }) {
  return (
    <span
      className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors duration-300"
      style={{ borderColor: selected ? '#ec3566' : '#d9ccd1' }}
      aria-hidden
    >
      <span
        className="h-2.5 w-2.5 rounded-full bg-brand-600 transition-opacity duration-300"
        style={{ opacity: selected ? 1 : 0 }}
      />
    </span>
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
          <button
            key={m.value}
            type="button"
            onClick={() => setMethod(m.value)}
            className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 ${
              method === m.value
                ? 'border-brand-400 bg-brand-50/60 ring-4 ring-brand-100'
                : 'border-ink-line hover:border-brand-200'
            }`}
          >
            <Dot selected={method === m.value} />
            <span>
              <span className="block text-sm font-medium text-ink">{m.title}</span>
              <span className="mt-0.5 block text-xs text-ink-soft">{m.desc}</span>
            </span>
          </button>
        ))}

        {/* ช่องสำหรับบัตรเครดิต เตรียมไว้ให้ต่อระบบชำระเงินภายหลัง */}
        <button
          type="button"
          disabled={!cardEnabled}
          onClick={() => setMethod('CARD')}
          className={`flex w-full items-start gap-3 rounded-xl border border-dashed p-4 text-left transition-all duration-200 ${
            cardEnabled
              ? method === 'CARD'
                ? 'border-brand-400 bg-brand-50/60 ring-4 ring-brand-100'
                : 'border-ink-line hover:border-brand-200'
              : 'cursor-not-allowed border-ink-line opacity-60'
          }`}
        >
          <Dot selected={method === 'CARD'} />
          <span>
            <span className="block text-sm font-medium text-ink">
              บัตรเครดิต/เดบิต{' '}
              {!cardEnabled && <span className="badge-gray ml-1">ยังไม่เปิดใช้งาน</span>}
            </span>
            <span className="mt-0.5 block text-xs text-ink-soft">
              เตรียมช่องทางไว้แล้ว เปิดใช้ได้เมื่อเชื่อมต่อผู้ให้บริการรับชำระเงิน
            </span>
          </span>
        </button>
      </div>

      {state?.error && (
        <p className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{state.error}</p>
      )}

      <SubmitButton />
    </form>
  );
}
