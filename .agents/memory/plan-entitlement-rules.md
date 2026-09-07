---
name: Precedência e privacidade dos planos
description: Regras de negócio e segurança que devem permanecer estáveis ao alterar compras e acessos.
---

O plano ilimitado activo nunca pode ser substituído por uma aprovação posterior de plano Mensal ou Trimestral. A verificação deve fazer parte da mesma transacção que aprova o pagamento e concede o acesso.

**Why:** Uma verificação fora da transacção permite que aprovações concorrentes removam acidentalmente um direito global já pago.

**How to apply:** Qualquer novo fluxo de aprovação, migração ou reparação de assinaturas deve preservar a precedência do ilimitado e actualizar comprovativo, assinatura e acessos de forma atómica.

Os links privados de WhatsApp e conteúdo bónus não podem aparecer no catálogo público de planos; só devem ser devolvidos pelo contexto autenticado do plano activo.

**Why:** Estes links fazem parte do benefício pago e a sua divulgação no catálogo permitiria contornar a aprovação.

**How to apply:** Ao criar novas listagens públicas, projectar apenas os campos comerciais. Servir links exclusivos somente depois de validar uma assinatura ou acesso não expirado.