import Link from 'next/link';
import { getSiteSettings } from '@/lib/settings';
import { Logo } from './logo';

/** ข้อมูลติดต่อที่ยังไม่ได้กรอกจะแสดงเป็นเส้นประไว้ให้เห็นว่าต้องเติม */
function ContactLine({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex gap-2 text-sm">
      <span className="w-20 shrink-0 text-ink-soft">{label}</span>
      {value ? (
        <span className="text-ink">{value}</span>
      ) : (
        <span className="text-ink-soft/50">(ยังไม่ได้กรอก)</span>
      )}
    </li>
  );
}

export async function SiteFooter() {
  const settings = await getSiteSettings();

  return (
    <footer id="contact" className="mt-24 border-t border-ink-line bg-brand-50/40">
      <div className="container-page grid gap-10 py-14 md:grid-cols-3">
        <div>
          <Logo logoUrl={settings.logoUrl} siteName={settings.siteName} />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
            {settings.tagline || 'สถาบันกวดวิชาที่ออกแบบคอร์สจากห้องเรียนจริง'}
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-ink">เมนูลัด</h3>
          <ul className="space-y-2 text-sm text-ink-soft">
            <li>
              <Link href="/courses" className="hover:text-brand-700">
                คอร์สเรียนทั้งหมด
              </Link>
            </li>
            <li>
              <Link href="/my-courses" className="hover:text-brand-700">
                คอร์สของฉัน
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-brand-700">
                คำสั่งซื้อและการชำระเงิน
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-brand-700">
                สมัครสมาชิก
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-ink">ติดต่อสถาบัน</h3>
          <ul className="space-y-2">
            <ContactLine label="โทร" value={settings.contactPhone} />
            <ContactLine label="อีเมล" value={settings.contactEmail} />
            <ContactLine label="LINE" value={settings.contactLine} />
            <ContactLine label="ที่อยู่" value={settings.contactAddress} />
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-line/70 py-5">
        <p className="container-page text-center text-xs text-ink-soft">
          © {new Date().getFullYear()} {settings.siteName} สงวนลิขสิทธิ์
        </p>
      </div>
    </footer>
  );
}
