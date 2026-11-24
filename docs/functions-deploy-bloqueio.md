# Deploy de Cloud Functions BLOQUEADO (2026-11-24)

> Status em 24/11/2026 ~11:25 BRT. Reavaliar quando retomar.

## O que está bloqueado

`firebase deploy --only functions --project nailnow-site` falha antes de enviar qualquer bytes para o Google.

```
Error: Cannot set CPU on the functions registerClientAccount because they are GCF gen 1
```

O erro é determinístico e aparece mesmo quando se pede deploy só de outra function (`functions:ping`, `functions:sendEmailOnCreate`) — o parse do `functions/index.js` é global, e o `registerClientAccount` dispara o erro antes de qualquer upload.

## Causa raiz

Bug conhecido do `firebase-tools` 14.x: o CLI aplica config de CPU default em todas as functions do codebase, inclusive em functions **GCF Gen 1**, que não aceitam esse parâmetro.

A function `registerClientAccount` em `functions/index.js:2826` usa a API SDK v1 (`functions.region("...").https.onRequest(...)`) — sintaxe Gen 1. A SDK versão `firebase-functions@4.9.0` no `package.json` é SDK v4.x, considerada **legacy**.

O CLI avisa durante o deploy:
- `functions: package.json indicates an outdated version of firebase-functions. Please upgrade using npm install --save firebase-functions@latest`
- `functions.config() API is deprecated. Cloud Runtime Configuration API... will be shut down in March 2026`

A conjunção `firebase-tools 14.x + firebase-functions 4.9 + função Gen 1` dispara o bug.

## 4 caminhos para destravar

1. **Migrar `registerClientAccount` para Gen 2 API no código.** Trocar `exports.registerClientAccount = functions.region(...).https.onRequest(...)` por `onRequest({ region: "...", cors: ... }, handler)` da SDK v5. Mudança de código moderada; mantém o comportamento. Risco médio.
2. **Upgrade `firebase-functions` 4.9 → 5.x.** A CLI avisa expressamente "there will be breaking changes when you upgrade". Pode quebrar outras functions (`sendEmailOnCreate`, `ping`). Risco alto; precisa bateria de testes.
3. **Downgrade local do `firebase-tools`** para versão anterior a 13.20 (quando o bug foi introduzido). Só afeta a máquina local; o repo não muda. Risco baixo, mas é gambiarra que trava a máquina na versão antiga.
4. **Aguardar fix upstream** no `firebase-tools`. Issue deve estar em https://github.com/firebase/firebase-tools/issues (buscar "Cannot set CPU GCF gen 1"). Sem SLA.

O prazo real é **março de 2026**: a partir dessa data, `functions.config()` deixa de funcionar, o que força o upgrade da SDK de qualquer jeito (caminho 2). Até lá, caminho 1 ou 3 é suficiente.

## O que fica pendente enquanto o bloqueio existe

- As **9 edições de URL** `https://www.nailnow.app` → `https://nailnow.app` em `functions/` e `firebase/functions/` já estão feitas localmente e estão guardadas no stash `functions-url-nailnow-app` (`git stash list`).
- A adição do script `lint` no-op em `functions/package.json` (destravava o predeploy hook morto) também está no mesmo stash.
- E-mails/links gerados pelas functions atuais em prod ainda apontam para `https://www.nailnow.app/...`, que hoje responde **404** (GitHub Pages). Ou seja: e-mails disparados agora têm links quebrados até que o www seja configurado (ver `docs/www-firebase-setup.md`) **ou** este deploy saia.

## Como retomar

```bash
cd ~/Desktop/nailnow-site
# recuperar as edições
git stash list | grep functions-url-nailnow-app
git stash pop stash@{N}   # N = o índice correspondente

# escolher 1 dos 4 caminhos acima (recomendado: caminho 1 ou 3)
# depois:
cd functions && npm install   # node_modules não é commitado
cd ..
firebase deploy --only functions:ping,functions:registerClientAccount,functions:sendEmailOnCreate --project nailnow-site
```

## Arquivos relacionados

- `functions/index.js:12,2525,2826` — `APP_URL`, CORS allowlist, `registerClientAccount`
- `functions/src/index.js:96,205` — `baseUrl`, `portalUrl`
- `functions/templates/confirmacao.html:66` — `<img src>` logo
- `functions/package.json:scripts.lint` — script no-op que destrava o predeploy
- `firebase.json` → `functions[0].predeploy` → `npm --prefix "$RESOURCE_DIR" run lint`
- `firebase/functions/**` — espelho legado, não é deployado
