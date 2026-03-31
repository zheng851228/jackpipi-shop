/* ════════════════════════════════════════
   A. CART 工具
════════════════════════════════════════ */
export const Cart = {
  get() { return JSON.parse(localStorage.getItem('jk_cart') || '[]'); },
  save(cart) {
    localStorage.setItem('jk_cart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('jk:cart-update', { detail: { cart } }));
  },
  add(product) {
    const cart = this.get();
    const ex = cart.find(x => x.id === product.id);
    if (ex) {
      ex.qty++;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        size: product.size || '—',
        emoji: product.emoji || '🌿',
        imageUrl: product.imageUrl || '',
        qty: 1,
      });
    }
    this.save(cart);
  },
  remove(id) {
    const cart = this.get().filter(x => x.id !== id);
    this.save(cart);
  },
  setQty(id, qty) {
    const cart = this.get();
    const item = cart.find(x => x.id === id);
    if (!item) return;
    item.qty = qty;
    if (item.qty <= 0) cart.splice(cart.indexOf(item), 1);
    this.save(cart);
  },
  inc(id) {
    const cart = this.get();
    const item = cart.find(x => x.id === id);
    if (item) { item.qty++; this.save(cart); }
  },
  dec(id) {
    const cart = this.get();
    const item = cart.find(x => x.id === id);
    if (!item) return;
    item.qty--;
    if (item.qty <= 0) cart.splice(cart.indexOf(item), 1);
    this.save(cart);
  },
  clear() { this.save([]); },
  count(cart = this.get()) { return cart.reduce((s, i) => s + i.qty, 0); },
  subtotal(cart = this.get()) { return cart.reduce((s, i) => s + i.price * i.qty, 0); }
};

/* ════════════════════════════════════════
   B. TOAST
════════════════════════════════════════ */
export function showToast(msg, duration = 2400) {
  let wrap = document.getElementById('g-toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'g-toast-wrap';
    wrap.className = 'g-toast-wrap';
    document.body.appendChild(wrap);
  }
  const t = document.createElement('div');
  t.className = 'g-toast';
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => {
    t.classList.add('out');
    t.addEventListener('animationend', () => t.remove(), { once: true });
  }, duration);
}

/* ════════════════════════════════════════
   C. CART DRAWER
════════════════════════════════════════ */
function buildDrawerHTML() {
  return `
    <div class="g-cart-overlay" id="g-cart-overlay"></div>
    <aside class="g-cart-drawer" id="g-cart-drawer" role="dialog" aria-label="購物車" aria-modal="true">
      <div class="g-cart-hd">
        <h2>購物車 <span class="g-cart-hd__count" id="g-cart-hd-count"></span></h2>
        <button class="g-cart-close" id="g-cart-close" aria-label="關閉購物車">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="g-cart-bd" id="g-cart-bd"></div>
      <div class="g-cart-ft">
        <div class="g-cart-row"><span>商品小計</span><span id="g-cart-sub">NT$ 0</span></div>
        <div class="g-cart-row" style="font-size:.76rem;opacity:.65;"><span>運費</span><span>結帳時計算</span></div>
        <div class="g-cart-total"><span>預估合計</span><span id="g-cart-total">NT$ 0</span></div>
        <button class="g-cart-checkout" id="g-cart-checkout">
          前往結帳 <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
        <a href="product.html" class="g-cart-continue">繼續選購</a>
      </div>
    </aside>
  `;
}

