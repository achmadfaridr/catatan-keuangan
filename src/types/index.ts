import { Database, TransactionType } from './database';

export type { TransactionType } from './database';

export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type NewTransaction = Database['public']['Tables']['transactions']['Insert'];

export type Budget = Database['public']['Tables']['budgets']['Row'];
export type NewBudget = Database['public']['Tables']['budgets']['Insert'];

export type Reminder = Database['public']['Tables']['reminders']['Row'];
export type NewReminder = Database['public']['Tables']['reminders']['Insert'];

export type RecurringRule = Database['public']['Tables']['recurring_rules']['Row'];
export type NewRecurringRule = Database['public']['Tables']['recurring_rules']['Insert'];

export type PageId = 'all' | 'day' | 'month' | 'year' | 'sv' | 'cal' | 'sum';
export type PeriodMode = 'day' | 'month' | 'year' | 'all';
export type FilterType = 'all' | TransactionType;

export interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface BarChartPoint {
  label: string;
  income: number;
  expense: number;
  savings: number;
}

export interface BudgetStatusRow {
  name: string;
  spent: number;
  limit: number;
  carryOver: number;
  status: 'ok' | 'warn' | 'over';
}

export interface HealthAssessment {
  score: number;
  statusLabel: string;
  statusColor: string;
  verdict: string;
  needsWantsRate: number;
  savingsRate: number;
  emergencyMonths: number;
  deficitMonths: number;
  unallocatedRate: number;
  recommendations: string[];
  proposedBudget: {
    total: number;
    categories: Record<string, number>;
  };
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'ok' | 'warn' | 'over' | 'info';
}
