import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CATEGORY_PRESETS, formatNumberInput, parseNumber } from '../../utils/formatters';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose }) => {
  const { budget, transactions, updateBudget } = useFinance();

  const [totalLimitStr, setTotalLimitStr] = useState<string>('');
  const [threshold, setThreshold] = useState<number>(80);
  const [carryOver, setCarryOver] = useState<boolean>(true);
  const [catLimits, setCatLimits] = useState<Record<string, string>>({});

  // Kategori pengeluaran unik
  const expenseCategories = Array.from(
    new Set([
      ...CATEGORY_PRESETS.out,
      ...transactions.filter((t) => t.type === 'out').map((t) => t.goal),
    ])
  );

  useEffect(() => {
    if (budget) {
      setTotalLimitStr(budget.total_limit > 0 ? formatNumberInput(budget.total_limit) : '');
      setThreshold(budget.threshold_percent || 80);
      setCarryOver(budget.carry_over_surplus !== undefined ? budget.carry_over_surplus : true);

      const mapping: Record<string, string> = {};
      if (budget.category_limits) {
        Object.entries(budget.category_limits).forEach(([cat, val]) => {
          if (Number(val) > 0) mapping[cat] = formatNumberInput(val);
        });
      }
      setCatLimits(mapping);
    }
  }, [budget, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTotal = parseNumber(totalLimitStr);

    const finalCats: Record<string, number> = {};
    Object.entries(catLimits).forEach(([k, v]) => {
      const parsed = parseNumber(v);
      if (parsed > 0) finalCats[k] = parsed;
    });

    await updateBudget({
      total_limit: finalTotal,
      threshold_percent: threshold,
      carry_over_surplus: carryOver,
      category_limits: finalCats,
    });

    onClose();
  };

  const handleCategoryLimitChange = (cat: string, val: string) => {
    setCatLimits((prev) => ({
      ...prev,
      [cat]: formatNumberInput(val),
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 className="modal-title">Pengaturan Anggaran Bulanan</h2>
            <p className="card-subtitle">
              Tentukan batas belanja agar aplikasi dapat memperingatkanmu saat mendekati limit.
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Batas Total Pengeluaran / Bulan (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="mis. 5.000.000 (kosongkan jika tanpa batas)"
              value={totalLimitStr}
              onChange={(e) => setTotalLimitStr(formatNumberInput(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Beri Peringatan Saat Pengeluaran Mencapai (%)</label>
            <select
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
            >
              <option value={50}>50% dari batas</option>
              <option value={70}>70% dari batas</option>
              <option value={80}>80% dari batas (Rekomendasi)</option>
              <option value={90}>90% dari batas</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
              <input
                type="checkbox"
                checked={carryOver}
                onChange={(e) => setCarryOver(e.target.checked)}
                style={{ width: 'auto' }}
              />
              <span>Akumulasikan sisa (surplus) anggaran bulan sebelumnya ke bulan berikutnya</span>
            </label>
          </div>

          <div style={{ borderTop: '1px solid var(--line-subtle)', paddingTop: '14px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
              Batas Khusus Per Pos Kategori (Opsional)
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '12px' }}>
              Tetapkan pagu maksimal untuk kategori tertentu (mis. Makanan, Hiburan, Belanja).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto' }}>
              {expenseCategories.map((cat) => (
                <div
                  key={cat}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', minWidth: '110px' }}>
                    {cat}
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Rp 0"
                    value={catLimits[cat] || ''}
                    onChange={(e) => handleCategoryLimitChange(cat, e.target.value)}
                    style={{ padding: '6px 10px', fontSize: '13px' }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Batal
            </button>
            <button type="submit" className="btn" style={{ flex: 1 }}>
              Simpan Anggaran
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
