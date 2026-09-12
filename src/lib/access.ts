import { prisma } from './db';

/** เช็คว่าผู้ใช้มีสิทธิ์เรียนคอร์สนี้อยู่หรือไม่ (ต้องยังไม่หมดอายุ) */
export async function hasCourseAccess(userId: string | null, courseId: string) {
  if (!userId) return false;
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (!enrollment || !enrollment.isActive) return false;
  return enrollment.expiresAt.getTime() > Date.now();
}

export async function getEnrollment(userId: string | null, courseId: string) {
  if (!userId) return null;
  return prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
}

/** สร้างเลขที่คำสั่งซื้อ เช่น ASP-260909-4821 */
export function generateOrderCode() {
  const now = new Date();
  const y = String(now.getFullYear()).slice(2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ASP-${y}${m}${d}-${rand}`;
}

/** คำนวณเปอร์เซ็นต์ความคืบหน้าของคอร์ส */
export async function getCourseProgress(userId: string, courseId: string) {
  const lessons = await prisma.lesson.findMany({
    where: { chapter: { courseId } },
    select: { id: true },
  });
  if (lessons.length === 0) return { total: 0, done: 0, percent: 0 };

  const done = await prisma.lessonProgress.count({
    where: {
      userId,
      completed: true,
      lessonId: { in: lessons.map((l) => l.id) },
    },
  });

  return {
    total: lessons.length,
    done,
    percent: Math.round((done / lessons.length) * 100),
  };
}
