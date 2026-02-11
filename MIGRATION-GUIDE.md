# GUIA: Como Migrar o Banco de Dados

## 🚨 Problema Atual
O cliente JavaScript `@libsql/client` tem um bug conhecido que impede a migração via código.

## ✅ Solução: Usar Turso CLI

### Opção 1: Script Automático (RECOMENDADO)

1. **Execute o script batch:**
   ```bash
   migrate-db.bat
   ```

   O script irá:
   - Ler suas credenciais do arquivo `.env`
   - Extrair o nome do banco de dados
   - Executar o SQL usando Turso CLI

### Opção 2: Manual via Turso CLI

1. **Instale o Turso CLI** (se ainda não tiver):
   ```bash
   # PowerShell (como Administrador)
   iwr -useb https://get.tur.so/install.ps1 | iex
   ```

2. **Faça login no Turso:**
   ```bash
   turso auth login
   ```

3. **Liste seus bancos de dados:**
   ```bash
   turso db list
   ```

4. **Execute a migração:**
   ```bash
   turso db shell SEU-BANCO-DE-DADOS < migrations/0000_new_black_panther.sql
   ```

   Substitua `SEU-BANCO-DE-DADOS` pelo nome do seu banco (exemplo: `doce-leveza-db`)

### Opção 3: Via Dashboard Web

1. Acesse: https://turso.tech/dashboard
2. Selecione seu banco de dados
3. Abra o SQL Editor
4. Cole o conteúdo de `migrations/0000_new_black_panther.sql`
5. Execute o SQL

## 🔍 Verificar se Funcionou

Após a migração, verifique se as tabelas foram criadas:

```bash
turso db shell SEU-BANCO-DE-DADOS "SELECT name FROM sqlite_master WHERE type='table';"
```

Você deve ver as 12 tabelas:
- admin_notifications
- admins
- consultations
- ebooks
- leads
- notifications
- pathologies
- subscriptions
- system_settings
- user_access
- users
- videos

## ❓ Problemas Comuns

### "turso: command not found"
- O Turso CLI não está instalado. Siga o passo 1 da Opção 2.

### "Database not found"
- Verifique o nome do banco com `turso db list`
- Certifique-se de que o `.env` tem a URL correta

### "Authentication required"
- Execute `turso auth login` e siga as instruções

## 📝 Próximos Passos

Após a migração bem-sucedida:
1. Execute o seed script para popular dados iniciais
2. Inicie o servidor: `npm run dev`
3. Configure o Cloudinary para uploads de imagens
