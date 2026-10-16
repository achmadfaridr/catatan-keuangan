import React from 'react';
import { Menu, Plus, Settings, RefreshCw } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { PageId } from '../types';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenTransactionModal: () => void;
  onOpenBudgetModal: () => void;
}

const PAGE_METADATA: Record<PageId, { title: string; subtitle: string }> = {
  all: {
    title: 'Total Keseluruhan',
    subtitle: 'Gambaran komprehensif seluruh keuangan sejak awal pencatatan',
  },
  day: {
    title: 'Catatan Harian',
    subtitle: 'Ringkasan pemasukan, pengeluaran & sisa anggaran per hari',
  },
  month: {
    title: 'Catatan Bulanan',
    subtitle: 'Ringkasan arus kas, grafik kategori, dan analisis per bulan',
  },
  year: {
    title: 'Analisis Tahunan',
    subtitle: 'Tren pengeluaran, pemasukan, dan tabungan sepanjang tahun',
  },
  sv: {
    title: 'Tabungan & Investasi',
    subtitle: 'Perkembangan dana masa depan, dana darurat, dan alokasi aset',
  },
  cal: {
    title: 'Kalender & Pengingat',
    subtitle: 'Jadwal tagihan rutin, pengingat tanggal, dan otomatisasi bulanan',
  },
  sum: {
    title: 'Kesimpulan & Saran',
    subtitle: 'Skor kesehatan keuangan, evaluasi aturan 50/30/20, dan panduan budgeting',
  },
};

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenTransactionModal,
  onOpenBudgetModal,
}) => {
  const { activePage, isSyncing } = useFinance();
  const meta = PAGE_METADATA[activePage];

  return (
    <header className="header">
      <div className="header-left">
        <button
          onClick={onOpenMobileMenu}
          className="mobile-menu-btn"
          aria-label="Buka Menu"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="page-title">{meta.title}</h1>
          <p className="page-subtitle">{meta.subtitle}</p>
        </div>
      </div>

      <div className="header-actions">
        {isSyncing && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--brand)',
              marginRight: '6px',
            }}
          >
            <RefreshCw size={14} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
            <span>Sinkronisasi...</span>
          </div>
        )}

        <button onClick={onOpenBudgetModal} className="btn btn-secondary">
          <Settings size={16} />
          <span>Anggaran</span>
        </button>

        <button onClick={onOpenTransactionModal} className="btn">
          <Plus size={18} />
          <span>Tambah</span>
        </button>
      </div>
    </header>
  );
};
