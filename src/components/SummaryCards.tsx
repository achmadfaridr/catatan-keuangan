import React from 'react';
import { ArrowDownLeft, ArrowUpRight, PiggyBank, Wallet } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatRupiah } from '../utils/formatters';

export const SummaryCards: React.FC = () => {
  const { transactions, period, activePage } = useFinance();

  const filtered =
    activePage === 'all'
      ? transactions
      : transactions.filter((t) => t.date.startsWith(period));

  const income = filtered
    .filter((t) => t.type === 'in')
    .reduce((s, t) => s + Number(t.amount), 0);

  const expense = filtered
    .filter((t) => t.type === 'out')
    .reduce((s, t) => s + Number(t.amount), 0);

  const savings = filtered
    .filter((t) => t.type === 'sv')
    .reduce((s, t) => s + Number(t.amount), 0);

  const balance = income - expense - savings;

  return (
    <div className="summary-grid">
      <div className="card stat-card in">
        <div className="stat-top">
          <span className="stat-label">Pemasukan</span>
          <div className="stat-icon" style={{ background: 'var(--income-glow)', color: 'var(--income)' }}>
            <ArrowDownLeft size={16} />
          </div>
        </div>
        <div className="stat-amount color-in">{formatRupiah(income)}</div>
        <p className="stat-desc">Total dana masuk</p>
      </div>

      <div className="card stat-card out">
        <div className="stat-top">
          <span className="stat-label">Pengeluaran</span>
          <div className="stat-icon" style={{ background: 'var(--expense-glow)', color: 'var(--expense)' }}>
            <ArrowUpRight size={16} />
          </div>
        </div>
        <div className="stat-amount color-out">{formatRupiah(expense)}</div>
        <p className="stat-desc">Total dana keluar</p>
      </div>

      <div className="card stat-card sv">
        <div className="stat-top">
          <span className="stat-label">Tabungan & Investasi</span>
          <div className="stat-icon" style={{ background: 'var(--savings-glow)', color: 'var(--savings)' }}>
            <PiggyBank size={16} />
          </div>
        </div>
        <div className="stat-amount color-sv">{formatRupiah(savings)}</div>
        <p className="stat-desc">Disisihkan untuk masa depan</p>
      </div>

      <div className="card stat-card bal">
        <div className="stat-top">
          <span className="stat-label">
            {activePage === 'all' ? 'Saldo Bersih' : 'Sisa Periode Ini'}
          </span>
          <div className="stat-icon" style={{ background: 'var(--brand-glow)', color: 'var(--brand)' }}>
            <Wallet size={16} />
          </div>
        </div>
        <div className={`stat-amount ${balance < 0 ? 'color-out' : 'color-brand'}`}>
          {balance < 0 ? '-' : ''}
          {formatRupiah(Math.abs(balance))}
        </div>
        <p className="stat-desc">Pemasukan − Pengeluaran − Tabungan</p>
      </div>
    </div>
  );
};
