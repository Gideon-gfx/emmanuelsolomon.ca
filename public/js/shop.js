// shop.js: client-side product rendering, cart, and checkout (Stripe)

async function fetchCatalog() {
  try {
    const r = await fetch('/books.json');
    if (!r.ok) return [];
    return await r.json();
  } catch (e) {
    console.warn('Could not load catalog', e);
    return [];
  }
}

function qs(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function getCart() {
  try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch (e) { return []; }
}
function saveCart(cart) { localStorage.setItem('cart', JSON.stringify(cart)); }

function buildNav() {
  const nav = document.getElementById('navLinks');
  if (!nav) return;
  nav.innerHTML = `
    <div class="nav-item dropdown">
      <a class="dropdown-toggle" data-bs-toggle="dropdown" href="#" style="color:#000">Music</a>
      <div class="dropdown-menu">
        <hr>
        <a class="dropdown-item" href="/scores">Scores</a>
        <hr>
        <a class="dropdown-item" href="/recordings">Repertoire</a>
      </div>
    </div>
    <hr>
    <div class="nav-item dropdown">
      <a class="dropdown-toggle" data-bs-toggle="dropdown" href="#" style="color:#000">Initiatives</a>
      <div class="dropdown-menu">
        <hr>
        <a class="dropdown-item" href="/bikkurimstudios">Bikkurimstudios</a>
        <hr>
        <a class="dropdown-item" href="/bivo">BiVo</a>
        <hr>
        <a class="dropdown-item" href="/lagossistema">Lagossistema</a>
      </div>
    </div>
    <hr>
    <a href="/mailing" style="color:#000">Mailing Lists</a>
    
  `;
  // Ensure nav anchors and social svgs are visible on pages using white theme
  try {
    nav.querySelectorAll('a').forEach(a => a.style.color = '#000');
    document.querySelectorAll('.nav-holder .social-links svg path').forEach(p => p.setAttribute('fill', '#000'));
  } catch (e) {}
}

function buildFooterLinks() {
  const f = document.getElementById('footerLinks');
  if (!f) return;
  f.innerHTML = `
    <div class="nav-item dropdown">
      <a class="dropdown-toggle" data-bs-toggle="dropdown" href="#">Music</a>
      <div class="dropdown-menu">
        <hr>
        <a class="dropdown-item" href="/scores">Scores</a>
        <hr>
        <a class="dropdown-item" href="/recordings">Repertoire</a>
      </div>
    </div>
    <hr>
    <div class="nav-item dropdown">
      <a class="dropdown-toggle" data-bs-toggle="dropdown" href="#">About</a>
      <div class="dropdown-menu">
        <hr>
        <a class="dropdown-item" href="/biography">Biography</a>
        <hr>
        <a class="dropdown-item" href="/research">Research & Publications</a>
      </div>
    </div>
    <hr>
    <div class="nav-item dropdown">
      <a class="dropdown-toggle" data-bs-toggle="dropdown" href="#">Contact</a>
      <div class="dropdown-menu">
        <hr>
        <a class="dropdown-item" href="/contact">Contact Form</a>
        <hr>
        <a class="dropdown-item" href="/collaborate">Collaborate</a>
      </div>
    </div>
    <hr>
    <a href="/mailing">Mailing Lists</a>`;
}

// Product page renderer
async function renderProductPage() {
  buildNav(); buildFooterLinks();
  const id = qs('id');
  const catalog = await fetchCatalog();
  const product = catalog.find(p => p.id === id);
  const main = document.getElementById('product');
  if (!product) {
    if (main) main.innerHTML = '<p>Product not found.</p>';
    return;
  }

  // Convert YouTube watch links to embed links
  if (product.youtube) {
    // Fix: Handle if user pasted a full iframe code instead of just a link
    if (product.youtube.includes('<iframe')) {
        const match = product.youtube.match(/src="([^"]+)"/);
        if (match && match[1]) product.youtube = match[1];
    }

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = product.youtube.match(regExp);
    if (match && match[2]) {
      product.youtube = 'https://www.youtube.com/embed/' + match[2];
    }
  }

  main.innerHTML = `
    <div class="product-page" style="max-width:980px;margin:0 auto;padding:20px">
      <!-- Video -->
      ${product.youtube ? `<div class="video-wrapper" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;margin-bottom:16px;"><iframe src="${product.youtube}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe></div>` : ''}
      ${product.audio ? `<div style="margin-bottom:12px;"><audio controls src="${product.audio}" style="width:100%;"></audio></div>` : ''}

      <!-- Title -->
      <h1 style="margin-top:0">${product.title}</h1>

      <!-- Description -->
      ${product.description ? `<p class="description">${product.description}</p>` : ''}

      <!-- Lyrics -->
      <h3>Lyrics</h3>
      <pre style="background:#f8f8f8;padding:12px;border-radius:6px">${product.lyrics}</pre>

      <!-- Get Music button (opens modal) -->
      <div style="margin:16px 0;">
        <button id="getMusicBtn" class="btn btn-danger" style="background-color: rgb(200, 7, 7) !important; border-color: rgb(200, 7, 7) !important; color: #fff;">Get Music</button>
      </div>

      <!-- Share section -->
      <div id="share" style="margin:18px 0;padding:12px;border-radius:6px;background:#fff;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
        <div><strong>Share this story</strong></div>
        <div style="display:flex;gap:8px;align-items:center">
          <a class="share-btn" data-service="facebook" href="#" title="Share on Facebook">${socialSVG('facebook')}</a>
          <a class="share-btn" data-service="twitter" href="#" title="Share on X">${socialSVG('twitter')}</a>
          <a class="share-btn" data-service="linkedin" href="#" title="Share on LinkedIn">${socialSVG('linkedin')}</a>
          <a class="share-btn" data-service="whatsapp" href="#" title="Share on WhatsApp">${socialSVG('whatsapp')}</a>
        </div>
      </div>

      <!-- Related posts -->
      <div style="margin-top:20px">
        <h4>Related compositions</h4>
        <div class="related" style="display:flex;gap:12px;flex-wrap:wrap">${catalog.filter(p=>p.id!==product.id).map(p=>`<a class="related-item" href="/scores/product.html?id=${p.id}" style="display:block;width:180px;text-align:center;padding:8px;border-radius:6px;background:#fff;text-decoration:none;color:inherit"><img src="${p.image}" style="max-width:100%;height:120px;object-fit:cover;border-radius:4px"><div style="margin-top:8px">${p.title}</div></a>`).join('')}</div>
      </div>

    </div>

    <!-- Modal (hidden) -->
    <div class="modal fade" id="getMusicModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h5 class="modal-title">Get Music</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>
          <div class="modal-body">
            <p>Choose an option below. ${product.minQuantity ? `Minimum order: ${product.minQuantity} copies.` : ''}</p>
            <div style="display:flex;gap:10px;align-items:center;">
              <label for="modalQty">Quantity</label>
              <input id="modalQty" type="number" min="${product.minQuantity || 1}" value="${product.minQuantity || 1}" style="width:100px;margin-left:8px;">
            </div>
            <div style="margin-top:12px">Price per copy: $${product.price.toFixed(2)} CAD</div>
          </div>
          <div class="modal-footer">
            <!-- <button id="addToCartModal" class="btn btn-secondary">Add to Cart</button> -->
            <button id="buyNow" class="btn btn-primary" style="background-color: rgb(200, 7, 7) !important; border-color: rgb(200, 7, 7) !important;">Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Get Music modal handlers
  const getMusicBtn = document.getElementById('getMusicBtn');
  const modalQty = document.getElementById('modalQty');
  const addToCartModal = document.getElementById('addToCartModal');
  const buyNow = document.getElementById('buyNow');

  let bootstrapModal;
  try {
    if (typeof bootstrap !== 'undefined') {
       bootstrapModal = new bootstrap.Modal(document.getElementById('getMusicModal'));
    } else {
       console.error('Bootstrap not loaded');
    }
  } catch(e) { console.error('Modal error', e); }

  if (getMusicBtn && bootstrapModal) {
     getMusicBtn.addEventListener('click', () => bootstrapModal.show());
  } else if (getMusicBtn) {
     // Fallback if bootstrap missing
     getMusicBtn.addEventListener('click', () => { 
        alert('Error: Interface not loaded. Please reload the page.');
        window.location.reload();
     });
  }

  if (addToCartModal) {
      addToCartModal.addEventListener('click', () => {
        const minQ = Number(product.minQuantity || 1);
        const q = Math.max(minQ, Number(modalQty.value || minQ));
        const cart = getCart();
        const existing = cart.find(it => it.id === product.id);
        if (existing) existing.quantity += q; else cart.push({ id: product.id, quantity: q });
        saveCart(cart);
        bootstrapModal.hide();
        alert(`Added ${q} copies to cart`);
      });
  }

  if (buyNow) {
      buyNow.addEventListener('click', async () => {
    try {
        const minQ = Number(product.minQuantity || 1);
        const q = Math.max(minQ, Number(modalQty.value || minQ));
        
        // Show loading state
        buyNow.disabled = true;
        buyNow.innerText = 'Processing...';

        const payload = { items: [{ id: product.id, quantity: q }] };
        const r = await fetch('/create-checkout-session', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload) 
        });
        
        if (!r.ok) {
            let errorMsg = r.statusText;
            try {
                const errData = await r.json();
                if(errData.error) errorMsg = errData.error;
            } catch(e) {}
            throw new Error(errorMsg);
        }

        const data = await r.json();
        if (data.url) {
            window.location = data.url;
        } else {
            console.error('No URL in response', data);
            alert('Checkout error: No payment URL returned.');
            buyNow.disabled = false;
            buyNow.innerText = 'Buy Now';
        }
    } catch (err) {
        console.error('Buy Button Error:', err);
        alert('Failed to start checkout. Please try again or contact support.\nError: ' + err.message);
        buyNow.disabled = false;
        buyNow.innerText = 'Buy Now';
    }
  });
  }

  // NOTE: Digital download action removed from modal. Checkout page shows purchase options.

  // Share buttons
  document.querySelectorAll('.share-btn').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const service = a.getAttribute('data-service');
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(product.title + ' — ' + (product.description||''));
      let shareUrl = '#';
      if (service === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      if (service === 'twitter') shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
      if (service === 'linkedin') shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
      if (service === 'whatsapp') shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
      window.open(shareUrl, '_blank');
    });
  });
}

function socialSVG(name) {
  const svgs = {
    facebook: '<svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg"><path d="M22 12.07C22 6.48 17.52 2 11.93 2 6.34 2 1.86 6.48 1.86 12.07 1.86 17.09 5.9 21.06 10.64 21.98v-6.98H8.24v-2.93h2.4V9.03c0-2.38 1.41-3.69 3.57-3.69 1.03 0 2.11.18 2.11.18v2.32h-1.19c-1.17 0-1.53.73-1.53 1.48v1.76h2.6l-.42 2.93h-2.18V21.98C18.1 21.06 22 17.09 22 12.07z"/></svg>',
    twitter: '<svg width="20" height="20" viewBox="0 0 24 24" fill="#1DA1F2" xmlns="http://www.w3.org/2000/svg"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.89-.53 1.57-1.37 1.9-2.37-.83.5-1.74.86-2.71 1.05C18.24 4.5 17.08 4 15.79 4c-2.2 0-3.99 1.8-3.99 4 0 .31.04.62.1.91C8.1 9.74 5.13 8.1 3.15 5.5c-.34.58-.53 1.25-.53 1.97 0 1.36.69 2.56 1.74 3.26-.64-.02-1.24-.2-1.77-.49v.05c0 1.9 1.35 3.48 3.13 3.85-.33.09-.68.13-1.04.13-.25 0-.5-.02-.74-.07.5 1.56 1.95 2.7 3.67 2.73C7.6 18.9 5.2 19.6 2.7 19.6c-.41 0-.82-.02-1.22-.07C1.79 21 3.36 22 5.22 22c6.64 0 10.28-5.5 10.28-10.27v-.47c.7-.5 1.3-1.12 1.78-1.82-.64.28-1.32.47-2.03.56.73-.43 1.29-1.1 1.55-1.9z"/></svg>',
    linkedin: '<svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg"><path d="M4.98 3.5C4.98 4.88 3.9 6 2.5 6S0 4.88 0 3.5 1.07 1 2.5 1 4.98 2.12 4.98 3.5zM0 24h5V7H0v17zM8 7h4.78v2.3h.07c.66-1.25 2.27-2.3 4.66-2.3C22.06 7 24 9.02 24 13.16V24h-5v-9.5c0-2.27-.04-5.18-3.16-5.18-3.16 0-3.64 2.47-3.64 5.02V24H8V7z"/></svg>',
    whatsapp: '<svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366" xmlns="http://www.w3.org/2000/svg"><path d="M20.52 3.48A11.9 11.9 0 0 0 12 .02C5.37.02.02 5.37.02 12c0 2.11.55 4.09 1.6 5.86L0 24l6.43-1.65A11.96 11.96 0 0 0 12 24c6.63 0 11.98-5.37 11.98-12 0-1.89-.44-3.67-1.46-5.32zM12.02 21.5c-1.7 0-3.35-.45-4.77-1.3l-.34-.2-3.83.98.99-3.7-.22-.38A8.44 8.44 0 0 1 3.56 12c0-4.7 3.82-8.52 8.52-8.52 4.7 0 8.52 3.82 8.52 8.52 0 4.7-3.82 8.52-8.52 8.52z"/></svg>'
  };
  return svgs[name]||'';
}

// Cart page renderer and checkout
async function renderCartPage() {
  buildNav(); buildFooterLinks();
  const catalog = await fetchCatalog();
  const cart = getCart();
  const itemsEl = document.getElementById('items');
  if (!itemsEl) return;
  if (cart.length === 0) { itemsEl.innerHTML = '<p>Your cart is empty.</p>'; return; }
  itemsEl.innerHTML = '';
  let total = 0;
  // Ensure cart respects product minimum quantities
  let cartChanged = false;
  for (const itm of cart) {
    const pcheck = catalog.find(p => p.id === itm.id) || { minQuantity: 1 };
    const minQ = Number(pcheck.minQuantity || 1);
    if ((Number(itm.quantity) || 0) < minQ) { itm.quantity = minQ; cartChanged = true; }
  }
  if (cartChanged) saveCart(cart);

  for (const it of cart) {
    const prod = catalog.find(p => p.id === it.id) || { title: it.id, price: 3.10 };
    const subtotal = prod.price * it.quantity;
    total += subtotal;
    const el = document.createElement('div');
    el.style.marginBottom = '12px';
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
        <div style="flex:1">
          <div style="font-weight:600;color:#000">${prod.title}</div>
          <div style="margin-top:6px;display:flex;align-items:center;gap:8px">
            <button class="qty-decr btn btn-sm btn-outline-secondary">-</button>
            <span class="qty" style="min-width:40px;display:inline-block;text-align:center">${it.quantity}</span>
            <button class="qty-incr btn btn-sm btn-outline-secondary">+</button>
            <button class="remove-item btn btn-sm btn-link text-danger" style="margin-left:8px">Remove</button>
          </div>
        </div>
        <div style="width:120px;text-align:right">$${subtotal.toFixed(2)}</div>
      </div>
    `;
    // attach handlers
    const decr = el.querySelector('.qty-decr');
    const incr = el.querySelector('.qty-incr');
    const qtySpan = el.querySelector('.qty');
    const removeBtn = el.querySelector('.remove-item');
    decr.addEventListener('click', () => {
      const cartNow = getCart();
      const item = cartNow.find(x => x.id === it.id);
      if (!item) return;
      const minQ = Number(prod.minQuantity || 1);
      item.quantity = Math.max(minQ, item.quantity - 1);
      saveCart(cartNow);
      qtySpan.textContent = item.quantity;
      document.getElementById('total').textContent = `$${cartNow.reduce((s,i)=>{ const p=catalog.find(c=>c.id===i.id)||{price:3.10}; return s + p.price*i.quantity },0).toFixed(2)}`;
      updateCartCount();
    });
    incr.addEventListener('click', () => {
      const cartNow = getCart();
      const item = cartNow.find(x => x.id === it.id);
      if (!item) return;
      item.quantity = item.quantity + 1;
      saveCart(cartNow);
      qtySpan.textContent = item.quantity;
      document.getElementById('total').textContent = `$${cartNow.reduce((s,i)=>{ const p=catalog.find(c=>c.id===i.id)||{price:3.10}; return s + p.price*i.quantity },0).toFixed(2)}`;
      updateCartCount();
    });
    removeBtn.addEventListener('click', () => {
      let cartNow = getCart();
      cartNow = cartNow.filter(x => x.id !== it.id);
      saveCart(cartNow);
      // re-render cart page
      renderCartPage();
      updateCartCount();
    });
    itemsEl.appendChild(el);
  }
  document.getElementById('total').textContent = `$${total.toFixed(2)}`;

  document.getElementById('checkout').addEventListener('click', async () => {
    // Prepare items for server
    const payload = { items: cart.map(i => ({ id: i.id, quantity: i.quantity })) };
    const r = await fetch('/create-checkout-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await r.json();
    if (data.url) {
      window.location = data.url;
    } else {
      alert('Checkout error');
    }
  });
}

// Auto-run depending on page
function initShop() {
  console.log('Shop.js init');
  buildNav(); buildFooterLinks();
  updateCartCount();
  // Robust page detection
  if (document.getElementById('product') && qs('id')) {
    console.log('Detected Product Page');
    renderProductPage();
  } else if (document.getElementById('items')) {
    console.log('Detected Cart Page');
    renderCartPage();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initShop);
} else {
  initShop();
}

function updateCartCount() {
  const countEl = document.getElementById('cartCount');
  if (!countEl) return;
  const cart = getCart();
  const totalQty = cart.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
  countEl.textContent = String(totalQty || 0);
}
