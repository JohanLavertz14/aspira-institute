import Link from 'next/link';
import { redirect } from 'next/navigation';
import { readSession } from '@/lib/auth';
import { getSiteSettings } from '@/lib/settings';
import { Logo } from '@/components/logo';
import { RegisterForm } from './register-form';

export const metadata = { title: 'สมัครสมาชิก' };

export default async function RegisterPage() {
  const session = await readSession();
  if (session) redirect('/my-courses');

  const settings = await getSiteSettings();

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-16 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <Link href="/">
            <Logo logoUrl={settings.logoUrl} siteName={settings.siteName} />
          </Link>

          <h1 className="mt-10 text-2xl font-semibold tracking-tight">สมัครสมาชิก</h1>
          <p className="mt-2 text-sm text-ink-soft">
            สมัครฟรี ไม่มีค่าใช้จ่าย จ่ายเฉพาะคอร์สที่เลือกเรียน
          </p>

          <RegisterForm />

          <p className="mt-6 text-sm text-ink-soft">
            มีบัญชีอยู่แล้ว{' '}
            <Link href="/login" className="font-medium text-brand-700 hover:underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden bg-brand-50 lg:block">
        <div className="flex h-full flex-col justify-center px-14">
          <h2 className="max-w-md text-3xl font-semibold leading-snug text-ink">
            สมัครครั้งเดียว เรียนได้ทุกคอร์สที่ซื้อไว้
          </h2>
          <div className="mt-8 space-y-4">
            {[
              ['1', 'สมัครสมาชิกด้วยอีเมล', 'ใช้อีเมลจริงเพื่อรับข่าวสารและกู้คืนบัญชี'],
              ['2', 'เลือกคอร์สและแจ้งชำระเงิน', 'โอนแล้วอัปโหลดสลิปในระบบได้ทันที'],
              ['3', 'รอแอดมินอนุมัติ', 'ปกติภายในไม่กี่ชั่วโมงในเวลาทำการ'],
              ['4', 'เริ่มเรียนได้เลย', 'ดูคลิป โหลดชีท ทำแบบทดสอบ ถามครูได้'],
            ].map(([n, title, desc]) => (
              <div key={n} className="flex gap-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                  {n}
                </span>
                <div>
                  <p className="font-medium text-ink">{title}</p>
                  <p className="text-sm text-ink-soft">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
