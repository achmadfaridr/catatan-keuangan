import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType } from '../../types';
import {
  CATEGORY_PRESETS,
  formatNumberInput,
  parseNumber,
  getTodayDate,
} from '../../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction?: Transaction | null;
  defaultDate?: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  editingTransaction,
  defaultDate,
}) => {
  const { addTransaction, updateTransaction, period, periodMode } = useFinance();

  const [type, setType] = useState<TransactionType>('out');
  const [date, setDate] = useState<string>(getTodayDate());
  const [amountStr, setAmountStr] = useState<string>('');
  const [goal, setGoal] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setDate(editingTransaction.date);
      setAmountStr(formatNumberInput(editingTransaction.amount));
      setGoal(editingTransaction.goal);
      setNote(editingTransaction.note || '');
    } else {
      setType('out');
      setDate(defaultDate || (periodMode === 'day' ? period : getTodayDate()));
      setAmountStr('');
      setGoal('');
      setNote('');
    }
    setErrorMsg('');
  }, [editingTransaction, defaultDate, isOpen, period, periodMode]);

  if (!isOpen) return null;

  const handleAddQuickAmount = (val: number) => {
    const cur = parseNumber(amountStr);
    setAmountStr(formatNumberInput(cur + val));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseNumber(amountStr);

    if (!date) {
      setErrorMsg('Tanggal transaksi wajib dipilih.');
      return;
    }
    if (amount <= 0) {
      setErrorMsg('Nominal transaksi harus lebih dari 0.');
      return;
    }
    if (!goal.trim()) {
      setErrorMsg('Tujuan atau kategori wajib diisi.');
      return;
    }

    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, {
        type,
        date,
        amount,
        goal: goal.trim(),
        note: note.trim(),
      });
    } else {
      await addTransaction({
        type,
        date,
        amount,
        goal: goal.trim(),
        note: note.trim(),
        recurring_rule_id: null,
      });
    }

    onClose();
  };

  const presetGoals = CATEGORY_PRESETS[type] || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="modal-title">
            {editingTransaction ? 'Ubah Transaksi' : 'Tambah Transaksi'}
          </h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Jenis Transaksi</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TransactionType)}
            >
              <option value="out">Pengeluaran</option>
              <option value="in">Pemasukan</option>
              <option value="sv">Tabungan & Investasi</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tanggal</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nominal (Rp)</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amountStr}
                onChange={(e) => setAmountStr(formatNumberInput(e.target.value))}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleAddQuickAmount(10000)}
              className="chip-btn"
            >
              +10rb
            </button>
            <button
              type="button"
              onClick={() => handleAddQuickAmount(50000)}
              className="chip-btn"
            >
              +50rb
            </button>
            <button
              type="button"
              onClick={() => handleAddQuickAmount(100000)}
              className="chip-btn"
            >
              +100rb
            </button>
            <button
              type="button"
              onClick={() => handleAddQuickAmount(500000)}
              className="chip-btn"
            >
              +500rb
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Tujuan / Kategori</label>
            <input
              type="text"
              list="goal-suggestions"
              placeholder="Pilih atau ketik kategori baru"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              required
            />
            <datalist id="goal-suggestions">
              {presetGoals.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </div>

          <div className="form-group">
            <label className="form-label">Keterangan (Opsional)</label>
            <input
              type="text"
              placeholder="mis. Beli makan siang, transfer ke bibit, dll."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {errorMsg && (
            <div style={{ color: 'var(--expense)', fontSize: '13px', marginBottom: '14px' }}>
              {errorMsg}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Batal
            </button>
            <button type="submit" className="btn" style={{ flex: 1 }}>
              {editingTransaction ? 'Simpan Perubahan' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
