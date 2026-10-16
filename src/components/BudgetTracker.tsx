import React from 'react';
import { Target, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { getBudgetStatusRows } from '../utils/calculations';
import { formatRupiah, formatPeriodLabel, getTodayDate } from '../utils/formatters';

interface BudgetTrackerProps {
  onOpenBudgetModal: () => void;
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({ onOpenBudgetModal }) => {
  const { transactions, budget, period, periodMode, activePage } = useFinance();

  const isYearly = periodMode === 'year';
  const targetMonth = isYearly
    ? period
    : activePage === 'all'
    ? getTodayDate().slice(0, 7)
    : period.slice(0, 7);

  const multiplier = isYearly ? 12 : 1;
  const rows = getBudgetStatusRows(transactions, budget, targetMonth, multiplier);

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Target & Anggaran Belanja</h2>
          <p className="card-subtitle">
            {rows.length > 0
              ? `Batas ${isYearly ? 'tahunan' : 'bulanan'} dengan batas peringatan ${budget.threshold_percent}%.`
              : 'Belum ada batas anggaran. Pasang batas agar pengeluaran terkendali.'}
          </p>
        </div>
        <button onClick={onOpenBudgetModal} className="btn btn-secondary" style={{ fontSize: '12.5px', padding: '6px 12px' }}>
          <Target size={14} />
          <span>Atur Anggaran</span>
        </button>
      </div>

      {rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-dim)' }}>
          <p style={{ marginBottom: '12px', fontSize: '13.5px' }}>
            Kamu belum mengatur batas pengeluaran bulanan.
          </p>
          <button onClick={onOpenBudgetModal} className="btn" style={{ fontSize: '13px' }}>
            Pasang Batas Sekarang
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {rows.map((row) => {
            const pct = Math.min(100, Math.round((row.spent / Math.max(1, row.limit)) * 100));
            const isOver = row.status === 'over';
            const isWarn = row.status === 'warn';

            const fillColor = isOver ? 'var(--expense)' : isWarn ? 'var(--warning)' : 'var(--income)';

            return (
              <div key={row.name} className="progress-card">
                <div className="progress-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isOver ? (
                      <AlertCircle size={15} color="var(--expense)" />
                    ) : isWarn ? (
                      <AlertTriangle size={15} color="var(--warning)" />
                    ) : (
                      <CheckCircle2 size={15} color="var(--income)" />
                    )}
                    <span style={{ color: 'var(--text-main)' }}>{row.name}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 600 }}>{formatRupiah(row.spent)}</span>
                    <span style={{ color: 'var(--text-dim)' }}> / {formatRupiah(row.limit)}</span>
                  </div>
                </div>

                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${pct}%`, background: fillColor }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-dim)' }}>
                  <span>
                    {isOver
                      ? `Melebihi batas sebesar ${formatRupiah(row.spent - row.limit)}!`
                      : `Sisa anggaran ${formatRupiah(row.limit - row.spent)} (${pct}% terpakai)`}
                  </span>
                  {row.carryOver > 0 && (
                    <span style={{ color: 'var(--brand)' }}>
                      + Surplus lalu: {formatRupiah(row.carryOver)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
