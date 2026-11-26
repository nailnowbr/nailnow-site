# NailNow Site — Notas para o Claude

Repo do site público `nailnow.app` (Firebase Hosting). Projeto Firebase: **nailnow-site**.

## Regras permanentes

1. **Promoção para produção é SEMPRE manual da Bruna.** Vale pra tudo: App Store, Google Play (sair de interno), e qualquer passo irreversível (DNS, domínio no Firebase Console, remover custom domain do GitHub Pages). O trabalho autônomo termina em verificação + push + relatório.
2. **Não mexer em DNS nem no Firebase/Vercel/GitHub Console.** Tarefas de DNS/Console são da Bruna, com extensão do Chrome. Claude só lê (dig, REST read-only, gh api GET).
3. **Não enviar e-mail nem push real a clientes** fora de campanhas explícitas aprovadas.
4. **Não re-assinar IPA à mão.** Se export/signing falhar (iOS), parar e avisar — nunca mexer em entitlements/provisioning manualmente.
5. **Android: sempre terminar em Play INTERNO** (não promover tracks).
6. **Sem secrets/credenciais commitadas.** Nunca commitar `.p8`, chaves, tokens, scripts `audit-*.js` com acesso admin, listas `*-sent.txt` de campanhas, ou golden tests que vazem dados (ex.: `story_card_golden_test.dart`).
7. **Hosting intocável** para rotas sensíveis: `/m/**`, `/.well-known/apple-app-site-association`, `/.well-known/assetlinks.json`, `/excluir-conta`, `/privacidade`. Toda mudança em `firebase.json` precisa validar essas rotas antes do push.

## Estado em produção (26/11/2026)

- **`/excluir-conta`** republicado com o texto alinhado à revisão de Segurança dos Dados do Google Play (prazo **04/12/2026**): "O que é excluído" cita login Google/Apple + avaliações feitas aparecem sem o nome + aviso de que a exclusão é da conta inteira; "Antes de excluir a conta" descreve que agendamentos em aberto (aguardando aceite, confirmados ou em andamento) bloqueiam a exclusão e que concluídos/cancelados/recusados/expirados não impedem; repasse pendente também bloqueia profissionais; "O que é mantido" não cita mais prazo de retenção.
- **Commit:** `d38409e` em `main` (push origin confirmado).
- **Deploy:** `firebase deploy --only hosting --project nailnow-site` — release complete **2026-11-26 11:52 BRT**.
- **Verificação pós-deploy:** apex `/excluir-conta` 200 com texto novo; `www.nailnow.app/excluir-conta` 301 → apex; AASA 200; `assetlinks.json` 200; `/m/bruna-6` 200.
- **Rollback:** Firebase Console → Hosting → release anterior. No git: `git revert d38409e && git push`.

## Estado em produção (24/11/2026)

- **Hosting:** Firebase Hosting (projeto `nailnow-site`), sitemap com 55 URLs, 60/60 rotas respondendo 200.
- **Apex:** `nailnow.app` → `199.36.158.100` (Firebase).
- **www:** `www.nailnow.app` CNAME → `nailnow-site.web.app` (Firebase). Redireciona 301 → apex. Firebase REST: `DOMAIN_ACTIVE` / `DNS_MATCH` / `CERT_PROPAGATING` (certificado válido na borda; só aguardar virar `CERT_ACTIVE`).
- **DNS:** Namecheap BasicDNS (nameservers `dns1/dns2.registrar-servers.com`).
- **E-mail do domínio:** forwarding Namecheap (`efwd...`); SPF único (`v=spf1 include:_spf.efwd.registrar-servers.com ~all` — o SPF duplicado `spf.privateemail.com` foi apagado). Encaminhamentos `bruna@`/`suporte@` validados.
- **Rotas servidas por rewrite** (firebase.json): `/profissional` → `profissional.html`, `/servicos` → `servicos.html`, mais 61 outros. Páginas antigas em `profissional/index.html` e `servicos/index.html` foram movidas para `_descartado/` (ignore no `firebase.json`).

## Bloqueio aberto: deploy de functions

- Pasta `functions/` tem bug de deploy no `firebase-tools 14.x`:
  > Cannot set CPU on the functions registerClientAccount because they are GCF gen 1
- **Decisão da Bruna:** não migrar para Gen 2 nem fazer upgrade de `firebase-functions` por enquanto.
- Stash guardado: `functions-url-nailnow-app` no repo (`git stash list`). Mantém 8 trocas `www.nailnow.app` → `nailnow.app` + script `lint` no-op em `functions/package.json`. **NÃO fazer pop/descartar sem OK da Bruna.**
- Detalhes do bloqueio e 4 caminhos para destravar: `docs/functions-deploy-bloqueio.md`.

## Fluxos de verificação que o Claude pode rodar

- Sitemap: `curl -s https://nailnow.app/sitemap.xml | grep -c '<loc>'` → esperado 55.
- Rotas sensíveis:
  - `curl -sI https://nailnow.app/.well-known/apple-app-site-association` → 200 `application/json`
  - `curl -sI https://nailnow.app/.well-known/assetlinks.json` → 200 `application/json`
  - `curl -sI https://nailnow.app/m/bruna-6` → 200 `text/html`
- Status de domínio no Firebase (read-only): REST `firebasehosting.googleapis.com/v1beta1/sites/nailnow-site/domains/<domínio>` usando token em `~/.config/configstore/firebase-tools.json` (sem gcloud).

## Pendências abertas (pedir "vai" antes de mexer)

- Destino do anúncio ativo do Meta (Instagram) — checar/atualizar URL final.
- Build **1.0.18+435** em teste pela Bruna e pelas sócias (TestFlight + Play interno). Promoção à produção = Bruna (sempre manual).
- Data Safety do Google Play aponta para `nailnow.app/excluir-conta` — prazo **04/12/2026**. Confirmar no Play Console que o link cadastrado é **sem `www`** (o `www.nailnow.app/excluir-conta` redireciona 301 pro apex, mas o Play deve guardar a URL canônica). Responsável: Bruna.
- Frase de retenção removida de "O que é mantido" — **rever o texto final com a Marta** antes de considerar fechado.
- Deploy das `functions/` do site segue bloqueado (bug Gen 1 CPU no `firebase-tools 14.x`); stash `functions-url-nailnow-app` preservado — **não aplicar nem descartar sem OK**.
- Teste de envio SPF/DKIM/DMARC do domínio quando a Bruna pedir.
- Acompanhar indexação no Google Search Console.
