import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { getTodayDate } from '../../utils/formatters';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  defaultDate,
}) => {
  const { addReminder, setSelectedCalendarDate } = useFinance();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate || getTodayDate());
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      setErrorMsg('Judul pengingat dan tanggal wajib diisi.');
      return;
    }

    await addReminder({
      title: title.trim(),
      date,
      note: note.trim(),
      is_done: false,
    });

    setSelectedCalendarDate(date);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="modal-title">Tambah Pengingat Agenda</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Judul Pengingat</label>
            <input
              type="text"
              placeholder="mis. Jatuh tempo bayar listrik, tagihan kartu kredit, dll."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tanggal Pengingat</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Keterangan Tambahan (Opsional)</label>
            <input
              type="text"
              placeholder="Nomor pelanggan, estimasi nominal, dsb."
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
              Simpan Pengingat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
