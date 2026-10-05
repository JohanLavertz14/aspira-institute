import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

// ต่อ PostgreSQL ผ่าน driver adapter ของ Prisma 7
// บน Vercel ค่า DATABASE_URL จะถูกตั้งอัตโนมัติเมื่อเชื่อมฐานข้อมูล Neon เข้ากับโปรเจกต์
const connectionString = process.env.DATABASE_URL;

function createClient() {
  if (!connectionString) {
    throw new Error(
      'ยังไม่ได้ตั้งค่า DATABASE_URL ถ้ารันในเครื่องให้ใส่ connection string ของ PostgreSQL ในไฟล์ .env',
    );
  }
  if (connectionString.startsWith('file:')) {
    throw new Error(
      'DATABASE_URL ยังชี้ไปที่ไฟล์ SQLite เดิม ตอนนี้ระบบใช้ PostgreSQL แล้ว ' +
        'ให้แก้ DATABASE_URL ใน .env เป็น connection string ของ PostgreSQL',
    );
  }
  // ตอนรันในเครื่อง พิมพ์โฮสต์ปลายทางไว้หนึ่งบรรทัด จะได้รู้ว่าเซิร์ฟเวอร์ต่อฐานข้อมูลตัวไหนอยู่
  // ถ้าแก้ .env แล้วบรรทัดนี้ยังเป็นค่าเดิม แปลว่ายังไม่ได้รีสตาร์ท dev server
  if (process.env.NODE_ENV !== 'production') {
    const host = connectionString.split('@')[1]?.split('/')[0] ?? '(ไม่ทราบ)';
    console.log(`[db] ต่อฐานข้อมูลที่ ${host}`);
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
