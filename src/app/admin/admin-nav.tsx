'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/admin', label: 'ภาพรวม', exact: true },
  { href: '/admin/payments', label: 'ตรวจสอบการชำระเงิน', badge: true },
  { href: '/admin/courses', label: 'จัดการคอร์ส' },
  { href: '/admin/subjects', label: 'จัดการวิชา' },
  { href: '/admin/students', label: 'นักเรียน' },
  { href: '/admin/settings', label: 'ตั้งค่าเว็บ' },
];

export function AdminNav({ waitingCount }: { waitingCount: number }) {
  const pathname = usePathname();

  return (
    <nav className="lg:w-60 lg:shrink-0">
      <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="shrink-0 lg:shrink">
              <Link
                href={item.href}
                className={`flex items-center justify-between gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm transition ${
                  active ? 'bg-brand-600 font-medium text-white' : 'text-ink-soft hover:bg-brand-50'
                }`}
              >
                {item.label}
                {item.badge && waitingCount > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      active ? 'bg-white/25 text-white' : 'bg-brand-600 text-white'
                    }`}
                  >
                    {waitingCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
