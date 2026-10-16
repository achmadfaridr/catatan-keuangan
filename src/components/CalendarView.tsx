import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Bell, Check, Trash2, Repeat } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import {
  MONTH_NAMES_FULL,
  formatRupiah,
  padZero,
  getTodayDate,
  formatDisplayDate,
  TYPE_META,
} from '../utils/formatters';

interface CalendarViewProps {
  onOpenReminderModal: (date?: string) => void;
  onOpenTransactionModal: (date?: string) => void;
  onOpenRecurringModal: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onOpenReminderModal,
  onOpenTransactionModal,
  onOpenRecurringModal,
}) => {
  const {
    transactions,
    reminders,
    recurringRules,
    calendarMonth,
    selectedCalendarDate,
    setSelectedCalendarDate,
    shiftCalendarMonthBy,
    toggleReminder,
    deleteReminder,
    deleteRecurringRule,
  } = useFinance();

  const today = getTodayDate();
  const [y, m] = calendarMonth.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const firstDayIndex = (new Date(y, m - 1, 1).getDay() + 6) % 7; // Senin = 0

  const dayHeaders = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  // Agenda for selected date
  const dayTx = transactions.filter((t) => t.date === selectedCalendarDate);
  const dayReminders = reminders.filter((r) => r.date === selectedCalendarDate);

  // Planned recurring rules for selected date
  const selectedDayNum = Number(selectedCalendarDate.slice(8));
  const dayPlanned = recurringRules.filter((r) => {
    if (!r.is_active || selectedCalendarDate <= today) return false;
    const ruleStart = r.start_month;
    const currentM = selectedCalendarDate.slice(0, 7);
    return currentM >= ruleStart && selectedDayNum === Math.min(r.day_of_month, daysInMonth);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Calendar Grid Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Kalender Keuangan & Pengingat</h2>
            <p className="card-subtitle">
              Titik hijau/merah/ungu = transaksi, kuning = pengingat, lingkaran = otomatisasi
            </p>
          </div>

          <div className="period-nav-group">
            <button
              onClick={() => shiftCalendarMonthBy(-1)}
              className="nav-arrow-btn"
              aria-label="Bulan Sebelumnya"
            >
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontWeight: 650, fontSize: '14px', minWidth: '130px', textAlign: 'center' }}>
              {MONTH_NAMES_FULL[m - 1]} {y}
            </span>
            <button
              onClick={() => shiftCalendarMonthBy(1)}
              className="nav-arrow-btn"
              aria-label="Bulan Berikutnya"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid-2">
          {/* Kalender Grid */}
          <div>
            <div className="cal-grid">
              {dayHeaders.map((dh) => (
                <div key={dh} className="cal-header-day">
                  {dh}
                </div>
              ))}

              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateKey = `${calendarMonth}-${padZero(dayNum)}`;
                const isSelected = selectedCalendarDate === dateKey;
                const isToday = today === dateKey;

                const dayTxList = transactions.filter((t) => t.date === dateKey);
                const hasIn = dayTxList.some((t) => t.type === 'in');
                const hasOut = dayTxList.some((t) => t.type === 'out');
                const hasSv = dayTxList.some((t) => t.type === 'sv');
                const hasRem = reminders.some((r) => r.date === dateKey && !r.is_done);
                const hasRecurring = recurringRules.some(
                  (r) =>
                    r.is_active &&
                    calendarMonth >= r.start_month &&
                    dayNum === Math.min(r.day_of_month, daysInMonth)
                );

                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedCalendarDate(dateKey)}
                    className={`cal-day-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                  >
                    <span>{dayNum}</span>
                    <div className="cal-dots">
                      {hasIn && <span className="cal-dot" style={{ background: 'var(--income)' }} />}
                      {hasOut && <span className="cal-dot" style={{ background: 'var(--expense)' }} />}
                      {hasSv && <span className="cal-dot" style={{ background: 'var(--savings)' }} />}
                      {hasRem && <span className="cal-dot" style={{ background: 'var(--warning)' }} />}
                      {hasRecurring && (
                        <span
                          className="cal-dot"
                          style={{
                            border: '1.5px solid var(--brand)',
                            background: 'transparent',
                          }}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Agenda Tanggal Terpilih */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--line-border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--line-subtle)',
                paddingBottom: '10px',
              }}
            >
              <div>
                <b style={{ fontSize: '15px', color: 'var(--text-main)' }}>
                  {formatDisplayDate(selectedCalendarDate)}
                </b>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => onOpenReminderModal(selectedCalendarDate)}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '5px 10px' }}
                >
                  <Bell size={13} />
                  <span>Pengingat</span>
                </button>
                <button
                  onClick={() => onOpenTransactionModal(selectedCalendarDate)}
                  className="btn"
                  style={{ fontSize: '12px', padding: '5px 10px' }}
                >
                  <Plus size={13} />
                  <span>Transaksi</span>
                </button>
              </div>
            </div>

            {dayReminders.length === 0 && dayTx.length === 0 && dayPlanned.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-dim)', fontSize: '13.5px' }}>
                Tidak ada agenda atau transaksi di tanggal ini.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {dayReminders.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--line-border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        onClick={() => toggleReminder(r.id)}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          border: '1px solid var(--warning)',
                          background: r.is_done ? 'var(--warning)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#000',
                        }}
                      >
                        {r.is_done && <Check size={14} />}
                      </button>
                      <div style={{ textDecoration: r.is_done ? 'line-through' : 'none', opacity: r.is_done ? 0.6 : 1 }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 600 }}>⏰ {r.title}</div>
                        {r.note && <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{r.note}</div>}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteReminder(r.id)}
                      className="tx-action-btn"
                      aria-label="Hapus Pengingat"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                {dayTx.map((t) => {
                  const meta = TYPE_META[t.type];
                  return (
                    <div
                      key={t.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--line-subtle)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{t.goal}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                          {meta.label} {t.note ? `· ${t.note}` : ''}
                        </div>
                      </div>
                      <div style={{ color: meta.color, fontWeight: 650, fontFamily: 'JetBrains Mono', fontSize: '14px' }}>
                        {meta.prefix}
                        {formatRupiah(Number(t.amount))}
                      </div>
                    </div>
                  );
                })}

                {dayPlanned.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: 'rgba(59, 130, 246, 0.08)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px dashed rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#93c5fd' }}>
                        🔁 {r.goal} (Terjadwal)
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                        Otomatisasi bulanan tiap tgl {r.day_of_month}
                      </div>
                    </div>
                    <div style={{ color: 'var(--brand)', fontWeight: 650, fontFamily: 'JetBrains Mono', fontSize: '14px' }}>
                      {formatRupiah(Number(r.amount))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Otomatisasi Bulanan (Recurring Rules) Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Otomatisasi Transaksi Rutin</h2>
            <p className="card-subtitle">
              Pemasukan (mis. gaji) atau pengeluaran rutin dicatat otomatis tiap bulan
            </p>
          </div>
          <button onClick={onOpenRecurringModal} className="btn btn-secondary" style={{ fontSize: '12.5px', padding: '6px 12px' }}>
            <Repeat size={14} />
            <span>+ Aturan Rutin</span>
          </button>
        </div>

        {recurringRules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-dim)', fontSize: '13.5px' }}>
            Belum ada aturan transaksi rutin. Buat otomatisasi untuk gaji bulanan, tagihan wifi, atau tabungan rutin.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recurringRules.map((rule) => {
              const meta = TYPE_META[rule.type];
              return (
                <div
                  key={rule.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--line-border)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 650, color: 'var(--text-main)', fontSize: '14.5px' }}>
                        {rule.goal}
                      </span>
                      <span
                        className="tx-badge"
                        style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                      Tiap tanggal {rule.day_of_month} · Mulai {rule.start_month}
                      {rule.note ? ` · ${rule.note}` : ''}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ color: meta.color, fontWeight: 700, fontFamily: 'JetBrains Mono', fontSize: '15px' }}>
                      {meta.prefix}
                      {formatRupiah(Number(rule.amount))}
                    </div>
                    <button
                      onClick={() => deleteRecurringRule(rule.id)}
                      className="tx-action-btn"
                      aria-label="Hapus Aturan"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
