import Link from 'next/link';
import { prisma } from '@/lib/db';
import { formatThaiDate } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const students = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      ...(q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }] } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { enrollments: true, orders: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">นักเรียน</h1>
        <p className="mt-1.5 text-sm text-ink-soft">ทั้งหมด {students.length} คน</p>
      </div>

      <form action="/admin/students" className="flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ''}
          className="input max-w-sm"
          placeholder="ค้นหาชื่อหรืออีเมล"
        />
        <button type="submit" className="btn-primary">
          ค้นหา
        </button>
      </form>

      <div className="card overflow-x-auto">
        <table className="table-basic">
          <thead>
            <tr>
              <th>ชื่อ</th>
              <th>อีเมล</th>
              <th>ระดับชั้น</th>
              <th>คอร์สที่เรียน</th>
              <th>คำสั่งซื้อ</th>
              <th>สมัครเมื่อ</th>
              <th>สถานะ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td className="font-medium">{s.name}</td>
                <td className="text-ink-soft">{s.email}</td>
                <td>{s.gradeLevel ?? '-'}</td>
                <td>{s._count.enrollments}</td>
                <td>{s._count.orders}</td>
                <td className="whitespace-nowrap text-ink-soft">{formatThaiDate(s.createdAt)}</td>
                <td>
                  {s.isActive ? (
                    <span className="badge-green">ใช้งานอยู่</span>
                  ) : (
                    <span className="badge-red">ระงับ</span>
                  )}
                </td>
                <td className="text-right">
                  <Link href={`/admin/students/${s.id}`} className="btn-outline btn-sm">
                    ดูข้อมูล
                  </Link>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-ink-soft">
                  ไม่พบนักเรียนที่ตรงกับคำค้นหา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
