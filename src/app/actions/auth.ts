'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { clearSessionCookie, hashPassword, setSessionCookie, verifyPassword } from '@/lib/auth';

export type FormState = { error?: string; success?: string } | null;

const registerSchema = z.object({
  name: z.string().trim().min(2, 'กรุณากรอกชื่อ-นามสกุล'),
  email: z.string().trim().toLowerCase().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(8, 'รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร'),
  phone: z.string().trim().optional(),
  school: z.string().trim().optional(),
  gradeLevel: z.string().trim().optional(),
});

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    phone: formData.get('phone'),
    school: formData.get('school'),
    gradeLevel: formData.get('gradeLevel'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' };
  }

  const data = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return { error: 'อีเมลนี้ถูกใช้สมัครไปแล้ว หากลืมรหัสผ่านกรุณาติดต่อสถาบัน' };
  }

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: await hashPassword(data.password),
      phone: data.phone || null,
      school: data.school || null,
      gradeLevel: data.gradeLevel || null,
      role: 'STUDENT',
    },
  });

  await setSessionCookie({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  redirect('/my-courses');
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' };
  }

  const redirectTo = String(formData.get('redirectTo') || '');
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
  }
  if (!user.isActive) {
    return { error: 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อสถาบัน' };
  }

  await setSessionCookie({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  if (redirectTo && redirectTo.startsWith('/')) redirect(redirectTo);
  redirect(user.role === 'ADMIN' ? '/admin' : '/my-courses');
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect('/');
}
