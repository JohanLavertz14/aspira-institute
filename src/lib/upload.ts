import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import { put } from '@vercel/blob';

/**
 * บันทึกไฟล์ที่ผู้ใช้อัปโหลด แล้วคืนค่า URL ที่ใช้อ้างถึงไฟล์นั้น
 *
 * ทำงานสองแบบอัตโนมัติตามสภาพแวดล้อม
 *
 * 1. ถ้ามี BLOB_READ_WRITE_TOKEN (บน Vercel เมื่อเชื่อม Blob store เข้ากับโปรเจกต์)
 *    จะอัปโหลดขึ้น Vercel Blob แล้วคืน URL แบบเต็ม
 *    จำเป็นบน Vercel เพราะระบบไฟล์ของ serverless เขียนไม่ได้และถูกล้างทุกครั้งที่ deploy
 *
 * 2. ถ้าไม่มี token (เช่นรันบนเครื่องตัวเอง) จะบันทึกลงโฟลเดอร์ public/uploads
 *    แล้วคืน path แบบ /uploads/... เหมือนเดิม
 *
 * ส่วนอื่นของระบบเก็บค่าที่คืนมาลงฐานข้อมูลตรง ๆ จึงรองรับทั้งสองแบบโดยไม่ต้องแก้อะไร
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

  // บน Vercel ใช้ Blob storage
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`${folder}/${safeName}`, file, {
      access: 'public',
      addRandomSuffix: false,
      ...(file.type ? { contentType: file.type } : {}),
    });
    return blob.url;
  }

  // บนเครื่องพัฒนา เก็บลงโฟลเดอร์ public/uploads
  const dir = path.join(process.cwd(), 'public', 'uploads', folder);
  await fs.mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, safeName), buffer);

  return `/uploads/${folder}/${safeName}`;
}
