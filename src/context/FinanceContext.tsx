import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  Transaction,
  NewTransaction,
  Budget,
  Reminder,
  NewReminder,
  RecurringRule,
  NewRecurringRule,
  PageId,
  PeriodMode,
  FilterType,
  ToastMessage,
  TransactionType,
} from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { getTodayDate, shiftPeriod, formatRupiah } from '../utils/formatters';
import { executeRecurringRules, getBudgetStatusRows } from '../utils/calculations';

interface FinanceContextType {
  transactions: Transaction[];
  budget: Budget;
  reminders: Reminder[];
  recurringRules: RecurringRule[];
  activePage: PageId;
  period: string;
  periodMode: PeriodMode;
  transactionFilter: FilterType;
  pieType: TransactionType;
  selectedCalendarDate: string;
  calendarMonth: string;
  toast: ToastMessage | null;
  loading: boolean;
  isSyncing: boolean;

  setActivePage: (p: PageId) => void;
  setPeriod: (p: string) => void;
  setPeriodMode: (m: PeriodMode) => void;
  setTransactionFilter: (f: FilterType) => void;
  setPieType: (t: TransactionType) => void;
  setSelectedCalendarDate: (d: string) => void;
  setCalendarMonth: (m: string) => void;
  shiftPeriodBy: (delta: number) => void;
  shiftCalendarMonthBy: (delta: number) => void;

  addTransaction: (data: Omit<NewTransaction, 'user_id'>) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Omit<NewTransaction, 'user_id'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  updateBudget: (data: Partial<Budget>) => Promise<void>;

  addReminder: (data: Omit<NewReminder, 'user_id'>) => Promise<void>;
  toggleReminder: (id: string) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;

  addRecurringRule: (data: Omit<NewRecurringRule, 'user_id'>) => Promise<void>;
  deleteRecurringRule: (id: string) => Promise<void>;

  showToast: (message: string, type?: ToastMessage['type']) => void;
  migrateLocalToCloud: () => Promise<number>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const DEFAULT_BUDGET: Budget = {
  id: 'default-budget',
  user_id: 'guest',
  total_limit: 0,
  threshold_percent: 80,
  carry_over_surplus: true,
  category_limits: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isConfigured } = useAuth();
  const today = getTodayDate();

