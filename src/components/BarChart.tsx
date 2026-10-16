import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { BarChartPoint } from '../types';
import {
  formatRupiah,
  MONTH_NAMES_SHORT,
  MONTH_NAMES_FULL,
  padZero,
  getTodayDate,
} from '../utils/formatters';

export const BarChart: React.FC = () => {
  const { transactions, period, periodMode, activePage } = useFinance();
  const [selectedPoint, setSelectedPoint] = useState<BarChartPoint | null>(null);

  // Generate chart data series
  const dataPoints: BarChartPoint[] = [];

  if (activePage === 'all' || periodMode === 'all') {
    // 12 bulan terakhir
    const today = getTodayDate();
    const curYear = Number(today.slice(0, 4));
    const curMonth = Number(today.slice(5, 7));

    for (let i = 11; i >= 0; i--) {
      const d = new Date(curYear, curMonth - 1 - i, 1);
      const mStr = `${d.getFullYear()}-${padZero(d.getMonth() + 1)}`;
      const list = transactions.filter((t) => t.date.startsWith(mStr));

      dataPoints.push({
        label: MONTH_NAMES_SHORT[d.getMonth()],
        income: list.filter((t) => t.type === 'in').reduce((s, t) => s + Number(t.amount), 0),
        expense: list.filter((t) => t.type === 'out').reduce((s, t) => s + Number(t.amount), 0),
        savings: list.filter((t) => t.type === 'sv').reduce((s, t) => s + Number(t.amount), 0),
      });
    }
  } else if (periodMode === 'year') {
    // 12 bulan dalam tahun terpilih
    const yearStr = period;
    for (let m = 1; m <= 12; m++) {
      const mStr = `${yearStr}-${padZero(m)}`;
      const list = transactions.filter((t) => t.date.startsWith(mStr));

      dataPoints.push({
        label: MONTH_NAMES_SHORT[m - 1],
        income: list.filter((t) => t.type === 'in').reduce((s, t) => s + Number(t.amount), 0),
        expense: list.filter((t) => t.type === 'out').reduce((s, t) => s + Number(t.amount), 0),
        savings: list.filter((t) => t.type === 'sv').reduce((s, t) => s + Number(t.amount), 0),
      });
    }
  } else {
    // Hari dalam bulan terpilih
    const ym = period.length >= 7 ? period.slice(0, 7) : getTodayDate().slice(0, 7);
    const [y, m] = ym.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = `${ym}-${padZero(d)}`;
      const list = transactions.filter((t) => t.date === dStr);

      dataPoints.push({
        label: String(d),
        income: list.filter((t) => t.type === 'in').reduce((s, t) => s + Number(t.amount), 0),
        expense: list.filter((t) => t.type === 'out').reduce((s, t) => s + Number(t.amount), 0),
        savings: list.filter((t) => t.type === 'sv').reduce((s, t) => s + Number(t.amount), 0),
      });
    }
  }

  const maxVal = Math.max(
    1,
    ...dataPoints.flatMap((p) => [p.income, p.expense, p.savings])
  );

  const displayPoint = selectedPoint || dataPoints[dataPoints.length - 1];

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Grafik Batang Komparatif</h2>
          <p className="card-subtitle">Bandingkan arus masuk, keluar, dan tabungan secara visual</p>
        </div>
      </div>

      <div className="barchart-container">
        {dataPoints.map((dp, idx) => {
          const inPct = (dp.income / maxVal) * 100;
          const outPct = (dp.expense / maxVal) * 100;
          const svPct = (dp.savings / maxVal) * 100;
          const isActive = displayPoint?.label === dp.label;

          // Step label jika jumlah data banyak (harian)
          const showLabel =
            dataPoints.length > 20 ? Number(dp.label) % 5 === 0 || dp.label === '1' : true;

          return (
            <div
              key={idx}
              onClick={() => setSelectedPoint(dp)}
              onMouseEnter={() => setSelectedPoint(dp)}
              className={`chart-bar-group ${isActive ? 'active' : ''}`}
            >
              <div className="chart-bars-inner">
                <div
                  className="chart-bar-col"
                  style={{ height: `${Math.max(dp.income ? 4 : 0, inPct)}%`, background: 'var(--income)' }}
                />
                <div
                  className="chart-bar-col"
                  style={{ height: `${Math.max(dp.expense ? 4 : 0, outPct)}%`, background: 'var(--expense)' }}
                />
                <div
                  className="chart-bar-col"
                  style={{ height: `${Math.max(dp.savings ? 4 : 0, svPct)}%`, background: 'var(--savings)' }}
                />
              </div>
              <span className="chart-axis-label">{showLabel ? dp.label : ''}</span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: '12px',
          padding: '8px 12px',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '13px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div>
          Periode: <b style={{ color: 'var(--text-main)' }}>{displayPoint?.label || '-'}</b>
        </div>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <span className="color-in">+{formatRupiah(displayPoint?.income || 0)}</span>
          <span className="color-out">-{formatRupiah(displayPoint?.expense || 0)}</span>
          <span className="color-sv">→ {formatRupiah(displayPoint?.savings || 0)}</span>
        </div>
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--income)' }} />
          <span>Pemasukan</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--expense)' }} />
          <span>Pengeluaran</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--savings)' }} />
          <span>Tabungan/Investasi</span>
        </div>
      </div>
    </div>
  );
};
