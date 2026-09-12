'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitPaymentAction, type ActionState } from '@/app/actions/orders';
import { formatBaht } from '@/lib/format';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary mt-6 w-full sm:w-auto" disabled={pending}>
      {pending ? 'กำลังส่งข้อมูล...' : 'ส่งแจ้งชำระเงิน'}
    </button>
  );
}

/** ค่าเริ่มต้นของช่องวันที่-เวลา เป็นเวลาปัจจุบันในเครื่องผู้ใช้ */
function nowLocalValue() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function PaymentForm({ code, amount }: { code: string; amount: number }) {
  const [state, formAction] = useActionState<ActionState, FormData>(submitPaymentAction, null);
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <form action={formAction} className="card mt-6 p-6">
      <input type="hidden" name="code" value={code} />

      <h2 className="text-lg font-semibold">แจ้งชำระเงิน</h2>
      <p className="mt-1.5 text-sm text-ink-soft">
        โอนยอด {formatBaht(amount)} เรียบร้อยแล้วให้แนบสลิปและกดส่งข้อมูล
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="paidAt">
            วันและเวลาที่โอน
          </label>
          <input
            id="paidAt"
            name="paidAt"
            type="datetime-local"
            required
            defaultValue={nowLocalValue()}
            className="input"
          />
        </div>

        <div>
          <label className="label" htmlFor="slip">
            สลิปการโอน (รูปภาพหรือ PDF)
          </label>
          <input
            id="slip"
            name="slip"
            type="file"
            required
            accept="image/*,application/pdf"
            className="input py-2"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setPreview(file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
            }}
          />
        </div>
      </div>

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="ตัวอย่างสลิป"
          className="mt-4 h-40 w-32 rounded-lg border border-ink-line object-cover"
        />
      )}

      <div className="mt-5">
        <label className="label" htmlFor="payerNote">
          หมายเหตุถึงแอดมิน <span className="font-normal text-ink-soft">(ไม่บังคับ)</span>
        </label>
        <textarea
          id="payerNote"
          name="payerNote"
          className="textarea"
          placeholder="เช่น โอนจากบัญชีของผู้ปกครอง ชื่อ ... "
        />
      </div>

      {state?.error && (
        <p className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{state.error}</p>
      )}
      {state?.success && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
          {state.success}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
