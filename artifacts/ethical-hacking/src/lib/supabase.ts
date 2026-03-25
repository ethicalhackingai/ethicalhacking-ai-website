import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AiTool = {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  long_description?: string | null;
  website_url: string;
  category: string;
  pricing_model: "Free" | "Freemium" | "Paid" | "Enterprise";
  price_range?: string | null;
  rating?: number | null;
  features?: string[] | null;
  logo_url?: string | null;
  is_featured: boolean;
  is_new: boolean;
  date_added?: string;
  created_at?: string;
  updated_at?: string;
};

export type ToolCategory = {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  display_order?: number;
};
