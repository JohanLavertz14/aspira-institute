'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { approvePaymentAction, rejectPaymentAction } from '@/app/actions/admin';

function ActionButton({ className, children }: { className: string; children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? 'กำลังบันทึก...' : children}
    </button>
  );
}

export function PaymentActions({ paymentId }: { paymentId: string }) {
  const [rejecting, setRejecting] = useState(false);

  return (
    <div className="mt-4 border-t border-ink-line pt-4">
      {rejecting ? (
        <form action={rejectPaymentAction} className="space-y-2">
          <input type="hidden" name="paymentId" value={paymentId} />
          <label className="label" htmlFor={`reason-${paymentId}`}>
            เหตุผลที่ไม่อนุมัติ (นักเรียนจะเห็นข้อความนี้)
          </label>
          <textarea
            id={`reason-${paymentId}`}
            name="reason"
            className="textarea min-h-[70px]"
            placeholder="เช่น ยอดโอนไม่ตรงกับราคาคอร์ส หรือสลิปไม่ชัด"
          />
          <div className="flex gap-2">
            <ActionButton className="btn-danger btn-sm">ยืนยันไม่อนุมัติ</ActionButton>
            <button type="button" onClick={() => setRejecting(false)} className="btn-ghost btn-sm">
              ยกเลิก
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap gap-2">
          <form action={approvePaymentAction}>
            <input type="hidden" name="paymentId" value={paymentId} />
            <ActionButton className="btn-primary btn-sm">อนุมัติและเปิดสิทธิ์เรียน</ActionButton>
          </form>
          <button type="button" onClick={() => setRejecting(true)} className="btn-danger btn-sm">
            ไม่อนุมัติ
          </button>
        </div>
      )}
    </div>
  );
}
