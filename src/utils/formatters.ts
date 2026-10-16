export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

export const MONTH_NAMES_FULL = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const CHART_PALETTE = [
  '#60a5fa', '#f87171', '#fbbf24', '#34d399', '#a78bfa',
  '#f472b6', '#2dd4bf', '#fb923c', '#94a3b8', '#818cf8'
];

export const CATEGORY_PRESETS = {
  in: ['Gaji', 'Bisnis', 'Bonus', 'Hadiah', 'Investasi', 'Lainnya'],
  out: ['Makanan', 'Transportasi', 'Tagihan', 'Belanja', 'Hiburan', 'Kesehatan', 'Pendidikan', 'Cicilan', 'Lainnya'],
  sv: ['Dana Darurat', 'Tabungan', 'Deposito', 'Reksa Dana', 'Saham', 'Emas', 'Kripto', 'Lainnya']
};

export const TYPE_META = {
  in: { label: 'Pemasukan', prefix: '+', color: 'var(--in)', bg: '#34d3991a', border: '#34d39955' },
  out: { label: 'Pengeluaran', prefix: '-', color: 'var(--out)', bg: '#f871711a', border: '#f8717155' },
  sv: { label: 'Tabungan & Investasi', prefix: '→ ', color: 'var(--sv)', bg: '#a78bfa1a', border: '#a78bfa55' }
};

export function formatRupiah(amount: number): string {
  if (isNaN(amount)) return 'Rp 0';
  const rounded = Math.round(amount);
  return 'Rp ' + rounded.toLocaleString('id-ID');
}

export function parseNumber(val: string | number): number {
  if (typeof val === 'number') return val;
  return Number(val.replace(/\D/g, '')) || 0;
}

export function formatNumberInput(val: string | number): string {
  const num = typeof val === 'number' ? val : parseNumber(val);
  return num > 0 ? num.toLocaleString('id-ID') : '';
}

export function padZero(n: number): string {
  return String(n).padStart(2, '0');
}

export function formatDateYMD(d: Date = new Date()): string {
  return `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}`;
}

export function getTodayDate(): string {
  return formatDateYMD(new Date());
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const day = Number(parts[2]);
    const month = MONTH_NAMES_SHORT[Number(parts[1]) - 1] || parts[1];
    const year = parts[0];
    return `${day} ${month} ${year}`;
  }
  if (parts.length === 2) {
    const month = MONTH_NAMES_FULL[Number(parts[1]) - 1] || parts[1];
    return `${month} ${parts[0]}`;
  }
  return dateStr;
}

export function formatPeriodLabel(period: string, mode: 'day' | 'month' | 'year' | 'all'): string {
  if (mode === 'all') return 'Keseluruhan Waktu';
  if (mode === 'year') return `Tahun ${period}`;
  const parts = period.split('-');
  if (mode === 'month' && parts.length >= 2) {
    const mIdx = Number(parts[1]) - 1;
    return `${MONTH_NAMES_FULL[mIdx] || parts[1]} ${parts[0]}`;
  }
  if (mode === 'day' && parts.length === 3) {
    const day = Number(parts[2]);
    const mIdx = Number(parts[1]) - 1;
    return `${day} ${MONTH_NAMES_FULL[mIdx] || parts[1]} ${parts[0]}`;
  }
  return period;
}

export function shiftPeriod(period: string, delta: number, mode: 'day' | 'month' | 'year' | 'all'): string {
  if (mode === 'all') return period;
  if (mode === 'year') {
    return String(Number(period) + delta);
  }
  const parts = period.split('-').map(Number);
  if (mode === 'month') {
    const d = new Date(parts[0], parts[1] - 1 + delta, 1);
    return `${d.getFullYear()}-${padZero(d.getMonth() + 1)}`;
  }
  const d = new Date(parts[0], parts[1] - 1, parts[2] + delta);
  return formatDateYMD(d);
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getNextMonth(monthStr: string): string {
  const [y, m] = monthStr.split('-').map(Number);
  const nextDate = new Date(y, m, 1);
  return `${nextDate.getFullYear()}-${padZero(nextDate.getMonth() + 1)}`;
}
