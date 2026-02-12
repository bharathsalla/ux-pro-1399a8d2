export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          comment_text: string
          created_at: string
          feedback_id: string
          id: string
          user_avatar_url: string | null
          user_country: string
          user_id: string
          user_name: string
        }
        Insert: {
          comment_text: string
          created_at?: string
          feedback_id: string
          id?: string
          user_avatar_url?: string | null
          user_country?: string
          user_id: string
          user_name?: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          feedback_id?: string
          id?: string
          user_avatar_url?: string | null
          user_country?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedback_and_testimonials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_and_testimonials: {
        Row: {
          comments_count: number
          created_at: string
          feedback_text: string
          id: string
          is_approved: boolean
          likes_count: number
          profile_link: string
          rating: number
          reactions_breakdown: Json
          user_avatar_url: string | null
          user_country: string
          user_id: string
          user_name: string
        }
        Insert: {
          comments_count?: number
          created_at?: string
          feedback_text: string
          id?: string
          is_approved?: boolean
          likes_count?: number
          profile_link?: string
          rating?: number
          reactions_breakdown?: Json
          user_avatar_url?: string | null
          user_country?: string
          user_id: string
          user_name?: string
        }
        Update: {
          comments_count?: number
          created_at?: string
          feedback_text?: string
          id?: string
          is_approved?: boolean
          likes_count?: number
          profile_link?: string
          rating?: number
          reactions_breakdown?: Json
          user_avatar_url?: string | null
          user_country?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_and_testimonials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_provider: string
          avatar_url: string | null
          country: string
          created_at: string
          email: string
          has_commented: boolean
          has_submitted_feedback: boolean
          id: string
          last_login_at: string | null
          login_count: number
          name: string
          updated_at: string
        }
        Insert: {
          auth_provider?: string
          avatar_url?: string | null
          country?: string
          created_at?: string
          email?: string
          has_commented?: boolean
          has_submitted_feedback?: boolean
          id: string
          last_login_at?: string | null
          login_count?: number
          name?: string
          updated_at?: string
        }
        Update: {
          auth_provider?: string
          avatar_url?: string | null
          country?: string
          created_at?: string
          email?: string
          has_commented?: boolean
          has_submitted_feedback?: boolean
          id?: string
          last_login_at?: string | null
          login_count?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      reactions: {
        Row: {
          created_at: string
          feedback_id: string
          id: string
          reaction_type: Database["public"]["Enums"]["reaction_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_id: string
          id?: string
          reaction_type: Database["public"]["Enums"]["reaction_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_id?: string
          id?: string
          reaction_type?: Database["public"]["Enums"]["reaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedback_and_testimonials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      review_rooms: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          expires_at: string
          expiry_days: number
          id: string
          image_url: string | null
          is_expired: boolean
          is_private: boolean
          passcode: string | null
          preview_url: string | null
          title: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string | null
          expires_at: string
          expiry_days?: number
          id?: string
          image_url?: string | null
          is_expired?: boolean
          is_private?: boolean
          passcode?: string | null
          preview_url?: string | null
          title: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          expires_at?: string
          expiry_days?: number
          id?: string
          image_url?: string | null
          is_expired?: boolean
          is_private?: boolean
          passcode?: string | null
          preview_url?: string | null
          title?: string
        }
        Relationships: []
      }
      room_comments: {
        Row: {
          comment_text: string
          created_at: string
          id: string
          is_resolved: boolean
          parent_id: string | null
          pin_number: number | null
          pin_x: number | null
          pin_y: number | null
          rect_h: number | null
          rect_w: number | null
          reviewer_id: string | null
          reviewer_name: string
          room_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string
          id?: string
          is_resolved?: boolean
          parent_id?: string | null
          pin_number?: number | null
          pin_x?: number | null
          pin_y?: number | null
          rect_h?: number | null
          rect_w?: number | null
          reviewer_id?: string | null
          reviewer_name?: string
          room_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          id?: string
          is_resolved?: boolean
          parent_id?: string | null
          pin_number?: number | null
          pin_x?: number | null
          pin_y?: number | null
          rect_h?: number | null
          rect_w?: number | null
          reviewer_id?: string | null
          reviewer_name?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "room_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_comments_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "review_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      reaction_type: "like" | "clap" | "love"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      reaction_type: ["like", "clap", "love"],
    },
  },
} as const