function renderCartBody() {
  const cart = Cart.get();
  const bdEl = document.getElementById('g-cart-bd');
  const subEl = document.getElementById('g-cart-sub');
  const totEl = document.getElementById('g-cart-total');
  const chkEl = document.getElementById('g-cart-checkout');
  const countEl = document.getElementById('g-cart-hd-count');
  if (!bdEl) return;

  const sub = Cart.subtotal(cart);
  subEl.textContent = `NT$ ${sub.toLocaleString()}`;
  totEl.textContent = `NT$ ${sub.toLocaleString()}`;
  chkEl.disabled = cart.length === 0;
  countEl.textContent = cart.length ? `(${Cart.count(cart)} 件)` : '';

  if (!cart.length) {
    bdEl.innerHTML = `
      <div class="g-cart-empty">
        <div class="g-cart-empty__icon">🛒</div>
        <p>購物車目前是空的</p>
        <small>去選幾株植物回家吧！</small>
      </div>`;
    return;
  }

  bdEl.innerHTML = cart.map(item => {
    const thumb = item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}">` : item.emoji;
    return `
      <div class="g-cart-item">
        <div class="g-ci-thumb">${thumb}</div>
        <div class="g-ci-info">
          <p class="g-ci-name">${item.name}</p>
          <p class="g-ci-size">${item.size}</p>
          <div class="g-ci-ctrl">
            <button class="g-qty-btn" data-action="dec" data-id="${item.id}" aria-label="減少數量">−</button>
            <span class="g-qty-val">${item.qty}</span>
            <button class="g-qty-btn" data-action="inc" data-id="${item.id}" aria-label="增加數量">+</button>
          </div>
        </div>
        <p class="g-ci-price">NT$ ${(item.price * item.qty).toLocaleString()}</p>
      </div>`;
  }).join('');
}

let drawerOpen = false;

export function openCart() {
  renderCartBody();
  document.getElementById('g-cart-overlay')?.classList.add('open');
  document.getElementById('g-cart-drawer')?.classList.add('open');
  document.body.style.overflow = 'hidden';
  drawerOpen = true;
}

export function closeCart() {
  document.getElementById('g-cart-overlay')?.classList.remove('open');
  document.getElementById('g-cart-drawer')?.classList.remove('open');
  document.body.style.overflow = '';
  drawerOpen = false;
}

/* ════════════════════════════════════════
   D. NAV & FOOTER 注入
════════════════════════════════════════ */
const NAV_LINKS = [
  { href: 'product.html', label: '所有植物', page: 'product' },
  { href: 'tools.html', label: '介質與工具', page: 'tools' },
  { href: 'pet.html', label: '照護助手', page: 'pet' },
  { href: 'about.html', label: '品牌故事', page: 'about' },
  { href: 'member.html', label: '會員中心', page: 'member' },
];

const FOOTER_COLS = [
  {
    title: '選購',
    links: [
      { href: 'product.html', label: '所有植物' },
      { href: 'tools.html', label: '介質與工具' },
      { href: 'checkout.html', label: '購物車結帳' },
    ],
  },
  {
    title: '服務',
    links: [
      { href: 'pet.html', label: '照護助手' },
      { href: 'member.html', label: '會員中心' },
      { href: 'about.html#policy', label: '購物須知' },
    ],
  },
  {
    title: '關於',
    links: [
      { href: 'about.html', label: '品牌故事' },
      { href: 'https://tw.shp.ee/nfaoQgHT', label: '蝦皮賣場', external: true },
      { href: '#', label: 'Instagram' },
    ],
  },
];

function injectNav(activePage) {
  if (document.querySelector('.g-nav')) return;

  const linksHTML = NAV_LINKS.map(l => `<a href="${l.href}" class="g-nav__link${l.page === activePage ? ' active' : ''}">${l.label}</a>`).join('');
  const mobileHTML = NAV_LINKS.map(l => `<a href="${l.href}" class="g-nav__mobile-link${l.page === activePage ? ' active' : ''}">${l.label}</a>`).join('');

  const navEl = document.createElement('nav');
  navEl.className = 'g-nav light-init';
  navEl.id = 'g-nav';
  navEl.setAttribute('role', 'navigation');
  navEl.innerHTML = `
    <div class="container g-nav__inner">
      <a href="index.html" class="g-nav__logo" aria-label="陽光花園 jackpipi 首頁">
        <span class="g-nav__logo-dot"></span>陽光花園 jackpipi
      </a>
      <div class="g-nav__links">
        ${linksHTML}
        <button class="g-nav__cart" id="g-open-cart" aria-label="開啟購物車">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          購物車 <span class="g-nav__cart-count" id="g-cart-count"></span>
        </button>
      </div>
      <button class="g-nav__hamburger" id="g-hamburger" aria-label="開啟選單" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>`;

  const mobileEl = document.createElement('div');
  mobileEl.className = 'g-nav__mobile';
  mobileEl.id = 'g-mobile-menu';
  mobileEl.innerHTML = `
    ${mobileHTML}
    <div class="g-nav__mobile-sub">
      <a href="checkout.html" class="g-nav__mobile-sub-link">購物車結帳</a>
      <a href="about.html#policy" class="g-nav__mobile-sub-link">購物須知</a>
      <a href="https://tw.shp.ee/nfaoQgHT" target="_blank" class="g-nav__mobile-sub-link">蝦皮賣場 ↗</a>
    </div>`;

  document.body.prepend(mobileEl);
  document.body.prepend(navEl);
}

