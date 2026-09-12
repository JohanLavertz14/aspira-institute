import Link from 'next/link';
import { prisma } from '@/lib/db';
import { NewCourseForm } from './new-course-form';

export const dynamic = 'force-dynamic';

export default async function NewCoursePage() {
  const subjects = await prisma.subject.findMany({ orderBy: { order: 'asc' } });

  return (
    <div className="space-y-6">
      <nav className="text-sm text-ink-soft">
        <Link href="/admin/courses" className="hover:text-brand-700">
          ← กลับไปหน้าจัดการคอร์ส
        </Link>
      </nav>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">สร้างคอร์สใหม่</h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          กรอกข้อมูลหลักก่อน แล้วค่อยเพิ่มบทและบทเรียนในหน้าถัดไป
        </p>
      </div>

      {subjects.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="font-medium text-ink">ยังไม่มีวิชาในระบบ</p>
          <p className="mt-1.5 text-sm text-ink-soft">ต้องสร้างวิชาก่อนจึงจะสร้างคอร์สได้</p>
          <Link href="/admin/subjects" className="btn-primary mt-5">
            ไปหน้าจัดการวิชา
          </Link>
        </div>
      ) : (
        <NewCourseForm subjects={subjects.map((s) => ({ id: s.id, name: s.name }))} />
      )}
    </div>
  );
}
