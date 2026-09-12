'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createCourseAction, type AdminState } from '@/app/actions/admin';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? 'กำลังสร้าง...' : 'สร้างคอร์ส'}
    </button>
  );
}

export function NewCourseForm({ subjects }: { subjects: { id: string; name: string }[] }) {
  const [state, formAction] = useActionState<AdminState, FormData>(createCourseAction, null);

  return (
    <form action={formAction} className="card space-y-5 p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="title">
            ชื่อคอร์ส
          </label>
          <input id="title" name="title" required className="input" placeholder="เช่น คณิตศาสตร์ ม.4 เทอม 1" />
        </div>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="subtitle">
            คำโปรย
          </label>
          <input id="subtitle" name="subtitle" className="input" placeholder="เช่น เซต ตรรกศาสตร์ และจำนวนจริง" />
        </div>

        <div>
          <label className="label" htmlFor="subjectId">
            วิชา
          </label>
          <select id="subjectId" name="subjectId" required className="select">
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="level">
            ระดับชั้น
          </label>
          <select id="level" name="level" className="select" defaultValue="ม.ปลาย">
            <option value="ม.ต้น">ม.ต้น</option>
            <option value="ม.ปลาย">ม.ปลาย</option>
            <option value="อื่นๆ">อื่นๆ</option>
          </select>
        </div>

        <div>
          <label className="label" htmlFor="price">
            ราคา (บาท)
          </label>
          <input id="price" name="price" type="number" min={0} defaultValue={0} className="input" />
        </div>

        <div>
          <label className="label" htmlFor="comparePrice">
            ราคาก่อนลด (ไม่บังคับ)
          </label>
          <input id="comparePrice" name="comparePrice" type="number" min={0} className="input" />
        </div>

        <div>
          <label className="label" htmlFor="accessDays">
            จำนวนวันที่เรียนได้
          </label>
          <input id="accessDays" name="accessDays" type="number" min={1} defaultValue={180} className="input" />
        </div>

        <div>
          <label className="label" htmlFor="totalHours">
            ความยาวรวม (ชั่วโมง)
          </label>
          <input id="totalHours" name="totalHours" type="number" min={0} step={0.5} defaultValue={0} className="input" />
        </div>

        <div>
          <label className="label" htmlFor="teacherName">
            ชื่อผู้สอน
          </label>
          <input id="teacherName" name="teacherName" className="input" placeholder="เช่น ครูพี่วิน" />
        </div>

        <div>
          <label className="label" htmlFor="slug">
            slug (ไม่บังคับ)
          </label>
          <input id="slug" name="slug" className="input" placeholder="math-m4-term1" />
        </div>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="description">
            รายละเอียดคอร์ส
          </label>
          <textarea id="description" name="description" className="textarea" />
        </div>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="teacherBio">
            แนะนำผู้สอน
          </label>
          <textarea id="teacherBio" name="teacherBio" className="textarea min-h-[80px]" />
        </div>
      </div>

      <div className="flex flex-wrap gap-6 border-t border-ink-line pt-5">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublished" className="accent-brand-600" />
          เผยแพร่คอร์สทันที
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isFeatured" className="accent-brand-600" />
          แสดงในคอร์สแนะนำหน้าแรก
        </label>
      </div>

      {state?.error && (
        <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{state.error}</p>
      )}

      <SubmitButton />
    </form>
  );
}
