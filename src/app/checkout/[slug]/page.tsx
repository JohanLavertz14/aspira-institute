import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { readSession } from '@/lib/auth';
import { getSiteSettings } from '@/lib/settings';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { formatBaht } from '@/lib/format';
import { CheckoutForm } from './checkout-form';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'สั่งซื้อคอร์ส' };

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await readSession();
  if (!session) redirect(`/login?redirectTo=/checkout/${slug}`);

  const course = await prisma.course.findUnique({
    where: { slug },
    include: { subject: true, chapters: { include: { _count: { select: { lessons: true } } } } },
  });
  if (!course || !course.isPublished) notFound();

  const settings = await getSiteSettings();
  const lessonCount = course.chapters.reduce((s, ch) => s + ch._count.lessons, 0);

  return (
    <>
      <SiteHeader />

      <main className="container-page py-12">
        <nav className="text-sm text-ink-soft">
          <Link href={`/courses/${course.slug}`} className="hover:text-brand-700">
            ← กลับไปหน้าคอร์ส
          </Link>
        </nav>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight">ยืนยันการสั่งซื้อ</h1>
        <p className="mt-2 text-ink-soft">
          ตรวจสอบรายละเอียดคอร์สและเลือกวิธีชำระเงิน ระบบจะออกเลขที่คำสั่งซื้อให้ในขั้นถัดไป
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="card p-6">
              <h2 className="text-lg font-semibold">คอร์สที่เลือก</h2>
              <div className="mt-4 flex gap-4">
                <span
                  className="h-20 w-28 shrink-0 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${course.subject.colorHex} 0%, rgba(28,20,32,0.85) 130%)`,
                  }}
                />
                <div>
                  <p className="font-semibold text-ink">{course.title}</p>
                  <p className="mt-1 text-sm text-ink-soft">{course.subtitle}</p>
                  <p className="mt-2 text-xs text-ink-soft">
                    {course.subject.name} · {course.level} · {lessonCount} บทเรียน
                  </p>
                </div>
              </div>
            </div>

            <CheckoutForm slug={course.slug} cardEnabled={settings.cardEnabled} />
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <h2 className="text-lg font-semibold">สรุปยอดชำระ</h2>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-soft">ราคาคอร์ส</dt>
                  <dd>{formatBaht(course.comparePrice ?? course.price)}</dd>
                </div>
                {course.comparePrice && course.comparePrice > course.price && (
                  <div className="flex justify-between text-emerald-600">
                    <dt>ส่วนลด</dt>
                    <dd>-{formatBaht(course.comparePrice - course.price)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-ink-line pt-3 text-base font-semibold">
                  <dt>ยอดที่ต้องชำระ</dt>
                  <dd className="text-brand-700">{formatBaht(course.price)}</dd>
                </div>
              </dl>

              <p className="mt-5 rounded-xl bg-brand-50 px-4 py-3 text-xs leading-relaxed text-ink-soft">
                เมื่อแอดมินอนุมัติการชำระเงินแล้ว ระบบจะเปิดสิทธิ์เรียนให้อัตโนมัติเป็นเวลา{' '}
                {course.accessDays} วัน
              </p>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
