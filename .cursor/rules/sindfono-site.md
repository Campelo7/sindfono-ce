---
description: Regras canônicas de arquitetura, segurança e LGPD do site do Sindfono CE. Leitura obrigatória antes de qualquer alteração.
globs: ["**/*"]
alwaysApply: true
---

# Sindfono CE — A Bíblia do Projeto

> Site oficial de sindicalização do **Sindicato dos Fonoaudiólogos do Estado do Ceará — Sindfono CE**.
> Substitui o Google Forms (`https://forms.gle/wZ8uhfRgAR1ccgYQ7`) por uma experiência própria:
> formulário multi-etapa, upload de documentos, persistência em PostgreSQL e instruções de pagamento
> (PIX / transferência / cartão).

Este documento é a **fonte única de verdade**. Se o código divergir destas regras, o código está errado.
Toda contribuição (humana ou de agente) DEVE ler este arquivo do início ao fim antes de codar.

---

## 1. Filosofia do Projeto

1. **Institucional primeiro.** É o site público de um sindicato. Tom sóbrio, confiável, acolhedor.
   Nada de "growth hacks", dark patterns ou linguagem comercial agressiva.
2. **LGPD-first.** Tratamos dados pessoais sensíveis (CPF, RG, documentos, filiação). Privacidade não é
   um recurso opcional, é um requisito de projeto. Quando houver dúvida entre conveniência e privacidade,
   escolha privacidade.
3. **Mobile-first.** A maioria das inscrições virá de celular. Todo layout começa no mobile e cresce.
4. **Acessível (a11y).** Labels em todos os campos, contraste adequado, navegação por teclado, `role`/`aria`
   onde necessário, mensagens de erro associadas aos campos.
5. **Determinístico e testável.** Lógica de negócio em funções puras testáveis. Efeitos colaterais (I/O,
   banco, arquivos, rede) isolados em camadas finas e mockáveis.
6. **Pronto para o próximo dev.** O código deve ser tão explícito que um programador júnior (ou um agente
   Sonnet) consiga executar features sem precisar adivinhar intenções.

---

## 2. Stack Oficial

| Camada            | Tecnologia                                   |
| ----------------- | -------------------------------------------- |
| Framework         | Next.js 15 (App Router)                       |
| Linguagem         | TypeScript **estrito**                        |
| UI                | React 19 + Tailwind CSS 3                     |
| Componentes base  | Shadcn-style (`src/components/ui`)            |
| Validação         | Zod 3                                         |
| ORM               | Prisma 6 + PostgreSQL                         |
| Testes            | Vitest 3 + React Testing Library             |
| Ícones            | lucide-react                                  |

NÃO adicione dependências novas sem necessidade real. Se precisar, justifique no PR.

---

## 3. Identidade Visual

- **Azul institucional** (`sindfono-blue-*`): cor primária, cabeçalhos, blocos de destaque.
- **Branco**: fundo padrão, respiro.
- **Laranja** (`sindfono-orange-*`): EXCLUSIVO para CTAs (botões de ação principal) e destaques pontuais.
- Tipografia: Inter.
- Mobile-first, formulário em etapas com indicador de progresso.

---

## 4. Arquitetura de Pastas

```
SindFono/
├── prisma/
│   └── schema.prisma            # Modelo de dados. Fonte de verdade do banco.
├── src/
│   ├── app/                     # Rotas (App Router). Server Components por padrão.
│   │   ├── api/                 # Route handlers (HTTP). Handlers FINOS.
│   │   ├── sindicalizacao/      # Fluxo de inscrição + confirmação.
│   │   └── admin/               # Área da secretaria (futuro, protegida).
│   ├── components/              # Componentes reutilizáveis de apresentação.
│   │   ├── ui/                  # Primitivos (button, input, card...). Sem regra de negócio.
│   │   └── layout/              # Header, Footer, chrome do site.
│   ├── features/                # Componentes de domínio (ex: formulário de sindicalização).
│   ├── hooks/                   # Hooks React reutilizáveis.
│   ├── lib/                     # Utilitários PUROS, sem I/O (masks, branded-types, lgpd, errors).
│   ├── server/                  # Código que SÓ roda no servidor.
│   │   ├── db.ts                # Singleton do Prisma Client.
│   │   └── services/            # Camada de serviço (regra de negócio + I/O).
│   ├── validations/             # Schemas Zod + tipos inferidos.
│   ├── types/                   # Tipos TypeScript compartilhados.
│   └── tests/                   # Setup de teste.
```

