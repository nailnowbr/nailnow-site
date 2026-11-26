# Relatório Claude Code — nailnow-site

## 26/11/2026 — texto novo de `/excluir-conta` (revisão Play Data Safety)

### Contexto
Google Play está revisando a Segurança dos Dados do app NailNow e a página `https://nailnow.app/excluir-conta` precisava descrever exatamente o que o sistema faz. Prazo do Google: **04/12/2026**. A versão anterior afirmava algo errado ("agendamentos em aberto são cancelados automaticamente") e continha prazo de retenção.

### O que mudou (`excluir-conta.html`)
- **"O que é excluído":**
  - login agora menciona Google/Apple;
  - removida a frase falsa "Agendamentos em aberto sem pagamento confirmado são cancelados automaticamente";
  - linha de avaliações reduzida a "As avaliações que você fez passam a aparecer sem o seu nome" (só as feitas pela pessoa; nada afirmado sobre as recebidas);
  - adicionado parágrafo "A exclusão é da conta inteira. Não existe exclusão parcial de dados."
- **"Antes de excluir a conta":** reescrito em `<p>` com a definição exata — "em aberto" = aguardando aceite / confirmados / em andamento → bloqueia a exclusão; concluídos/cancelados/recusados/expirados não impedem; repasse pendente bloqueia profissionais até resolver com suporte.
- **"O que é mantido":** removida a cláusula "pelo prazo exigido pela legislação" (sem citar retenção).

### Commit + deploy
- Commit: **`d38409e`** em `main` ("docs(excluir-conta): alinha texto com Segurança dos Dados do Google Play"), pushed.
- Deploy: `firebase deploy --only hosting --project nailnow-site` — release complete **2026-11-26 11:52 BRT**.

### Verificação pós-deploy
| URL | Status | Esperado |
|---|---|---|
| `https://nailnow.app/excluir-conta` | **200** com texto novo no ar | ok |
| `https://www.nailnow.app/excluir-conta` | **301** → `https://nailnow.app/excluir-conta` | ok |
| `https://nailnow.app/.well-known/apple-app-site-association` | **200** | ok |
| `https://nailnow.app/.well-known/assetlinks.json` | **200** | ok |
| `https://nailnow.app/m/bruna-6` | **200** | ok |

### Pendências pós-deploy
- Confirmar no Play Console que a URL de exclusão está cadastrada **sem** `www` (redireciona 301, mas o Play deve guardar a canônica). Responsável: Bruna. Prazo: **04/12/2026**.
- Rever o texto final de "O que é mantido" com a Marta antes de considerar fechado.
- Teste de envio SPF/DKIM/DMARC do domínio — pendente, esperando "vai" da Bruna.
- `firebase deploy --only functions --project nailnow-site` segue bloqueado (bug Gen 1 CPU no `firebase-tools 14.x`); stash `functions-url-nailnow-app` preservado.

### Rollback
- Texto: `git revert d38409e && git push origin main` + novo `firebase deploy --only hosting --project nailnow-site`.
- Ou, no Firebase Console → Hosting → release anterior, **Reverter**.

---

## 24/11/2026 — migração GitHub Pages → Firebase Hosting e www

### Contexto
Após migrar o DNS do apex para o Firebase Hosting, ~62 páginas do site estavam retornando 404 porque o rewrite no `firebase.json` só cobria a home. Também era preciso colocar `www.nailnow.app` sob o mesmo Firebase (redirecionando 301 para o apex) e limpar restos de template antigo.

### O que foi feito e commitado

- **d7c1a7d** `fix(hosting): rewrite /rota → /rota.html para todas as páginas`
  - 63 rewrites adicionados no `firebase.json` para servir as páginas que estavam só como `.html` na raiz.
- **e2f0a58** `fix(hosting): /profissional e /servicos servem as páginas reais; sitemap limpo`
  - `/profissional` passa a servir `profissional.html`; `/servicos` → `servicos.html`.
  - `profissional/index.html` e `servicos/index.html` movidos para `_descartado/` (ignore novo no `firebase.json`).
  - Links do `confirmar-cadastro.html` agora apontam para `/app-profissional`.
  - `/agendamentos` removido do `sitemap.xml` (de 56 para 55 URLs).
