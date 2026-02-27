# 🔄 Guia de Migração do Banco de Dados

## ✅ Status: Supabase PostgreSQL Configurado

O projeto foi migrado com sucesso de **Turso/LibSQL para Supabase PostgreSQL**.

---

## 🎯 Configuração Implementada

### Dependências Atualizadas:
- ✅ Removido: `@libsql/client`
- ✅ Adicionado: `pg` (PostgreSQL driver)
- ✅ Adicionado: `@types/pg` (TypeScript types)

### Arquivos Atualizados:
- ✅ `server/db.ts` - Pool PostgreSQL com client Drizzle ORM
- ✅ `drizzle.config.ts` - Dialect alterado para `postgresql`
- ✅ `scripts/migrate.ts` - Migration script para PostgreSQL
- ✅ `package.json` - Dependências PostgreSQL adicionadas
- ✅ `.env.example` - Formato PostgreSQL/Supabase
- ✅ `.env` - Credenciais Supabase configuradas

---

## 🚀 Próximas Etapas

### 1. Instalar Dependências
```bash
npm install
```

### 2. Executar Migrações (Escolher uma opção)

**Opção A: Usando drizzle-kit (RECOMENDADO)**
```bash
npm run db:push
```

**Opção B: Usando script TypeScript**
```bash
npm run db:migrate
```

**Opção C: Usando Supabase SQL Editor**
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Abra a aba "SQL"
4. Cole o conteúdo de `migrations/0000_new_black_panther.sql`
5. Clique "Execute"

### 3. Iniciar o Servidor
```bash
npm run dev
```

### 4. Verificar Tabelas (Opcional)
```bash
# Via psql
psql postgresql://postgres:password@db.supabase.co:5432/postgres

# Dentro do psql:
\dt  # Listar tabelas
```

---

## 📊 Tabelas Esperadas

Após a migração, você deve ter:
- ✅ users
- ✅ admins
- ✅ pathologies
- ✅ videos
- ✅ ebooks
- ✅ consultations
- ✅ subscriptions
- ✅ user_access
- ✅ leads
- ✅ notifications
- ✅ admin_notifications
- ✅ system_settings

---

## 🔗 Recursos

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Drizzle ORM PostgreSQL:** https://orm.drizzle.team/docs/get-started-postgresql
- **Connection String:** postgresql://postgres:[password]@db.supabase.co:5432/postgres

---

## ⚠️ Notas Importantes

1. **Credenciais:** O arquivo `.env` contém as credenciais. **NÃO COMMITAR PARA GIT!**
2. **SSL:** Supabase requere SSL. Já está configurado em `server/db.ts`
3. **Pool:** O Pool PostgreSQL é criado automaticamente na importação
