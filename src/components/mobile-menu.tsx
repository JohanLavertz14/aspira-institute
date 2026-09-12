'use client';

import Link from 'next/link';
import { useState } from 'react';
import { logoutAction } from '@/app/actions/auth';

type Session = { name: string; role: string } | null;

export function MobileMenu({
  nav,
  session,
}: {
  nav: { href: string; label: string }[];
  session: Session;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="เปิดเมนู"
        aria-expanded={open}
        className="grid h-10 w-10 place-items-center rounded-xl border border-ink-line text-ink"
      >
        <span className="sr-only">เมนู</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-16 border-b border-ink-line bg-white p-4 shadow-lift">
          <nav className="flex flex-col">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm text-ink hover:bg-brand-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-3 flex flex-col gap-2 border-t border-ink-line pt-3">
            {session ? (
              <>
                {session.role === 'ADMIN' && (
                  <Link href="/admin" onClick={() => setOpen(false)} className="btn-outline">
                    หลังบ้าน
                  </Link>
                )}
                <Link href="/my-courses" onClick={() => setOpen(false)} className="btn-primary">
                  คอร์สของฉัน
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className="btn-ghost w-full">
                    ออกจากระบบ
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="btn-outline">
                  เข้าสู่ระบบ
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="btn-primary">
                  สมัครเรียน
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
