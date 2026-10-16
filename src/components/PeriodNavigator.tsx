import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { PeriodMode } from '../types';
import { formatPeriodLabel } from '../utils/formatters';

export const PeriodNavigator: React.FC = () => {
  const { period, periodMode, setPeriod, setPeriodMode, shiftPeriodBy } = useFinance();

  const handleModeChange = (mode: PeriodMode) => {
    setPeriodMode(mode);
    const now = new Date();
    const ymd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
    if (mode === 'day') setPeriod(ymd);
    else if (mode === 'month') setPeriod(ymd.slice(0, 7));
    else if (mode === 'year') setPeriod(ymd.slice(0, 4));
  };

  return (
    <div className="period-bar">
      <div className="period-tabs">
        <button
          onClick={() => handleModeChange('day')}
          className={`tab-btn ${periodMode === 'day' ? 'active' : ''}`}
        >
          Harian
        </button>
        <button
          onClick={() => handleModeChange('month')}
          className={`tab-btn ${periodMode === 'month' ? 'active' : ''}`}
        >
          Bulanan
        </button>
        <button
          onClick={() => handleModeChange('year')}
          className={`tab-btn ${periodMode === 'year' ? 'active' : ''}`}
        >
          Tahunan
        </button>
      </div>

      <div className="period-nav-group">
        <button
          onClick={() => shiftPeriodBy(-1)}
          className="nav-arrow-btn"
          title="Sebelumnya"
          aria-label="Sebelumnya"
        >
          <ChevronLeft size={18} />
        </button>

        {periodMode === 'day' ? (
          <input
            type="date"
            value={period}
            onChange={(e) => e.target.value && setPeriod(e.target.value)}
            className="period-input"
          />
        ) : periodMode === 'month' ? (
          <input
            type="month"
            value={period}
            onChange={(e) => e.target.value && setPeriod(e.target.value)}
            className="period-input"
          />
        ) : (
          <input
            type="number"
            min="2000"
            max="2099"
            value={period}
            onChange={(e) => e.target.value && setPeriod(e.target.value)}
            className="period-input"
            style={{ width: '90px' }}
          />
        )}

        <button
          onClick={() => shiftPeriodBy(1)}
          className="nav-arrow-btn"
          title="Berikutnya"
          aria-label="Berikutnya"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginLeft: '4px' }}>
        {formatPeriodLabel(period, periodMode)}
      </div>
    </div>
  );
};
