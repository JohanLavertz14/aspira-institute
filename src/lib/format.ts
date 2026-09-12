export function formatBaht(amount: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat('th-TH').format(n);
}

export function formatThaiDate(date: Date | string, withTime = false) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    ...(withTime ? { timeStyle: 'short' } : {}),
  }).format(d);
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} นาที`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} ชั่วโมง` : `${h} ชม. ${m} นาที`;
}

export function daysLeft(expiresAt: Date | string) {
  const end = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  const diff = end.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: 'รอชำระเงิน',
  WAITING_REVIEW: 'รอตรวจสอบสลิป',
  PAID: 'ชำระแล้ว',
  REJECTED: 'ไม่อนุมัติ',
  CANCELLED: 'ยกเลิก',
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  BANK_TRANSFER: 'โอนผ่านธนาคาร',
  PROMPTPAY: 'พร้อมเพย์',
  CARD: 'บัตรเครดิต/เดบิต',
};
