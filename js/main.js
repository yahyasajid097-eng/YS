/* ==========================================================================
   Moon Blossom — main.js
   i18n bootstrap, header/footer render, nav behaviour, shared utilities
   ========================================================================== */

const MB = (() => {

  const DATA_PATH = (window.MB_BASE || '') + 'data/';
  const state = {
    lang: localStorage.getItem('mb_lang') || 'en',
    translations: null,
    store: null,
    catalog: null
  };

  /* ---------------- fetch helpers ---------------- */
  async function fetchJSON(path){
    const res = await fetch(path, { cache: 'no-cache' });
    if(!res.ok) throw new Error('Failed to load ' + path);
    return res.json();
  }

  async function loadCore(){
    const [translations, store] = await Promise.all([
      fetchJSON(DATA_PATH + 'translations.json'),
      fetchJSON(DATA_PATH + 'store.json')
    ]);
    state.translations = translations;
    state.store = store;
    return { translations, store };
  }

  async function loadCatalog(){
    if(state.catalog) return state.catalog;
    state.catalog = await fetchJSON(DATA_PATH + 'products.json');
    return state.catalog;
  }

  function t(key){
    const dict = state.translations[state.lang] || state.translations.en;
    return key.split('.').reduce((o,k)=> (o && o[k] !== undefined) ? o[k] : key, dict);
  }

  function fieldT(obj){
    if(!obj) return '';
    return obj[state.lang] || obj.en || '';
  }

  function formatPrice(n){
    const symbol = state.store.currencySymbol || 'DH';
    const formatted = Number(n).toLocaleString(state.lang === 'ar' ? 'ar-MA' : (state.lang === 'fr' ? 'fr-MA' : 'en-US'));
    return `${formatted} ${symbol}`;
  }

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  }

  /* ---------------- icon library (signature crescent + bag glyphs) ---------------- */
  const icons = {
    crescent: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.5 3.5C11 5 8.5 9 8.5 13.5C8.5 18 11 20.5 15.5 22C10 22.5 5 18 5 12.5C5 7 10 2.5 15.5 3.5Z" fill="#D4AF37"/></svg>`,
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20L15 15" stroke-linecap="round"/></svg>`,
    bag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 8H18L19 21H5L6 8Z" stroke-linejoin="round"/><path d="M9 8V6C9 4 10.3 2.5 12 2.5C13.7 2.5 15 4 15 6V8" stroke-linecap="round"/></svg>`,
    heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20.5C12 20.5 3 15 3 8.8C3 5.6 5.4 3.5 8.2 3.5C10 3.5 11.3 4.4 12 5.6C12.7 4.4 14 3.5 15.8 3.5C18.6 3.5 21 5.6 21 8.8C21 15 12 20.5 12 20.5Z" stroke-linejoin="round"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 5L19 19M19 5L5 19" stroke-linecap="round"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12.5L9.5 18L20 6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 4V20M4 12H20" stroke-linecap="round"/></svg>`,
    globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12H21M12 3C14.5 5.7 15.8 8.7 15.8 12C15.8 15.3 14.5 18.3 12 21C9.5 18.3 8.2 15.3 8.2 12C8.2 8.7 9.5 5.7 12 3Z"/></svg>`,
    truck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 6H14V17H2V6Z" stroke-linejoin="round"/><path d="M14 10H18L21 13V17H14V10Z" stroke-linejoin="round"/><circle cx="6" cy="19" r="1.8"/><circle cx="17" cy="19" r="1.8"/></svg>`,
    leaf: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 20C4 12 9 4 20 4C20 15 12 20 4 20Z" stroke-linejoin="round"/><path d="M4 20C8 16 12 12 20 4" stroke-linecap="round"/></svg>`,
    shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3L20 6.5V11C20 16 16.5 19.5 12 21C7.5 19.5 4 16 4 11V6.5L12 3Z" stroke-linejoin="round"/></svg>`,
    pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21C12 21 19 14.5 19 9.5C19 5.4 15.6 2 12 2C8.4 2 5 5.4 5 9.5C5 14.5 12 21 12 21Z" stroke-linejoin="round"/><circle cx="12" cy="9.5" r="2.5"/></svg>`,
    mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 6L12 13L21 6" stroke-linecap="round"/></svg>`,
    phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 3H9L11 8L8.5 9.5C9.5 12 11.5 14 14 15L15.5 12.5L20.5 14.5V17.5C20.5 19 19.2 20.2 17.7 20C10.5 19 4.5 13 3.5 5.8C3.3 4.3 4.5 3 6 3Z" stroke-linejoin="round"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7V12L15.5 14" stroke-linecap="round"/></svg>`,
    whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.1-.6.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.2-.5.1-.2 0-.4 0-.5C10 9 9.4 7.5 9.1 7c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 2-1.4.2-.6.2-1.2.1-1.3-.1-.1-.3-.2-.6-.3z"/><path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.6 1.4 5.2L2 22l4.9-1.3C8.4 21.5 10.1 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.7 0-3.3-.5-4.7-1.3l-.3-.2-3.5.9.9-3.4-.2-.3C3.5 14.4 3 12.7 3 11 3 6.6 6.6 3 12 3s9 3.6 9 8-4 9.2-9 9.2z"/></svg>`,
    star: `★`,
    starOutline: `☆`
  };

  function svgIcon(name){ return icons[name] || ''; }

  /* ---------------- product media: real photo if provided, else illustration ---------------- */
  function productMedia(p, colorHex, imgIndex){
    const hex = colorHex || (p.colors && p.colors[0] && p.colors[0].hex) || '#D4AF37';
    if(p.images && p.images.length){
      const idx = (typeof imgIndex === 'number' && p.images[imgIndex]) ? imgIndex : 0;
      const src = escapeHtml(p.images[idx]);
      const alt = escapeHtml(fieldT(p.name));
      return `<img src="${src}" alt="${alt}" loading="lazy" onerror="MBImgFallback(this,'${p.category}','${hex}')">`;
    }
    return bagIllustration(p.category, hex);
  }

  /* ---------------- bag illustration (per category, tinted) ---------------- */
  function bagIllustration(category, hex){
    const c = hex || '#D4AF37';
    const handles = {
      tote: `<path d="M32 34V24C32 15 39 8 50 8C61 8 68 15 68 24V34" stroke="${c}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
      shoulder: `<path d="M30 30C28 14 34 4 50 4C58 4 62 10 62 16" stroke="${c}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
      clutch: `<path d="M38 24C38 16 43 11 50 11C57 11 62 16 62 24" stroke="${c}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-dasharray="2 5"/>`,
      crossbody: `<path d="M22 20C22 20 40 2 50 2C60 2 78 20 78 20" stroke="${c}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.55"/><path d="M34 30V22C34 16 40 12 50 12C60 12 66 16 66 22V30" stroke="${c}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
      mini: `<path d="M40 26V20C40 15 44 11 50 11C56 11 60 15 60 20V26" stroke="${c}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`
    };
    const bodies = {
      tote: `<path d="M20 34H80L75 92H25L20 34Z" stroke="${c}" stroke-width="2" fill="${c}" fill-opacity="0.07" stroke-linejoin="round"/>`,
      shoulder: `<path d="M26 30C26 30 24 92 34 92H66C76 92 74 30 74 30C74 24 63 20 50 20C37 20 26 24 26 30Z" stroke="${c}" stroke-width="2" fill="${c}" fill-opacity="0.07" stroke-linejoin="round"/>`,
      clutch: `<rect x="24" y="24" width="52" height="46" rx="4" stroke="${c}" stroke-width="2" fill="${c}" fill-opacity="0.07"/>`,
      crossbody: `<path d="M28 30H72L68 78H32L28 30Z" stroke="${c}" stroke-width="2" fill="${c}" fill-opacity="0.07" stroke-linejoin="round"/>`,
      mini: `<path d="M28 26H72L69 76H31L28 26Z" stroke="${c}" stroke-width="2" fill="${c}" fill-opacity="0.07" stroke-linejoin="round"/>`
    };
    const clasp = category === 'clutch'
      ? `<path d="M46 24C46 21.2 47.8 19 50 19C52.2 19 54 21.2 54 24" stroke="${c}" stroke-width="2" fill="none"/>`
      : `<circle cx="50" cy="34" r="2.6" fill="${c}"/>`;
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      ${handles[category] || handles.tote}
      ${bodies[category] || bodies.tote}
      ${clasp}
      <path d="M20 46H80" stroke="${c}" stroke-width="1" stroke-opacity="0.35"/>
    </svg>`;
  }

  /* ---------------- header / footer templates ---------------- */
  function langLabel(code){
    return { en:'English', fr:'Français', ar:'العربية' }[code];
  }

  function headerTemplate(activePage){
    const nav = [
      ['index.html','home'], ['shop.html','shop'], ['categories.html','categories'],
      ['about.html','about'], ['contact.html','contact']
    ];
    const cartCount = (typeof MBCart !== 'undefined') ? MBCart.count() : 0;
    return `
    <div class="container header-row">
      <a href="index.html" class="logo"><b>${escapeHtml(state.store.logoText)}</b><span class="logo-slogan">${escapeHtml(fieldT(state.store.slogan))}</span></a>
      <nav class="main-nav" aria-label="Main navigation">
        ${nav.map(([href,key]) => `<a href="${href}" class="${activePage===key?'active':''}">${t('nav.'+key)}</a>`).join('')}
      </nav>
      <div class="header-actions">
        <div class="lang-switch" id="langSwitch">
          <button class="lang-btn" id="langBtn" aria-haspopup="true" aria-expanded="false">${svgIcon('globe')} ${state.lang.toUpperCase()}</button>
          <div class="lang-menu" role="menu">
            ${['en','fr','ar'].map(c => `<button data-lang="${c}" class="${c===state.lang?'active':''}">${langLabel(c)} ${c===state.lang?svgIcon('check'):''}</button>`).join('')}
          </div>
        </div>
        <a href="cart.html" class="icon-btn" aria-label="${t('nav.cart')}">${svgIcon('bag')}<span class="cart-count" id="cartCount">${cartCount}</span></a>
        <button class="burger" id="burgerBtn" aria-label="${t('misc.menu')}"><span></span><span></span><span></span></button>
      </div>
    </div>
    <div class="mobile-nav" id="mobileNav">
      ${nav.map(([href,key]) => `<a href="${href}">${t('nav.'+key)}</a>`).join('')}
      <a href="faq.html">${t('nav.faq')}</a>
    </div>`;
  }

  function footerTemplate(){
    const s = state.store;
    return `
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand">
          <a href="index.html" class="logo"><b>${escapeHtml(s.logoText)}</b></a>
          <p>${escapeHtml(fieldT({en:'Handbags crafted for the woman who carries her own light. Designed in Morocco, made to be loved.', fr:'Des sacs conçus pour la femme qui porte sa propre lumière. Conçus au Maroc, faits pour être aimés.', ar:'حقائب صُممت للمرأة التي تحمل نورها الخاص. صُممت في المغرب لتكون محبوبة.'}))}</p>
          <div class="footer-social">
            <a href="${s.socialLinks.instagram}" aria-label="Instagram" target="_blank" rel="noopener">${svgIcon('bag')}</a>
            <a href="${s.socialLinks.facebook}" aria-label="Facebook" target="_blank" rel="noopener">${svgIcon('globe')}</a>
            <a href="${s.socialLinks.tiktok}" aria-label="TikTok" target="_blank" rel="noopener">${svgIcon('heart')}</a>
          </div>
        </div>
        <div class="footer-col">
          <h4>${t('footer.shop')}</h4>
          <ul>
            <li><a href="shop.html">${t('nav.shop')}</a></li>
            <li><a href="categories.html">${t('nav.categories')}</a></li>
            <li><a href="cart.html">${t('nav.cart')}</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>${t('footer.help')}</h4>
          <ul>
            <li><a href="faq.html">${t('nav.faq')}</a></li>
            <li><a href="contact.html">${t('nav.contact')}</a></li>
            <li><a href="shipping.html">${t('footer.shipping')}</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>${t('footer.legal')}</h4>
          <ul>
            <li><a href="privacy.html">${t('footer.privacy')}</a></li>
            <li><a href="returns.html">${t('footer.returns')}</a></li>
            <li><a href="shipping.html">${t('footer.shipping')}</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>${t('nav.contact')}</h4>
          <ul>
            <li>${escapeHtml(s.contact.phoneDisplay)}</li>
            <li>${escapeHtml(s.contact.email)}</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; ${new Date().getFullYear()} ${escapeHtml(s.logoText)}. ${t('footer.rights')}</span>
        <span class="footer-payment">${t('footer.madeIn')}</span>
      </div>
    </div>`;
  }

  function renderChrome(activePage){
    const headerEl = document.getElementById('site-header');
    const footerEl = document.getElementById('site-footer');
    if(headerEl) headerEl.innerHTML = headerTemplate(activePage);
    if(footerEl) footerEl.innerHTML = footerTemplate();
    bindChromeEvents();
  }

  function updateCartBadge(){
    const el = document.getElementById('cartCount');
    if(el && typeof MBCart !== 'undefined') el.textContent = MBCart.count();
  }

  function bindChromeEvents(){
    const langSwitch = document.getElementById('langSwitch');
    const langBtn = document.getElementById('langBtn');
    if(langBtn){
      langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langSwitch.classList.toggle('open');
        langBtn.setAttribute('aria-expanded', langSwitch.classList.contains('open'));
      });
    }
    document.querySelectorAll('.lang-menu [data-lang]').forEach(btn => {
      btn.addEventListener('click', () => setLang(btn.dataset.lang));
    });
    document.addEventListener('click', () => { if(langSwitch) langSwitch.classList.remove('open'); });

    const burger = document.getElementById('burgerBtn');
    const mobileNav = document.getElementById('mobileNav');
    if(burger){
      burger.addEventListener('click', () => {
        burger.classList.toggle('open');
        mobileNav.classList.toggle('open');
      });
      mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        burger.classList.remove('open'); mobileNav.classList.remove('open');
      }));
    }
  }

  function setLang(code){
    state.lang = code;
    localStorage.setItem('mb_lang', code);
    document.documentElement.lang = code;
    document.documentElement.dir = state.translations[code].dir;
    document.dispatchEvent(new CustomEvent('mb:langchange'));
  }

  function applyStaticTranslations(){
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder));
    });
    document.title = document.title; // preserved per page
  }

  /* ---------------- scroll reveal ---------------- */
  function initReveal(){
    const items = document.querySelectorAll('.reveal');
    if(!('IntersectionObserver' in window)){ items.forEach(i=>i.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    items.forEach(i => io.observe(i));
  }

  /* ---------------- toast ---------------- */
  let toastTimer;
  function toast(msg){
    let el = document.getElementById('mbToast');
    if(!el){
      el = document.createElement('div');
      el.id = 'mbToast';
      el.className = 'toast';
      el.innerHTML = `${svgIcon('check')}<span id="mbToastMsg"></span>`;
      document.body.appendChild(el);
    }
    el.querySelector('#mbToastMsg').textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
  }

  /* ---------------- floating petals for hero ---------------- */
  function initPetals(container){
    if(!container) return;
    const n = window.innerWidth < 700 ? 8 : 16;
    for(let i=0;i<n;i++){
      const p = document.createElement('span');
      p.className = 'petal';
      p.style.left = Math.random()*100 + '%';
      p.style.animationDuration = (14 + Math.random()*14) + 's';
      p.style.animationDelay = (Math.random()*14) + 's';
      p.style.opacity = 0.15 + Math.random()*0.3;
      p.style.transform = `scale(${0.6 + Math.random()*1.2})`;
      container.appendChild(p);
    }
  }

  /* ---------------- init ---------------- */
  async function init(activePage){
    try{
      await loadCore();
    }catch(err){
      console.error('Moon Blossom: failed to load core data', err);
      const headerEl = document.getElementById('site-header');
      if(headerEl){
        headerEl.innerHTML = `<div style="background:#0D0D0D;color:#fff;padding:16px 20px;font-family:sans-serif;font-size:13px;text-align:center;">
          Content failed to load — please refresh, or check that this site is served over http(s), not opened as a local file.
        </div>`;
      }
      throw err;
    }
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.translations[state.lang].dir;
    renderChrome(activePage);
    applyStaticTranslations();
    initReveal();
    document.addEventListener('mb:langchange', () => {
      renderChrome(activePage);
      applyStaticTranslations();
      document.dispatchEvent(new CustomEvent('mb:rerender'));
    });
    document.addEventListener('mb:cartchange', updateCartBadge);
    return state;
  }

  return {
    init, t, fieldT, formatPrice, escapeHtml, svgIcon, bagIllustration, productMedia,
    loadCatalog, state, toast, initReveal, initPetals, renderChrome, setLang, updateCartBadge
  };
})();

// Global fallback: if a product photo fails to load (missing file, wrong path),
// replace it with the elegant line-art illustration instead of a broken image icon.
function MBImgFallback(imgEl, category, hex){
  try{
    const svg = MB.bagIllustration(category, hex);
    imgEl.outerHTML = svg;
  }catch(e){ imgEl.style.display = 'none'; }
}

if('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
