import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * บันทึกไฟล์ที่อัปโหลดลงโฟลเดอร์ public/uploads
 *
 * หมายเหตุสำหรับตอนขึ้นเซิร์ฟเวอร์จริง
 * ถ้า deploy บน Vercel หรือแพลตฟอร์มที่ไฟล์ระบบเป็นแบบชั่วคราว
 * ให้เปลี่ยนฟังก์ชันนี้ไปอัปโหลดขึ้น object storage เช่น S3 หรือ Cloudflare R2 แทน
 * แล้วคืนค่า URL ของไฟล์กลับมาในรูปแบบเดิม ส่วนอื่นของระบบไม่ต้องแก้
 */
const MAX_BYTES = 25 * 1024 * 1024; // 25MB รองรับชีทเล่มเต็มที่มีรูปเยอะ
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];

export async function saveUploadedFile(file: File, folder: 'slips' | 'sheets' | 'branding') {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_BYTES) throw new Error('ไฟล์ใหญ่เกิน 25MB กรุณาย่อขนาดก่อนอัปโหลด');
  if (file.type && !ALLOWED.includes(file.type)) {
    throw new Error('รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP) หรือ PDF เท่านั้น');
  }

  const ext = path.extname(file.name) || (file.type === 'application/pdf' ? '.pdf' : '.jpg');
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const dir = path.join(process.cwd(), 'public', 'uploads', folder);

  await fs.mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, safeName), buffer);

  return `/uploads/${folder}/${safeName}`;
}
