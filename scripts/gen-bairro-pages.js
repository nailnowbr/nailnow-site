// Gera páginas de recrutamento por bairro seguindo o mesmo padrão de
// trabalhar-como-manicure-porto-alegre.html.
//
// Rodar: node scripts/gen-bairro-pages.js
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.resolve(__dirname, '..');

const bairros = [
  {
    slug: 'trabalhar-como-manicure-vila-ipiranga',
    bairro: 'Vila Ipiranga',
    bairroSlug: 'vila-ipiranga',
    cidade: 'Porto Alegre',
    cidadeSlug: 'porto-alegre',
    uf: 'RS',
    geoRegion: 'BR-RS',
    geo: '-30.0161;-51.1852',
    demandaContext: 'Vila Ipiranga foi um dos bairros com mais pedidos abertos na plataforma nos últimos 45 dias (5 solicitações). Hoje temos apenas 1 manicure atendendo a região.',
    proximos: 'Passo d\'Areia, Sarandi, Jardim Lindóia, Cristo Redentor, Jardim Itu, Higienópolis',
    salarioMin: 60, salarioMax: 200,
    zonaBusca: 'zona norte de Porto Alegre',
    keywordsExtras: 'manicure vila ipiranga, manicure zona norte poa, manicure a domicilio vila ipiranga',
  },
  {
    slug: 'trabalhar-como-manicure-jardim-carvalho',
    bairro: 'Jardim Carvalho',
    bairroSlug: 'jardim-carvalho',
    cidade: 'Porto Alegre',
    cidadeSlug: 'porto-alegre',
    uf: 'RS',
    geoRegion: 'BR-RS',
    geo: '-30.0685;-51.1487',
    demandaContext: 'Jardim Carvalho teve 3 solicitações de clientes na plataforma nos últimos 45 dias e ZERO manicures cadastradas na região. Quem começar primeiro atende toda a demanda local.',
    proximos: 'Chácara das Pedras, Três Figueiras, Bela Vista, Petrópolis, Jardim do Salso, Boa Vista',
    salarioMin: 60, salarioMax: 220,
    zonaBusca: 'zona leste de Porto Alegre',
    keywordsExtras: 'manicure jardim carvalho, manicure chacara das pedras, manicure zona leste poa',
  },
  {
    slug: 'trabalhar-como-manicure-bela-vista-poa',
    bairro: 'Bela Vista',
    bairroSlug: 'bela-vista-poa',
    cidade: 'Porto Alegre',
    cidadeSlug: 'porto-alegre',
    uf: 'RS',
    geoRegion: 'BR-RS',
    geo: '-30.0403;-51.1926',
    demandaContext: 'Bela Vista teve 3 solicitações recentes de clientes na plataforma e nenhuma manicure cadastrada no bairro. Ticket médio da região tende a ser maior por ser bairro nobre.',
    proximos: 'Moinhos de Vento, Auxiliadora, Rio Branco, Mont\'Serrat, Boa Vista, Higienópolis',
    salarioMin: 70, salarioMax: 250,
    zonaBusca: 'zona norte de Porto Alegre',
    keywordsExtras: 'manicure bela vista poa, manicure moinhos de vento, manicure zona norte poa',
  },
  {
    slug: 'trabalhar-como-manicure-jardim-itu',
    bairro: 'Jardim Itu',
    bairroSlug: 'jardim-itu',
    cidade: 'Porto Alegre',
    cidadeSlug: 'porto-alegre',
    uf: 'RS',
    geoRegion: 'BR-RS',
    geo: '-30.0059;-51.1662',
    demandaContext: 'Jardim Itu teve 2 solicitações de clientes recentemente na plataforma e ZERO manicures cadastradas ali. Bairro com potencial pra construir uma clientela fixa.',
    proximos: 'Sarandi, Vila Ipiranga, Passo das Pedras, Jardim Sabará, Mário Quintana, Rubem Berta',
    salarioMin: 60, salarioMax: 180,
    zonaBusca: 'zona norte de Porto Alegre',
    keywordsExtras: 'manicure jardim itu, manicure zona norte poa, manicure sarandi',
  },
  {
    slug: 'trabalhar-como-manicure-bras-sp',
    bairro: 'Brás',
    bairroSlug: 'bras-sp',
    cidade: 'São Paulo',
    cidadeSlug: 'sao-paulo',
    uf: 'SP',
    geoRegion: 'BR-SP',
    geo: '-23.5410;-46.6098',
    demandaContext: 'Brás teve 2 pedidos de clientes NailNow em julho e nenhuma manicure cadastrada no bairro. Chegando primeiro, você fica sozinha atendendo a região.',
    proximos: 'Mooca, Pari, Tatuapé, Belenzinho, Bom Retiro, Sé, Belém',
    salarioMin: 70, salarioMax: 220,
    zonaBusca: 'zona leste de São Paulo',
    keywordsExtras: 'manicure bras sp, manicure mooca, manicure zona leste sp',
  },
  {
    slug: 'trabalhar-como-manicure-republica-sp',
    bairro: 'República',
    bairroSlug: 'republica-sp',
    cidade: 'São Paulo',
    cidadeSlug: 'sao-paulo',
    uf: 'SP',
    geoRegion: 'BR-SP',
    geo: '-23.5445;-46.6420',
    demandaContext: 'República é uma região central de SP com grande potencial de demanda corporativa (escritórios e coworkings) e residencial. Hoje não temos manicures cadastradas ali — quem chegar primeiro atende toda a região central.',
    proximos: 'Sé, Consolação, Vila Buarque, Santa Cecília, Higienópolis, Bela Vista, Centro',
    salarioMin: 70, salarioMax: 250,
    zonaBusca: 'centro de São Paulo',
    keywordsExtras: 'manicure republica sp, manicure centro sp, manicure vila buarque, manicure santa cecilia',
  },
];

