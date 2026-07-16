import type { Metadata } from "next";
import { AdminLoginForm } from "@/features/auth/admin-login-form";

export const metadata: Metadata = { title: "Admin — Sindfono CE" };

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function AdminLoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1f5c] px-4">
      <AdminLoginForm error={sp.error} />
    </div>
  );
}
