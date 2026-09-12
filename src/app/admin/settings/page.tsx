import { getSiteSettings } from '@/lib/settings';
import { SettingsForm } from './settings-form';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const s = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">ตั้งค่าเว็บ</h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          ข้อมูลสถาบัน โลโก้ และบัญชีรับชำระเงินที่แสดงในหน้าสั่งซื้อ
        </p>
      </div>

      <SettingsForm
        settings={{
          siteName: s.siteName,
          tagline: s.tagline,
          aboutText: s.aboutText,
          logoUrl: s.logoUrl,
          contactPhone: s.contactPhone,
          contactEmail: s.contactEmail,
          contactLine: s.contactLine,
          contactAddress: s.contactAddress,
          facebookUrl: s.facebookUrl,
          bankName: s.bankName,
          bankBranch: s.bankBranch,
          bankAccountNo: s.bankAccountNo,
          bankAccountName: s.bankAccountName,
          promptpayId: s.promptpayId,
          promptpayQrUrl: s.promptpayQrUrl,
          cardEnabled: s.cardEnabled,
        }}
      />
    </div>
  );
}
