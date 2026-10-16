import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { TransactionType } from '../../types';
import {
  CATEGORY_PRESETS,
  formatNumberInput,
  parseNumber,
  getTodayDate,
} from '../../utils/formatters';

interface RecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecurringModal: React.FC<RecurringModalProps> = ({ isOpen, onClose }) => {
  const { addRecurringRule } = useFinance();
  const today = getTodayDate();

  const [type, setType] = useState<TransactionType>('in');
  const [amountStr, setAmountStr] = useState<string>('');
  const [goal, setGoal] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [dayOfMonth, setDayOfMonth] = useState<number>(25);
  const [startMonth, setStartMonth] = useState<string>(today.slice(0, 7));
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseNumber(amountStr);

    if (amount <= 0) {
      setErrorMsg('Nominal transaksi harus lebih dari 0.');
      return;
    }
    if (!goal.trim()) {
      setErrorMsg('Tujuan atau kategori wajib diisi.');
      return;
    }
    if (dayOfMonth < 1 || dayOfMonth > 31) {
      setErrorMsg('Tanggal harus berada di rentang 1 hingga 31.');
      return;
    }

    await addRecurringRule({
      type,
      amount,
      goal: goal.trim(),
      note: note.trim(),
      day_of_month: dayOfMonth,
      start_month: startMonth,
      last_processed_month: '',
      is_active: true,
    });

    onClose();
  };

  const presetGoals = CATEGORY_PRESETS[type] || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 className="modal-title">Aturan Transaksi Otomatis Bulanan</h2>
            <p className="card-subtitle">
              Sistem akan otomatis mencatat transaksi ini setiap bulan pada tanggal yang dipilih.
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Jenis Transaksi</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TransactionType)}
            >
              <option value="in">Pemasukan (mis. Gaji, Dividen, Omzet)</option>
              <option value="out">Pengeluaran (mis. Cicilan, Sewa, Wifi, Listrik)</option>
              <option value="sv">Tabungan & Investasi (mis. Auto-debet Reksadana)</option>
            </select>
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

          <div className="form-group">
            <label className="form-label">Tujuan / Kategori</label>
            <input
              type="text"
              list="recurring-goals"
              placeholder="Pilih atau ketik sendiri"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              required
            />
            <datalist id="recurring-goals">
              {presetGoals.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </div>

          <div className="form-group">
            <label className="form-label">Keterangan (Opsional)</label>
            <input
              type="text"
              placeholder="mis. Gaji bulanan kantor"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tiap Tanggal (1-31)</label>
              <input
                type="number"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Math.min(31, Math.max(1, Number(e.target.value))))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mulai Bulan</label>
              <input
                type="month"
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
                required
              />
            </div>
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
              Simpan Aturan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
