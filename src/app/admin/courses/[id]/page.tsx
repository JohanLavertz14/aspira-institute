import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { formatDuration } from '@/lib/format';
import {
  createChapterAction,
  createLessonAction,
  deleteChapterAction,
  deleteCourseAction,
  updateChapterAction,
} from '@/app/actions/admin';
import { EditCourseForm } from './edit-course-form';

export const dynamic = 'force-dynamic';

export default async function AdminCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [course, subjects] = await Promise.all([
    prisma.course.findUnique({
      where: { id },
      include: {
        subject: true,
        _count: { select: { enrollments: true } },
        chapters: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              include: { _count: { select: { attachments: true } }, quiz: { select: { id: true } } },
            },
          },
        },
      },
    }),
    prisma.subject.findMany({ orderBy: { order: 'asc' } }),
  ]);

  if (!course) notFound();

  return (
    <div className="space-y-6">
      <nav className="text-sm text-ink-soft">
        <Link href="/admin/courses" className="hover:text-brand-700">
          ← กลับไปหน้าจัดการคอร์ส
        </Link>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{course.title}</h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            {course.subject.name} · นักเรียน {course._count.enrollments} คน ·{' '}
            {course.isPublished ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}
          </p>
        </div>
        <Link href={`/courses/${course.slug}`} target="_blank" className="btn-outline btn-sm">
          ดูหน้าคอร์สจริง
        </Link>
      </div>

      <EditCourseForm
        course={{
          id: course.id,
          title: course.title,
          subtitle: course.subtitle ?? '',
          description: course.description,
          subjectId: course.subjectId,
          level: course.level,
          price: course.price,
          comparePrice: course.comparePrice,
          accessDays: course.accessDays,
          teacherName: course.teacherName,
          teacherBio: course.teacherBio ?? '',
          totalHours: course.totalHours,
          isPublished: course.isPublished,
          isFeatured: course.isFeatured,
          coverImage: course.coverImage,
          materialTitle: course.materialTitle ?? '',
          materialUrl: course.materialUrl,
        }}
        subjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
      />

      {/* บทและบทเรียน */}
      <section className="card p-6">
        <h2 className="text-lg font-semibold">บทและบทเรียน</h2>
        <p className="mt-1.5 text-sm text-ink-soft">
          ลำดับน้อยกว่าจะแสดงก่อน กดที่ชื่อบทเรียนเพื่อแก้ลิงก์วิดีโอ ชีท และแบบทดสอบ
        </p>

        <div className="mt-5 space-y-5">
          {course.chapters.map((ch) => (
            <div key={ch.id} className="rounded-2xl border border-ink-line">
              <div className="border-b border-ink-line bg-brand-50/40 p-4">
                <form action={updateChapterAction} className="flex flex-wrap items-end gap-3">
                  <input type="hidden" name="id" value={ch.id} />
                  <div className="min-w-[200px] flex-1">
                    <label className="label text-xs">ชื่อบท</label>
                    <input name="title" defaultValue={ch.title} className="input" />
                  </div>
                  <div className="min-w-[200px] flex-1">
                    <label className="label text-xs">คำอธิบายบท</label>
                    <input name="summary" defaultValue={ch.summary ?? ''} className="input" />
                  </div>
                  <div className="w-24">
                    <label className="label text-xs">ลำดับ</label>
                    <input name="order" type="number" defaultValue={ch.order} className="input" />
                  </div>
                  <button type="submit" className="btn-outline btn-sm">
                    บันทึก
                  </button>
                </form>
              </div>

              <ul className="divide-y divide-ink-line/70">
                {ch.lessons.map((l) => (
                  <li key={l.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <span className="w-8 shrink-0 text-xs text-ink-soft">{l.order + 1}</span>
                    <Link
                      href={`/admin/lessons/${l.id}`}
                      className="min-w-0 flex-1 text-sm font-medium text-ink hover:text-brand-700"
                    >
                      {l.title}
                    </Link>
                    <span className="shrink-0 text-xs text-ink-soft">
                      {formatDuration(l.durationMin)}
                    </span>
                    {l.isPreview && <span className="badge-green shrink-0">ตัวอย่างฟรี</span>}
                    {l._count.attachments > 0 && (
                      <span className="badge-gray shrink-0">ชีท {l._count.attachments}</span>
                    )}
                    {l.quiz && <span className="badge-brand shrink-0">มีแบบทดสอบ</span>}
                    {!l.videoId && <span className="badge-amber shrink-0">ยังไม่ใส่วิดีโอ</span>}
                    <Link href={`/admin/lessons/${l.id}`} className="btn-ghost btn-sm shrink-0">
                      แก้ไข
                    </Link>
                  </li>
                ))}
                {ch.lessons.length === 0 && (
                  <li className="px-4 py-3 text-sm text-ink-soft">ยังไม่มีบทเรียนในบทนี้</li>
                )}
              </ul>

              <div className="border-t border-ink-line bg-white p-4">
                <form action={createLessonAction} className="flex flex-wrap items-end gap-3">
                  <input type="hidden" name="chapterId" value={ch.id} />
                  <div className="min-w-[220px] flex-1">
                    <label className="label text-xs">เพิ่มบทเรียนใหม่</label>
                    <input name="title" required className="input" placeholder="ชื่อบทเรียน" />
                  </div>
                  <div className="w-40">
                    <label className="label text-xs">รหัสวิดีโอ Vimeo</label>
                    <input name="videoId" className="input" placeholder="เช่น 76979871" />
                  </div>
                  <div className="w-28">
                    <label className="label text-xs">ความยาว (นาที)</label>
                    <input name="durationMin" type="number" min={0} defaultValue={0} className="input" />
                  </div>
                  <button type="submit" className="btn-primary btn-sm">
                    + เพิ่มบทเรียน
                  </button>
                </form>

                <form action={deleteChapterAction} className="mt-3">
                  <input type="hidden" name="id" value={ch.id} />
                  <button type="submit" className="text-xs text-ink-soft hover:text-red-600">
                    ลบบทนี้ (บทเรียนข้างในจะถูกลบด้วย)
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>

        {/* เพิ่มบทใหม่ */}
        <form action={createChapterAction} className="mt-6 flex flex-wrap items-end gap-3 border-t border-ink-line pt-6">
          <input type="hidden" name="courseId" value={course.id} />
          <div className="min-w-[220px] flex-1">
            <label className="label text-xs">เพิ่มบทใหม่</label>
            <input name="title" required className="input" placeholder="เช่น บทที่ 4 ความน่าจะเป็น" />
          </div>
          <div className="min-w-[220px] flex-1">
            <label className="label text-xs">คำอธิบายบท (ไม่บังคับ)</label>
            <input name="summary" className="input" />
          </div>
          <button type="submit" className="btn-primary btn-sm">
            + เพิ่มบท
          </button>
        </form>
      </section>

      {/* ลบคอร์ส */}
      <section className="card border-red-100 p-6">
        <h2 className="text-lg font-semibold text-red-600">ลบคอร์สนี้</h2>
        <p className="mt-1.5 text-sm text-ink-soft">
          การลบจะลบบท บทเรียน แบบทดสอบ และสิทธิ์เรียนของนักเรียนในคอร์สนี้ทั้งหมด และย้อนกลับไม่ได้
        </p>
        <form action={deleteCourseAction} className="mt-4">
          <input type="hidden" name="id" value={course.id} />
          <button type="submit" className="btn-danger btn-sm">
            ลบคอร์สถาวร
          </button>
        </form>
      </section>
    </div>
  );
}
