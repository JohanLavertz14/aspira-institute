'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateSettingsAction, type AdminState } from '@/app/actions/admin';

type Settings = {
  siteName: string;
  tagline: string;
  aboutText: string;
  logoUrl: string | null;
  contactPhone: string;
  contactEmail: string;
  contactLine: string;
  contactAddress: string;
  facebookUrl: string;
  bankName: string;
  bankBranch: string;
  bankAccountNo: string;
  bankAccountName: string;
  promptpayId: string;
  promptpayQrUrl: string | null;
  cardEnabled: boolean;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
    </button>
  );
}

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction] = useActionState<AdminState, FormData>(updateSettingsAction, null);

  return (
    <form action={formAction} className="space-y-6">
      {/* ข้อมูลสถาบัน */}
      <section className="card space-y-5 p-6">
        <h2 className="text-lg font-semibold">ข้อมูลสถาบัน</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">ชื่อสถาบัน</label>
            <input name="siteName" defaultValue={settings.siteName} className="input" />
          </div>

          <div>
            <label className="label">โลโก้</label>
            <input name="logo" type="file" accept="image/*" className="input py-2" />
            <p className="mt-1.5 text-xs text-ink-soft">
              {settings.logoUrl
                ? 'มีโลโก้อยู่แล้ว อัปโหลดใหม่เพื่อแทนที่'
                : 'ยังไม่ได้อัปโหลด ระบบจะใช้สัญลักษณ์ตัวอักษรไปก่อน'}
            </p>
            {settings.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.logoUrl}
                alt="โลโก้ปัจจุบัน"
                className="mt-3 h-14 w-14 rounded-xl border border-ink-line object-contain"
              />
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="label">คำโปรยของสถาบัน</label>
            <input name="tagline" defaultValue={settings.tagline} className="input" />
          </div>

          <div className="sm:col-span-2">
            <label className="label">เกี่ยวกับสถาบัน</label>
            <textarea name="aboutText" defaultValue={settings.aboutText} className="textarea" />
          </div>
        </div>
      </section>

      {/* ข้อมูลติดต่อ */}
      <section className="card space-y-5 p-6">
        <h2 className="text-lg font-semibold">ข้อมูลติดต่อ</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">เบอร์โทร</label>
            <input name="contactPhone" defaultValue={settings.contactPhone} className="input" />
          </div>
          <div>
            <label className="label">อีเมล</label>
            <input name="contactEmail" defaultValue={settings.contactEmail} className="input" />
          </div>
          <div>
            <label className="label">LINE</label>
            <input name="contactLine" defaultValue={settings.contactLine} className="input" />
          </div>
          <div>
            <label className="label">เฟซบุ๊ก (ลิงก์)</label>
            <input name="facebookUrl" defaultValue={settings.facebookUrl} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">ที่อยู่</label>
            <input name="contactAddress" defaultValue={settings.contactAddress} className="input" />
          </div>
        </div>
      </section>

      {/* ช่องทางรับชำระเงิน */}
      <section className="card space-y-5 p-6">
        <h2 className="text-lg font-semibold">ช่องทางรับชำระเงิน</h2>
        <p className="text-sm text-ink-soft">ข้อมูลนี้จะแสดงในหน้าชำระเงินของนักเรียน</p>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">ธนาคาร</label>
            <input name="bankName" defaultValue={settings.bankName} className="input" />
          </div>
          <div>
            <label className="label">สาขา</label>
            <input name="bankBranch" defaultValue={settings.bankBranch} className="input" />
          </div>
          <div>
            <label className="label">เลขที่บัญชี</label>
            <input name="bankAccountNo" defaultValue={settings.bankAccountNo} className="input" />
          </div>
          <div>
            <label className="label">ชื่อบัญชี</label>
            <input name="bankAccountName" defaultValue={settings.bankAccountName} className="input" />
          </div>
          <div>
            <label className="label">พร้อมเพย์ (เบอร์หรือเลขประจำตัว)</label>
            <input name="promptpayId" defaultValue={settings.promptpayId} className="input" />
          </div>
          <div>
            <label className="label">รูป QR พร้อมเพย์</label>
            <input name="promptpayQr" type="file" accept="image/*" className="input py-2" />
            {settings.promptpayQrUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.promptpayQrUrl}
                alt="QR ปัจจุบัน"
                className="mt-3 h-28 w-28 rounded-xl border border-ink-line object-contain"
              />
            )}
          </div>
        </div>

        <label className="flex items-center gap-2 border-t border-ink-line pt-5 text-sm">
          <input
            type="checkbox"
            name="cardEnabled"
            defaultChecked={settings.cardEnabled}
            className="accent-brand-600"
          />
          เปิดตัวเลือกชำระด้วยบัตรเครดิต/เดบิต (ต้องต่อระบบรับชำระเงินก่อนจึงจะใช้งานได้จริง)
        </label>
      </section>

      {state?.error && (
        <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">{state.success}</p>
      )}

      <SubmitButton />
    </form>
  );
}
