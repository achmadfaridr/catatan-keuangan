import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatRupiah, formatPeriodLabel, shiftPeriod, getTodayDate } from '../utils/formatters';

export const DescriptiveResume: React.FC = () => {
  const { transactions, period, periodMode, activePage } = useFinance();

  const currentList =
    activePage === 'all'
      ? transactions
      : transactions.filter((t) => t.date.startsWith(period));

  const inc = currentList
    .filter((t) => t.type === 'in')
    .reduce((s, t) => s + Number(t.amount), 0);
  const out = currentList
    .filter((t) => t.type === 'out')
    .reduce((s, t) => s + Number(t.amount), 0);
  const sv = currentList
    .filter((t) => t.type === 'sv')
    .reduce((s, t) => s + Number(t.amount), 0);
  const balance = inc - out - sv;

  const label = formatPeriodLabel(period, periodMode);

  // Perbandingan dengan periode sebelumnya
  const prevPeriod = shiftPeriod(period, -1, periodMode);
  const prevList = transactions.filter((t) => t.date.startsWith(prevPeriod));
  const prevOut = prevList
    .filter((t) => t.type === 'out')
    .reduce((s, t) => s + Number(t.amount), 0);

  // Kategori pengeluaran terbesar
  const catSums: Record<string, number> = {};
  currentList
    .filter((t) => t.type === 'out')
    .forEach((t) => {
      catSums[t.goal] = (catSums[t.goal] || 0) + Number(t.amount);
    });
  const topCat = Object.entries(catSums).sort((a, b) => b[1] - a[1])[0];

  let narrative = '';

  if (currentList.length === 0) {
    narrative = `Belum ada transaksi di <b>${label}</b>. Tekan tombol “+ Tambah” untuk mulai mencatat pemasukan, pengeluaran, atau setoran tabungan.`;
  } else {
    narrative = `Pada <b>${label}</b> kamu mencatat <b>${currentList.length} transaksi</b>: pemasukan <b class="color-in">${formatRupiah(
      inc
    )}</b>, pengeluaran <b class="color-out">${formatRupiah(out)}</b>`;

    if (sv > 0) {
      narrative += `, dan menabung/berinvestasi <b class="color-sv">${formatRupiah(sv)}</b>.`;
    } else {
      narrative += '.';
    }

    if (balance >= 0) {
      narrative += ` Sisa dana tersedia kamu <b class="color-brand">${formatRupiah(balance)}</b>.`;
    } else {
      narrative += ` Kamu mengalami <b class="color-out">defisit ${formatRupiah(
        Math.abs(balance)
      )}</b> — pengeluaran dan tabungan melampaui pemasukan periode ini.`;
    }

    if (topCat && out > 0) {
      const pct = Math.round((topCat[1] / out) * 100);
      narrative += ` Pengeluaran terbesar berada di pos <b>${topCat[0]}</b> (${pct}% dari total pengeluaran).`;
    }

    if (inc > 0 && sv > 0) {
      const svPct = Math.round((sv / inc) * 100);
      narrative += ` Rasio tabungan mencapai <b>${svPct}%</b> dari pemasukan${
        svPct >= 20 ? ' — sangat baik, sudah melampaui standar ideal 20% 👍' : '; usahakan tingkatkan mendekati 20%.'
      }`;
    } else if (inc > 0 && sv === 0) {
      narrative += ' Belum ada dana yang disisihkan ke tabungan/investasi. Biasakan menyisihkan di awal gajian.';
    }

    if (prevOut > 0 && out > 0) {
      const diffPct = Math.round(((out - prevOut) / prevOut) * 100);
      narrative += ` Dibandingkan ${
        periodMode === 'year' ? 'tahun' : periodMode === 'month' ? 'bulan' : 'hari'
      } sebelumnya, pengeluaran ${diffPct >= 0 ? 'meningkat' : 'turun'} <b>${Math.abs(diffPct)}%</b>.`;
    }

    if (periodMode === 'month' && out > 0) {
      const [y, m] = period.split('-').map(Number);
      const daysInMonth = new Date(y, m, 0).getDate();
      const today = getTodayDate();
      const passedDays = today.startsWith(period) ? Number(today.slice(8)) : daysInMonth;
      const dailyAvg = out / Math.max(1, passedDays);
      narrative += ` Rata-rata belanja harian tercatat ${formatRupiah(dailyAvg)}.`;
    }
  }

  return (
    <div className="card resume-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '18px' }}>📝</span>
        <h2 className="card-title">Ringkasan Naratif · {label}</h2>
      </div>
      <p className="resume-text" dangerouslySetInnerHTML={{ __html: narrative }} />
    </div>
  );
};