### Responsabilidade de cada camada

- **`app/`** — Roteamento e composição de página. Sem regra de negócio. Route handlers apenas
  orquestram: parse → validação → chamada de serviço → resposta HTTP.
- **`components/ui/`** — Primitivos burros. Recebem props, renderizam. ZERO fetch, ZERO Prisma.
- **`components/` e `features/`** — Apresentação e interação. Podem ter estado local de UI.
- **`hooks/`** — Lógica de UI reutilizável (estado, efeitos). Sem acesso a banco.
- **`lib/`** — Funções PURAS, determinísticas, sem I/O. 100% testáveis sem mocks.
- **`validations/`** — Contratos de entrada (Zod). Única fonte dos tipos do formulário.
- **`server/services/`** — Onde mora a regra de negócio com efeitos colaterais (banco, arquivos, e-mail).
- **`server/db.ts`** — Único lugar que instancia o Prisma Client.

---

## 5. Fluxo de Dados (camadas)

```
UI (components / features)
        │  (envia FormData)
        ▼
Route Handler (app/api/*)         ← FINO: parse + delega
        │
        ▼
Validação (validations/*, Zod + branded types)
        │
        ▼
Service (server/services/*)        ← regra de negócio + transações
        │
        ▼
Prisma (server/db.ts) ─────────────► PostgreSQL
        │
        ▼
Upload / Notification services      ← efeitos colaterais isolados
```

**Regra de ouro:** o fluxo é sempre de cima para baixo. Camadas de baixo NUNCA importam camadas de cima.
`lib/` não importa `server/`. `components/` não importa `prisma`.

---

## 6. Padrões de TypeScript Estrito

1. **Proibido `any`.** Use `unknown` + narrowing, generics ou tipos precisos.
2. **`as` é exceção, não regra.** Só em fronteiras inevitáveis (ex: `FormData` → string), sempre com
   validação logo em seguida. Nunca use `as` para silenciar o compilador.
3. **Branded types** para identificadores e dados sensíveis: `Cpf`, `Rg`, `Cep`, `Phone`, `Email`,
   `ApplicationId`. Isso impede passar uma string crua onde se espera um CPF validado.
4. **Funções puras** retornam valores; erros previsíveis são modelados como retorno (`T | InvalidValueError`)
   ou exceções tipadas (classes em `lib/errors.ts`). Nunca lance strings.
5. **Exports nomeados** sempre (exceto componentes de página `app/**/page.tsx`, que exigem `export default`).
6. **`type` para shapes, `interface` para contratos extensíveis** (ex: `NotificationChannel`).
7. **`readonly` e `as const`** para dados imutáveis (listas de constantes, enums-like).
8. **Sem efeitos colaterais em `lib/`.** Se a função toca disco, rede ou banco, ela pertence a `server/`.
9. **Datas**: armazenar em UTC (`DateTime` no Prisma); formatar para `pt-BR` apenas na borda de exibição.

---

## 7. Server vs Client Components

- **Padrão = Server Component.** Não escreva `'use client'` por hábito.
- Use `'use client'` SOMENTE quando houver: estado local, eventos do usuário, hooks de browser,
  `react-hook-form`, refs de DOM.
- O formulário multi-etapa é Client Component. Páginas institucionais são Server Components.
- NUNCA importe `server/` (db, services) dentro de um Client Component. A ponte é o route handler / server action.
- Segredos (`DATABASE_URL`, credenciais) NUNCA podem vazar para o bundle client. Só `NEXT_PUBLIC_*` é público.

---

## 8. Regras de Banco de Dados

1. **Prisma só via `server/services/*`.** É PROIBIDO importar `@/server/db` ou `@prisma/client`
   em componentes, hooks, `lib/` ou route handlers diretamente (handler chama o serviço).
2. **Atomicidade.** Operações que criam múltiplas linhas (application + documents + histórico) DEVEM
   usar `prisma.$transaction`. Se o upload falhar, a transação reverte e os arquivos órfãos são limpos.
3. **Singleton.** Apenas `server/db.ts` instancia `PrismaClient`. Em dev, reaproveita via `globalThis`.
4. **Sem logs de parâmetros em produção.** A configuração de log do Prisma nunca pode logar `query`/`params`
   em produção (vazaria CPF/RG). Ver `server/db.ts`.
5. **Migrations versionadas.** Mudou `schema.prisma` → gere migration (`npx prisma migrate dev`). Nunca
   edite o banco "na mão".
