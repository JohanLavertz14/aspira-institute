/**
 * ตรวจสอบว่าต่อฐานข้อมูลได้และมีข้อมูลอะไรอยู่บ้าง
 *
 * ใช้ตรวจหลังรัน db:push และ db:seed:chem ว่าสำเร็จจริง
 *
 *   npm run db:check
 *   DATABASE_URL='postgresql://...' npm run db:check
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const url = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

/** ซ่อนรหัสผ่านในสตริงก่อนพิมพ์ออกหน้าจอ */
function maskUrl(raw?: string) {
  if (!raw) return '(ไม่ได้ตั้งค่า)';
  return raw.replace(/\/\/([^:]+):[^@]+@/, '//$1:****@');
}

async function main() {
  console.log(`ฐานข้อมูล: ${maskUrl(url)}`);
  console.log('');

  const [subjects, courses, published, lessons, quizzes, questions, users, admins, orders, enrollments] =
    await Promise.all([
      prisma.subject.count(),
      prisma.course.count(),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.lesson.count(),
      prisma.quiz.count(),
      prisma.question.count(),
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.order.count(),
      prisma.enrollment.count(),
    ]);

  console.log('ต่อฐานข้อมูลได้และตารางครบ');
  console.log('');
  console.log(`  วิชา           ${subjects}`);
  console.log(`  คอร์ส          ${courses} (เผยแพร่แล้ว ${published})`);
  console.log(`  บทเรียน        ${lessons}`);
  console.log(`  แบบทดสอบ       ${quizzes} ชุด รวม ${questions} ข้อ`);
  console.log(`  ผู้ใช้          ${users} (แอดมิน ${admins})`);
  console.log(`  คำสั่งซื้อ      ${orders}`);
  console.log(`  สิทธิ์เรียน     ${enrollments}`);
  console.log('');

  const courseList = await prisma.course.findMany({
    orderBy: { order: 'asc' },
    select: { slug: true, title: true, isPublished: true, price: true, materialUrl: true },
  });

  if (courseList.length === 0) {
    console.log('ยังไม่มีคอร์สในฐานข้อมูล ให้รัน npm run db:seed:chem');
  } else {
    console.log('รายการคอร์ส');
    for (const c of courseList) {
      const state = c.isPublished ? 'เผยแพร่' : 'ฉบับร่าง';
      const sheet = c.materialUrl ? 'มีชีท' : 'ยังไม่มีชีท';
      console.log(`  [${state}] ${c.title} (${c.slug}) ${c.price} บาท ${sheet}`);
    }
  }

  if (admins === 0) {
    console.log('');
    console.log('ยังไม่มีบัญชีแอดมิน ให้รัน npm run admin -- create อีเมล รหัสผ่าน "ชื่อ"');
  }
}

main()
  .catch((e) => {
    console.error('');
    console.error('ตรวจสอบไม่สำเร็จ');
    console.error(e instanceof Error ? e.message : e);
    console.error('');
    console.error('ถ้าข้อความบอกว่าไม่พบตาราง ให้รัน npm run db:push ก่อน');
    console.error('ถ้าบอกว่าต่อฐานข้อมูลไม่ได้ ให้ตรวจ DATABASE_URL อีกครั้ง');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
