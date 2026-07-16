"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "@/actions/auth";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

const resolveInitialMessage = (error?: string, confirmed?: boolean) => {
  if (confirmed) {
    return {
      success:
        "E-mail confirmado com sucesso! Faça login com sua senha para continuar.",
    };
  }

  if (error === "auth_error" || error === "confirm_failed") {
    return {
      success:
        "Se você acabou de confirmar o e-mail, faça login abaixo com a senha que criou.",
    };
  }

  return error ? { error } : {};
};

export const LoginForm = ({
  error,
  confirmed,
  nextPath = "/portal",
}: {
  error?: string;
  confirmed?: boolean;
  nextPath?: string;
}) => {
  const [pending, startTransition] = useTransition();
  const [showPass, setShowPass] = useState(false);
  const initial = resolveInitialMessage(error, confirmed);
  const [success, setSuccess] = useState(initial.success ?? "");
  const [err, setErr] = useState(initial.error ?? "");

  const registerHref = `/auth/register?next=${encodeURIComponent(nextPath)}`;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr("");
    setSuccess("");
    startTransition(async () => {
      const fd = new FormData(e.currentTarget);
      const result = await signIn(fd);
      if (result?.error) setErr(result.error);
    });
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <span className="logo-frame mx-auto mb-4 block" style={{ width: 72, height: 72 }}>
          <Image src="/logo.png" alt="Sindfono CE" width={68} height={68} className="logo-img" />
        </span>
        <h1 className="text-2xl font-extrabold text-[#0f1f5c]">Entrar no Portal</h1>
        <p className="text-gray-500 mt-1">
          {nextPath.startsWith("/sindicalizar")
            ? "Entre para continuar sua sindicalização"
            : "Acompanhe sua sindicalização"}
        </p>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-200">
        {success && (
          <div className="mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}
        {err && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="hidden" name="redirectTo" value={nextPath} />
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">E-mail</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Senha</label>
            <div className="relative">
              <input
                name="password"
                type={showPass ? "text" : "password"}
                required
                autoComplete="current-password"
                className="h-11 w-full rounded-lg border border-gray-300 px-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0f1f5c] py-3 text-sm font-bold text-white transition hover:bg-blue-900 disabled:opacity-60"
          >
            {pending ? "Entrando…" : <><ArrowRight size={16} /> Entrar</>}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Ainda não tem conta?{" "}
          <Link href={registerHref} className="font-semibold text-orange-500 hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
};