6. **Unicidade.** `cpf` e `email` são `@unique` para impedir inscrição duplicada. Trate o erro `P2002`
   como conflito de negócio (não como erro 500).

---

## 9. Segurança e LGPD (REGRAS NUMERADAS — NÃO NEGOCIÁVEIS)

1. **Nunca logar CPF, RG, documentos ou filiação em texto puro.** Use `maskForLogs` / `redactSensitiveData`
   de `lib/lgpd.ts` antes de qualquer `console`/log estruturado.
2. **Mascaramento em erros.** Mensagens de erro retornadas ao client NUNCA repetem o dado sensível. Use
   `clientMessage` das classes de `lib/errors.ts`.
3. **Allowlist de MIME.** Uploads aceitam SOMENTE `application/pdf`, `image/jpeg`, `image/png`. Tudo o mais
   é rejeitado com `InvalidFileTypeError` (415). Nunca confie só na extensão.
4. **Limite de tamanho.** Arquivos acima de `MAX_UPLOAD_SIZE_MB` → `FileTooLargeError` (413).
5. **Sanitização de nome de arquivo.** Remova path traversal (`..`, `/`, `\`, caracteres de controle).
   O nome salvo em disco é gerado pelo sistema (UUID), nunca o nome do usuário.
6. **Antivírus (stub).** Há um ponto de extensão `scanForMalware()` no `upload.service`. Hoje é stub;
   em produção deve plugar um scanner real antes de persistir o arquivo.
7. **URLs assinadas / privadas.** Documentos NUNCA são servidos por URL pública adivinhável. Persistimos
   caminho relativo; o acesso será mediado por rota autenticada (admin) com URL assinada/expirável.
8. **Caminho relativo, nunca absoluto.** O banco guarda caminho relativo ao `UPLOAD_DIR`. Nunca exponha
   path absoluto do servidor (vazaria estrutura de diretórios).
9. **Consentimento versionado.** Guardamos `lgpdConsent`, `lgpdConsentVersion` e `lgpdConsentedAt`. Se o
   texto de consentimento mudar, incremente `LGPD_VERSION` em `lib/lgpd.ts`.
10. **Minimização.** Notificações (e-mail) NÃO carregam dados sensíveis no corpo. Apenas nome, contato e o
    ID da aplicação para a secretaria abrir o painel. CPF/RG jamais trafegam por e-mail.
11. **Retenção.** Dados de inscrições rejeitadas/inativas devem ter política de retenção definida; o schema
    registra timestamps que permitem expurgo programado (job futuro).
12. **Direito ao esquecimento.** A exclusão de uma `MemberApplication` faz cascade nos documentos e remove
    os arquivos do disco. Deve existir um caminho de serviço para atender solicitações de titular.
13. **Princípio do menor privilégio.** A área admin será protegida por autenticação; nenhuma rota pública
    pode retornar dados de outra pessoa.

---

## 10. Campos do Formulário (contrato completo)

Etapas e campos. Tipos referem-se ao schema Zod / Prisma. Máscaras são aplicadas na UI; o servidor
**revalida** sempre.

### Etapa 1 — Dados Pessoais (`step1Schema`)
| Campo               | Tipo            | Máscara/Regra                                       |
| ------------------- | --------------- | --------------------------------------------------- |
| `fullName`          | string ≥ 3      | —                                                   |
| `phone`             | `Phone`         | `(85) 91234-5678` — DDD + 8/9 dígitos               |
| `email`             | `Email`         | e-mail válido                                       |
| `crfaOrStudentInfo` | string ≥ 2      | nº CRFa ou dados de instituição/matrícula           |
| `birthDate`         | ISO date string | data passada, idade plausível                       |
| `cpf`               | `Cpf`           | `000.000.000-00`, **dígitos verificadores válidos** |
| `rg`                | `Rg`            | ≥ 3 dígitos                                          |
| `issuingAgency`     | string ≥ 3      | órgão expedidor + data                              |
| `filiacao`          | string ≥ 3      | pai e/ou mãe (SENSÍVEL)                             |
| `maritalStatus`     | enum            | `MaritalStatus`                                     |
| `nationality`       | string ≥ 2      | —                                                   |
| `birthplace`        | string ≥ 2      | cidade - UF                                          |

### Etapa 2 — Endereço (`step2Schema`)
| Campo                     | Tipo       | Máscara/Regra        |
| ------------------------- | ---------- | -------------------- |
| `residentialStreet`       | string ≥ 2 | —                    |
| `residentialNumber`       | string ≥ 1 | —                    |
| `residentialComplement`   | string ≥ 1 | "N/A" se não houver  |
| `residentialNeighborhood` | string ≥ 2 | —                    |
| `residentialCity`         | string ≥ 2 | —                    |
| `residentialCep`          | `Cep`      | `00000-000`, 8 díg.  |

### Etapa 3 — Dados Profissionais (`step3Schema`)
| Campo                   | Tipo                | Regra                            |
| ----------------------- | ------------------- | -------------------------------- |
| `workRelation`          | enum `WorkRelation` | CLT/PJ/LIBERAL/CONCURSADO/OUTRO  |
| `workDetails`           | string ≥ 1          | empresa/período ou "NÃO"         |
| `commercialAddress`     | string ≥ 3          | —                                |
| `practiceAreas`         | string ≥ 2          | áreas de atuação                 |
| `graduationInstitution` | string ≥ 2          | —                                |
| `graduationYear`        | int                 | 1970 ≤ ano ≤ ano atual           |

### Etapa 4 — Formação (`step4Schema`)
| Campo           | Tipo       | Regra                       |
| --------------- | ---------- | --------------------------- |
| `specialization`| string ≥ 1 | instituição/ano ou "NÃO"    |
| `masters`       | string ≥ 1 | instituição/ano ou "NÃO"    |
| `doctorate`     | string ≥ 1 | instituição/ano ou "NÃO"    |
| `postDoctorate` | string ≥ 1 | instituição/ano ou "NÃO"    |

### Etapa 5 — Documentos (validados no servidor, fora do Zod de texto)
| Documento           | Campo               | Regra                                  |
| ------------------- | ------------------- | -------------------------------------- |
| Comprovante endereço| `addressProof`      | 1 arquivo, PDF/JPG/PNG                  |
| Identidade          | `identityDocuments` | 1+ arquivos (frente e verso)           |
| Comprovante CREFONO | `crefonoProof`      | 1 arquivo                              |

### Etapa 6 — LGPD e revisão (`lgpdSchema`)
| Campo         | Tipo          | Regra                          |
| ------------- | ------------- | ------------------------------ |
| `lgpdConsent` | `literal(true)`| obrigatório marcar para enviar |

---

## 11. Status e Máquina de Estados

Enum `ApplicationStatus`:

```
PENDING_REVIEW ──► APPROVED
       │
       ├────────► REJECTED
       │
       └────────► NEEDS_CORRECTION ──► PENDING_REVIEW
```

Transições válidas (toda mudança é registrada em `ApplicationStatusHistory`):

| De                 | Para permitido                              |
| ------------------ | ------------------------------------------- |
| `PENDING_REVIEW`   | `APPROVED`, `REJECTED`, `NEEDS_CORRECTION`  |
| `NEEDS_CORRECTION` | `PENDING_REVIEW`                            |
| `APPROVED`         | — (estado final)                            |
| `REJECTED`         | — (estado final)                            |

`REJECTED` e `NEEDS_CORRECTION` exigem `reason`. Transição inválida → `AppError` (não 500).

---

## 12. Tratamento de Erros

Toda a hierarquia vive em `lib/errors.ts`. Cada erro carrega `statusCode` e `clientMessage` (mensagem
segura, sem dado sensível):

| Classe                      | HTTP | Quando                                  |
| --------------------------- | ---- | --------------------------------------- |
| `ValidationError`           | 400  | Zod falhou                              |
| `FileTooLargeError`         | 413  | arquivo > limite                        |
| `InvalidFileTypeError`      | 415  | MIME fora da allowlist                  |
| `LgpdConsentRequiredError`  | 422  | consentimento ausente                   |
| `NotFoundError`             | 404  | recurso inexistente                     |
| `AppError` (base)           | 500* | erro de negócio genérico                |

O route handler tem um único `catch` que mapeia `AppError → { error: clientMessage, statusCode }`.
Erros desconhecidos viram 500 genérico, SEM vazar `error.message` cru ao client e SEM logar dado sensível.

---

## 13. Convenções de Teste

- **Ferramentas:** Vitest + React Testing Library. Ambiente `jsdom` (ver `vitest.config.ts`).
- **Padrão AAA:** Arrange, Act, Assert. Um comportamento por teste, nome descritivo em PT-BR ou EN claro.
- **TDD leve:** escreva/atualize o teste ANTES de implementar a feature (workflow §15).
- **Funções puras (`lib/`)**: cobertura alta, sem mocks. Teste casos felizes E de borda (CPF inválido,
  CEP curto, MIME proibido, consentimento ausente).
- **Services (`server/`)**: mocke o Prisma (`vi.mock`) e o filesystem. Verifique transação, ordem de chamadas
  e — crítico — **ausência de dados sensíveis** nos payloads de notificação/log.
- **Componentes**: teste comportamento visível ao usuário (texto, navegação, validação), não detalhes internos.
- **Cobertura mínima por camada:** `lib/` e `validations/` ~100%; `services/` cobrir caminhos felizes + erros;
  UI cobrir fluxos principais.
- **Nunca** use CPF/RG reais de pessoas nos testes. Use CPFs sinteticamente válidos para os check digits.

---

## 14. Convenções de Nomes e Arquivos

- Arquivos: `kebab-case.ts` / `kebab-case.tsx`. Serviços: `*.service.ts`. Testes: `*.test.ts(x)` ao lado do alvo.
- Componentes React: `PascalCase`. Hooks: `useCamelCase`. Funções/variáveis: `camelCase`. Constantes globais:
  `UPPER_SNAKE_CASE`.
- Schemas Zod: `camelCaseSchema` (ex: `step1Schema`, `fullApplicationSchema`).
- Tipos inferidos: `PascalCase` (`Step1Data`, `ApplicationFormData`).
- Branded types: `PascalCase` singular (`Cpf`, `Email`).
- Exports SEMPRE nomeados (exceto `page.tsx`/`layout.tsx`).
- Imports internos via alias `@/*`.

---

## 15. Workflow do Agente (Sonnet) — passo a passo

Para CADA tarefa:

1. **Ler esta regra** (`.cursor/rules/sindfono-site.md`) e os arquivos relevantes.
2. **Escrever/atualizar o teste** primeiro (`*.test.ts`), descrevendo o comportamento esperado.
3. **Implementar** a feature respeitando as camadas (§5) e as regras de LGPD (§9).
4. **Rodar** `npm run test` e corrigir até passar (verde).
5. **Rodar** `npm run lint` e corrigir.
6. **Nunca** introduzir `any`, logar dado sensível ou acessar Prisma fora de `server/services`.
7. **Atualizar esta bíblia** se a tarefa criar um novo padrão arquitetural.

### O que está pronto para o Sonnet usar (já entregue pelo arquiteto)
- `lib/branded-types.ts`, `lib/masks.ts`, `lib/lgpd.ts`, `lib/errors.ts`
- `validations/application.ts` (schemas por etapa + branded types + CPF/CEP/telefone reais)
- `server/db.ts` (singleton seguro), `server/services/{applications,upload,notifications}.service.ts`
- `app/api/applications/route.ts` (handler fino)
- `prisma/schema.prisma` (unicidade, consentimento versionado, histórico e notas)

### O que o Sonnet deve fazer na UI
- Reescrever `features/sindicalizacao/sindicalizacao-form.tsx` consumindo os schemas por etapa e as máscaras.
- Aplicar máscaras de `lib/masks.ts` nos inputs (CPF, CEP, telefone).
- Exibir o texto `LGPD_CONSENT_TEXT` e enviar a versão do consentimento.
- Não inventar regra de negócio na UI: validação e persistência já têm dono nas camadas abaixo.

---

## 16. Variáveis de Ambiente

| Var                  | Uso                                             |
| -------------------- | ----------------------------------------------- |
| `DATABASE_URL`       | conexão PostgreSQL                              |
| `UPLOAD_DIR`         | diretório base de uploads (relativo)           |
| `MAX_UPLOAD_SIZE_MB` | limite por arquivo                             |
| `NODE_ENV`           | controla logs do Prisma e mocks                |
| `SECRETARY_EMAIL`    | destino das notificações                        |

Nenhum segredo em `NEXT_PUBLIC_*`. Nenhum segredo commitado (use `.env`, veja `.env.example`).

---

## 17. Checklist de Pull Request

- [ ] Li a bíblia e segui as camadas.
- [ ] Sem `any`, sem `as` desnecessário.
- [ ] Sem dado sensível em logs/erros/e-mails.
- [ ] Prisma só em `server/services`.
- [ ] Testes escritos antes e passando (`npm run test`).
- [ ] Lint limpo (`npm run lint`).
- [ ] Consentimento LGPD versionado quando aplicável.
- [ ] Atualizei a bíblia se criei um padrão novo.