  const [activePage, setActivePage] = useState<PageId>('all');
  const [periodMode, setPeriodMode] = useState<PeriodMode>('month');
  const [period, setPeriod] = useState<string>(today.slice(0, 7));
  const [transactionFilter, setTransactionFilter] = useState<FilterType>('all');
  const [pieType, setPieType] = useState<TransactionType>('out');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(today);
  const [calendarMonth, setCalendarMonth] = useState<string>(today.slice(0, 7));

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<Budget>(DEFAULT_BUDGET);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'ok') => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((cur) => (cur?.id === id ? null : cur));
    }, 4500);
  }, []);

  // 1. Inisialisasi Data (Supabase atau LocalStorage)
  const loadData = useCallback(async () => {
    setLoading(true);
    if (user && supabase && isConfigured) {
      try {
        setIsSyncing(true);
        // Load Transactions
        const { data: txData } = await (supabase.from('transactions') as any)
          .select('*')
          .order('date', { ascending: false });

        // Load Budget
        const { data: bgData } = await (supabase.from('budgets') as any)
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        // Load Reminders
        const { data: rmData } = await (supabase.from('reminders') as any)
          .select('*')
          .order('date', { ascending: true });

        // Load Recurring Rules
        const { data: rcData } = await (supabase.from('recurring_rules') as any)
          .select('*')
          .order('created_at', { ascending: false });

        if (txData) setTransactions(txData as Transaction[]);
        if (bgData) setBudget(bgData as Budget);
        if (rmData) setReminders(rmData as Reminder[]);
        if (rcData) setRecurringRules(rcData as RecurringRule[]);
      } catch (err) {
        console.error('Error fetching Supabase data:', err);
        showToast('Gagal menyinkronkan data dengan Supabase', 'over');
      } finally {
        setIsSyncing(false);
      }
    } else {
      // Offline Local Storage Fallback
      try {
        const localTx = localStorage.getItem('keuangan');
        const localBg = localStorage.getItem('keuangan_budget');
        const localRm = localStorage.getItem('keuangan_rem');
        const localRc = localStorage.getItem('keuangan_rec');

        if (localTx) {
          const parsed = JSON.parse(localTx);
          setTransactions(
            parsed.map((item: any) => ({
              id: item.id || crypto.randomUUID(),
              user_id: 'guest',
              type: item.type,
              date: item.date,
              amount: item.amt !== undefined ? item.amt : item.amount,
              goal: item.goal,
              note: item.note || '',
              recurring_rule_id: item.rid || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }))
          );
        }

        if (localBg) {
          const parsedBg = JSON.parse(localBg);
          setBudget({
            id: 'local-budget',
            user_id: 'guest',
            total_limit: parsedBg.total || 0,
            threshold_percent: parsedBg.th || 80,
            carry_over_surplus: parsedBg.carry !== undefined ? parsedBg.carry : true,
            category_limits: parsedBg.cats || {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        if (localRm) {
          const parsedRm = JSON.parse(localRm);
          setReminders(
            parsedRm.map((r: any) => ({
              id: r.id || crypto.randomUUID(),
              user_id: 'guest',
              title: r.title,
              date: r.date,
              note: r.note || '',
              is_done: Boolean(r.done),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }))
          );
        }

        if (localRc) {
          const parsedRc = JSON.parse(localRc);
          setRecurringRules(
            parsedRc.map((r: any) => ({
              id: r.id || crypto.randomUUID(),
              user_id: 'guest',
              type: r.type,
              amount: r.amt || r.amount,
              goal: r.goal,
              note: r.note || '',
              day_of_month: r.day || 1,
              start_month: r.start || today.slice(0, 7),
              last_processed_month: r.last || '',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }))
          );
        }
      } catch (err) {
        console.error('Error loading local storage data:', err);
      }
    }
    setLoading(false);
  }, [user, isConfigured, showToast, today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Persist Local Storage jika dalam Guest Mode
  useEffect(() => {
    if (!user || !supabase) {
      localStorage.setItem('keuangan', JSON.stringify(transactions));
      localStorage.setItem(
        'keuangan_budget',
        JSON.stringify({
          total: budget.total_limit,
          th: budget.threshold_percent,
          carry: budget.carry_over_surplus,
          cats: budget.category_limits,
        })
      );
      localStorage.setItem('keuangan_rem', JSON.stringify(reminders));
      localStorage.setItem('keuangan_rec', JSON.stringify(recurringRules));
    }
  }, [transactions, budget, reminders, recurringRules, user]);

  // Otomatisasi Recurring Rules Checker
  useEffect(() => {
    if (loading || recurringRules.length === 0) return;

    const count = executeRecurringRules(
      recurringRules,
      async (newTxData, ruleId, processedMonth) => {
        const newTx: Transaction = {
          ...newTxData,
          note: newTxData.note || '',
          recurring_rule_id: newTxData.recurring_rule_id || null,
          id: crypto.randomUUID(),
          user_id: user?.id || 'guest',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (user && supabase) {
          await (supabase.from('transactions') as any).insert(newTx);
          await (supabase.from('recurring_rules') as any)
            .update({ last_processed_month: processedMonth })
            .eq('id', ruleId);
        }

        setTransactions((prev) => [newTx, ...prev]);
        setRecurringRules((prev) =>
          prev.map((r) => (r.id === ruleId ? { ...r, last_processed_month: processedMonth } : r))
        );
      }
    );

    if (count > 0) {
      showToast(`${count} transaksi otomatis bulanan dicatat 🔁`, 'ok');
    }
  }, [recurringRules, user, loading, showToast]);

  // Evaluasi Anggaran setelah tambah transaksi
  const checkBudgetAlert = useCallback(
    (txList: Transaction[], bgt: Budget, dateStr: string, goal: string) => {
      const monthStr = dateStr.slice(0, 7);
      const rows = getBudgetStatusRows(txList, bgt, monthStr, 1);
      const targetRows = rows.filter((r) => r.status !== 'ok' && (r.name === 'Total Pengeluaran' || r.name === goal));

      if (targetRows.length > 0) {
        const worst = targetRows.sort((a, b) => (a.status === 'over' ? 0 : 1) - (b.status === 'over' ? 0 : 1))[0];
        if (worst.status === 'over') {
          showToast(`⚠️ ${worst.name} melebihi anggaran! Terpakai ${formatRupiah(worst.spent)} dari ${formatRupiah(worst.limit)}.`, 'over');
        } else {
          showToast(`🔔 ${worst.name} mendekati batas (${Math.round((worst.spent / worst.limit) * 100)}%). Sisa ${formatRupiah(worst.limit - worst.spent)}.`, 'warn');
        }
      } else {
        showToast('Transaksi berhasil disimpan ✓', 'ok');
      }
    },
    [showToast]
  );

  const shiftPeriodBy = (delta: number) => {
    setPeriod((cur) => shiftPeriod(cur, delta, periodMode));
  };

  const shiftCalendarMonthBy = (delta: number) => {
    setCalendarMonth((cur) => shiftPeriod(cur, delta, 'month'));
  };

  // CRUD TRANSACTIONS
  const addTransaction = async (data: Omit<NewTransaction, 'user_id'>) => {
    const newTx: Transaction = {
      ...data,
      note: data.note || '',
      recurring_rule_id: data.recurring_rule_id || null,
      id: crypto.randomUUID(),
      user_id: user?.id || 'guest',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const nextList = [newTx, ...transactions];
    setTransactions(nextList);

    if (user && supabase) {
      const { error } = await (supabase.from('transactions') as any).insert(newTx);
      if (error) {
        console.error('Supabase insert error:', error);
        showToast('Gagal menyimpan ke server Supabase', 'over');
        return;
      }
    }

    if (data.type === 'out') {
      checkBudgetAlert(nextList, budget, data.date, data.goal);
    } else if (data.type === 'sv') {
      showToast('Setoran tabungan & investasi tersimpan 🐷', 'ok');
    } else {
      showToast('Pemasukan tersimpan ✓', 'ok');
    }
  };

  const updateTransaction = async (id: string, data: Partial<Omit<NewTransaction, 'user_id'>>) => {
    const updatedList = transactions.map((t) =>
      t.id === id ? { ...t, ...data, updated_at: new Date().toISOString() } : t
    );
    setTransactions(updatedList);

    if (user && supabase) {
      await (supabase.from('transactions') as any).update(data).eq('id', id);
    }

    showToast('Transaksi berhasil diperbarui ✓', 'ok');
  };

  const deleteTransaction = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (user && supabase) {
      await (supabase.from('transactions') as any).delete().eq('id', id);
    }
    showToast('Transaksi dihapus', 'info');
  };

  // CRUD BUDGET
  const updateBudget = async (data: Partial<Budget>) => {
    const updatedBudget: Budget = {
      ...budget,
      ...data,
      user_id: user?.id || 'guest',
      updated_at: new Date().toISOString(),
    };
    setBudget(updatedBudget);

    if (user && supabase) {
      await (supabase.from('budgets') as any).upsert(
        {
          ...updatedBudget,
          user_id: user.id,
        },
        { onConflict: 'user_id' }
      );
    }

    showToast('Pengaturan anggaran disimpan 🎯', 'ok');
  };

  // CRUD REMINDERS
  const addReminder = async (data: Omit<NewReminder, 'user_id'>) => {
    const newRem: Reminder = {
      id: crypto.randomUUID(),
      user_id: user?.id || 'guest',
      title: data.title,
      date: data.date,
      note: data.note || '',
      is_done: data.is_done ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setReminders((prev) => [...prev, newRem].sort((a, b) => a.date.localeCompare(b.date)));

    if (user && supabase) {
      await (supabase.from('reminders') as any).insert(newRem);
    }
    showToast('Pengingat ditambahkan ⏰', 'ok');
  };

  const toggleReminder = async (id: string) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, is_done: !r.is_done } : r));
    setReminders(updated);
    const target = updated.find((r) => r.id === id);

    if (user && supabase && target) {
      await (supabase.from('reminders') as any).update({ is_done: target.is_done }).eq('id', id);
    }
  };

  const deleteReminder = async (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    if (user && supabase) {
      await (supabase.from('reminders') as any).delete().eq('id', id);
    }
    showToast('Pengingat dihapus', 'info');
  };

  // CRUD RECURRING RULES
  const addRecurringRule = async (data: Omit<NewRecurringRule, 'user_id'>) => {
    const newRule: RecurringRule = {
      id: crypto.randomUUID(),
      user_id: user?.id || 'guest',
      type: data.type,
      amount: data.amount,
      goal: data.goal,
      note: data.note || '',
      day_of_month: data.day_of_month,
      start_month: data.start_month,
      last_processed_month: data.last_processed_month || '',
      is_active: data.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setRecurringRules((prev) => [newRule, ...prev]);

    if (user && supabase) {
      await (supabase.from('recurring_rules') as any).insert(newRule);
    }
    showToast('Aturan otomatisasi bulanan dibuat 🔁', 'ok');
  };

  const deleteRecurringRule = async (id: string) => {
    setRecurringRules((prev) => prev.filter((r) => r.id !== id));
    if (user && supabase) {
      await (supabase.from('recurring_rules') as any).delete().eq('id', id);
    }
    showToast('Aturan otomatis dihapus', 'info');
  };

  // MIGRASI DATA LOKAL KE SUPABASE
  const migrateLocalToCloud = async (): Promise<number> => {
    if (!user || !supabase) return 0;
    try {
      setIsSyncing(true);
      const localTx = localStorage.getItem('keuangan');
      if (!localTx) return 0;
      const parsed: any[] = JSON.parse(localTx);
      if (!parsed.length) return 0;

      const itemsToInsert = parsed.map((item) => ({
        user_id: user.id,
        type: item.type,
        date: item.date,
        amount: item.amount || item.amt,
        goal: item.goal,
        note: item.note || '',
        recurring_rule_id: null,
      }));

      const { data, error } = await (supabase.from('transactions') as any)
        .insert(itemsToInsert)
        .select();
      if (error) throw error;

      await loadData();
      showToast(`${data?.length || itemsToInsert.length} data lokal berhasil dimigrasikan ke Supabase! ☁️`, 'ok');
      return data?.length || itemsToInsert.length;
    } catch (err) {
      console.error('Migrasi gagal:', err);
      showToast('Gagal memigrasikan data ke Supabase', 'over');
      return 0;
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budget,
        reminders,
        recurringRules,
        activePage,
        period,
        periodMode,
        transactionFilter,
        pieType,
        selectedCalendarDate,
        calendarMonth,
        toast,
        loading,
        isSyncing,
        setActivePage,
        setPeriod,
        setPeriodMode,
        setTransactionFilter,
        setPieType,
        setSelectedCalendarDate,
        setCalendarMonth,
        shiftPeriodBy,
        shiftCalendarMonthBy,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        updateBudget,
        addReminder,
        toggleReminder,
        deleteReminder,
        addRecurringRule,
        deleteRecurringRule,
        showToast,
        migrateLocalToCloud,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};
