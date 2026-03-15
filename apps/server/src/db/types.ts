// Database types matching schema.sql
// Regenerate with: npx supabase gen types typescript --project-id <ref>

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          phone: string;
          name: string;
          email: string | null;
          monthly_income: number;
          occupation: string | null;
          city: string | null;
          avatar_url: string | null;
          onboarding_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          phone: string;
          name?: string;
          email?: string | null;
          monthly_income?: number;
          occupation?: string | null;
          city?: string | null;
          avatar_url?: string | null;
          onboarding_complete?: boolean;
        };
        Update: {
          phone?: string;
          name?: string;
          email?: string | null;
          monthly_income?: number;
          occupation?: string | null;
          city?: string | null;
          avatar_url?: string | null;
          onboarding_complete?: boolean;
        };
        Relationships: [];
      };
      accounts: {
        Row: {
          id: string;
          user_id: string;
          account_name: string | null;
          bank_name: string;
          account_number: string;
          ifsc: string | null;
          account_type: "savings" | "current" | "credit_card";
          balance: number;
          last_synced: string | null;
          finvu_consent_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_name?: string | null;
          bank_name: string;
          account_number: string;
          ifsc?: string | null;
          account_type: "savings" | "current" | "credit_card";
          balance?: number;
          last_synced?: string | null;
          finvu_consent_id?: string | null;
        };
        Update: {
          account_name?: string | null;
          bank_name?: string;
          account_number?: string;
          ifsc?: string | null;
          account_type?: "savings" | "current" | "credit_card";
          balance?: number;
          last_synced?: string | null;
          finvu_consent_id?: string | null;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          account_id: string | null;
          amount: number;
          currency: string;
          description: string;
          merchant_name: string | null;
          category: string | null;
          subcategory: string | null;
          emoji: string | null;
          transaction_date: string;
          reference_id: string | null;
          mode: "UPI" | "NEFT" | "IMPS" | "CARD" | "CASH" | "OTHER";
          is_recurring: boolean;
          is_income: boolean;
          is_salary: boolean;
          is_emi: boolean;
          enriched: boolean;
          enrichment_source: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id?: string | null;
          amount: number;
          currency?: string;
          description?: string;
          merchant_name?: string | null;
          category?: string | null;
          subcategory?: string | null;
          emoji?: string | null;
          transaction_date: string;
          reference_id?: string | null;
          mode?: "UPI" | "NEFT" | "IMPS" | "CARD" | "CASH" | "OTHER";
          is_recurring?: boolean;
          is_income?: boolean;
          is_salary?: boolean;
          is_emi?: boolean;
          enriched?: boolean;
          enrichment_source?: string;
          notes?: string | null;
        };
        Update: {
          account_id?: string | null;
          amount?: number;
          description?: string;
          merchant_name?: string | null;
          category?: string | null;
          subcategory?: string | null;
          emoji?: string | null;
          transaction_date?: string;
          reference_id?: string | null;
          mode?: "UPI" | "NEFT" | "IMPS" | "CARD" | "CASH" | "OTHER";
          is_recurring?: boolean;
          is_income?: boolean;
          is_salary?: boolean;
          is_emi?: boolean;
          enriched?: boolean;
          enrichment_source?: string;
          notes?: string | null;
        };
        Relationships: [];
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          limit_amount: number;
          spent_amount: number;
          period: "weekly" | "monthly";
          month_year: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          limit_amount: number;
          spent_amount?: number;
          period?: "weekly" | "monthly";
          month_year?: string;
        };
        Update: {
          category?: string;
          limit_amount?: number;
          spent_amount?: number;
          period?: "weekly" | "monthly";
          month_year?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          user_id: string;
          role: "user" | "assistant";
          content: string;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: "user" | "assistant";
          content: string;
          metadata?: Record<string, unknown>;
        };
        Update: {
          role?: "user" | "assistant";
          content?: string;
          metadata?: Record<string, unknown>;
        };
        Relationships: [];
      };
      memories: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          embedding: number[] | null;
          category: "preference" | "fact" | "context" | "financial";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          embedding?: number[] | null;
          category?: "preference" | "fact" | "context" | "financial";
        };
        Update: {
          content?: string;
          embedding?: number[] | null;
          category?: "preference" | "fact" | "context" | "financial";
        };
        Relationships: [];
      };
      insights: {
        Row: {
          id: string;
          user_id: string;
          type: "spending_spike" | "recurring_charge" | "savings_opportunity" | "roast" | "tip" | "deep_dive";
          title: string;
          body: string;
          amount_related: number | null;
          category: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "spending_spike" | "recurring_charge" | "savings_opportunity" | "roast" | "tip" | "deep_dive";
          title: string;
          body: string;
          amount_related?: number | null;
          category?: string | null;
          read?: boolean;
        };
        Update: {
          type?: "spending_spike" | "recurring_charge" | "savings_opportunity" | "roast" | "tip" | "deep_dive";
          title?: string;
          body?: string;
          amount_related?: number | null;
          category?: string | null;
          read?: boolean;
        };
        Relationships: [];
      };
      savings_goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount: number;
          emoji: string;
          deadline: string | null;
          auto_save_amount: number | null;
          auto_save_frequency: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount?: number;
          emoji?: string;
          deadline?: string | null;
          auto_save_amount?: number | null;
          auto_save_frequency?: string | null;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          target_amount?: number;
          current_amount?: number;
          emoji?: string;
          deadline?: string | null;
          auto_save_amount?: number | null;
          auto_save_frequency?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      recurring_charges: {
        Row: {
          id: string;
          user_id: string;
          merchant_name: string;
          amount: number;
          frequency: "weekly" | "monthly" | "quarterly" | "yearly";
          category: string | null;
          last_charged_at: string | null;
          next_expected_at: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          merchant_name: string;
          amount: number;
          frequency: "weekly" | "monthly" | "quarterly" | "yearly";
          category?: string | null;
          last_charged_at?: string | null;
          next_expected_at?: string | null;
          is_active?: boolean;
        };
        Update: {
          merchant_name?: string;
          amount?: number;
          frequency?: "weekly" | "monthly" | "quarterly" | "yearly";
          category?: string | null;
          last_charged_at?: string | null;
          next_expected_at?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      advance_requests: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          status: "pending" | "approved" | "disbursed" | "repaid" | "rejected";
          repay_date: string;
          razorpay_payment_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          status?: "pending" | "approved" | "disbursed" | "repaid" | "rejected";
          repay_date: string;
          razorpay_payment_id?: string | null;
        };
        Update: {
          amount?: number;
          status?: "pending" | "approved" | "disbursed" | "repaid" | "rejected";
          repay_date?: string;
          razorpay_payment_id?: string | null;
        };
        Relationships: [];
      };
      credit_scores: {
        Row: {
          id: string;
          user_id: string;
          score: number;
          provider: string;
          factors: unknown[];
          fetched_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          score: number;
          provider?: string;
          factors?: unknown[];
          fetched_at?: string;
        };
        Update: {
          score?: number;
          provider?: string;
          factors?: unknown[];
          fetched_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      match_memories: {
        Args: {
          query_embedding: number[];
          match_user_id: string;
          match_threshold?: number;
          match_count?: number;
        };
        Returns: {
          id: string;
          user_id: string;
          content: string;
          category: string;
          similarity: number;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
