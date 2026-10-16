import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatRupiah } from '../utils/formatters';

export const BalanceOverview: React.FC = () => {
  const { transactions } = useFinance();

  const totalIn = transactions
    .filter((t) => t.type === 'in')
    .reduce((s, t) => s + Number(t.amount), 0);

  const totalOut = transactions
    .filter((t) => t.type === 'out')
    .reduce((s, t) => s + Number(t.amount), 0);

  const totalSv = transactions
    .filter((t) => t.type === 'sv')
    .reduce((s, t) => s + Number(t.amount), 0);

  const overallNet = totalIn - totalOut;
  const usableBalance = overallNet - totalSv;

  return (
    <div className="grid-equal">
      <div className="card" style={{ borderLeft: '4px solid var(--income)' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          💵 Saldo yang Aman Digunakan
        </span>
        <div
          style={{
            fontSize: '28px',
            fontWeight: 800,
            fontFamily: 'JetBrains Mono, monospace',
            margin: '6px 0 2px',
            color: usableBalance < 0 ? 'var(--expense)' : 'var(--income)',
          }}
        >
          {usableBalance < 0 ? '-' : ''}
          {formatRupiah(Math.abs(usableBalance))}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
          Dana kas riil yang bebas dipakai setelah disisihkan untuk tabungan & investasi.
        </p>
      </div>

      <div className="card" style={{ borderLeft: '4px solid var(--brand)' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          🏦 Total Akumulasi Kekayaan Bersih
        </span>
        <div
          style={{
            fontSize: '28px',
            fontWeight: 800,
            fontFamily: 'JetBrains Mono, monospace',
            margin: '6px 0 2px',
            color: overallNet < 0 ? 'var(--expense)' : 'var(--text-main)',
          }}
        >
          {overallNet < 0 ? '-' : ''}
          {formatRupiah(Math.abs(overallNet))}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
          Total masuk ({formatRupiah(totalIn)}) − keluar ({formatRupiah(totalOut)}). Di dalamnya {formatRupiah(totalSv)} telah disimpan di tabungan/aset.
        </p>
      </div>
    </div>
  );
};
