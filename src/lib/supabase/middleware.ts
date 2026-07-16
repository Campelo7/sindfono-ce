import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { safeNextPath } from "@/lib/safe-redirect";

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Sindicalização — requer conta criada e login
  if (pathname.startsWith("/sindicalizar") && !user) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Portal do interessado — requer auth
  if (pathname.startsWith("/portal") && !user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Painel admin — requer auth + role admin
  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/admin-login", request.url));
    }
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!adminUser) {
      return NextResponse.redirect(new URL("/auth/admin-login?error=unauthorized", request.url));
    }
  }

  // Redirecionar usuários logados para fora das páginas de auth
  if (user && (pathname === "/auth/login" || pathname === "/auth/register")) {
    const next = request.nextUrl.searchParams.get("next");
    if (next && safeNextPath(next) === next) {
      return NextResponse.redirect(new URL(next, request.url));
    }
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  return supabaseResponse;
};
