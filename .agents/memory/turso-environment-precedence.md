---
name: Ligação Turso por ambiente
description: Evitar que uma variável local sobreponha as credenciais remotas do Turso.
---

Não manter `TURSO_DATABASE_URL=file:local.db` como variável de ambiente de desenvolvimento quando existe um Secret partilhado com a URL remota do Turso.

**Why:** Variáveis específicas de `development` têm precedência sobre o Secret partilhado. A aplicação pode aparentar estar ligada ao Turso enquanto continua a ler e escrever no ficheiro local.

**How to apply:** Ao diagnosticar diferenças entre preview e produção, confirmar apenas o protocolo efectivo da URL. Para ambientes remotos, deve ser `libsql:` ou `https:`; remover variáveis locais conflitantes antes de reiniciar o workflow.