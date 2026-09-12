import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getSiteSettings } from '@/lib/settings';
import { prisma } from '@/lib/db';
import { Logo } from '@/components/logo';
import { logoutAction } from '@/app/actions/auth';
import { AdminNav } from './admin-nav';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'หลังบ้าน' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirectTo=/admin');
  if (user.role !== 'ADMIN') redirect('/my-courses');

  const [settings, waitingCount] = await Promise.all([
    getSiteSettings(),
    prisma.payment.count({ where: { status: 'PENDING' } }),
  ]);

  return (
    <div className="min-h-screen bg-brand-50/30">
      <header className="border-b border-ink-line bg-white">
        <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Logo logoUrl={settings.logoUrl} siteName={settings.siteName} size="sm" />
            </Link>
            <span className="badge-brand hidden sm:inline-flex">หลังบ้าน</span>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/" className="btn-ghost btn-sm">
              ดูหน้าเว็บ
            </Link>
            <span className="hidden text-sm text-ink-soft sm:inline">{user.name}</span>
            <form action={logoutAction}>
              <button type="submit" className="btn-outline btn-sm">
                ออกจากระบบ
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-6 lg:flex-row">
        <AdminNav waitingCount={waitingCount} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
