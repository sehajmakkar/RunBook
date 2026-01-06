// Re-export Supabase clients
// Use the appropriate client based on your context:
//
// Client Components:
//   import { createClient } from "@/lib/supabase/client"
//
// Server Components / Route Handlers:
//   import { createClient, getUser, getSession } from "@/lib/supabase/server"
//
// Middleware:
//   import { createClient } from "@/lib/supabase/middleware"

export { createClient as createBrowserClient } from "./client";
export { createClient as createServerClient, getUser, getSession } from "./server";

