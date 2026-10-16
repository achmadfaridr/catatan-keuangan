import React from 'react';
import { Edit2, Trash2, Search } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Transaction, FilterType } from '../types';
import { formatRupiah, formatDisplayDate, TYPE_META } from '../utils/formatters';

interface TransactionListProps {
  onEditTransaction: (tx: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ onEditTransaction }) => {
  const {
    transactions,
    period,
    activePage,
    transactionFilter,
    setTransactionFilter,
    deleteTransaction,
  } = useFinance();

  const [searchTerm, setSearchTerm] = React.useState('');

  const currentList =
    activePage === 'all'
      ? transactions
      : transactions.filter((t) => t.date.startsWith(period));

  const filtered = currentList
    .filter((t) => transactionFilter === 'all' || t.type === transactionFilter)
    .filter((t) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        t.goal.toLowerCase().includes(term) ||
        (t.note && t.note.toLowerCase().includes(term))
      );
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleDelete = (id: string, goal: string) => {
    if (window.confirm(`Hapus transaksi "${goal}"?`)) {
      deleteTransaction(id);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Riwayat Transaksi</h2>
          <p className="card-subtitle">
            Daftar pencatatan pada periode yang dipilih ({filtered.length} item)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div className="chip-group">
            {(['all', 'in', 'out', 'sv'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setTransactionFilter(f)}
                className={`chip-btn ${transactionFilter === f ? 'active' : ''}`}
              >
                {f === 'all' ? 'Semua' : TYPE_META[f].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: '14px' }}>
        <Search
          size={16}
          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
        />
        <input
          type="text"
          placeholder="Cari transaksi atau keterangan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '36px', fontSize: '13.5px' }}
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-dim)', fontSize: '14px' }}>
          Tidak ada transaksi yang cocok untuk ditampilkan.
        </div>
      ) : (
        <div>
          {filtered.map((t) => {
            const meta = TYPE_META[t.type];
            return (
              <div key={t.id} className="tx-item">
                <div className="tx-left">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 650, color: 'var(--text-main)', fontSize: '14.5px' }}>
                        {t.goal}
                      </span>
                      <span
                        className="tx-badge"
                        style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                      <span>{formatDisplayDate(t.date)}</span>
                      {t.note && <span> · {t.note}</span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div className="tx-amount" style={{ color: meta.color }}>
                    {meta.prefix}
                    {formatRupiah(Number(t.amount))}
                  </div>

                  <div className="tx-actions">
                    <button
                      onClick={() => onEditTransaction(t)}
                      className="tx-action-btn"
                      title="Ubah"
                      aria-label="Ubah Transaksi"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id, t.goal)}
                      className="tx-action-btn"
                      title="Hapus"
                      aria-label="Hapus Transaksi"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
