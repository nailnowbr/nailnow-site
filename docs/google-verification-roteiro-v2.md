# Roteiro vídeo Google OAuth Verification — v2 (pós-recusa 13/09/2026)

## Contexto da recusa

Google recusou a v1 (Shorts vertical `BONPiNvdLSg`) por 3 motivos:
1. Vídeo não mostrou POR QUÊ cada scope é necessário
2. Tela de consent não estava com todos os scopes expandidos e legíveis
3. Faltou passo-a-passo claro pra navegar até o botão de conectar

Alerta bônus: app tá live em prod — Google avisa que scopes não-verificados consomem cota de "unverified users" (~100). Não é bloqueio, mas fica de olho.

## Setup antes de gravar

- **Formato**: horizontal 1920x1080, 2m30s a 3m00s. Não usar Shorts.
- **Device**: iPhone via QuickTime (Arquivo → Nova Gravação de Filme → escolhe iPhone) OU Android via `scrcpy`. Grava a tela do celular + narração por cima no CapCut/iMovie.
- **Contas de teste** (mesmas já submetidas):
  - Manicure aprovada: `brunizm+3@hotmail.com` / `Bruninha89*`
  - Cliente pra agendar: `brunizm@hotmail.com` / `Bruninha89*`
  - Ambas SEM 2FA, SEM verificação de telefone pendente. Confirma antes de gravar.
- **App build**: 1.0.10+288 (último) no TF ou Play internal.
- **Google Calendar aberto** em outra aba do browser (myaccount.google.com/permissions + calendar.google.com) pra mostrar depois.
- **Idioma**: narração em inglês (Google recomenda). Legenda opcional.

## Roteiro (chapters)

### 00:00–00:20 — Intro (contexto)

> "Hi, this is the demo for NailNow — a Brazilian marketplace app that connects clients to home-service manicurists. We're requesting two Google Calendar scopes: `calendar.events` and `calendar.readonly`. I'll show why each is required and why narrower alternatives don't work for our use case."

Tela: mostra homepage `nailnow.app` no browser + logo do app.

### 00:20–00:50 — Consent screen (CRÍTICO — pt.1 da recusa)

Passo-a-passo narrado:
> "Manicurists open the app, log in, and go to the Dashboard. Here they see a card titled 'Google Calendar' right below the availability card. Tapping 'Conectar Google Calendar' opens the OAuth consent screen in a WebView."

**CRÍTICO**: quando a tela de consent aparecer:
- Se o Google agrupar os scopes ("NailNow wants access to your Google Account"), **clica em "Show all services"** ou "Select all" pra expandir
- Espera 3s com a tela parada mostrando os 2 scopes por extenso e legíveis:
  - "See, edit, share, and permanently delete all the calendars you can access using Google Calendar" (events)
  - "See and download any calendar you can access using your Google Calendar" (readonly)
- Só depois clica "Continue"

> "Both scopes are displayed fully expanded. The user reads exactly what NailNow will access before consenting."

### 00:50–01:40 — Por que `calendar.events` (pt.2 da recusa)

Volta pro app. Como cliente (segunda conta), faz um agendamento com essa manicure. Confirma no fluxo normal.

Depois abre `calendar.google.com` da manicure em outra aba.

> "Here's why we need `calendar.events` and not just `.app.created`: when a client books a service in NailNow, we create an event on the manicurist's PRIMARY Google Calendar, titled 'NailNow · [Client Name] · [Service]'. The manicurist keeps ONE unified calendar — their personal life plus their NailNow appointments — so they can visually see conflicts. The `calendar.app.created` scope would isolate NailNow events in a separate calendar, defeating the purpose of unified scheduling that our users explicitly requested. `calendar.events` is the narrowest scope that allows writing to the primary calendar."

Mostra o evento criado no Calendar da manicure (título "NailNow · Bruna · Alongamento em Soft Gel", data, horário).

### 01:40–02:20 — Por que `calendar.readonly` (pt.2 da recusa)

Volta pro app. Como outro cliente, tenta agendar outro serviço com a mesma manicure NO MESMO horário do agendamento anterior. Não deveria aparecer disponível.

> "Now here's why we need `calendar.readonly`. Before offering an appointment slot to a client, NailNow queries the manicurist's freebusy — including events from other calendars they've integrated, like personal events, other work commitments, or events created outside NailNow. This prevents double-booking. We also apply a 30-minute buffer around existing events for commute time. The `.freebusy` scope alone isn't sufficient because we need to identify WHICH calendar owns the conflicting event to explain to the manicurist why a slot was blocked. `.readonly` is the narrowest scope that lets us read event metadata across all calendars for conflict detection — we never modify or display event contents to third parties."

Mostra a tela do cliente com o horário indisponível ou com aviso de conflito.

### 02:20–02:45 — Disconnect + revoke (Limited Use compliance)

Volta pro dashboard da manicure. Toca no card Calendar → "Desconectar" → confirma dialog.

Abre `myaccount.google.com/permissions` no browser → mostra que "NailNow" sumiu da lista.

> "Users can disconnect at any time from within the app, which revokes the OAuth grant. This complies with Google's Limited Use policy — we only use Calendar data for the scheduling features shown, we don't share it with third parties, we don't use it for ads, and we don't allow humans to read it except with explicit user consent for support."

### 02:45–03:00 — Homepage + política

Mostra rapidinho:
- `nailnow.app` (homepage)
- `nailnow.app/politica-de-privacidade` → scroll até seção 15 (Google API disclosure)
- `nailnow.app/termos-de-uso` → scroll até cláusula 10.1

> "Homepage, privacy policy section 15 covering Google API usage, and terms of service clause 10.1 are all live. Thank you for reviewing."

## Depois de gravar

1. Sobe pro YouTube **unlisted** (não precisa público — só o link)
2. Copia o link
3. Responde direto no email da API OAuth Dev Verification (não abre nova submissão — o "please reply directly to this email" no fim é literal)
4. No corpo do reply, inclui:
   - Link novo do vídeo
   - Confirmação: "The scopes configured in Google Cloud Console (`calendar.events` + `calendar.readonly`) exactly match the scopes requested by our app at runtime (see `nailnow/src/calendar/calendar.service.ts` line 13-16)"
   - Credenciais de teste (mesmas de antes)
   - Passo-a-passo pra Google reproduzir: "1) Download the app from TestFlight/Play Internal (link if you can share), 2) Log in with credentials above, 3) Go to Dashboard, 4) Tap 'Conectar Google Calendar' card, 5) Complete OAuth flow, 6) As a client account, book an appointment with this manicurist — a Calendar event will be created."

## Checklist antes de enviar

- [ ] Vídeo horizontal 1920x1080, 2m30s–3m
- [ ] Consent screen mostrada com scopes 100% legíveis, sem grouping
- [ ] Narração explicou POR QUÊ cada scope + POR QUÊ narrower não serve
- [ ] Contas de teste sem 2FA/telefone/cartão
- [ ] YouTube unlisted, link testado em janela anônima
- [ ] Reply direto no email (não nova submissão)
- [ ] Cloud Console: scopes ainda são `calendar.events` + `calendar.readonly` (nada foi mudado)

## Se cansada demais pra gravar hoje

Verification demora 2-4 semanas mesmo depois de aprovar o vídeo. 1-2 dias a mais no reply não muda nada. Prioriza descanso.

Enquanto isso: até 100 usuárias novas conseguem conectar via "Avançado → Ir para NailNow (não seguro)". Se conta chegar perto de 100, criar projeto GCP separado só pra dev/demo (a produção segue com `plexiform-style-477301-j4`).
 
 