function injectFooter() {
  if (document.querySelector('.g-footer')) return;

  const colsHTML = FOOTER_COLS.map(col => `
    <div>
      <p class="g-footer__col-title">${col.title}</p>
      <ul class="g-footer__links">
        ${col.links.map(l => `<li><a href="${l.href}" class="g-footer__link" ${l.external ? 'target="_blank" rel="noopener"' : ''}>${l.label}${l.external ? ' ↗' : ''}</a></li>`).join('')}
      </ul>
    </div>`).join('');

  const footerEl = document.createElement('footer');
  footerEl.className = 'g-footer';
  footerEl.innerHTML = `
    <div class="container">
      <div class="g-footer__grid">
        <div class="g-footer__brand">
          <div class="g-footer__logo"><span class="g-footer__logo-dot"></span>陽光花園 jackpipi</div>
          <p class="g-footer__tagline">台灣 · 自家培育 · 永續包裝<br>用每一株植物，練習慢下來。</p>
          <div class="g-footer__social">
            <a href="https://tw.shp.ee/nfaoQgHT" target="_blank" class="g-footer__social-btn">🛒</a>
            <a href="#" class="g-footer__social-btn">📷</a>
            <a href="#" class="g-footer__social-btn">💬</a>
          </div>
        </div>
        ${colsHTML}
      </div>
      <div class="g-footer__bottom">
        <p class="g-footer__copy">© 2026 陽光花園 jackpipi. All rights reserved.</p>
        <div class="g-footer__badges">
          <span class="g-footer__badge">🔒 SSL 加密</span>
          <span class="g-footer__badge">🌱 台灣自培</span>
          <span class="g-footer__badge">♻️ 環保包材</span>
        </div>
      </div>
    </div>`;
  document.body.appendChild(footerEl);
}

function injectCartDrawer() {
  if (document.getElementById('g-cart-drawer')) return;
  const wrap = document.createElement('div');
  wrap.innerHTML = buildDrawerHTML();
  document.body.appendChild(wrap);
}

function updateBadge() {
  const n = Cart.count();
  const el = document.getElementById('g-cart-count');
  if (!el) return;
  el.textContent = n;
  el.style.display = n > 0 ? 'flex' : 'none';
  if (n > 0) el.style.animation = 'none', requestAnimationFrame(() => el.style.animation = '');
}

function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => io.observe(el));
}

function init() {
  const activePage = document.body.dataset.page || '';
  injectNav(activePage);
  injectFooter();
  injectCartDrawer();

  const navEl = document.getElementById('g-nav');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navEl?.classList.toggle('scrolled', window.scrollY > 60);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  const hamburger = document.getElementById('g-hamburger');
  const mobileMenu = document.getElementById('g-mobile-menu');
  hamburger?.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
    mobileMenu?.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mobileMenu?.querySelectorAll('.g-nav__mobile-link, .g-nav__mobile-sub-link').forEach(link => link.addEventListener('click', () => {
    hamburger?.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }));

  document.getElementById('g-open-cart')?.addEventListener('click', openCart);
  document.getElementById('g-cart-close')?.addEventListener('click', closeCart);
  document.getElementById('g-cart-overlay')?.addEventListener('click', closeCart);
  document.getElementById('g-cart-checkout')?.addEventListener('click', () => { window.location.href = 'checkout.html'; });

  document.getElementById('g-cart-bd')?.addEventListener('click', e => {
    const btn = e.target.closest('.g-qty-btn');
    if (!btn) return;
    if (btn.dataset.action === 'inc') Cart.inc(btn.dataset.id);
    else Cart.dec(btn.dataset.id);
    renderCartBody();
    updateBadge();
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawerOpen) closeCart(); });
  window.addEventListener('jk:cart-update', () => {
    updateBadge();
    if (drawerOpen) renderCartBody();
  });

  initReveal();
  updateBadge();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
