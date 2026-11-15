import React, { useState } from 'react';
import { X, Cloud, Shield, ArrowRight, UploadCloud, User as UserIcon, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    closeAuthModal,
    isConfigured,
    user,
    username,
    signInWithUsername,
    signUpWithUsername,
    continueAsGuest,
  } = useAuth();

  const { migrateLocalToCloud } = useFinance();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [usernameInput, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (mode === 'signin') {
      const { error } = await signInWithUsername(usernameInput, password);
      if (error) {
        setErrorMsg(error.message || 'Gagal masuk. Periksa username dan password.');
      } else {
        closeAuthModal();
      }
    } else {
      const { error } = await signUpWithUsername(usernameInput, password);
      if (error) {
        setErrorMsg(error.message || 'Gagal mendaftar akun.');
      } else {
        setSuccessMsg('Pendaftaran akun berhasil! Kamu sekarang sudah terhubung.');
        setTimeout(() => {
          closeAuthModal();
        }, 1200);
      }
    }
    setLoading(false);
  };

  const handleMigrate = async () => {
    setLoading(true);
    await migrateLocalToCloud();
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={closeAuthModal}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand)',
              }}
            >
              <Cloud size={18} />
            </div>
            <h2 className="modal-title" style={{ margin: 0 }}>
              {isConfigured ? (mode === 'signin' ? 'Masuk ke Akun' : 'Daftar Akun Baru') : 'Konfigurasi Supabase'}
            </h2>
          </div>
          <button onClick={closeAuthModal} className="btn-ghost" style={{ padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {!isConfigured ? (
          <div>
            <div className="alert-box info" style={{ marginBottom: '16px' }}>
              <div>
                <b>Supabase Belum Dikonfigurasi</b>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>
                  Aplikasi saat ini berjalan dalam <b>Mode Lokal (Offline)</b> menggunakan memori browser kamu.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={continueAsGuest} className="btn" style={{ width: '100%' }}>
                <span>Lanjutkan Dalam Mode Lokal</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : user ? (
          <div>
            <div className="alert-box ok" style={{ marginBottom: '16px' }}>
              <Shield size={18} color="var(--income)" style={{ flexShrink: 0 }} />
              <div>
                <b>Kamu sudah terhubung ke Supabase</b>
                <p style={{ fontSize: '12px', marginTop: '2px' }}>
                  Username: <strong style={{ color: 'var(--text-bright)' }}>@{username}</strong>
                </p>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px' }}>
              Punya data transaksi lama di mode offline browser ini? Kamu bisa memindahkannya ke database Supabase dengan 1 klik di bawah.
            </p>

            <button
              onClick={handleMigrate}
              disabled={loading}
              className="btn btn-secondary"
              style={{ width: '100%', marginBottom: '10px' }}
            >
              <UploadCloud size={16} />
              <span>{loading ? 'Memproses...' : 'Migrasikan Data Lokal ke Supabase'}</span>
            </button>

            <button onClick={closeAuthModal} className="btn-ghost" style={{ width: '100%', fontSize: '13px' }}>
              Tutup
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', background: 'var(--bg-surface)', padding: '3px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`tab-btn ${mode === 'signin' ? 'active' : ''}`}
                style={{ flex: 1, padding: '7px' }}
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`tab-btn ${mode === 'signup' ? 'active' : ''}`}
                style={{ flex: 1, padding: '7px' }}
              >
                Daftar
              </button>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserIcon size={14} />
                <span>Username</span>
              </label>
              <input
                type="text"
                placeholder="misal: farid"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} />
                <span>Password</span>
              </label>
              <input
                type="password"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {errorMsg && (
              <div style={{ color: 'var(--expense)', fontSize: '13px', marginBottom: '14px' }}>
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div style={{ color: 'var(--income)', fontSize: '13px', marginBottom: '14px' }}>
                {successMsg}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
              <button type="submit" disabled={loading} className="btn" style={{ width: '100%' }}>
                {loading ? 'Memproses...' : mode === 'signin' ? 'Masuk' : 'Daftar Akun'}
              </button>

              <button
                type="button"
                onClick={continueAsGuest}
                className="btn btn-ghost"
                style={{ fontSize: '13px' }}
              >
                Lanjutkan Sebagai Tamu (Offline)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
