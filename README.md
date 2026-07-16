# Sindfono CE — Site de Sindicalização

Site profissional para o Sindicato dos Fonoaudiólogos do Estado do Ceará.

## Stack

- Next.js 15 (App Router)
- TypeScript + Tailwind CSS
- Supabase (Auth, PostgreSQL, Storage)
- Zod + React Hook Form
- Vitest

## Setup local

```bash
cp .env.local.example .env.local
# Preencha as variáveis Supabase e NEXT_PUBLIC_SITE_URL

npm install
npm run dev
```

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção
- `npm run start` — servidor de produção
- `npm run test` — testes unitários

## Rotas

- `/` — Página inicial institucional
- `/diretoria` — Diretoria do sindicato
- `/eventos` — Eventos e comunicados públicos
- `/auth/register`, `/auth/login` — Cadastro e login do usuário
- `/sindicalizar` — Fluxo de sindicalização em etapas (exige conta)
- `/portal` — Portal do sindicalizado (documentos, notificações, pagamento)
- `/admin` — Área administrativa (revisão + pagamentos)

## Deploy (checklist)

1. Rodar migrations `001`–`010` no Supabase (`supabase/migrations/`)
2. Criar bucket `membership-documents` (migration `003_storage.sql`)
3. Configurar variáveis de ambiente (ver `.env.local.example`)
4. Definir `NEXT_PUBLIC_SITE_URL` com o domínio de produção
5. Adicionar URL de callback em Supabase Auth: `https://seu-dominio/auth/callback`
6. Inserir ao menos um admin em `admin_users`
7. `npm run build` deve passar sem erros

## Cores

- Azul institucional: `#1e40af`, `#0f2057`
- Laranja (CTAs): `#f97316`
