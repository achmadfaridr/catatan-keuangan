import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  BarChart3,
  PiggyBank,
  CalendarCheck,
  Activity,
  Cloud,
  HardDrive,
  LogOut,
  LogIn,
  X,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { PageId } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_ITEMS: { id: PageId; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'Total Keseluruhan', icon: <LayoutDashboard size={18} /> },
  { id: 'day', label: 'Harian', icon: <CalendarDays size={18} /> },
  { id: 'month', label: 'Bulanan', icon: <CalendarRange size={18} /> },
  { id: 'year', label: 'Tahunan', icon: <BarChart3 size={18} /> },
  { id: 'sv', label: 'Tabungan & Investasi', icon: <PiggyBank size={18} /> },
  { id: 'cal', label: 'Kalender & Pengingat', icon: <CalendarCheck size={18} /> },
  { id: 'sum', label: 'Kesimpulan & Saran', icon: <Activity size={18} /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activePage, setActivePage } = useFinance();
  const { user, isConfigured, isGuest, signOut, openAuthModal } = useAuth();

  const handleSelectPage = (id: PageId) => {
    setActivePage(id);
    onClose();
  };

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <PiggyBank size={22} />
          </div>
          <div>
            <div className="brand-title">Catatan Keuangan</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>TypeScript + Supabase</div>
          </div>
          {isOpen && (
            <button
              onClick={onClose}
              className="btn-ghost"
              style={{ marginLeft: 'auto', padding: '4px' }}
              aria-label="Tutup Menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="nav-list">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectPage(item.id)}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="auth-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                {user && isConfigured ? (
                  <>
                    <Cloud size={14} color="#10b981" />
                    <span style={{ color: '#10b981', fontWeight: 600 }}>Supabase Cloud</span>
                  </>
                ) : (
                  <>
                    <HardDrive size={14} color="#f59e0b" />
                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>Mode Lokal</span>
                  </>
                )}
              </div>
              <span className="brand-badge">{isConfigured ? 'Online' : 'Offline'}</span>
            </div>

            {user ? (
              <div className="auth-user-info">
                <div className="user-avatar">{user.email?.slice(0, 1).toUpperCase() || 'U'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {user.email}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Terhubung ke Supabase</div>
                </div>
                <button
                  onClick={signOut}
                  className="btn-ghost"
                  style={{ padding: '6px' }}
                  title="Keluar"
                  aria-label="Keluar"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div>
                <button
                  onClick={openAuthModal}
                  className="btn btn-secondary"
                  style={{ width: '100%', fontSize: '12px', padding: '6px 10px' }}
                >
                  <LogIn size={14} />
                  <span>{isConfigured ? 'Masuk / Daftar' : 'Setup Supabase'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
