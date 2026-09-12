import Link from 'next/link';
import { formatBaht } from '@/lib/format';

export type CourseCardData = {
  slug: string;
  title: string;
  subtitle: string | null;
  price: number;
  comparePrice: number | null;
  level: string;
  totalHours: number;
  coverImage: string | null;
  teacherName: string;
  lessonCount: number;
  subject: { name: string; colorHex: string };
};

/** ภาพหน้าปกคอร์ส ถ้ายังไม่ได้อัปโหลดจะใช้พื้นหลังไล่สีตามสีประจำวิชาแทน */
function Cover({ course }: { course: CourseCardData }) {
  if (course.coverImage) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={course.coverImage} alt={course.title} className="h-full w-full object-cover" />;
  }
  return (
    <div
      className="flex h-full w-full flex-col justify-between p-5 text-white"
      style={{
        background: `linear-gradient(135deg, ${course.subject.colorHex} 0%, rgba(28,20,32,0.85) 130%)`,
      }}
    >
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/75">
        {course.subject.name}
      </span>
      <span className="text-lg font-semibold leading-snug">{course.title}</span>
    </div>
  );
}

export function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="h-40 overflow-hidden">
        <Cover course={course} />
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge-brand">{course.subject.name}</span>
          <span className="badge-gray">{course.level}</span>
        </div>

        <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-snug text-ink group-hover:text-brand-700">
          {course.title}
        </h3>
        {course.subtitle && (
          <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">{course.subtitle}</p>
        )}

        <p className="mt-3 text-xs text-ink-soft">
          {course.teacherName || 'ทีมผู้สอน'} · {course.lessonCount} บทเรียน
          {course.totalHours > 0 && ` · ${course.totalHours} ชั่วโมง`}
        </p>

        <div className="mt-4 flex items-end justify-between border-t border-ink-line pt-4">
          <div>
            {course.comparePrice && course.comparePrice > course.price && (
              <span className="mr-2 text-xs text-ink-soft line-through">
                {formatBaht(course.comparePrice)}
              </span>
            )}
            <span className="text-lg font-semibold text-brand-700">{formatBaht(course.price)}</span>
          </div>
          <span className="text-sm font-medium text-brand-600 group-hover:underline">ดูรายละเอียด</span>
        </div>
      </div>
    </Link>
  );
}
