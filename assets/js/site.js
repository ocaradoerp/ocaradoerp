(function(){
  // Carrega Google Analytics 4 e Meta Pixel a partir de /assets/js/config.js
  var T = window.OCDE_TRACK || {};
  if (T.ga4) {
    var g = document.createElement('script'); g.async = true;
    g.src = 'https://www.googletagmanager.com/gtag/js?id=' + T.ga4; document.head.appendChild(g);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    gtag('js', new Date()); gtag('config', T.ga4);
  }
  if (T.pixel) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', T.pixel); fbq('track', 'PageView');
  }
})();
(function(){
  var ZAP = '5516999864902';
  var params = new URLSearchParams(location.search);
  var origem = (params.get('origem') || params.get('utm_source') || document.body.getAttribute('data-origem') || '').toLowerCase();
  var fmt = new Intl.NumberFormat('pt-BR');

  // Faixa de boas-vindas na página inicial (domínios redirecionados)
  var faixa = document.getElementById('origem');
  var textos = { bling: 'Veio do Bling? Migração é comigo.', tiny: 'Tiny e Olist: é comigo mesmo.' };
  if (faixa && textos[origem]) { faixa.textContent = textos[origem]; faixa.hidden = false; }

  function rastrear(evento, dados){
    dados = dados || {};
    if (origem) dados.origem = origem;
    try { window.dataLayer = window.dataLayer || []; dataLayer.push(Object.assign({event: evento}, dados)); } catch(e){}
    try { if (window.gtag) gtag('event', evento, dados); } catch(e){}
    try { if (window.fbq) fbq('trackCustom', evento, dados); } catch(e){}
  }
  function lead(){ try { if (window.fbq) fbq('track','Lead'); } catch(e){} try { if (window.gtag) gtag('event','generate_lead'); } catch(e){} }

  // Calculadora
  var totalAno = 0;
  var p = document.getElementById('pessoas'), h = document.getElementById('horas');
  if (p && h) {
    var rH = document.getElementById('r-horas'), rT = document.getElementById('r-texto');
    var calcular = function(){
      var pessoas = +p.value, horas = +h.value;
      document.getElementById('o-pessoas').textContent = pessoas + (pessoas === 1 ? ' pessoa' : ' pessoas');
      document.getElementById('o-horas').textContent = horas + ' h';
      totalAno = pessoas * horas * 48;
      var semanas = Math.round(totalAno / 44);
      rH.textContent = fmt.format(totalAno);
      rT.textContent = semanas >= 52
        ? 'É como pagar ' + fmt.format(Math.round(semanas/52*10)/10) + ' funcionário(s) o ano inteiro só para retrabalho. Esse é o tempo que a gente vai buscar de volta.'
        : 'É como ter uma pessoa trabalhando ' + semanas + ' semanas inteiras só em retrabalho. Esse é o tempo que a gente vai buscar de volta.';
    };
    p.addEventListener('input', calcular); h.addEventListener('input', calcular); calcular();
    var cta = document.getElementById('r-cta');
    if (cta) cta.addEventListener('click', function(){ rastrear('calculadora_cta', {horas_ano: totalAno}); });
  }

  // Cliques
  document.querySelectorAll('[data-zap]').forEach(function(a){
    a.addEventListener('click', function(){ rastrear('clique_whatsapp', {local: a.getAttribute('data-zap')}); lead(); });
    if (origem && a.href.indexOf('?') < 0) { a.href += '?text=' + encodeURIComponent('Olá, Guilherme! Vim pelo site (' + origem + ').'); }
  });
  document.querySelectorAll('[data-parceiro]').forEach(function(a){
    a.addEventListener('click', function(){ rastrear('clique_parceiro', {parceiro: a.getAttribute('data-parceiro')}); });
  });
  document.querySelectorAll('[data-kit]').forEach(function(a){
    a.addEventListener('click', function(){ rastrear('pedir_kit'); });
  });
  document.querySelectorAll('[data-comunidade]').forEach(function(a){
    a.addEventListener('click', function(){ rastrear('entrar_comunidade'); });
  });

  // Formulário → WhatsApp
  var form = document.getElementById('form-cotacao');
  if (form) form.addEventListener('submit', function(ev){
    ev.preventDefault();
    var f = new FormData(form);
    var nome = (f.get('nome') || '').trim();
    var erro = document.getElementById('f-erro');
    if (!nome) { erro.hidden = false; document.getElementById('f-nome').focus(); return; }
    erro.hidden = true;
    var canais = f.getAll('canais').join(', ') || 'não informado';
    var linhas = [
      'Olá, Guilherme! Quero cotar um projeto.',
      '',
      '*Nome:* ' + nome,
      (f.get('empresa') || '').trim() ? '*Empresa:* ' + f.get('empresa').trim() : null,
      '*Onde vendo:* ' + canais,
      '*Sistema atual:* ' + f.get('erp'),
      '*Pedidos/mês:* ' + f.get('pedidos'),
      '*Preciso de:* ' + f.get('interesse'),
      (f.get('msg') || '').trim() ? '*Maior dor:* ' + f.get('msg').trim() : null,
      totalAno ? '*Tempo perdido (calculadora):* ' + fmt.format(totalAno) + ' h/ano' : null,
      origem ? '*Origem:* ' + origem : null
    ].filter(function(x){ return x !== null; });
    rastrear('enviar_cotacao', {interesse: f.get('interesse'), erp: f.get('erp'), pedidos: f.get('pedidos')});
    lead();
    window.open('https://wa.me/' + ZAP + '?text=' + encodeURIComponent(linhas.join('\n')), '_blank', 'noopener');
  });

  // Voltar ao topo
  var topo = document.querySelector('.topo-btn');
  if (topo) {
    var checar = function(){ topo.classList.toggle('ativo', window.scrollY > 700); };
    window.addEventListener('scroll', checar, {passive: true}); checar();
    topo.addEventListener('click', function(){
      var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({top: 0, behavior: reduzir ? 'auto' : 'smooth'});
      var alvo = document.querySelector('.marca'); if (alvo) alvo.focus({preventScroll: true});
    });
  }

  var ano = document.getElementById('ano'); if (ano) ano.textContent = new Date().getFullYear();
})();
