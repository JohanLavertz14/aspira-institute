import Link from 'next/link';
import { readSession } from '@/lib/auth';
import { getSiteSettings } from '@/lib/settings';
import { Logo } from './logo';
import { MobileMenu } from './mobile-menu';
import { logoutAction } from '@/app/actions/auth';

const NAV = [
  { href: '/courses', label: 'คอร์สเรียนทั้งหมด' },
  { href: '/#subjects', label: 'วิชาที่เปิดสอน' },
  { href: '/#how', label: 'เรียนอย่างไร' },
  { href: '/#contact', label: 'ติดต่อสถาบัน' },
];

export async function SiteHeader() {
  const [session, settings] = await Promise.all([readSession(), getSiteSettings()]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-line/80 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <Logo logoUrl={settings.logoUrl} siteName={settings.siteName} size="sm" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-sm text-ink-soft transition hover:bg-brand-50 hover:text-brand-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {session ? (
            <>
              {session.role === 'ADMIN' && (
                <Link href="/admin" className="btn-ghost btn-sm">
                  หลังบ้าน
                </Link>
              )}
              <Link href="/my-courses" className="btn-outline btn-sm">
                คอร์สของฉัน
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="btn-ghost btn-sm">
                  ออกจากระบบ
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost btn-sm">
                เข้าสู่ระบบ
              </Link>
              <Link href="/register" className="btn-primary btn-sm">
                สมัครเรียน
              </Link>
            </>
          )}
        </div>

        <MobileMenu nav={NAV} session={session} />
      </div>
    </header>
  );
}
