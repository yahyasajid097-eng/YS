/* ==========================================================================
   Moon Blossom — products.js
   Catalog rendering across Home / Shop / Product / Categories
   ========================================================================== */

const MBProducts = (() => {

  function badgeLabel(badge){
    if(!badge) return '';
    return MB.t('badges.' + badge);
  }

  function productCardHTML(p){
    const hasDiscount = p.discountPrice && p.discountPrice < p.price;
    const off = hasDiscount ? Math.round(100 - (p.discountPrice/p.price*100)) : 0;
    const wished = MBCart.isWished(p.id);
    return `
    <div class="product-card reveal in" data-id="${p.id}">
      <div class="product-media">
        ${p.badge ? `<span class="product-badge ${p.badge==='sale'?'sale':''}">${badgeLabel(p.badge)}</span>` : ''}
        <button class="wishlist-btn ${wished?'active':''}" data-wish="${p.id}" aria-label="${MB.t('product.wishlist')}">${MB.svgIcon('heart')}</button>
        <a href="product.html?slug=${p.slug}">${MB.bagIllustration(p.category, p.colors[0].hex)}</a>
        <button class="quick-add" data-quickadd="${p.id}">${MB.t('product.addToCart')}</button>
      </div>
      <a href="product.html?slug=${p.slug}" class="product-info">
        <span class="product-cat">${MB.fieldT(getCategoryName(p.category))}</span>
        <div class="product-name">${MB.fieldT(p.name)}</div>
        <div class="product-price">
          ${hasDiscount ? `<span class="price-original">${MB.formatPrice(p.price)}</span>` : ''}
          <span class="price-current">${MB.formatPrice(hasDiscount ? p.discountPrice : p.price)}</span>
          ${hasDiscount ? `<span class="price-off">-${off}%</span>` : ''}
        </div>
        <div class="product-colors">
          ${p.colors.map(c => `<span class="color-dot" style="background:${c.hex}"></span>`).join('')}
        </div>
      </a>
    </div>`;
  }

  let catalogCache = null;
  function getCategoryName(id){
    const cat = catalogCache.categories.find(c => c.id === id);
    return cat ? cat.name : { en:id, fr:id, ar:id };
  }

  function bindCardEvents(container){
    container.querySelectorAll('[data-wish]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        const active = MBCart.toggleWish(btn.dataset.wish);
        btn.classList.toggle('active', active);
      });
    });
    container.querySelectorAll('[data-quickadd]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        const p = catalogCache.products.find(pr => pr.id === btn.dataset.quickadd);
        const price = (p.discountPrice && p.discountPrice < p.price) ? p.discountPrice : p.price;
        MBCart.addItem(p.id, 1, p.colors[0].hex, price);
        MB.toast(`${MB.fieldT(p.name)} — ${MB.t('product.addToCart')} ✓`);
      });
    });
  }

  /* ---------------- Home page sections ---------------- */
  async function renderHome(){
    catalogCache = await MB.loadCatalog();
    const featured = catalogCache.products.filter(p => p.featured).slice(0,4);
    const bestsellers = catalogCache.products.filter(p => p.badge === 'bestseller').slice(0,4);
    const newArrivals = catalogCache.products.filter(p => p.newArrival).slice(0,4);

    const fEl = document.getElementById('featuredGrid');
    const bEl = document.getElementById('bestsellersGrid');
    const nEl = document.getElementById('newArrivalsGrid');
    if(fEl){ fEl.innerHTML = featured.map(productCardHTML).join(''); bindCardEvents(fEl); }
    if(bEl){ bEl.innerHTML = bestsellers.map(productCardHTML).join(''); bindCardEvents(bEl); }
    if(nEl){ nEl.innerHTML = newArrivals.map(productCardHTML).join(''); bindCardEvents(nEl); }
    MB.initReveal();
  }

  /* ---------------- Shop page ---------------- */
  let shopFilters = { category: 'all', min: null, max: null, sort: 'newest', search: '' };

  async function renderShop(){
    catalogCache = await MB.loadCatalog();
    buildCategoryFilters();
    readShopFiltersFromUI();
    applyShopFilters();

    document.querySelectorAll('#categoryFilters input').forEach(el => el.addEventListener('change', () => { readShopFiltersFromUI(); applyShopFilters(); }));
    const priceInputs = document.querySelectorAll('.price-inputs input');
    priceInputs.forEach(el => el.addEventListener('input', () => { readShopFiltersFromUI(); applyShopFilters(); }));
    const sortEl = document.getElementById('sortSelect');
    if(sortEl) sortEl.addEventListener('change', () => { readShopFiltersFromUI(); applyShopFilters(); });
    const searchEl = document.getElementById('shopSearch');
    if(searchEl) searchEl.addEventListener('input', () => { readShopFiltersFromUI(); applyShopFilters(); });
    const resetBtn = document.getElementById('resetFiltersBtn');
    if(resetBtn) resetBtn.addEventListener('click', () => {
      document.querySelectorAll('#categoryFilters input[type=radio][value="all"]').forEach(r => r.checked = true);
      priceInputs.forEach(el => el.value = '');
      if(searchEl) searchEl.value = '';
      readShopFiltersFromUI(); applyShopFilters();
    });

    const urlParams = new URLSearchParams(location.search);
    if(urlParams.get('category')){
      const radio = document.querySelector(`#categoryFilters input[value="${urlParams.get('category')}"]`);
      if(radio){ radio.checked = true; readShopFiltersFromUI(); applyShopFilters(); }
    }
    if(urlParams.get('q')){
      if(searchEl){ searchEl.value = urlParams.get('q'); readShopFiltersFromUI(); applyShopFilters(); }
    }
  }

  function buildCategoryFilters(){
    const el = document.getElementById('categoryFilters');
    if(!el || el.dataset.built) return;
    el.dataset.built = '1';
    const all = `<label class="filter-option"><input type="radio" name="cat" value="all" checked> <span>${MB.t('shop.allCategories')}</span></label>`;
    const cats = catalogCache.categories.map(c => `<label class="filter-option"><input type="radio" name="cat" value="${c.id}"> <span>${MB.fieldT(c.name)}</span></label>`).join('');
    el.innerHTML = all + cats;
  }

  function readShopFiltersFromUI(){
    const checked = document.querySelector('#categoryFilters input:checked');
    shopFilters.category = checked ? checked.value : 'all';
    const min = document.getElementById('priceMin');
    const max = document.getElementById('priceMax');
    shopFilters.min = min && min.value ? Number(min.value) : null;
    shopFilters.max = max && max.value ? Number(max.value) : null;
    const sortEl = document.getElementById('sortSelect');
    shopFilters.sort = sortEl ? sortEl.value : 'newest';
    const searchEl = document.getElementById('shopSearch');
    shopFilters.search = searchEl ? searchEl.value.trim().toLowerCase() : '';
  }

  function applyShopFilters(){
    let list = [...catalogCache.products];
    if(shopFilters.category !== 'all') list = list.filter(p => p.category === shopFilters.category);
    if(shopFilters.min !== null) list = list.filter(p => (p.discountPrice||p.price) >= shopFilters.min);
    if(shopFilters.max !== null) list = list.filter(p => (p.discountPrice||p.price) <= shopFilters.max);
    if(shopFilters.search){
      list = list.filter(p => ['en','fr','ar'].some(l => (p.name[l]||'').toLowerCase().includes(shopFilters.search)));
    }
    switch(shopFilters.sort){
      case 'price-low': list.sort((a,b) => (a.discountPrice||a.price) - (b.discountPrice||b.price)); break;
      case 'price-high': list.sort((a,b) => (b.discountPrice||b.price) - (a.discountPrice||a.price)); break;
      case 'popular': list.sort((a,b) => b.rating - a.rating); break;
      default: list.sort((a,b) => (b.newArrival?1:0) - (a.newArrival?1:0));
    }

    const grid = document.getElementById('shopGrid');
    const empty = document.getElementById('shopEmpty');
    const count = document.getElementById('resultsCount');
    if(count) count.textContent = `${list.length} ${MB.t('shop.results')}`;
    if(list.length === 0){
      grid.innerHTML = '';
      if(empty) empty.style.display = 'block';
    } else {
      if(empty) empty.style.display = 'none';
      grid.innerHTML = list.map(productCardHTML).join('');
      bindCardEvents(grid);
      MB.initReveal();
    }
  }

  /* ---------------- Categories page ---------------- */
  async function renderCategories(){
    catalogCache = await MB.loadCatalog();
    const grid = document.getElementById('categoriesGrid');
    if(!grid) return;
    grid.innerHTML = catalogCache.categories.map(c => {
      const sample = catalogCache.products.find(p => p.category === c.id);
      const count = catalogCache.products.filter(p => p.category === c.id).length;
      return `<a href="shop.html?category=${c.id}" class="cat-card reveal in">
        ${MB.bagIllustration(c.id, '#D4AF37')}
        <div class="cat-card-label"><span>${MB.fieldT(c.name)}</span><small>${count} ${MB.t('shop.results')}</small></div>
      </a>`;
    }).join('');
  }

  /* ---------------- Product detail page ---------------- */
  let currentProduct = null;
  let currentColor = null;
  let currentQty = 1;

  async function renderProductPage(){
    catalogCache = await MB.loadCatalog();
    const slug = new URLSearchParams(location.search).get('slug');
    const p = catalogCache.products.find(pr => pr.slug === slug) || catalogCache.products[0];
    currentProduct = p;
    currentColor = p.colors[0].hex;
    currentQty = 1;
    if(!p){ location.href = '404.html'; return; }

    document.title = `${MB.fieldT(p.name)} — Moon Blossom`;

    document.getElementById('pdpCategory').textContent = MB.fieldT(getCategoryName(p.category));
    document.getElementById('pdpName').textContent = MB.fieldT(p.name);
    document.getElementById('pdpDesc').textContent = MB.fieldT(p.description);
    document.getElementById('pdpRatingVal').textContent = p.rating;
    document.getElementById('pdpReviewCount').textContent = `(${p.reviewCount} ${MB.t('product.reviews')})`;
    document.getElementById('pdpStars').textContent = '★★★★★'.slice(0, Math.round(p.rating)) + '☆☆☆☆☆'.slice(0, 5-Math.round(p.rating));
    document.getElementById('pdpSku').textContent = `${MB.t('product.sku')}: ${p.id.toUpperCase()}`;

    renderGallery();
    renderPrice();
    renderColorSwatches();
    renderSpecs();
    renderQty();
    renderRelated();
    bindPdpActions();
    MB.initReveal();
  }

  function renderGallery(){
    const main = document.getElementById('pdpMainImage');
    main.innerHTML = MB.bagIllustration(currentProduct.category, currentColor);
    const thumbs = document.getElementById('pdpThumbs');
    thumbs.innerHTML = currentProduct.colors.map((c,i) => `<div class="pdp-thumb ${c.hex===currentColor?'active':''}" data-hex="${c.hex}">${MB.bagIllustration(currentProduct.category, c.hex)}</div>`).join('');
    thumbs.querySelectorAll('.pdp-thumb').forEach(t => t.addEventListener('click', () => {
      currentColor = t.dataset.hex;
      renderGallery(); renderColorSwatches();
    }));
  }

  function renderPrice(){
    const p = currentProduct;
    const hasDiscount = p.discountPrice && p.discountPrice < p.price;
    const el = document.getElementById('pdpPrice');
    el.innerHTML = hasDiscount
      ? `<span class="price-current">${MB.formatPrice(p.discountPrice)}</span><span class="price-original">${MB.formatPrice(p.price)}</span>`
      : `<span class="price-current">${MB.formatPrice(p.price)}</span>`;
  }

  function renderColorSwatches(){
    const p = currentProduct;
    const row = document.getElementById('colorSwatchRow');
    row.innerHTML = p.colors.map(c => `<span class="color-swatch ${c.hex===currentColor?'active':''}" style="background:${c.hex}" data-hex="${c.hex}" title="${MB.fieldT(c.name)}"></span>`).join('');
    row.querySelectorAll('.color-swatch').forEach(sw => sw.addEventListener('click', () => {
      currentColor = sw.dataset.hex;
      renderGallery(); renderColorSwatches();
    }));
    const activeColor = p.colors.find(c => c.hex === currentColor);
    document.getElementById('colorNameLabel').textContent = MB.fieldT(activeColor.name);
  }

  function renderSpecs(){
    const el = document.getElementById('tabSpecs');
    if(!el) return;
    el.innerHTML = MB.fieldT(currentProduct.specs).map(s => `<li>${MB.svgIcon('check')}<span>${s}</span></li>`).join('');
  }

  function renderQty(){
    document.getElementById('qtyVal').textContent = currentQty;
  }

  function bindPdpActions(){
    document.getElementById('qtyIncBtn').onclick = () => { currentQty = Math.min(currentQty+1, 10); renderQty(); };
    document.getElementById('qtyDecBtn').onclick = () => { currentQty = Math.max(currentQty-1, 1); renderQty(); };
    document.getElementById('addToCartBtn').onclick = () => {
      const price = (currentProduct.discountPrice && currentProduct.discountPrice < currentProduct.price) ? currentProduct.discountPrice : currentProduct.price;
      MBCart.addItem(currentProduct.id, currentQty, currentColor, price);
      MB.toast(`${MB.fieldT(currentProduct.name)} — ${MB.t('product.addToCart')} ✓`);
    };
    document.getElementById('buyNowBtn').onclick = () => {
      const price = (currentProduct.discountPrice && currentProduct.discountPrice < currentProduct.price) ? currentProduct.discountPrice : currentProduct.price;
      MBCart.addItem(currentProduct.id, currentQty, currentColor, price);
      location.href = 'checkout.html';
    };
    const wishBtn = document.getElementById('pdpWishBtn');
    if(wishBtn){
      wishBtn.classList.toggle('active', MBCart.isWished(currentProduct.id));
      wishBtn.onclick = () => wishBtn.classList.toggle('active', MBCart.toggleWish(currentProduct.id));
    }
  }

  function renderRelated(){
    const related = catalogCache.products.filter(p => p.category === currentProduct.category && p.id !== currentProduct.id).slice(0,4);
    const fallback = related.length ? related : catalogCache.products.filter(p => p.id !== currentProduct.id).slice(0,4);
    const grid = document.getElementById('relatedGrid');
    if(grid){ grid.innerHTML = fallback.map(productCardHTML).join(''); bindCardEvents(grid); }
  }

  return { renderHome, renderShop, renderCategories, renderProductPage, productCardHTML, bindCardEvents, get catalog(){ return catalogCache; } };
})();
