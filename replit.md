# Doce Leveza — Plataforma de Saúde e Bem-Estar

## Visão Geral

Plataforma completa de saúde e nutrição chamada "Doce Leveza". Inclui landing page, área do usuário (dashboard) e painel administrativo. Permite cadastro de usuários, acesso a programas de saúde, vídeos, ebooks, consultas e gerenciamento de assinaturas.

## Preferências do Usuário

- Linguagem de comunicação: Português (Brasil/Angola)
- Estilo: simples e direto

## Arquitetura do Sistema

### Frontend

- **Framework**: React 18 + TypeScript + Vite
- **Roteamento**: Wouter (client-side routing)
- **UI**: Shadcn UI (Radix UI primitives) + Tailwind CSS
- **Estado**: TanStack React Query para dados do servidor
- **Formulários**: React Hook Form + Zod

### Backend

- **Servidor**: Express.js + TypeScript
- **Autenticação**: iron-session (cookie-based, sessions seguras)
- **ORM**: Drizzle ORM com dialect SQLite (Turso/LibSQL)
- **Rate Limiting**: express-rate-limit
- **Segurança**: helmet.js

### Banco de Dados — TURSO (LibSQL/SQLite)

O banco de dados foi migrado de PostgreSQL para **Turso** (SQLite distribuído).

**Driver**: `@libsql/client`
**ORM**: `drizzle-orm/libsql`
**Dialect**: `turso` (SQLite)

**Variáveis de ambiente necessárias:**
- `TURSO_DATABASE_URL` — URL do banco (formato: `libsql://nome-db-org.turso.io`)
- `TURSO_AUTH_TOKEN` — Token de autenticação Turso
- `SESSION_PASSWORD` — Senha da sessão (mínimo 32 caracteres)

**Comandos de banco:**
- `npm run db:push` — Aplica schema no banco Turso
- `npm run db:seed` — Cria admin e dados padrão
- `npm run db:migrate` — Roda migrations

### Tabelas do Banco

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários (login por telefone) |
| `admins` | Administradores (login por email) |
| `pathologies` | Programas de saúde |
| `videos` | Vídeos dos programas |
| `ebooks` | Ebooks da biblioteca |
| `consultations` | Consultas agendadas |
| `subscriptions` | Assinaturas dos usuários |
| `user_access` | Controle de acesso por programa |
| `leads` | Leads capturados na landing page |
| `payment_proofs` | Comprovantes de pagamento |
| `notifications` | Notificações do usuário |
| `admin_notifications` | Notificações do admin |
| `system_settings` | Configurações globais do sistema |

### Rotas do Frontend

**Públicas:**
- `/` — Landing page

**Dashboard do Usuário (requer login por telefone):**
- `/dashboard` — Visão geral
- `/dashboard/programas` — Lista de programas
- `/dashboard/programas/:slug` — Detalhe do programa + vídeos
- `/dashboard/biblioteca` — Biblioteca de ebooks
- `/dashboard/perfil` — Perfil do usuário
- `/dashboard/consultas` — Consultas agendadas
- `/dashboard/configuracoes` — Configurações da conta
- `/dashboard/assinatura` — Minha assinatura
- `/dashboard/assinaturas` — Comprar/assinar programas

**Painel Admin (requer login por email):**
- `/admin` — Dashboard com estatísticas
- `/admin/alunos` — Gerenciar usuários
- `/admin/programas` — Gerenciar programas
- `/admin/videos` — Gerenciar vídeos
- `/admin/ebooks` — Gerenciar ebooks
- `/admin/consultas` — Gerenciar consultas
- `/admin/assinaturas` — Gerenciar assinaturas
- `/admin/pagamentos` — Verificar comprovantes
- `/admin/configuracoes` — Configurações do sistema

### Build e Deploy

- `npm run dev` — Desenvolvimento (porta 5000)
- `npm run build` — Build de produção (Vite + esbuild)
- `npm run start` — Servidor de produção
- Deployment: Autoscale no Replit

## Admin Padrão

- **Email**: `doceleveza@admin.ao`
- **Role**: `super_admin`
- (credenciais em segredo — não armazenar aqui)

## Problemas Resolvidos

1. ✅ PDF estático existe em `attached_assets/` — sem problema
2. ✅ Fluxo de pagamento corrigido — `PaymentDialog` agora envia JSON em vez de `FormData`
3. ✅ Admin Payments — `queryKey` e `queryFn` corrigidos para usar query param `?status=`
4. ✅ Configurações admin — `requireAdmin` adicionado aos endpoints GET/PATCH
5. ✅ Express `trust proxy` configurado para o proxy do Replit (elimina aviso do rate-limit)
6. ✅ GET /api/leads protegido com `requireAdmin`
7. ✅ DELETE /api/admin/leads/:id protegido com `requireAdmin`
8. ✅ POST /api/auth/forgot-password agora com rate-limit (50 req/hora)
9. ✅ Senhas removidas dos scripts — agora usam variável de ambiente `ADMIN_PASSWORD`
10. ✅ bcrypt cost reduzido de 12→10 (login 794ms→241ms)
11. ✅ IDOR corrigido: notificações, consultas, assinaturas — verificação de posse em todas as rotas de utilizador
12. ✅ POST /api/consultations requer auth + userId forçado da sessão (nunca do body)
13. ✅ PATCH /api/consultations/:id verifica que a consulta pertence ao utilizador da sessão; só permite alterar status/datetime
14. ✅ PUT /api/admin/users/:id usa whitelist de campos; password hashada se incluída
15. ✅ PATCH /api/admin/settings valida com Zod antes de passar ao storage
16. ✅ POST/PATCH /api/admin/user-access validados com insertUserAccessSchema
17. ✅ POST /api/payments/submit valida amount (positivo), programId (inteiro positivo), proofUrl (URL válida) e verifica existência do programa no DB
