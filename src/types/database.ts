export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TransactionType = 'in' | 'out' | 'sv';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: TransactionType;
          date: string;
          amount: number;
          goal: string;
          note: string | null;
          recurring_rule_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: TransactionType;
          date: string;
          amount: number;
          goal: string;
          note?: string | null;
          recurring_rule_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: TransactionType;
          date?: string;
          amount?: number;
          goal?: string;
          note?: string | null;
          recurring_rule_id?: string | null;
          updated_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          total_limit: number;
          threshold_percent: number;
          carry_over_surplus: boolean;
          category_limits: Record<string, number>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_limit?: number;
          threshold_percent?: number;
          carry_over_surplus?: boolean;
          category_limits?: Record<string, number>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_limit?: number;
          threshold_percent?: number;
          carry_over_surplus?: boolean;
          category_limits?: Record<string, number>;
          updated_at?: string;
        };
      };
      reminders: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          date: string;
          note: string | null;
          is_done: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          date: string;
          note?: string | null;
          is_done?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          date?: string;
          note?: string | null;
          is_done?: boolean;
          updated_at?: string;
        };
      };
      recurring_rules: {
        Row: {
          id: string;
          user_id: string;
          type: TransactionType;
          amount: number;
          goal: string;
          note: string | null;
          day_of_month: number;
          start_month: string;
          last_processed_month: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: TransactionType;
          amount: number;
          goal: string;
          note?: string | null;
          day_of_month: number;
          start_month: string;
          last_processed_month?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: TransactionType;
          amount?: number;
          goal?: string;
          note?: string | null;
          day_of_month?: number;
          start_month?: string;
          last_processed_month?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
    };
  };
}
