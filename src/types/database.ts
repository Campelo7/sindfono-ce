export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type MembershipStatus =
  | "draft"
  | "documents_pending"
  | "under_review"
  | "correction_requested"
  | "approved_for_payment"
  | "payment_pending"
  | "active"
  | "rejected";

export type DocumentType =
  | "rg"
  | "cpf"
  | "crfa"
  | "address_proof"
  | "photo_3x4"
  | "other";

export type DocumentStatus = "pending" | "approved" | "correction_needed" | "rejected";

export type WorkRelation = "CLT" | "PJ" | "LIBERAL" | "CONCURSADO" | "OUTRO";

export type MaritalStatus =
  | "SOLTEIRO"
  | "CASADO"
  | "SEPARADO"
  | "DIVORCIADO"
  | "VIUVO"
  | "UNIAO_ESTAVEL"
  | "OUTRO";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          cpf: string;
          crfa_or_student_info: string;
          birth_date: string;
          email: string;
          phone: string;
          rg: string;
          issuing_agency: string;
          filiacao: string;
          marital_status: MaritalStatus;
          nationality: string;
          birthplace: string;
          residential_street: string;
          residential_number: string;
          residential_complement: string | null;
          residential_neighborhood: string;
          residential_city: string;
          residential_state: string;
          residential_cep: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      membership_requests: {
        Row: {
          id: string;
          user_id: string;
          profile_id: string;
          status: MembershipStatus;
          work_relation: WorkRelation;
          work_details: string;
          commercial_address: string;
          practice_areas: string;
          graduation_institution: string;
          graduation_year: number;
          specialization: string | null;
          masters: string | null;
          doctorate: string | null;
          post_doctorate: string | null;
          lgpd_consent: boolean;
          lgpd_consent_at: string | null;
          admin_notes: string | null;
          submitted_at: string | null;
          reviewed_at: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["membership_requests"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["membership_requests"]["Insert"]>;
      };
      documents: {
        Row: {
          id: string;
          membership_request_id: string;
          user_id: string;
          document_type: DocumentType;
          file_name: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          status: DocumentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["documents"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>;
      };
      document_reviews: {
        Row: {
          id: string;
          document_id: string;
          admin_user_id: string;
          status: DocumentStatus;
          comment: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["document_reviews"]["Row"], "created_at">;
        Update: never;
      };
      status_history: {
        Row: {
          id: string;
          membership_request_id: string;
          previous_status: MembershipStatus | null;
          new_status: MembershipStatus;
          changed_by: string;
          changed_by_name: string;
          comment: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["status_history"]["Row"], "created_at">;
        Update: never;
      };
      payments: {
        Row: {
          id: string;
          membership_request_id: string;
          user_id: string;
          amount: number;
          description: string;
          status: "pending" | "paid" | "cancelled";
          payment_method: string | null;
          paid_at: string | null;
          receipt_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["payments"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
      };
      admin_users: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string;
          role: "admin" | "super_admin";
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["admin_users"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["admin_users"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          membership_request_id: string | null;
          title: string;
          message: string;
          type: "info" | "warning" | "success" | "error";
          read: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notifications"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
    };
    Views: {};
    Functions: {
      is_admin: {
        Args: { user_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      membership_status: MembershipStatus;
      document_type: DocumentType;
      document_status: DocumentStatus;
    };
  };
}

// ── Convenience row types ────────────────────────────────────────────────────
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type MembershipRequest = Database["public"]["Tables"]["membership_requests"]["Row"];
export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type DocumentReview = Database["public"]["Tables"]["document_reviews"]["Row"];
export type StatusHistory = Database["public"]["Tables"]["status_history"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type AdminUser = Database["public"]["Tables"]["admin_users"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
