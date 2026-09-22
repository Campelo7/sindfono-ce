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


## Objetivo

Organizar o processo de sindicalização em uma aplicação web, reunindo o envio de informações e documentos, a revisão administrativa e o acompanhamento pelo associado.

## Funcionalidades

* Cadastro e autenticação de usuários.
* Solicitação de sindicalização em etapas.
* Envio de documentos.
* Revisão de solicitações pela administração.
* Confirmação administrativa de pagamentos.
* Portal do associado.
* Publicação de eventos.

## Organização do código

* `src/app`: páginas e rotas.
* `src/components`: componentes reutilizáveis.
* `src/features`: interfaces organizadas por funcionalidade.
* `src/actions`: operações executadas no servidor.
* `src/validations`: esquemas de validação.
* `src/lib`: utilitários e integração com Supabase.
* `supabase/migrations`: alterações na estrutura e nas políticas do banco.

## Testes

O projeto inclui testes com Vitest para validações e regras de negócio. Entre os cenários estão a rejeição de confirmação duplicada de pagamento e a restrição de operações administrativas.

Para executar os testes, utilize `npm run test`.

## Melhorias planejadas

* Adicionar imagens dos principais fluxos.
* Revisar as instruções de configuração local.
* Automatizar a execução de testes e build.
* Documentar as decisões técnicas e limitações conhecidas.
