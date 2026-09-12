/**
 * โลโก้สถาบัน
 * ตอนนี้เว้นที่ไว้เป็นสัญลักษณ์ตัวอักษร A เมื่ออัปโหลดไฟล์โลโก้จริงในหน้า
 * "ตั้งค่าเว็บ" ของหลังบ้านแล้ว ระบบจะสลับไปแสดงรูปโลโก้ให้อัตโนมัติ
 */
export function Logo({
  logoUrl,
  siteName = 'Aspira Institute',
  size = 'md',
}: {
  logoUrl?: string | null;
  siteName?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const box = size === 'sm' ? 'h-8 w-8 text-sm' : size === 'lg' ? 'h-12 w-12 text-xl' : 'h-10 w-10 text-base';
  const text = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';

  return (
    <span className="inline-flex items-center gap-2.5">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={siteName} className={`${box} rounded-xl object-contain`} />
      ) : (
        <span
          className={`${box} grid place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 font-bold text-white shadow-sm`}
          aria-hidden
        >
          A
        </span>
      )}
      <span className={`${text} font-semibold tracking-tight text-ink`}>{siteName}</span>
    </span>
  );
}
