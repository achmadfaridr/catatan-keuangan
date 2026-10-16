import React from 'react';
import { Lightbulb, CheckCircle2, AlertTriangle, AlertCircle, Sparkles } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { assessFinancialHealth } from '../utils/calculations';
import { formatRupiah } from '../utils/formatters';

export const FinancialHealthView: React.FC = () => {
  const { transactions, budget, updateBudget, showToast } = useFinance();

  const assessment = assessFinancialHealth(transactions, budget);

  const handleApplyProposedBudget = async () => {
    if (assessment.proposedBudget.total <= 0) {
      showToast('Belum cukup data pengeluaran untuk membuat usulan anggaran.', 'warn');
      return;
    }

    await updateBudget({
      total_limit: assessment.proposedBudget.total,
      category_limits: assessment.proposedBudget.categories,
    });

    showToast('Usulan anggaran cerdas berhasil diterapkan! 🎯', 'ok');
  };

  const getStatusIcon = (isOk: boolean, isWarn: boolean) => {
    if (isOk) return <CheckCircle2 size={16} color="var(--income)" />;
    if (isWarn) return <AlertTriangle size={16} color="var(--warning)" />;
    return <AlertCircle size={16} color="var(--expense)" />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Gauge & Verdict Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '140px', height: '140px', flexShrink: 0, margin: '0 auto' }}>
            <svg viewBox="0 0 42 42" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle
                cx="21"
                cy="21"
                r="15.9155"
                fill="none"
                stroke="var(--line-border)"
                strokeWidth="4"
              />
              <circle
                cx="21"
                cy="21"
                r="15.9155"
                fill="none"
                stroke={assessment.statusColor}
                strokeWidth="4"
                strokeDasharray={`${assessment.score} ${100 - assessment.score}`}
                strokeDashoffset="0"
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  fontFamily: 'JetBrains Mono',
                  color: assessment.statusColor,
                  lineHeight: 1,
                }}
              >
                {assessment.score}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                dari 100
              </span>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '240px' }}>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: assessment.statusColor,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{assessment.statusLabel}</span>
            </div>
            <p style={{ marginTop: '8px', fontSize: '14.5px', lineHeight: 1.6, color: '#cbd5e1' }}>
              {assessment.verdict}
            </p>
            <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-dim)' }}>
              Dihitung berdasarkan rata-rata pola arus kas pada data riwayat keuangan kamu.
            </div>
          </div>
        </div>
      </div>

      {/* Indikator Kesehatan & Alokasi 50/30/20 */}
      <div className="grid-equal">
        {/* Indikator Tabel */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Parameter Kesehatan Keuangan</h2>
              <p className="card-subtitle">Tolok ukur perencanaan finansial standar</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid var(--line-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getStatusIcon(assessment.needsWantsRate <= 70, assessment.needsWantsRate <= 85)}
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600 }}>Rasio Pengeluaran</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Target: ≤ 70–80% pemasukan</div>
                </div>
              </div>
              <b style={{ fontFamily: 'JetBrains Mono', fontSize: '14px' }}>
                {Math.round(assessment.needsWantsRate)}%
              </b>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid var(--line-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getStatusIcon(assessment.savingsRate >= 20, assessment.savingsRate >= 10)}
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600 }}>Rasio Tabungan / Aset</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Target: ≥ 20% pemasukan</div>
                </div>
              </div>
              <b style={{ fontFamily: 'JetBrains Mono', fontSize: '14px' }}>
                {Math.round(assessment.savingsRate)}%
              </b>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid var(--line-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getStatusIcon(assessment.emergencyMonths >= 3, assessment.emergencyMonths >= 1)}
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600 }}>Kecukupan Dana Darurat</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Target: 3–6 bulan pengeluaran</div>
                </div>
              </div>
              <b style={{ fontFamily: 'JetBrains Mono', fontSize: '14px' }}>
                {assessment.emergencyMonths.toFixed(1)} bulan
              </b>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getStatusIcon(assessment.deficitMonths === 0, assessment.deficitMonths === 1)}
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600 }}>Bulan Mengalami Defisit</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Target: 0 bulan</div>
                </div>
              </div>
              <b style={{ fontFamily: 'JetBrains Mono', fontSize: '14px' }}>
                {assessment.deficitMonths} bulan
              </b>
            </div>
          </div>
        </div>

        {/* Alokasi 50/30/20 Rule */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Alokasi Anggaran Ideal (50/30/20)</h2>
              <p className="card-subtitle">Distribusi pengeluaran vs tabungan masa depan</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span>Pengeluaran Belanja (Kebutuhan + Keinginan)</span>
                <b>{Math.round(assessment.needsWantsRate)}%</b>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min(100, assessment.needsWantsRate)}%`,
                    background: assessment.needsWantsRate <= 80 ? 'var(--income)' : 'var(--expense)',
                  }}
                />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                Target ideal: ≤ 80% dari total pemasukan
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span>Tabungan & Investasi</span>
                <b>{Math.round(assessment.savingsRate)}%</b>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min(100, assessment.savingsRate)}%`,
                    background: assessment.savingsRate >= 20 ? 'var(--income)' : 'var(--warning)',
                  }}
                />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                Target ideal: ≥ 20% dari total pemasukan
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span>Sisa Belum Dialokasikan</span>
                <b>{Math.round(assessment.unallocatedRate)}%</b>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min(100, assessment.unallocatedRate)}%`,
                    background: 'var(--brand)',
                  }}
                />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                Sisa arus kas positif yang bisa dialihkan ke investasi
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saran & Usulan Anggaran Otomatis */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Saran & Rekomendasi Finansial</h2>
            <p className="card-subtitle">Panduan langkah nyata untuk menyehatkan arus kas kamu</p>
          </div>

          {assessment.proposedBudget.total > 0 && (
            <button onClick={handleApplyProposedBudget} className="btn" style={{ fontSize: '13px' }}>
              <Sparkles size={15} />
              <span>Terapkan Usulan Anggaran</span>
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {assessment.recommendations.map((tip, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--line-border)',
                fontSize: '13.5px',
                lineHeight: 1.5,
              }}
            >
              <Lightbulb size={18} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{tip}</div>
            </div>
          ))}
        </div>

        {assessment.proposedBudget.total > 0 && (
          <div style={{ marginTop: '16px', borderTop: '1px solid var(--line-subtle)', paddingTop: '14px' }}>
            <div style={{ fontSize: '12.5px', color: 'var(--text-dim)', marginBottom: '8px' }}>
              Usulan batas pengeluaran bulanan berdasarkan data pengeluaranmu:
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '10px',
              }}
            >
              <div
                style={{
                  background: 'var(--bg-surface)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--line-border)',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Total Pengeluaran</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'JetBrains Mono' }}>
                  {formatRupiah(assessment.proposedBudget.total)}
                </div>
              </div>
              {Object.entries(assessment.proposedBudget.categories).map(([cat, val]) => (
                <div
                  key={cat}
                  style={{
                    background: 'var(--bg-surface)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--line-border)',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{cat}</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'JetBrains Mono' }}>
                    {formatRupiah(val)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
