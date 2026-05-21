(function () {
  'use strict';

  function fire(pixelName, pixelParams, gaName, gaParams) {
    try {
      if (typeof window.fbq === 'function') {
        window.fbq('track', pixelName, pixelParams || {});
      }
    } catch (e) {}
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', gaName, gaParams || {});
      }
    } catch (e) {}
  }

  function matchTarget(el) {
    var a = el.closest ? el.closest('a') : null;
    if (!a) return null;
    var href = (a.getAttribute('href') || '').toLowerCase();

    if (href.indexOf('apps.apple.com') !== -1) {
      return { pixel: 'Lead', pixelParams: { content_name: 'app_store', store: 'ios' }, ga: 'download_app', gaParams: { store: 'ios' } };
    }
    if (href.indexOf('play.google.com') !== -1) {
      return { pixel: 'Lead', pixelParams: { content_name: 'google_play', store: 'android' }, ga: 'download_app', gaParams: { store: 'android' } };
    }
    if (href.indexOf('wa.me') !== -1 || href.indexOf('whatsapp.com') !== -1) {
      return { pixel: 'Contact', pixelParams: { channel: 'whatsapp' }, ga: 'contact', gaParams: { channel: 'whatsapp' } };
    }
    if (a.classList && a.classList.contains('header-cta')) {
      var role = href.indexOf('profissional') !== -1 ? 'manicure' : (href.indexOf('cliente') !== -1 ? 'cliente' : 'desconhecido');
      return { pixel: 'ViewContent', pixelParams: { content_name: 'cta_' + role, role: role }, ga: 'select_audience', gaParams: { role: role } };
    }
    return null;
  }

  document.addEventListener('click', function (event) {
    var hit = matchTarget(event.target);
    if (hit) fire(hit.pixel, hit.pixelParams, hit.ga, hit.gaParams);
  }, true);

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!form || !form.id) return;
    if (form.id === 'nn-b2b-form') {
      fire('Lead', { content_name: 'b2b_form' }, 'generate_lead', { source: 'b2b_form' });
    }
  }, true);
})();
