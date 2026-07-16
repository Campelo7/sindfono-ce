import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/register-form";
import { safeNextPath } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Cadastro — Portal Sindfono CE" };

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default async function RegisterPage({ searchParams }: Props) {
  const sp = await searchParams;
  const nextPath = safeNextPath(sp.next);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <RegisterForm nextPath={nextPath} />
    </div>
  );
}
