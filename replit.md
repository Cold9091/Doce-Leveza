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

## Admin Padrão (após seed)

- **Email**: `admin@doceleveza.com`
- **Senha**: `admin123`
- **Role**: `super_admin`

## Problemas Conhecidos (a corrigir)

1. Detalhe do programa importa PDF estático que pode não existir
2. Fluxo de pagamento (upload de comprovante) está quebrado
3. Admin Payments — URL de API errada no queryKey
4. Configurações admin sem autenticação no GET/PATCH
5. Senhas armazenadas em texto puro (sem hash)
6. SESSION_PASSWORD usa valor padrão — deve ser env var
