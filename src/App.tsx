import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PeriodNavigator } from './components/PeriodNavigator';
import { SummaryCards } from './components/SummaryCards';
import { DescriptiveResume } from './components/DescriptiveResume';
import { BarChart } from './components/BarChart';
import { PieChart } from './components/PieChart';
import { BalanceOverview } from './components/BalanceOverview';
import { BudgetTracker } from './components/BudgetTracker';
import { TransactionList } from './components/TransactionList';
import { SavingsView } from './components/SavingsView';
import { CalendarView } from './components/CalendarView';
import { FinancialHealthView } from './components/FinancialHealthView';
import { TransactionModal } from './components/Modals/TransactionModal';
import { BudgetModal } from './components/Modals/BudgetModal';
import { ReminderModal } from './components/Modals/ReminderModal';
import { RecurringModal } from './components/Modals/RecurringModal';
import { AuthModal } from './components/Modals/AuthModal';
import { Toast } from './components/Toast';
import { useFinance } from './context/FinanceContext';
import { Transaction } from './types';

export const App: React.FC = () => {
  const { activePage } = useFinance();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [defaultTxDate, setDefaultTxDate] = useState<string | undefined>(undefined);

  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [defaultReminderDate, setDefaultReminderDate] = useState<string | undefined>(undefined);
  const [recurringModalOpen, setRecurringModalOpen] = useState(false);

  const handleOpenAddTx = (date?: string) => {
    setEditingTx(null);
    setDefaultTxDate(date);
    setTxModalOpen(true);
  };

  const handleOpenEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setTxModalOpen(true);
  };

  const handleOpenAddReminder = (date?: string) => {
    setDefaultReminderDate(date);
    setReminderModalOpen(true);
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <main className="main-content">
        <Header
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenTransactionModal={() => handleOpenAddTx()}
          onOpenBudgetModal={() => setBudgetModalOpen(true)}
        />

        {/* Page Routing */}
        {activePage === 'all' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <BalanceOverview />
            <SummaryCards />
            <DescriptiveResume />
            <div className="grid-2">
              <BarChart />
              <PieChart />
            </div>
            <BudgetTracker onOpenBudgetModal={() => setBudgetModalOpen(true)} />
            <TransactionList onEditTransaction={handleOpenEditTx} />
          </div>
        )}

        {(activePage === 'day' || activePage === 'month' || activePage === 'year') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <PeriodNavigator />
            <SummaryCards />
            <DescriptiveResume />
            <div className="grid-2">
              <BarChart />
              <PieChart />
            </div>
            <BudgetTracker onOpenBudgetModal={() => setBudgetModalOpen(true)} />
            <TransactionList onEditTransaction={handleOpenEditTx} />
          </div>
        )}

        {activePage === 'sv' && <SavingsView />}

        {activePage === 'cal' && (
          <CalendarView
            onOpenReminderModal={handleOpenAddReminder}
            onOpenTransactionModal={handleOpenAddTx}
            onOpenRecurringModal={() => setRecurringModalOpen(true)}
          />
        )}

        {activePage === 'sum' && <FinancialHealthView />}
      </main>

      {/* Modals & Overlays */}
      <TransactionModal
        isOpen={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        editingTransaction={editingTx}
        defaultDate={defaultTxDate}
      />

      <BudgetModal
        isOpen={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
      />

      <ReminderModal
        isOpen={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        defaultDate={defaultReminderDate}
      />

      <RecurringModal
        isOpen={recurringModalOpen}
        onClose={() => setRecurringModalOpen(false)}
      />

      <AuthModal />
      <Toast />
    </div>
  );
};
