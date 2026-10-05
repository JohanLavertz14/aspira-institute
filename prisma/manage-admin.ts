/**
 * เครื่องมือจัดการบัญชีแอดมินของเว็บ Aspira Institute
 *
 * วิธีใช้ (รันใน terminal ที่โฟลเดอร์โปรเจกต์)
 *
 *   npm run admin -- list
 *       ดูรายชื่อบัญชีแอดมินทั้งหมด
 *
 *   npm run admin -- create อีเมล รหัสผ่าน "ชื่อที่จะแสดง"
 *       สร้างบัญชีแอดมินใหม่ ถ้าอีเมลนี้มีอยู่แล้วจะอัปเกรดเป็นแอดมินและตั้งรหัสผ่านใหม่ให้
 *
 *   npm run admin -- password อีเมล รหัสผ่านใหม่
 *       เปลี่ยนรหัสผ่านของบัญชีแอดมินที่มีอยู่
 *
 *   npm run admin -- remove อีเมล
 *       ลบบัญชีแอดมิน (ระบบจะไม่ยอมให้ลบถ้าเหลือแอดมินคนสุดท้าย)
 *
 * รหัสผ่านถูกเก็บเป็นค่าแฮชด้วย bcrypt ไม่ได้เก็บเป็นข้อความธรรมดา
 * ถ้ารหัสผ่านมีอักขระพิเศษ เช่น $ หรือ ! ให้ครอบด้วยเครื่องหมายคำพูดเดี่ยว
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const HELP = `
เครื่องมือจัดการบัญชีแอดมิน

  npm run admin -- list
  npm run admin -- create อีเมล รหัสผ่าน "ชื่อที่จะแสดง"
  npm run admin -- password อีเมล รหัสผ่านใหม่
  npm run admin -- remove อีเมล
`;

function checkEmail(email: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error(`รูปแบบอีเมลไม่ถูกต้อง: ${email}`);
  }
  return email.toLowerCase();
}

function checkPassword(password: string) {
  if (password.length < 8) throw new Error('รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร');
  if (/^\d+$/.test(password)) throw new Error('รหัสผ่านไม่ควรเป็นตัวเลขล้วน');
  const weak = ['password', '12345678', 'admin123', 'aspira123', 'qwertyui'];
  if (weak.includes(password.toLowerCase())) throw new Error('รหัสผ่านนี้เดาง่ายเกินไป');
  return password;
}

async function list() {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    orderBy: { createdAt: 'asc' },
    select: { email: true, name: true, isActive: true, createdAt: true },
  });

  if (admins.length === 0) {
    console.log('ยังไม่มีบัญชีแอดมินในระบบ');
    return;
  }

  console.log(`บัญชีแอดมินทั้งหมด ${admins.length} บัญชี`);
  for (const a of admins) {
    const status = a.isActive ? 'ใช้งานอยู่' : 'ถูกระงับ';
    const when = a.createdAt.toISOString().slice(0, 10);
    console.log(`  ${a.email}  (${a.name}, ${status}, สร้าง ${when})`);
  }
}

async function create(emailRaw: string, passwordRaw: string, name?: string) {
  const email = checkEmail(emailRaw);
  const password = checkPassword(passwordRaw);
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      name: name || 'ผู้ดูแลระบบ',
      role: 'ADMIN',
      isActive: true,
    },
    update: {
      passwordHash,
      role: 'ADMIN',
      isActive: true,
      ...(name ? { name } : {}),
    },
  });

  console.log(existing ? 'อัปเดตบัญชีเดิมเป็นแอดมินแล้ว' : 'สร้างบัญชีแอดมินใหม่แล้ว');
  console.log(`  อีเมล : ${user.email}`);
  console.log(`  ชื่อ   : ${user.name}`);
  console.log('  เข้าสู่ระบบที่ /login แล้วไปที่ /admin');
}

async function changePassword(emailRaw: string, passwordRaw: string) {
  const email = checkEmail(emailRaw);
  const password = checkPassword(passwordRaw);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error(`ไม่พบบัญชีอีเมล ${email}`);

  await prisma.user.update({
    where: { email },
    data: { passwordHash: await bcrypt.hash(password, 10) },
  });

  console.log(`เปลี่ยนรหัสผ่านของ ${email} เรียบร้อย`);
}

async function remove(emailRaw: string) {
  const email = checkEmail(emailRaw);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error(`ไม่พบบัญชีอีเมล ${email}`);
  if (user.role !== 'ADMIN') throw new Error(`${email} ไม่ใช่บัญชีแอดมิน`);

  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
  if (adminCount <= 1) {
    throw new Error('เหลือแอดมินคนสุดท้าย ลบไม่ได้ ให้สร้างแอดมินคนใหม่ก่อน');
  }

  await prisma.user.delete({ where: { email } });
  console.log(`ลบบัญชีแอดมิน ${email} เรียบร้อย`);
}

/** แสดงปลายทางให้เห็นก่อน จะได้รู้ว่ากำลังแก้ฐานข้อมูลตัวไหน */
function logTarget() {
  const host = (process.env.DATABASE_URL ?? '').split('@')[1]?.split('/')[0] ?? '(ไม่ทราบ)';
  console.log(`ฐานข้อมูลปลายทาง: ${host}`);
}

async function main() {
  logTarget();
  const [command, ...args] = process.argv.slice(2);

  switch (command) {
    case 'list':
      await list();
      break;
    case 'create':
      if (args.length < 2) throw new Error('ใช้: npm run admin -- create อีเมล รหัสผ่าน "ชื่อ"');
      await create(args[0], args[1], args[2]);
      break;
    case 'password':
      if (args.length < 2) throw new Error('ใช้: npm run admin -- password อีเมล รหัสผ่านใหม่');
      await changePassword(args[0], args[1]);
      break;
    case 'remove':
      if (args.length < 1) throw new Error('ใช้: npm run admin -- remove อีเมล');
      await remove(args[0]);
      break;
    default:
      console.log(HELP);
  }
}

main()
  .catch((e) => {
    console.error(`ผิดพลาด: ${e instanceof Error ? e.message : e}`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
