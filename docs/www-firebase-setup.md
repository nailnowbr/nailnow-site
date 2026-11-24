# Fazer `www.nailnow.app` funcionar com Firebase Hosting

Status atual (checado em 2026-11-24):

- `nailnow.app` (apex) → Firebase Hosting (`199.36.158.100`) ✅
- `www.nailnow.app` → GitHub Pages (`brunizm.github.io` / `185.199.108-111.153`) → retorna **404** ❌

Objetivo: fazer `https://www.nailnow.app/*` responder, redirecionando pro apex `https://nailnow.app/*` (preservando path e query).

> ⚠️ Esses passos NÃO foram executados. Executar quando a Bruna aprovar.
> Enquanto não for feito, qualquer link gerado no backend ou em e-mail com `www.nailnow.app/...` continua quebrado (ex: `functions/src/index.js:205` e `docs/firebase-email.md:89` usam `www.nailnow.app/profissional/login.html`).

---

## Passo 1 — Adicionar `www.nailnow.app` no Firebase Hosting

No **Firebase Console** → projeto `nailnow-site` → **Hosting** → site `nailnow-site`:

1. Clicar em **Adicionar domínio personalizado**.
2. Digitar `www.nailnow.app`.
3. Quando perguntar "Como quer servir?", escolher **Redirecionar para outro domínio** → destino `nailnow.app` → tipo `301 (permanente)`.
   - Se essa opção não aparecer (algumas versões do Console só oferecem "servir conteúdo"), seguir com **Servir conteúdo** e lidar com o redirect via `firebase.json` (ver Alternativa B).
4. O Firebase vai pedir pra criar **um ou mais registros DNS** (geralmente 2 registros `A` apontando pros IPs do Firebase). Anotar os IPs exatos que o Console mostrar.

## Passo 2 — Remover o DNS atual que aponta pro GitHub Pages

No registrador do domínio (onde `nailnow.app` é gerenciado; pelo apex apontar pros IPs do Firebase, o DNS deve estar no Google Domains / Squarespace Domains ou similar):

1. Localizar a entrada DNS de `www`. Hoje ela é um **CNAME** `www → brunizm.github.io.` (ou 4 registros `A` para `185.199.108-111.153`).
2. **Remover** essa entrada. Isso tira o GitHub Pages do caminho.

## Passo 3 — Criar o DNS novo que aponta pro Firebase

Ainda no registrador, criar os registros que o Firebase mostrou no Passo 1:

- Tipo: `A`
- Host: `www`
- Valor: (IPs que o Firebase Console listou — tipicamente 2 IPs do tipo `199.36.158.x` ou `151.101.x.x`)
- TTL: 3600 (ou o padrão)

> O Firebase **não** aceita CNAME pra domínios `www` em alguns casos; sempre seguir exatamente o que o Console pedir.

## Passo 4 — Esperar propagação + validação SSL

1. Esperar propagação DNS (5 min a 1 h). Checar com:
   ```bash
   dig +short www.nailnow.app A
   # deve retornar os IPs do Firebase, NÃO 185.199.*.*
   ```
2. Voltar no Firebase Console → o status do domínio vai sair de "Pendente" → "Conectado". O certificado SSL é emitido automaticamente (pode levar mais 15-60 min).
3. Testar:
   ```bash
   curl -sI https://www.nailnow.app/
   # esperado: HTTP/2 301, location: https://nailnow.app/
   curl -sI https://www.nailnow.app/profissional
   # esperado: HTTP/2 301, location: https://nailnow.app/profissional
   ```

## Passo 5 — Fazer o GitHub Pages parar de servir esse hostname (opcional, mas limpa)

No repo que hospedava GH Pages (`brunizm/brunizm.github.io` ou o CNAME em algum repo `docs/CNAME`):

1. Remover o arquivo `CNAME` que contém `nailnow.app` ou `www.nailnow.app`.
2. Em **Settings → Pages** do repo, remover o custom domain `www.nailnow.app` (se ainda estiver lá).

Isso não é obrigatório — assim que o DNS deixar de apontar pro GH, ele deixa de ser alcançado. Mas limpar evita confusão futura.

---

## Alternativa B — Se o Firebase Console não oferecer redirect direto

Se a tela do Console só deixar "servir conteúdo", servir o mesmo site em `www` e adicionar um **redirect 301 → apex** via `firebase.json`:

```json
"redirects": [
  {
    "source": "**",
    "regex": "^(?:https?://)?www\\.nailnow\\.app(/.*)?$",
    "destination": "https://nailnow.app:1",
    "type": 301
  }
]
```

Observação: o `redirects` do `firebase.json` só roda quando Firebase está servindo — por isso a abordagem canônica é o redirect direto do Console (Passo 1 opção "Redirecionar").

---

## Rollback

Se algo der errado no Passo 3:

1. No registrador DNS, recriar a entrada antiga: `www → brunizm.github.io.` (CNAME) **ou** os 4 registros `A` pros IPs `185.199.108-111.153`.
2. No Firebase Console → Hosting → site `nailnow-site` → remover `www.nailnow.app`.

Tudo volta ao estado atual (apex funciona, www 404 do GH Pages).

---

## Depois que o www estiver funcionando

Corrigir as 2 referências no código que hoje usam `www.nailnow.app`:

- `functions/src/index.js:205` — `www.nailnow.app/profissional/login.html`
- `docs/firebase-email.md:89` — mesma URL

Pode manter com `www` (vai 301 pro apex) ou trocar pra `https://nailnow.app/profissional/login.html` direto. Manter com `www` dá camada de compatibilidade retroativa pros e-mails já disparados.
