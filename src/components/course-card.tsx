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
        backgroundImage: `radial-gradient(130% 110% at 100% 0%, ${course.subject.colorHex}59 0%, transparent 58%), linear-gradient(120deg, #ec3566 0%, #fa557f 45%, #f97316 100%)`,
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
  // ส่วนลดคำนวณจากราคาก่อนลด ใช้แสดงป้ายสีส้มบนการ์ด
  const discountPercent =
    course.comparePrice && course.comparePrice > course.price
      ? Math.round((1 - course.price / course.comparePrice) * 100)
      : 0;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="card-interactive group overflow-hidden"
    >
      <div className="relative h-40 overflow-hidden">
        <Cover course={course} />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge-brand">{course.subject.name}</span>
          <span className="badge-gray">{course.level}</span>
          {discountPercent > 0 && <span className="badge-accent">ลด {discountPercent}%</span>}
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
