'use client';

import NumberFlow from '@number-flow/react';
import React from 'react';

/**
 * กล่องราคาที่สลับมุมมองได้ระหว่างราคาเต็มกับราคาเฉลี่ยต่อเดือน
 *
 * ดัดแปลงจากคอมโพเนนต์ PricingInteraction ของ 21st.dev
 * ต้นฉบับเป็นตัวเลือกแพ็กเกจรายเดือนกับรายปี แต่คอร์สของสถาบันขายแบบจ่ายครั้งเดียว
 * จึงเปลี่ยนความหมายของสวิตช์เป็นการสลับวิธีมองราคาแทน
 * ตัวเลขต่อเดือนคำนวณจากราคาเต็มหารด้วยอายุคอร์ส ไม่ใช่การผ่อนชำระ
 * และเขียนกำกับไว้ใต้ตัวเลขเพื่อไม่ให้เข้าใจผิด
 */
const BAHT = { style: 'currency', currency: 'THB', maximumFractionDigits: 0 } as const;

export function PriceToggle({
  price,
  comparePrice,
  accessDays,
}: {
  price: number;
  comparePrice: number | null;
  accessDays: number;
}) {
  const [mode, setMode] = React.useState(0);

  const months = Math.max(1, Math.round(accessDays / 30));
  const perMonth = Math.round(price / months);
  const shown = mode === 0 ? price : perMonth;
  const discountPercent =
    comparePrice && comparePrice > price ? Math.round((1 - price / comparePrice) * 100) : 0;

  return (
    <div className="w-full">
      {/* สวิตช์สองช่อง พร้อมแถบขาวที่เลื่อนตามตัวเลือก */}
      <div className="relative flex w-full items-center rounded-full bg-brand-50 p-1.5">
        <button
          type="button"
          onClick={() => setMode(0)}
          className={`z-20 w-full rounded-full p-1.5 text-sm font-medium transition-colors ${
            mode === 0 ? 'text-brand-700' : 'text-ink-soft'
          }`}
        >
          จ่ายครั้งเดียว
        </button>
        <button
          type="button"
          onClick={() => setMode(1)}
          className={`z-20 w-full rounded-full p-1.5 text-sm font-medium transition-colors ${
            mode === 1 ? 'text-brand-700' : 'text-ink-soft'
          }`}
        >
          เฉลี่ยต่อเดือน
        </button>
        <div
          className="absolute inset-0 z-10 flex w-1/2 justify-center p-1.5"
          style={{ transform: `translateX(${mode * 100}%)`, transition: 'transform 0.3s' }}
        >
          <div className="h-full w-full rounded-full bg-white shadow-sm" />
        </div>
      </div>

      {/* ตัวเลขราคา เปลี่ยนค่าแบบไหลตามตัวเลือก */}
      <div className="mt-5 flex flex-wrap items-end gap-3">
        <NumberFlow
          value={shown}
          format={BAHT}
          locales="th-TH"
          className="text-4xl font-semibold text-gradient"
        />
        {mode === 1 && <span className="pb-1.5 text-sm text-ink-soft">ต่อเดือน</span>}
        {mode === 0 && comparePrice && comparePrice > price && (
          <span className="pb-2 text-sm text-ink-soft line-through">
            {comparePrice.toLocaleString('th-TH')} บาท
          </span>
        )}
        {mode === 0 && discountPercent > 0 && (
          <span className="badge-accent mb-2">ลด {discountPercent}%</span>
        )}
      </div>

      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        {mode === 0
          ? `ชำระครั้งเดียว เรียนได้ ${accessDays} วันนับจากวันที่อนุมัติ`
          : `คิดจากราคาเต็มหารด้วยอายุคอร์ส ${months} เดือน เป็นการจ่ายครั้งเดียว ไม่ใช่การผ่อนชำระ`}
      </p>
    </div>
  );
}
