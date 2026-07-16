import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/login-form";
import { safeNextPath } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Entrar — Portal Sindfono CE" };

interface Props {
  searchParams: Promise<{ error?: string; next?: string; confirmed?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const nextPath = safeNextPath(sp.next);
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <LoginForm
        error={sp.error}
        confirmed={sp.confirmed === "1"}
        nextPath={nextPath}
      />
    </div>
  );
}