function tpl(b) {
  const cidadeUF = `${b.cidade}, ${b.uf}`;
  const cidadePath = `/manicure-a-domicilio-${b.cidadeSlug}`;
  const trabalharCidadePath = `/trabalhar-como-manicure-${b.cidadeSlug}`;
  return `<!doctype html>
<html lang="pt-BR" class="no-js">
  <head>
    <script src="/assets/js/force-https.js"></script>
    <script src="/assets/js/tracking.js" defer></script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-NKTL1PLZ2J"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', 'G-NKTL1PLZ2J');
      gtag('config', 'AW-18272743310');
    </script>

    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#F45CA2" />
    <meta name="apple-mobile-web-app-title" content="NailNow" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="description" content="Trabalhar como manicure em ${b.bairro}, ${cidadeUF}: cadastro gratuito na NailNow, agenda flexível, atendimento a domicílio e clientes reais na sua região. ${b.demandaContext}" />
    <meta name="keywords" content="trabalhar como manicure em ${b.bairro.toLowerCase()}, vagas manicure ${b.bairro.toLowerCase()}, manicure ${b.bairro.toLowerCase()} ${b.cidade.toLowerCase()}, manicure autonoma ${b.bairro.toLowerCase()}, cadastro manicure app ${b.cidade.toLowerCase()}, ${b.keywordsExtras}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="https://nailnow.app/${b.slug}" />
    <link rel="alternate" hreflang="pt-BR" href="https://nailnow.app/${b.slug}" />
    <meta name="geo.region" content="${b.geoRegion}" />
    <meta name="geo.placename" content="${b.bairro}, ${b.cidade}" />
    <meta name="geo.position" content="${b.geo}" />
    <meta name="ICBM" content="${b.geo.replace(';', ', ')}" />
    <meta property="og:site_name" content="NailNow" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:title" content="Trabalhar como Manicure em ${b.bairro}, ${b.cidade} | NailNow" />
    <meta property="og:description" content="Cadastre-se na NailNow como manicure em ${b.bairro} (${b.cidade}). Agenda flexível, clientes verificadas, pagamento digital e atendimento a domicílio na região." />
    <meta property="og:url" content="https://nailnow.app/${b.slug}" />
    <meta property="og:image" content="https://nailnow.app/assets/nail1.jpg" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="787" />
    <meta property="og:image:height" content="1000" />
    <meta property="og:image:alt" content="NailNow — manicure e pedicure a domicílio" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Trabalhar como Manicure em ${b.bairro}, ${b.cidade} | NailNow" />
    <meta name="twitter:description" content="Cadastre-se na NailNow como manicure em ${b.bairro} (${b.cidade}). Agenda flexível, pagamento digital, atendimento a domicílio na região." />
    <meta name="twitter:image" content="https://nailnow.app/assets/nail1.jpg" />
    <title>Trabalhar como Manicure em ${b.bairro}, ${b.cidade} | NailNow</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/styles.css" />
    <link rel="icon" type="image/svg+xml" href="/assets/nailnow-logo.svg" />
    <script src="/assets/js/menu-toggle.js" defer></script>
    <style>
      .local-seo-page main { max-width: 1080px; margin: 0 auto; padding: 56px 20px 72px; }
      .local-hero, .local-section, .local-faq, .local-cta { background: var(--card); border: 1px solid #f7d7e7; border-radius: 24px; box-shadow: var(--shadow); }
      .local-hero { padding: 36px; margin-bottom: 24px; }
      .local-hero__grid, .local-section__grid, .local-faq__grid { display: grid; gap: 18px; }
      .local-hero__grid { grid-template-columns: 1.4fr 0.9fr; align-items: start; }
      .local-card, .local-faq-item { background: #fff9fc; border: 1px solid #f6d5e7; border-radius: 18px; padding: 20px; }
      .local-card h2, .local-section h2, .local-faq h2, .local-cta h2 { margin-top: 0; }
      .local-section, .local-faq, .local-cta { padding: 32px; margin-bottom: 24px; }
      .local-section__grid, .local-faq__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .local-cta { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
      .local-links { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 18px; }
      .local-links a { display: inline-flex; align-items: center; justify-content: center; padding: 10px 16px; border-radius: 999px; text-decoration: none; border: 1px solid #f1bfd9; color: var(--text); background: #fff; }
      .local-highlights { margin: 0; padding-left: 20px; color: var(--muted); line-height: 1.7; }
      .local-breadcrumbs { font-size: 13px; color: #814D68; opacity: .8; margin: 8px 0 16px; }
      .local-breadcrumbs a { color: #F45CA2; text-decoration: none; }
      .local-breadcrumbs a:hover { text-decoration: underline; }
      @media (max-width: 820px) {
        .local-hero__grid, .local-section__grid, .local-faq__grid, .local-cta { grid-template-columns: 1fr; display: grid; }
        .local-hero, .local-section, .local-faq, .local-cta { padding: 24px; }
      }
    </style>
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": "Manicure a domicílio em ${b.bairro} (${b.cidade}) — autônoma / parceira NailNow",
        "description": "<p>A NailNow busca manicures autônomas em ${b.bairro}, ${b.cidade} (${b.uf}), para atendimento a domicílio pela plataforma. ${b.demandaContext} Você monta sua agenda, define seus horários e serviços, e recebe pagamento digital com split automático direto na sua conta.</p><p><strong>Requisitos:</strong> experiência com manicure/pedicure, materiais próprios, celular com internet, disponibilidade para atendimento a domicílio.</p><p><strong>Como funciona:</strong> cadastro rápido pelo site, envio de portfólio e documentos, aprovação e onboarding pela equipe NailNow.</p>",
        "identifier": { "@type": "PropertyValue", "name": "NailNow", "value": "nailnow-manicure-${b.bairroSlug}" },
        "datePosted": "2026-07-12",
        "validThrough": "2027-07-12",
        "employmentType": ["CONTRACTOR", "PART_TIME"],
        "hiringOrganization": { "@type": "Organization", "name": "NailNow", "sameAs": "https://nailnow.app/", "logo": "https://nailnow.app/assets/nailnow-logo.svg" },
        "jobLocation": [
          { "@type": "Place", "address": { "@type": "PostalAddress", "addressLocality": "${b.cidade}", "addressRegion": "${b.uf}", "addressCountry": "BR" } }
        ],
        "applicantLocationRequirements": [
          { "@type": "City", "name": "${b.cidade}" }
        ],
        "baseSalary": {
          "@type": "MonetaryAmount",
          "currency": "BRL",
          "value": {
            "@type": "QuantitativeValue",
            "minValue": ${b.salarioMin},
            "maxValue": ${b.salarioMax},
            "unitText": "HOUR"
          }
        },
        "directApply": true,
        "url": "https://nailnow.app/${b.slug}"
      }
    </script>
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "NailNow", "item": "https://nailnow.app/" },
          { "@type": "ListItem", "position": 2, "name": "Sou Manicure", "item": "https://nailnow.app/profissional" },
          { "@type": "ListItem", "position": 3, "name": "${b.cidade}", "item": "https://nailnow.app${trabalharCidadePath}" },
          { "@type": "ListItem", "position": 4, "name": "${b.bairro}", "item": "https://nailnow.app/${b.slug}" }
        ]
      }
    </script>
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "Quero ser manicure NailNow em ${b.bairro}. Como funciona?", "acceptedAnswer": { "@type": "Answer", "text": "Você faz o cadastro pelo site, envia documentos e portfólio. Depois de aprovada, começa a receber solicitações de clientes em ${b.bairro} e bairros próximos, dentro do raio de atendimento que você definir." } },
          { "@type": "Question", "name": "Tem cliente pedindo manicure em ${b.bairro}?", "acceptedAnswer": { "@type": "Answer", "text": "${b.demandaContext}" } },
          { "@type": "Question", "name": "Preciso morar em ${b.bairro} pra atender ali?", "acceptedAnswer": { "@type": "Answer", "text": "Não precisa morar no bairro. Você define seu raio de atendimento (em km) e a plataforma envia pedidos compatíveis. Muitas manicures moram em um bairro e atendem outros próximos." } },
          { "@type": "Question", "name": "Como recebo os pagamentos?", "acceptedAnswer": { "@type": "Answer", "text": "Pagamento digital (PIX ou cartão) via plataforma. O valor cai direto na sua conta com split automático, sem cobrar taxas separadas da cliente." } },
          { "@type": "Question", "name": "Precisa ter CNPJ ou MEI?", "acceptedAnswer": { "@type": "Answer", "text": "Não é obrigatório começar com CNPJ. Muitas profissionais começam como autônomas e abrem MEI depois. A NailNow te orienta ao longo do processo." } },
          { "@type": "Question", "name": "Vou trabalhar exclusivamente pra NailNow?", "acceptedAnswer": { "@type": "Answer", "text": "Não. Você continua autônoma e pode atender clientes de outras fontes. A NailNow é canal adicional pra encher sua agenda, sem exclusividade e sem taxa fixa mensal." } }
        ]
      }
    </script>
  </head>
  <body class="local-seo-page">
    <header class="nn-topbar">
      <div class="nn-tb-wrap">
        <a class="nn-tb-brand" href="/" aria-label="Início da NailNow">
          <img src="/assets/nailnow-logo.svg" alt="Logotipo da NailNow" />
          NailNow
        </a>
        <nav class="nn-tb-nav" aria-label="Principal">
          <a href="/">Home</a>
          <a href="/como-funciona">Como funciona</a>
          <a href="/beneficio-corporativo">Benefício corporativo</a>
          <a href="/feedbacks">Feedbacks</a>
          <div class="nn-tb-drop">
            <button class="nn-tb-drop-toggle" type="button" aria-haspopup="true" aria-expanded="false">Cidades <span class="nn-tb-drop-caret" aria-hidden="true">▾</span></button>
            <div class="nn-tb-drop-menu" hidden>
              <a href="/manicure-a-domicilio-porto-alegre">Manicure em Porto Alegre</a>
              <a href="/manicure-a-domicilio-sao-paulo">Manicure em São Paulo</a>
              <div class="nn-tb-drop-divider"></div>
              <a href="/trabalhar-como-manicure-porto-alegre">Sou manicure em POA</a>
              <a href="/trabalhar-como-manicure-sao-paulo">Sou manicure em SP</a>
            </div>
          </div>
        </nav>
        <div class="nn-tb-actions">
          <a class="nn-tb-btn is-ghost" href="/app-profissional">Sou Manicure</a>
          <a class="nn-tb-btn is-solid" href="/app-cliente">Sou Cliente</a>
        </div>
        <button class="nn-tb-toggle" id="nnTbToggle" aria-label="Abrir menu" aria-expanded="false">☰</button>
      </div>
      <div class="nn-tb-mobile" id="nnTbMobile" hidden>
        <a class="nn-tb-m-link" href="/">Home</a>
        <a class="nn-tb-m-link" href="/como-funciona">Como funciona</a>
        <a class="nn-tb-m-link" href="/beneficio-corporativo">Benefício corporativo</a>
        <a class="nn-tb-m-link" href="/feedbacks">Feedbacks</a>
        <div class="nn-tb-m-drop">
          <button class="nn-tb-m-drop-toggle" type="button" aria-expanded="false">Cidades <span class="nn-tb-m-drop-caret" aria-hidden="true">▾</span></button>
          <div class="nn-tb-m-drop-menu" hidden>
            <a href="/manicure-a-domicilio-porto-alegre">Manicure em Porto Alegre</a>
            <a href="/manicure-a-domicilio-sao-paulo">Manicure em São Paulo</a>
            <a href="/trabalhar-como-manicure-porto-alegre">Sou manicure em POA</a>
            <a href="/trabalhar-como-manicure-sao-paulo">Sou manicure em SP</a>
          </div>
        </div>
        <div class="nn-tb-m-actions">
          <a class="nn-tb-btn is-ghost" href="/app-profissional">Sou Manicure</a>
          <a class="nn-tb-btn is-solid" href="/app-cliente">Sou Cliente</a>
        </div>
      </div>
    </header>

    <main>
      <nav class="local-breadcrumbs" aria-label="Breadcrumb">
        <a href="/">NailNow</a> · <a href="/app-profissional">Sou Manicure</a> · <a href="${trabalharCidadePath}">${b.cidade}</a> · <span aria-current="page">${b.bairro}</span>
      </nav>
      <section class="local-hero">
        <div class="local-hero__grid">
          <div>
            <span class="eyebrow">Vaga · Manicure autônoma · ${b.bairro}, ${b.cidade}</span>
            <h1>Trabalhar como manicure em ${b.bairro} (${b.cidade})</h1>
            <p>${b.demandaContext} A NailNow é gratuita pra você se cadastrar e não tem taxa mensal — o repasse é <strong>direto na sua conta, com split automático</strong>. Ganho por atendimento fica entre R$ ${b.salarioMin} e R$ ${b.salarioMax} dependendo do serviço.</p>
            <p>Você define seus horários, seu raio de atendimento e seus serviços (manicure, pedicure, gel, blindagem, alongamento). A gente cuida da divulgação, do agendamento e da cobrança. Sem exclusividade.</p>
            <div class="local-links">
              <a href="/app-profissional">Fazer cadastro grátis</a>
              <a href="${trabalharCidadePath}">Ver todas as vagas em ${b.cidade}</a>
              <a href="/faq">Tirar dúvidas</a>
              <a href="${cidadePath}">Sou cliente em ${b.cidade}</a>
            </div>
          </div>
          <aside class="local-card" aria-label="Por que atender em ${b.bairro}">
            <h2>Por que ${b.bairro}?</h2>
            <ul class="local-highlights">
              <li><strong>Demanda validada</strong>: clientes reais buscando manicure ali.</li>
              <li><strong>Baixa concorrência</strong>: poucas ou nenhuma manicure NailNow no bairro hoje.</li>
              <li>Agenda 100% flexível — você escolhe dias e horários.</li>
              <li>Pagamento digital com split automático via app.</li>
              <li>Sem taxa mensal, sem exclusividade.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section class="local-section">
        <h2>Como funciona pra manicures em ${b.bairro}</h2>
        <div class="local-section__grid">
          <article class="local-card">
            <h3>1. Cadastro rápido</h3>
            <p>Preencha o cadastro pelo site com seus dados, portfólio e documento. Menos de 10 minutos.</p>
          </article>
          <article class="local-card">
            <h3>2. Aprovação e onboarding</h3>
            <p>Nossa equipe revisa seu perfil, valida experiência e alinha detalhes. Aprovação típica em 24–48h.</p>
          </article>
          <article class="local-card">
            <h3>3. Ative sua agenda</h3>
            <p>Defina raio de atendimento (que cobre ${b.bairro} e vizinhos), dias, horários e valores.</p>
          </article>
          <article class="local-card">
            <h3>4. Receba solicitações</h3>
            <p>Clientes agendam pelo app. Você confirma ou recusa. Depois do atendimento, o valor cai automático na sua conta.</p>
          </article>
        </div>
      </section>

      <section class="local-section">
        <h2>Bairros próximos que você pode atender</h2>
        <p>Definindo raio de 5–8 km a partir de ${b.bairro}, sua área de atendimento cobre também:</p>
        <p><strong>${b.proximos}</strong> — todos na ${b.zonaBusca}.</p>
      </section>

      <section class="local-faq">
        <h2>Perguntas frequentes — manicure NailNow em ${b.bairro}</h2>
        <div class="local-faq__grid">
          <article class="local-faq-item">
            <h3>Tem cliente pedindo em ${b.bairro}?</h3>
            <p>${b.demandaContext}</p>
          </article>
          <article class="local-faq-item">
            <h3>Preciso morar no bairro?</h3>
            <p>Não. Você define seu raio de atendimento em km e recebe pedidos compatíveis. Muitas manicures moram em um bairro e atendem outros próximos.</p>
          </article>
          <article class="local-faq-item">
            <h3>Como recebo o pagamento?</h3>
            <p>PIX ou cartão via plataforma, com split automático. Valor cai direto na sua conta, sem cobrar taxa extra da cliente.</p>
          </article>
          <article class="local-faq-item">
            <h3>Preciso de CNPJ ou MEI?</h3>
            <p>Não obrigatório no começo. A maioria começa autônoma e depois abre MEI. Te orientamos no processo.</p>
          </article>
          <article class="local-faq-item">
            <h3>Preciso de experiência prévia?</h3>
            <p>Sim. Manicure/pedicure com portfólio de trabalhos reais. Validamos experiência antes de aprovar.</p>
          </article>
          <article class="local-faq-item">
            <h3>Tem exclusividade?</h3>
            <p>Não. Você continua autônoma e pode atender de outros canais. NailNow é canal adicional pra encher sua agenda.</p>
          </article>
        </div>
      </section>

      <section class="local-cta">
        <div>
          <span class="eyebrow">Próximo passo</span>
          <h2>Faça seu cadastro como manicure NailNow em ${b.bairro}</h2>
          <p>Cadastro grátis, sem taxa mensal e sem exclusividade. Comece a receber clientes verificadas em ${b.bairro} e bairros próximos.</p>
        </div>
        <a href="/app-profissional" class="btn">Cadastrar como manicure</a>
      </section>
    </main>

    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-column footer-column--brand">
          <h2 class="footer-logo">NailNow</h2>
          <p>Beleza na sua agenda com profissionais selecionadas, atendimento onde você estiver e suporte humanizado.</p>
        </div>
        <div class="footer-column footer-links" aria-label="Links úteis">
          <h3>Links úteis</h3>
          <a href="/servicos">Serviços</a>
          <a href="/faq">Perguntas frequentes</a>
          <a href="/conteudo">Conteúdo</a>
        </div>
        <div class="footer-column footer-links" aria-label="Cidades atendidas">
          <h3>Cidades atendidas</h3>
          <a href="/manicure-a-domicilio-sao-paulo">São Paulo</a>
          <a href="/manicure-a-domicilio-porto-alegre">Porto Alegre</a>
        </div>
      </div>
      <p class="footer-copy">© NailNow 2026. Todos os direitos reservados. NAILNOW SERVICOS DIGITAIS LTDA</p>
    </footer>
  </body>
</html>
`;
}

let ok = 0;
for (const b of bairros) {
  const html = tpl(b);
  const outPath = path.join(OUT_DIR, `${b.slug}.html`);
  fs.writeFileSync(outPath, html, 'utf8');
  console.log('wrote', outPath, `(${html.length} bytes)`);
  ok++;
}
console.log(`\n${ok}/${bairros.length} páginas geradas.`);
