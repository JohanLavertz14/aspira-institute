import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

// ต่อ PostgreSQL ผ่าน driver adapter ของ Prisma 7
// บน Vercel ค่า DATABASE_URL จะถูกตั้งอัตโนมัติเมื่อเชื่อมฐานข้อมูล Neon เข้ากับโปรเจกต์
const connectionString = process.env.DATABASE_URL;

function createClient() {
  if (!connectionString) {
    throw new Error('ยังไม่ได้ตั้งค่า DATABASE_URL');
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

// ใน dev ของ Next.js ไฟล์จะถูก reload บ่อย จึงเก็บ client ไว้บน globalThis
// เพื่อไม่ให้เปิดคอนเนกชันซ้ำจนเต็ม
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
