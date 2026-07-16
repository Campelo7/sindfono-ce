import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SindicalizarStepper } from "@/features/sindicalizar/sindicalizar-stepper";

export const metadata: Metadata = {
  title: "Sindicalizar-se — Sindfono CE",
  description: "Processo completo de sindicalização ao Sindicato dos Fonoaudiólogos do Estado do Ceará.",
};

export default async function SindicalizarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect("/auth/login?next=/sindicalizar");

  return (
    <div className="min-h-screen bg-gray-50 px-4 pb-12 pt-28 sm:px-6">
      <SindicalizarStepper userEmail={user.email} />
    </div>
  );
}
