'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateCourseAction, type AdminState } from '@/app/actions/admin';

type CourseForm = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  subjectId: string;
  level: string;
  price: number;
  comparePrice: number | null;
  accessDays: number;
  teacherName: string;
  teacherBio: string;
  totalHours: number;
  isPublished: boolean;
  isFeatured: boolean;
  coverImage: string | null;
  materialTitle: string;
  materialUrl: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? 'กำลังบันทึก...' : 'บันทึกข้อมูลคอร์ส'}
    </button>
  );
}

export function EditCourseForm({
  course,
  subjects,
}: {
  course: CourseForm;
  subjects: { id: string; name: string }[];
}) {
  const [state, formAction] = useActionState<AdminState, FormData>(updateCourseAction, null);

  return (
    <form action={formAction} className="card space-y-5 p-6">
      <input type="hidden" name="id" value={course.id} />
      <h2 className="text-lg font-semibold">ข้อมูลคอร์ส</h2>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">ชื่อคอร์ส</label>
          <input name="title" required defaultValue={course.title} className="input" />
        </div>

        <div className="sm:col-span-2">
          <label className="label">คำโปรย</label>
          <input name="subtitle" defaultValue={course.subtitle} className="input" />
        </div>

        <div>
          <label className="label">วิชา</label>
          <select name="subjectId" defaultValue={course.subjectId} className="select">
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">ระดับชั้น</label>
          <select name="level" defaultValue={course.level} className="select">
            <option value="ม.ต้น">ม.ต้น</option>
            <option value="ม.ปลาย">ม.ปลาย</option>
            <option value="อื่นๆ">อื่นๆ</option>
          </select>
        </div>

        <div>
          <label className="label">ราคา (บาท)</label>
          <input name="price" type="number" min={0} defaultValue={course.price} className="input" />
        </div>

        <div>
          <label className="label">ราคาก่อนลด</label>
          <input
            name="comparePrice"
            type="number"
            min={0}
            defaultValue={course.comparePrice ?? ''}
            className="input"
          />
        </div>

        <div>
          <label className="label">จำนวนวันที่เรียนได้</label>
          <input name="accessDays" type="number" min={1} defaultValue={course.accessDays} className="input" />
        </div>

        <div>
          <label className="label">ความยาวรวม (ชั่วโมง)</label>
          <input
            name="totalHours"
            type="number"
            min={0}
            step={0.5}
            defaultValue={course.totalHours}
            className="input"
          />
        </div>

        <div>
          <label className="label">ชื่อผู้สอน</label>
          <input name="teacherName" defaultValue={course.teacherName} className="input" />
        </div>

        <div>
          <label className="label">ภาพหน้าปก (ไม่บังคับ)</label>
          <input name="coverImage" type="file" accept="image/*" className="input py-2" />
          {course.coverImage && (
            <p className="mt-1.5 text-xs text-ink-soft">ใช้ภาพปัจจุบันอยู่ อัปโหลดใหม่เพื่อแทนที่</p>
          )}
        </div>

        <div className="sm:col-span-2 rounded-xl border border-brand-200 bg-brand-50/50 p-4">
          <p className="text-sm font-medium text-ink">เอกสารประกอบคอร์ส (ชีทเล่มเต็ม)</p>
          <p className="mt-1 text-xs text-ink-soft">
            ไฟล์นี้จะแสดงให้นักเรียนดาวน์โหลดได้ตั้งแต่ก่อนเริ่มเรียน แยกจากชีทของแต่ละบทเรียน
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label text-xs">ชื่อเอกสารที่จะแสดง</label>
              <input
                name="materialTitle"
                defaultValue={course.materialTitle}
                className="input"
                placeholder="เช่น ชีทเรียน Chemistry Foundation"
              />
            </div>
            <div>
              <label className="label text-xs">ไฟล์ PDF (ไม่เกิน 25MB)</label>
              <input name="material" type="file" accept="application/pdf" className="input py-2" />
            </div>
          </div>

          {course.materialUrl && (
            <p className="mt-3 text-xs text-ink-soft">
              ไฟล์ปัจจุบัน{' '}
              <a
                href={course.materialUrl}
                target="_blank"
                rel="noreferrer"
                className="text-brand-700 hover:underline"
              >
                {course.materialUrl}
              </a>{' '}
              อัปโหลดใหม่เพื่อแทนที่
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="label">รายละเอียดคอร์ส</label>
          <textarea name="description" defaultValue={course.description} className="textarea min-h-[140px]" />
        </div>

        <div className="sm:col-span-2">
          <label className="label">แนะนำผู้สอน</label>
          <textarea name="teacherBio" defaultValue={course.teacherBio} className="textarea min-h-[80px]" />
        </div>
      </div>

      <div className="flex flex-wrap gap-6 border-t border-ink-line pt-5">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={course.isPublished}
            className="accent-brand-600"
          />
          เผยแพร่คอร์สนี้
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={course.isFeatured}
            className="accent-brand-600"
          />
          แสดงในคอร์สแนะนำหน้าแรก
        </label>
      </div>

      {state?.error && (
        <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">{state.success}</p>
      )}

      <SubmitButton />
    </form>
  );
}
