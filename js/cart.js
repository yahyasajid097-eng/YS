/* ==========================================================================
   Moon Blossom — cart.js
   localStorage-backed cart, cart page render, checkout + WhatsApp handoff
   ========================================================================== */

const MBCart = (() => {
  const KEY = 'moonblossom_cart';
  const WISHKEY = 'moonblossom_wishlist';

  function read(){
    try{ return JSON.parse(localStorage.getItem(KEY)) || []; }catch(e){ return []; }
  }
  function write(items){
    localStorage.setItem(KEY, JSON.stringify(items));
    document.dispatchEvent(new CustomEvent('mb:cartchange'));
  }

  function findIndex(items, id, color){
    return items.findIndex(i => i.id === id && i.color === color);
  }

  function addItem(id, qty, color, price){
    const items = read();
    const idx = findIndex(items, id, color);
    if(idx > -1){ items[idx].qty += qty; }
    else{ items.push({ id, qty, color, price }); }
    write(items);
  }

  function updateQty(id, color, qty){
    const items = read();
    const idx = findIndex(items, id, color);
    if(idx > -1){
      if(qty <= 0) items.splice(idx,1);
      else items[idx].qty = qty;
      write(items);
    }
  }

  function removeItem(id, color){
    write(read().filter(i => !(i.id === id && i.color === color)));
  }

  function clear(){ write([]); }

  function count(){ return read().reduce((s,i) => s + i.qty, 0); }

  function subtotal(){ return read().reduce((s,i) => s + (i.price * i.qty), 0); }

  /* ---------------- wishlist ---------------- */
  function readWish(){ try{ return JSON.parse(localStorage.getItem(WISHKEY)) || []; }catch(e){ return []; } }
  function toggleWish(id){
    let items = readWish();
    if(items.includes(id)) items = items.filter(i => i !== id);
    else items.push(id);
    localStorage.setItem(WISHKEY, JSON.stringify(items));
    document.dispatchEvent(new CustomEvent('mb:wishchange'));
    return items.includes(id);
  }
  function isWished(id){ return readWish().includes(id); }

  /* ---------------- cart page ---------------- */
  async function renderCartPage(){
    const catalog = await MB.loadCatalog();
    const items = read();
    const layout = document.getElementById('cartLayout');
    const empty = document.getElementById('cartEmpty');
    if(!layout) return;

    if(items.length === 0){
      layout.style.display = 'none';
      if(empty) empty.style.display = 'block';
      return;
    }
    layout.style.display = 'grid';
    if(empty) empty.style.display = 'none';

    const listEl = document.getElementById('cartItemsList');
    listEl.innerHTML = items.map(item => {
      const p = catalog.products.find(pr => pr.id === item.id);
      if(!p) return '';
      const colorObj = p.colors.find(c => c.hex === item.color) || p.colors[0];
      return `
      <div class="cart-item" data-id="${p.id}" data-color="${item.color}">
        <a href="product.html?slug=${p.slug}" class="cart-item-media">${MB.bagIllustration(p.category, item.color)}</a>
        <div class="cart-item-body">
          <a href="product.html?slug=${p.slug}"><div class="cart-item-name">${MB.fieldT(p.name)}</div></a>
          <div class="cart-item-meta">${MB.t('product.color')}: ${MB.fieldT(colorObj.name)}</div>
          <div class="cart-item-qty">
            <div class="qty-selector">
              <button class="qty-dec" aria-label="decrease">−</button>
              <span>${item.qty}</span>
              <button class="qty-inc" aria-label="increase">+</button>
            </div>
          </div>
        </div>
        <div class="cart-item-actions">
          <div class="cart-item-price">${MB.formatPrice(item.price * item.qty)}</div>
          <button class="link-remove">${MB.t('cart.remove')}</button>
        </div>
      </div>`;
    }).join('');

    listEl.querySelectorAll('.cart-item').forEach(row => {
      const id = row.dataset.id, color = row.dataset.color;
      row.querySelector('.qty-inc').addEventListener('click', () => {
        const item = read().find(i => i.id===id && i.color===color);
        updateQty(id, color, item.qty + 1);
        renderCartPage();
      });
      row.querySelector('.qty-dec').addEventListener('click', () => {
        const item = read().find(i => i.id===id && i.color===color);
        updateQty(id, color, item.qty - 1);
        renderCartPage();
      });
      row.querySelector('.link-remove').addEventListener('click', () => {
        removeItem(id, color);
        renderCartPage();
      });
    });

    renderSummary();
  }

  function renderSummary(){
    const sub = subtotal();
    const store = MB.state.store;
    const shipFee = sub >= store.freeShippingThreshold ? 0 : store.shippingFee;
    const subEl = document.getElementById('sumSubtotal');
    const shipEl = document.getElementById('sumShipping');
    const totalEl = document.getElementById('sumTotal');
    if(subEl) subEl.textContent = MB.formatPrice(sub);
    if(shipEl) shipEl.textContent = shipFee === 0 ? MB.t('cart.free') : MB.formatPrice(shipFee);
    if(totalEl) totalEl.textContent = MB.formatPrice(sub + shipFee);
  }

  /* ---------------- checkout page ---------------- */
  async function renderCheckoutSummary(){
    const catalog = await MB.loadCatalog();
    const items = read();
    const el = document.getElementById('checkoutItems');
    if(!el) return;
    el.innerHTML = items.map(item => {
      const p = catalog.products.find(pr => pr.id === item.id);
      if(!p) return '';
      return `<div class="checkout-summary-item"><span>${MB.fieldT(p.name)} × ${item.qty}</span><span>${MB.formatPrice(item.price*item.qty)}</span></div>`;
    }).join('');
    renderSummary();

    const cityEl = document.getElementById('cityField');
    if(cityEl && cityEl.options.length <= 1){
      MB.state.store.cities.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c; opt.textContent = c;
        cityEl.appendChild(opt);
      });
    }
  }

  function buildWhatsAppMessage(customer){
    const catalog = MB.state.catalog;
    const items = read();
    const store = MB.state.store;
    const sub = subtotal();
    const shipFee = sub >= store.freeShippingThreshold ? 0 : store.shippingFee;
    const total = sub + shipFee;

    let lines = [];
    lines.push(`✨ *New Order — ${store.storeName}* ✨`);
    lines.push('');
    lines.push(`*Name:* ${customer.name}`);
    lines.push(`*Phone:* ${customer.phone}`);
    lines.push(`*City:* ${customer.city}`);
    lines.push(`*Address:* ${customer.address}`);
    if(customer.notes) lines.push(`*Notes:* ${customer.notes}`);
    lines.push('');
    lines.push('*Order Details:*');
    items.forEach(item => {
      const p = catalog.products.find(pr => pr.id === item.id);
      if(!p) return;
      const colorObj = p.colors.find(c => c.hex === item.color) || p.colors[0];
      lines.push(`• ${MB.fieldT(p.name)} (${MB.fieldT(colorObj.name)}) × ${item.qty} — ${MB.formatPrice(item.price*item.qty)}`);
    });
    lines.push('');
    lines.push(`*Subtotal:* ${MB.formatPrice(sub)}`);
    lines.push(`*Shipping:* ${shipFee === 0 ? 'Free' : MB.formatPrice(shipFee)}`);
    lines.push(`*Total:* ${MB.formatPrice(total)}`);
    lines.push('');
    lines.push('*Payment:* Cash on Delivery');

    return lines.join('\n');
  }

  function submitOrder(customer){
    const store = MB.state.store;
    const message = buildWhatsAppMessage(customer);
    const url = `https://wa.me/${store.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  return {
    read, addItem, updateQty, removeItem, clear, count, subtotal,
    toggleWish, isWished,
    renderCartPage, renderSummary, renderCheckoutSummary, buildWhatsAppMessage, submitOrder
  };
})();