- **e6799f7** `docs(functions): registra bloqueio do deploy (Gen 1 CPU bug firebase-tools 14.x)`
  - Documenta o bloqueio do `firebase deploy --only functions`, causa (bug firebase-tools 14.x com Gen 1 + SDK v4.9), 4 caminhos para destravar, e a localização do stash `functions-url-nailnow-app`.

### Verificações finais

- Sitemap em produção com 55 URLs; 60/60 rotas retornaram 200 no sweep.
- `/.well-known/apple-app-site-association`, `/.well-known/assetlinks.json` e `/m/bruna-6`: 200 com content-type correto.
- `www.nailnow.app`, `/profissional`, `/m/bruna-6` sob `www` retornam 301 para o apex, com TLS válido (sem `-k`).
- `dig +short CNAME www.nailnow.app` → `nailnow-site.web.app.` (Firebase).
- Firebase REST (`sites/nailnow-site/domains/www.nailnow.app`): `DOMAIN_ACTIVE`, `DNS_MATCH`, `CERT_PROPAGATING` (certificado já válido na borda).

### Bloqueio aberto — functions

- `firebase deploy --only functions --project nailnow-site` falha com:
  > Cannot set CPU on the functions registerClientAccount because they are GCF gen 1
- Decisão da Bruna: **não migrar para Gen 2 nem fazer upgrade de `firebase-functions` agora**.
- As edições que trocavam `www.nailnow.app` por `nailnow.app` em `functions/` e `firebase/functions/` (8 arquivos rastreados) + script `lint` no-op em `functions/package.json` ficaram no stash **`functions-url-nailnow-app`**.
- Comando para retomar quando a Bruna autorizar:
  ```
  git -C ~/Desktop/nailnow-site stash list     # confirmar que o stash ainda está aí
  git -C ~/Desktop/nailnow-site stash apply stash@{0}
  ```
- 4 caminhos para destravar o deploy estão em `docs/functions-deploy-bloqueio.md`.

### Mudanças fora do repo (feitas pela Bruna, com Claude só observando)

- DNS Namecheap: CNAME `www` apontado de `brunizm.github.io` para `nailnow-site.web.app`. GitHub Pages não precisa de limpeza (nenhum repo reivindica o `www`).
- Firebase Console: domínio `www.nailnow.app` adicionado como redirect 301 para `nailnow.app`.
- E-mail do domínio: TXT SPF duplicado (`spf.privateemail.com`) removido; sobrou só o SPF do forwarding (`efwd.registrar-servers.com`). Encaminhamentos `bruna@`/`suporte@` testados.
  - **Rollback do SPF (se necessário):** recriar TXT em `@` com `v=spf1 include:spf.privateemail.com ~all`.
- Search Console: sitemap reenviado (55 URLs), indexação da home solicitada.
- Google Ads: 11 anúncios já estão com URL final `https://nailnow.app/` (verificado).

### Pendências abertas

- Destino do anúncio ativo do Meta (Instagram) — revisar URL final.
- Build 432 / `1.0.18+432` em teste pela Bruna e pelas sócias (TestFlight + Play interno). Promoção à produção é manual.
- Data Safety do Google Play aponta para `nailnow.app/excluir-conta`. Prazo: **04/12/2026**. Responsável: Bruna.
- Acompanhar indexação no Google Search Console nos próximos dias.
- Teste de envio SPF/DKIM/DMARC a ser feito quando a Bruna pedir.

### Como reverter (resumo)

- Rewrites 404-fix (`d7c1a7d` + `e2f0a58`): `git revert d7c1a7d e2f0a58` → deploy manual via Firebase Console (Claude não faz deploy sozinho).
- CNAME `www`: no Namecheap, apontar `www` de volta para `brunizm.github.io.` (reativando GitHub Pages).
- SPF: ver bloco acima.
