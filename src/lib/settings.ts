import { prisma } from './db';

/** ข้อมูลสถาบันที่ใช้ทั้งเว็บ ถ้ายังไม่มีจะสร้างค่าเริ่มต้นให้ */
export async function getSiteSettings() {
  const existing = await prisma.siteSetting.findUnique({ where: { id: 'singleton' } });
  if (existing) return existing;
  return prisma.siteSetting.create({ data: { id: 'singleton' } });
}

export type SiteSettings = Awaited<ReturnType<typeof getSiteSettings>>;
