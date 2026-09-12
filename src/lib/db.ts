import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@/generated/prisma/client';

// ตั้งแต่ Prisma 7 เป็นต้นไป ต้องต่อฐานข้อมูลผ่าน driver adapter
// ถ้าย้ายไป PostgreSQL ให้เปลี่ยนมาใช้ @prisma/adapter-pg แทนบรรทัดล่างนี้
const databaseUrl = process.env.DATABASE_URL ?? 'file:./prisma/dev.db';

function createClient() {
  const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
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
