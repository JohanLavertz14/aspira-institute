/**
 * ภาพจำลองหน้าเรียนที่แสดงอยู่ในกรอบอุปกรณ์บนหน้าแรก
 * เป็นงานออกแบบล้วน ไม่ได้ดึงข้อมูลจริง จึงไม่ต้องเป็น client component
 */
const LESSONS: [string, 'done' | 'current' | 'todo'][] = [
  ['0.1 เลขยกกำลังสิบและสัญกรณ์วิทยาศาสตร์', 'done'],
  ['0.2 หน่วย SI และคำนำหน้าหน่วย', 'done'],
  ['0.3 การแปลงหน่วยด้วยวิธีวิเคราะห์มิติ', 'done'],
  ['0.4 เลขนัยสำคัญและการปัดเลข', 'current'],
  ['0.5 ลอการิทึม: เครื่องมือของ pH', 'todo'],
  ['0.6 สมการกำลังสองและการประมาณค่า', 'todo'],
  ['0.7 การอ่านกราฟและความสัมพันธ์เชิงเส้น', 'todo'],
];

export function HeroPreview() {
  return (
    <div className="flex h-full w-full flex-col bg-white text-left">
      {/* แถบบนของหน้าเรียน */}
      <div className="flex shrink-0 items-center gap-2.5 border-b border-ink-line px-3 py-2 md:px-4 md:py-2.5">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-brand-gradient text-[10px] font-bold text-white">
          A
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[11px] font-medium text-ink md:text-xs">
            Foundation for Chemistry
          </span>
          <span className="block truncate text-[10px] text-ink-soft">3 จาก 49 บท · 6%</span>
        </span>
        <span className="hidden rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-medium text-brand-700 sm:block">
          คอร์สของฉัน
        </span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-3 md:grid-cols-[1fr_15rem] md:p-4">
        {/* จอวิดีโอ */}
        <div className="relative min-h-0 overflow-hidden rounded-xl bg-brand-gradient">
          <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/20 ring-1 ring-white/40 backdrop-blur">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent p-3 md:p-4">
            <span className="block text-[10px] uppercase tracking-[0.2em] text-white/70">
              บทที่ 0 คณิตศาสตร์ หน่วย และเครื่องมือ
            </span>
            <span className="mt-1 block text-sm font-semibold text-white md:text-base">
              0.4 เลขนัยสำคัญและการปัดเลข
            </span>
          </span>
        </div>

        {/* รายการบทเรียนด้านข้าง */}
        <div className="hidden min-h-0 flex-col md:flex">
          <div className="rounded-xl border border-ink-line p-2.5">
            <div className="flex items-center justify-between text-[10px] text-ink-soft">
              <span>ความคืบหน้า</span>
              <span className="font-medium text-brand-700">6%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-brand-100">
              <div className="h-full w-[6%] rounded-full bg-brand-gradient" />
            </div>
          </div>

          <ul className="mt-2 min-h-0 flex-1 space-y-1 overflow-hidden">
            {LESSONS.map(([title, state]) => (
              <li
                key={title}
                className={`flex items-start gap-2 rounded-lg px-2 py-1.5 text-[11px] leading-snug ${
                  state === 'current' ? 'bg-brand-gradient text-white' : 'text-ink'
                }`}
              >
                <span
                  className={`mt-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full text-[8px] font-bold ${
                    state === 'current'
                      ? 'bg-white/25 text-white'
                      : state === 'done'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {state === 'done' ? '✓' : ''}
                </span>
                <span className="line-clamp-2">{title}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
