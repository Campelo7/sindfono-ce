"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/safe-redirect";

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirectTo") as string | null;
  const next = safeNextPath(redirectTo);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const callbackUrl = `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`;

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: callbackUrl },
    });

    if (error) return { error: error.message };
    return { success: "Verifique seu e-mail para confirmar o cadastro." };
  } catch {
    return {
      error:
        "Não foi possível conectar ao servidor de autenticação. Reinicie o site com npm run dev e tente novamente.",
    };
  }
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirectTo") as string | null;

  const safeRedirect = safeNextPath(redirectTo);

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        return {
          error:
            "Confirme seu e-mail antes de entrar. Verifique a caixa de entrada (e spam).",
        };
      }
      return { error: "E-mail ou senha incorretos." };
    }
  } catch {
    return {
      error:
        "Não foi possível conectar ao servidor de autenticação. Reinicie o site com npm run dev e tente novamente.",
    };
  }

  redirect(safeRedirect);
}

export async function adminSignIn(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "E-mail ou senha incorretos." };

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", data.user.id)
    .eq("is_active", true)
    .single();

  if (!adminUser) {
    await supabase.auth.signOut();
    return { error: "Acesso não autorizado." };
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function getSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
