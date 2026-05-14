import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getEnvOrThrow(key: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// Client-side client (anonymous)
export const supabase = createClient(
  getEnvOrThrow("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl),
  getEnvOrThrow("NEXT_PUBLIC_SUPABASE_ANON_KEY", supabaseAnonKey),
  {
    auth: {
      persistSession: false,
    },
  }
);

// Server-side admin client (bypasses RLS)
export function getServiceClient() {
  return createClient(
    getEnvOrThrow("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl),
    getEnvOrThrow("SUPABASE_SERVICE_ROLE_KEY", supabaseServiceKey),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

// Storage bucket name
export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "documents";