import Link from 'next/link';
import { redirect } from 'next/navigation';
import { readSession } from '@/lib/auth';
import { getSiteSettings } from '@/lib/settings';
import { Logo } from '@/components/logo';
import { LoginForm } from './login-form';

export const metadata = { title: 'เข้าสู่ระบบ' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const session = await readSession();
  if (session) redirect('/my-courses');

  const { redirectTo } = await searchParams;
  const settings = await getSiteSettings();

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-16 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/">
            <Logo logoUrl={settings.logoUrl} siteName={settings.siteName} />
          </Link>

          <h1 className="mt-10 text-2xl font-semibold tracking-tight">เข้าสู่ระบบ</h1>
          <p className="mt-2 text-sm text-ink-soft">
            ใช้อีเมลและรหัสผ่านที่สมัครไว้ เพื่อเข้าเรียนคอร์สของคุณ
          </p>

          <LoginForm redirectTo={redirectTo} />

          <p className="mt-6 text-sm text-ink-soft">
            ยังไม่มีบัญชี{' '}
            <Link href="/register" className="font-medium text-brand-700 hover:underline">
              สมัครสมาชิกที่นี่
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 lg:block">
        <div className="flex h-full flex-col justify-center px-14 text-white">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/70">
            {settings.siteName}
          </p>
          <h2 className="mt-4 max-w-md text-3xl font-semibold leading-snug">
            {settings.tagline || 'เรียนออนไลน์กับติวเตอร์ตัวจริง ทบทวนซ้ำได้ทุกที่ทุกเวลา'}
          </h2>
          <ul className="mt-8 space-y-3 text-sm text-white/85">
            <li>• คลิปบทเรียนเต็มหลักสูตร ดูซ้ำได้ตลอดอายุคอร์ส</li>
            <li>• ชีทสรุปและแบบฝึกหัดดาวน์โหลดได้ทุกบท</li>
            <li>• แบบทดสอบท้ายบทตรวจคำตอบอัตโนมัติ</li>
            <li>• ถามครูใต้คลิปได้ทันทีเมื่อติดตรงไหน</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
