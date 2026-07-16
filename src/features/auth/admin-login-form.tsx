"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { adminSignIn } from "@/actions/auth";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

export const AdminLoginForm = ({ error }: { error?: string }) => {
  const [pending, startTransition] = useTransition();
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState(error === "unauthorized" ? "Acesso não autorizado." : "");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr("");
    startTransition(async () => {
      const fd = new FormData(e.currentTarget);
      const result = await adminSignIn(fd);
      if (result?.error) setErr(result.error);
    });
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
          <ShieldCheck size={32} className="text-orange-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Painel Administrativo</h1>
        <p className="text-white/60 mt-1">Sindfono CE — Acesso restrito</p>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-2xl">
        {err && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">E-mail</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="admin@sindfono.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Senha</label>
            <div className="relative">
              <input
                name="password"
                type={showPass ? "text" : "password"}
                required
                className="h-11 w-full rounded-lg border border-gray-300 px-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center rounded-full bg-[#0f1f5c] py-3 text-sm font-bold text-white transition hover:bg-blue-900 disabled:opacity-60"
          >
            {pending ? "Entrando…" : "Acessar painel"}
          </button>
        </form>
      </div>
    </div>
  );
};
