"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { signUp } from "@/actions/auth";

export const RegisterForm = ({ nextPath = "/portal" }: { nextPath?: string }) => {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<{ error?: string; success?: string }>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState({});
    startTransition(async () => {
      const fd = new FormData(e.currentTarget);
      if (fd.get("password") !== fd.get("confirm_password")) {
        setState({ error: "As senhas não conferem." });
        return;
      }
      const result = await signUp(fd);
      setState(result);
    });
  };

  const loginHref = `/auth/login?next=${encodeURIComponent(nextPath)}`;

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <span className="logo-frame mx-auto mb-4 block" style={{ width: 72, height: 72 }}>
          <Image src="/logo.png" alt="Sindfono CE" width={68} height={68} className="logo-img" />
        </span>
        <h1 className="text-2xl font-extrabold text-[#0f1f5c]">Criar conta</h1>
        <p className="text-gray-500 mt-1">
          {nextPath.startsWith("/sindicalizar")
            ? "Primeiro passo para iniciar sua sindicalização"
            : "Para acompanhar sua sindicalização"}
        </p>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-200">
        {state.error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}
        {state.success && (
          <div className="mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            {state.success}
            {nextPath.startsWith("/sindicalizar") && (
              <p className="mt-2">
                Depois de confirmar o e-mail,{" "}
                <Link href={loginHref} className="font-semibold underline">
                  faça login
                </Link>{" "}
                para continuar a sindicalização.
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="redirectTo" value={nextPath} />
          {[
            { name: "email", type: "email", label: "E-mail", placeholder: "seu@email.com" },
            { name: "password", type: "password", label: "Senha", placeholder: "Mínimo 8 caracteres" },
            { name: "confirm_password", type: "password", label: "Confirmar senha", placeholder: "Repita a senha" },
          ].map(({ name, type, label, placeholder }) => (
            <div key={name}>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</label>
              <input
                name={name}
                type={type}
                required
                minLength={name === "password" ? 8 : undefined}
                placeholder={placeholder}
                className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center rounded-full bg-orange-500 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-60"
          >
            {pending ? "Criando conta…" : "Criar conta"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Já tem conta?{" "}
          <Link href={loginHref} className="font-semibold text-[#0f1f5c] hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
};
