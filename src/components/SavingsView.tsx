import React from 'react';
import { PiggyBank, TrendingUp, ShieldCheck, PieChart as PieIcon } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import {
  formatRupiah,
  getTodayDate,
  getNextMonth,
  MONTH_NAMES_SHORT,
  MONTH_NAMES_FULL,
  padZero,
  formatDisplayDate,
} from '../utils/formatters';

export const SavingsView: React.FC = () => {
  const { transactions } = useFinance();
  const today = getTodayDate();
  const currentMonth = today.slice(0, 7);

  const svList = transactions.filter((t) => t.type === 'sv');
  const totalSaved = svList.reduce((s, t) => s + Number(t.amount), 0);

  // Setoran bulan berjalan
  const monthSaved = svList
    .filter((t) => t.date.startsWith(currentMonth))
    .reduce((s, t) => s + Number(t.amount), 0);

  // Pemasukan bulan berjalan
  const monthIncome = transactions
    .filter((t) => t.type === 'in' && t.date.startsWith(currentMonth))
    .reduce((s, t) => s + Number(t.amount), 0);

  const savingsRate = monthIncome > 0 ? (monthSaved / monthIncome) * 100 : 0;

  // Hitung jumlah bulan sejak setoran pertama
  let monthsCount = 0;
  if (svList.length > 0) {
    let earliest = svList.reduce((min, t) => (t.date < min ? t.date : min), '9999').slice(0, 7);
    while (earliest <= currentMonth && monthsCount < 600) {
      monthsCount++;
      earliest = getNextMonth(earliest);
    }
  }
  const monthlyAvg = monthsCount > 0 ? totalSaved / monthsCount : 0;

  // Dana darurat
  const emergencyTotal = svList
    .filter((t) => /darurat/i.test(t.goal))
    .reduce((s, t) => s + Number(t.amount), 0);

  // Kantong Tabungan (Pockets)
  const pocketsMap: Record<string, { total: number; count: number }> = {};
  svList.forEach((t) => {
    if (!pocketsMap[t.goal]) {
      pocketsMap[t.goal] = { total: 0, count: 0 };
    }
    pocketsMap[t.goal].total += Number(t.amount);
    pocketsMap[t.goal].count += 1;
  });

  const sortedPockets = Object.entries(pocketsMap).sort((a, b) => b[1].total - a[1].total);

  // 12 Bulan Terakhir Setoran Chart
  const last12Months: { monthLabel: string; amount: number }[] = [];
  const curY = Number(today.slice(0, 4));
  const curM = Number(today.slice(5, 7));

  for (let i = 11; i >= 0; i--) {
    const d = new Date(curY, curM - 1 - i, 1);
    const mStr = `${d.getFullYear()}-${padZero(d.getMonth() + 1)}`;
    const amt = svList
      .filter((t) => t.date.startsWith(mStr))
      .reduce((s, t) => s + Number(t.amount), 0);

    last12Months.push({
      monthLabel: MONTH_NAMES_SHORT[d.getMonth()],
      amount: amt,
    });
  }

  const maxVal = Math.max(1, ...last12Months.map((m) => m.amount));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 4 Summary Cards */}
      <div className="summary-grid">
        <div className="card stat-card sv">
          <div className="stat-top">
            <span className="stat-label">Total Tersimpan</span>
            <div className="stat-icon" style={{ background: 'var(--savings-glow)', color: 'var(--savings)' }}>
              <PiggyBank size={16} />
            </div>
          </div>
          <div className="stat-amount color-sv">{formatRupiah(totalSaved)}</div>
          <p className="stat-desc">Akumulasi seluruh setoran</p>
        </div>

        <div className="card stat-card sv">
          <div className="stat-top">
            <span className="stat-label">Setoran Bulan Ini</span>
            <div className="stat-icon" style={{ background: 'var(--savings-glow)', color: 'var(--savings)' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="stat-amount color-sv">{formatRupiah(monthSaved)}</div>
          <p className="stat-desc">Bulan berjalan ({MONTH_NAMES_SHORT[curM - 1]})</p>
        </div>

        <div className="card stat-card sv">
          <div className="stat-top">
            <span className="stat-label">Rata-rata / Bulan</span>
            <div className="stat-icon" style={{ background: 'var(--savings-glow)', color: 'var(--savings)' }}>
              <PieIcon size={16} />
            </div>
          </div>
          <div className="stat-amount color-sv">{formatRupiah(monthlyAvg)}</div>
          <p className="stat-desc">Sejak setoran pertama</p>
        </div>

        <div className="card stat-card sv">
          <div className="stat-top">
            <span className="stat-label">Rasio Tabungan</span>
            <div className="stat-icon" style={{ background: 'var(--savings-glow)', color: 'var(--savings)' }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div
            className={`stat-amount ${
              savingsRate >= 20 ? 'color-in' : savingsRate >= 10 ? 'color-brand' : 'color-out'
            }`}
          >
            {monthIncome > 0 ? `${Math.round(savingsRate)}%` : '-'}
          </div>
          <p className="stat-desc">Target ideal: ≥ 20% pemasukan</p>
        </div>
      </div>

      {/* Ringkasan & Pockets */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Kantong Tabungan & Alokasi Portofolio</h2>
              <p className="card-subtitle">Pembagian dana berdasarkan tujuan spesifik</p>
            </div>
          </div>

          {sortedPockets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-dim)' }}>
              Belum ada tabungan atau investasi tercatat.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              {sortedPockets.map(([goal, data]) => {
                const pct = totalSaved > 0 ? Math.round((data.total / totalSaved) * 100) : 0;
                return (
                  <div
                    key={goal}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--line-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px',
                    }}
                  >
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      {goal}
                    </div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--savings)', fontFamily: 'JetBrains Mono' }}>
                      {formatRupiah(data.total)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                      {data.count}× setoran · {pct}% portofolio
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Konsistensi 12 Bulan</h2>
              <p className="card-subtitle">Setoran rutin bulanan ke instrumen masa depan</p>
            </div>
          </div>

          <div className="barchart-container" style={{ height: '140px' }}>
            {last12Months.map((m, idx) => {
              const hPct = (m.amount / maxVal) * 100;
              return (
                <div key={idx} className="chart-bar-group" title={`${m.monthLabel}: ${formatRupiah(m.amount)}`}>
                  <div className="chart-bars-inner">
                    <div
                      className="chart-bar-col"
                      style={{
                        height: `${Math.max(m.amount ? 6 : 0, hPct)}%`,
                        background: 'var(--savings)',
                      }}
                    />
                  </div>
                  <span className="chart-axis-label">{m.monthLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Riwayat Setoran Tabungan */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Riwayat Setoran Tabungan & Investasi</h2>
            <p className="card-subtitle">Daftar transaksi dana yang disisihkan</p>
          </div>
        </div>

        {svList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-dim)' }}>
            Belum ada data setoran tabungan.
          </div>
        ) : (
          <div>
            {svList
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((t) => (
                <div key={t.id} className="tx-item">
                  <div className="tx-left">
                    <div>
                      <div style={{ fontWeight: 650, color: 'var(--text-main)', fontSize: '14px' }}>
                        {t.goal}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                        {formatDisplayDate(t.date)}
                        {t.note && ` · ${t.note}`}
                      </div>
                    </div>
                  </div>
                  <div className="tx-amount color-sv">→ {formatRupiah(Number(t.amount))}</div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
