import type { Metadata } from 'next';
import './globals.css';
import { getSiteSettings } from '@/lib/settings';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings().catch(() => null);
  const name = settings?.siteName ?? 'Aspira Institute';
  return {
    title: {
      default: `${name} | คอร์สเรียนออนไลน์`,
      template: `%s | ${name}`,
    },
    description:
      settings?.tagline || 'คอร์สเรียนออนไลน์ของสถาบัน Aspira Institute เรียนซ้ำได้ พร้อมชีทและแบบทดสอบท้ายบท',
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
