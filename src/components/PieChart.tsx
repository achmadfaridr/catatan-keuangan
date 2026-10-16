import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CategorySummary, TransactionType } from '../types';
import { formatRupiah, CHART_PALETTE, TYPE_META } from '../utils/formatters';

export const PieChart: React.FC = () => {
  const { transactions, period, pieType, setPieType, activePage } = useFinance();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const currentList =
    activePage === 'all'
      ? transactions
      : transactions.filter((t) => t.date.startsWith(period));

  const targetList = currentList.filter((t) => t.type === pieType);

  const catMap: Record<string, number> = {};
  targetList.forEach((t) => {
    catMap[t.goal] = (catMap[t.goal] || 0) + Number(t.amount);
  });

  const total = Object.values(catMap).reduce((s, v) => s + v, 0);

  const categories: CategorySummary[] = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amount], i) => ({
      category: cat,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
      color: CHART_PALETTE[i % CHART_PALETTE.length],
    }));

  const activeCategory =
    hoveredIdx !== null && categories[hoveredIdx] ? categories[hoveredIdx] : null;

  // Generate SVG arcs
  let accumulatedOffset = 25; // 25 to start at 12 o'clock
  const circles = categories.map((cat, idx) => {
    const strokeDasharray = `${cat.percentage} ${100 - cat.percentage}`;
    const strokeDashoffset = accumulatedOffset;
    accumulatedOffset -= cat.percentage;

    return (
      <circle
        key={cat.category}
        cx="21"
        cy="21"
        r="15.9155"
        fill="none"
        stroke={cat.color}
        strokeWidth={hoveredIdx === idx ? '6.5' : '5'}
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        style={{
          cursor: 'pointer',
          transition: 'stroke-width 0.2s, opacity 0.2s',
          opacity: hoveredIdx === null || hoveredIdx === idx ? 1 : 0.5,
        }}
        onMouseEnter={() => setHoveredIdx(idx)}
        onMouseLeave={() => setHoveredIdx(null)}
      />
    );
  });

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Komposisi Kategori</h2>
          <p className="card-subtitle">Distribusi alokasi berdasarkan tujuan transaksi</p>
        </div>

        <div className="period-tabs">
          <button
            onClick={() => setPieType('out')}
            className={`tab-btn ${pieType === 'out' ? 'active' : ''}`}
          >
            Keluar
          </button>
          <button
            onClick={() => setPieType('in')}
            className={`tab-btn ${pieType === 'in' ? 'active' : ''}`}
          >
            Masuk
          </button>
          <button
            onClick={() => setPieType('sv')}
            className={`tab-btn ${pieType === 'sv' ? 'active' : ''}`}
          >
            Tabungan
          </button>
        </div>
      </div>

      {categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-dim)', fontSize: '14px' }}>
          Belum ada catatan {TYPE_META[pieType].label.toLowerCase()} di periode ini.
        </div>
      ) : (
        <div className="pie-wrapper">
          <svg viewBox="0 0 42 42" className="pie-svg">
            {circles}
            <text x="21" y="19" textAnchor="middle" fontSize="3" fill="var(--text-muted)">
              {activeCategory ? activeCategory.category : 'Total'}
            </text>
            <text
              x="21"
              y="24"
              textAnchor="middle"
              fontSize="3.4"
              fontWeight="700"
              fill="var(--text-main)"
            >
              {activeCategory
                ? `${Math.round(activeCategory.percentage)}%`
                : formatRupiah(total)}
            </text>
          </svg>

          <div className="pie-list">
            {categories.map((c, i) => (
              <div
                key={c.category}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="pie-item"
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: c.color,
                    flexShrink: 0,
                  }}
                />
                <span className="pie-item-name">{c.category}</span>
                <span className="pie-item-pct">{Math.round(c.percentage)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
