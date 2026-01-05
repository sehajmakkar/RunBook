import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    try {
      const cookieStore = await cookies();

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            },
          },
        }
      );

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Auth error:", error.message);
        return NextResponse.redirect(`${origin}/login?error=auth_failed`);
      }

      if (data.user) {
        // Check if user exists in our database
        let dbUser = await prisma.user.findUnique({
          where: { supabaseId: data.user.id },
        });

        // If user doesn't exist, create them
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              supabaseId: data.user.id,
              email: data.user.email!,
              name: data.user.user_metadata?.full_name || null,
              avatarUrl: data.user.user_metadata?.avatar_url || null,
              onboardingDone: false,
            },
          });
          console.log("Created new user:", dbUser.id);
        }

        // Redirect based on onboarding status
        const redirectUrl = dbUser.onboardingDone ? next : "/dashboard";
        return NextResponse.redirect(`${origin}${redirectUrl}`);
      }
    } catch (err) {
      console.error("Callback error:", err);
      return NextResponse.redirect(`${origin}/login?error=server_error`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}

