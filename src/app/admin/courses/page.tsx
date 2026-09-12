import Link from 'next/link';
import { prisma } from '@/lib/db';
import { formatBaht } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: [{ isPublished: 'desc' }, { order: 'asc' }],
    include: {
      subject: true,
      _count: { select: { enrollments: true } },
      chapters: { include: { _count: { select: { lessons: true } } } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">จัดการคอร์ส</h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            ทั้งหมด {courses.length} คอร์ส (เผยแพร่แล้ว {courses.filter((c) => c.isPublished).length})
          </p>
        </div>
        <Link href="/admin/courses/new" className="btn-primary">
          + สร้างคอร์สใหม่
        </Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="table-basic">
          <thead>
            <tr>
              <th>คอร์ส</th>
              <th>วิชา</th>
              <th>ราคา</th>
              <th>บทเรียน</th>
              <th>นักเรียน</th>
              <th>สถานะ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id}>
                <td className="min-w-[240px]">
                  <span className="block font-medium text-ink">{c.title}</span>
                  <span className="block text-xs text-ink-soft">{c.subtitle}</span>
                </td>
                <td>
                  <span
                    className="badge"
                    style={{ background: `${c.subject.colorHex}1a`, color: c.subject.colorHex }}
                  >
                    {c.subject.name}
                  </span>
                </td>
                <td className="whitespace-nowrap">{formatBaht(c.price)}</td>
                <td>{c.chapters.reduce((s, ch) => s + ch._count.lessons, 0)} บท</td>
                <td>{c._count.enrollments} คน</td>
                <td>
                  {c.isPublished ? (
                    <span className="badge-green">เผยแพร่</span>
                  ) : (
                    <span className="badge-gray">ฉบับร่าง</span>
                  )}
                </td>
                <td className="text-right">
                  <Link href={`/admin/courses/${c.id}`} className="btn-outline btn-sm">
                    จัดการ
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
