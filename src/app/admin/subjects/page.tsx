import { prisma } from '@/lib/db';
import { deleteSubjectAction, updateSubjectAction } from '@/app/actions/admin';
import { NewSubjectForm } from './new-subject-form';

export const dynamic = 'force-dynamic';

export default async function AdminSubjectsPage() {
  const subjects = await prisma.subject.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { courses: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">จัดการวิชา</h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          วิชาใช้จัดกลุ่มคอร์สและกำหนดสีประจำวิชาที่ใช้แสดงบนเว็บ
        </p>
      </div>

      <div className="space-y-3">
        {subjects.map((s) => (
          <form key={s.id} action={updateSubjectAction} className="card flex flex-wrap items-end gap-3 p-4">
            <input type="hidden" name="id" value={s.id} />

            <div className="w-16">
              <label className="label text-xs">สี</label>
              <input name="colorHex" type="color" defaultValue={s.colorHex} className="input h-10 p-1" />
            </div>

            <div className="min-w-[160px] flex-1">
              <label className="label text-xs">ชื่อวิชา</label>
              <input name="name" defaultValue={s.name} className="input" />
            </div>

            <div className="min-w-[200px] flex-[2]">
              <label className="label text-xs">คำอธิบาย</label>
              <input name="description" defaultValue={s.description ?? ''} className="input" />
            </div>

            <div className="w-20">
              <label className="label text-xs">ลำดับ</label>
              <input name="order" type="number" defaultValue={s.order} className="input" />
            </div>

            <label className="flex h-10 items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={s.isActive}
                className="accent-brand-600"
              />
              เปิดใช้
            </label>

            <span className="badge-gray h-fit">{s._count.courses} คอร์ส</span>

            <button type="submit" className="btn-outline btn-sm">
              บันทึก
            </button>

            {s._count.courses === 0 && (
              <button
                type="submit"
                formAction={deleteSubjectAction}
                className="btn-danger btn-sm"
              >
                ลบ
              </button>
            )}
          </form>
        ))}
      </div>

      <NewSubjectForm />
    </div>
  );
}
