'use client';

import { useEffect, useRef, useState } from 'react';
import core from '@/public/assets/store-core';
import { filtersInitial, isActive } from '@/lib/catalog';
import { price, socials } from '@/lib/brand';
import { storeClient } from '@/lib/supabase';
import BottomNav from './BottomNav';
import Button from './Button';
import CartDrawer from './CartDrawer';
import CheckoutForm from './CheckoutForm';
import Dialog from './Dialog';
import FAQ from './FAQ';
import FilterSheet from './FilterSheet';
import FloatingButtons from './FloatingButtons';
import Footer from './Footer';
import Header from './Header';
import Hero from './Hero';
import LoginForm from './LoginForm';
import NavDrawer from './NavDrawer';
import Newsletter from './Newsletter';
import OrderTracking from './OrderTracking';
import ProductArea from './ProductArea';
import ProductDetails from './ProductDetails';
import ScentQuiz from './ScentQuiz';

const cartKey = 'monsela_cart';
const savedKey = 'monsela_saved_later';

function readCart(key = cartKey) {
  try {
    const cart = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(cart) ? cart.filter((item) => item?.id != null && Number.isFinite(+item.qty) && +item.qty >= 1)
      .map((item) => ({ ...item, qty: Math.floor(Number(item.qty)), cartKey: item.cartKey || core.itemKey(item.id, item.variantLabel, item.bottleColor) })) : [];
  } catch { return []; }
}

function emitCommerce(event, detail) {
  window.dataLayer ||= [];
  window.dataLayer.push({ event: `monsela_${event}`, currency: 'EGP', ...detail });
  window.dispatchEvent(new CustomEvent('monsela:commerce', { detail: { event, currency: 'EGP', ...detail } }));
}

export default function Storefront() {
  const [open, show] = useState('');
  const [active, setActive] = useState('home');
  const [status, setStatus] = useState('loading');
  const [products, setProducts] = useState([]);
  const [ranking, setRanking] = useState({});
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [filters, setFilters] = useState(filtersInitial);
  const [cart, setCart] = useState([]);
  const [saved, setSaved] = useState([]);
  const [selected, setSelected] = useState(null);
  const [account, setAccount] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [locked, setLocked] = useState(false);
  const [notice, setNotice] = useState('');
  const cartRef = useRef([]);
  const catalogRef = useRef(null);
  const catalogRequest = useRef(0);
  const close = () => show('');

  function replaceCart(items, newCatalog) {
    if (newCatalog) { catalogRef.current = newCatalog; setProducts(newCatalog); }
    cartRef.current = items;
    setCart(items);
    try { localStorage.setItem(cartKey, JSON.stringify(items)); } catch {}
  }

  async function reload() {
    const request = ++catalogRequest.current;
    setStatus('loading');
    try {
      const { data, error } = await storeClient().from('products').select('*')
        .order('featured', { ascending: false }).order('sort_order', { ascending: true }).order('created_at', { ascending: false });
      if (catalogRequest.current !== request) return;
      if (error) throw error;
      const list = (data || []).filter(isActive);
      replaceCart(core.reconcileCart(cartRef.current, list).items, list);
      setStatus('ready');
    } catch {
      if (catalogRequest.current === request) setStatus('error');
    }
  }

  useEffect(() => {
    const client = storeClient();
    const restore = () => {
      const saved = readCart();
      cartRef.current = catalogRef.current ? core.reconcileCart(saved, catalogRef.current).items : saved;
      setCart(cartRef.current);
    };
    restore();
    setSaved(readCart(savedKey));
    reload();
    const { data: auth } = client.auth.onAuthStateChange((_, session) => setAccount(session?.user || null));
    client.rpc('get_best_sellers', { limit_count: 50 }).then(({ data }) => {
      if (Array.isArray(data)) setRanking(Object.fromEntries(data.filter((row) => row.product_id != null)
        .map((row, index) => [row.product_id, Number(row.total_sold ?? row.total_qty ?? (data.length - index))])));
    }).catch(() => {});
    client.rpc('increment_page_view').then(() => {}, () => {});
    const onStorage = (event) => {
      if (event.key === cartKey) restore();
      if (event.key === savedKey) setSaved(readCart(savedKey));
    };
    const onPageShow = (event) => { if (event.persisted) { restore(); setSaved(readCart(savedKey)); reload(); } };
    window.addEventListener('storage', onStorage);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      catalogRequest.current++;
      auth.subscription.unsubscribe();
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, []);

  useEffect(() => {
    function updateActive() {
      const point = Math.min(window.innerHeight * 0.4, 220);
      const next = ['quiz', 'store', 'home'].find((id) => document.getElementById(id)?.getBoundingClientRect().top <= point);
      setActive(next || 'home');
    }
    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive, { passive: true });
    return () => { window.removeEventListener('scroll', updateActive); window.removeEventListener('resize', updateActive); };
  }, []);

  function add(item) {
    const existing = cartRef.current.find((entry) => entry.cartKey === item.cartKey);
    const next = existing
      ? cartRef.current.map((entry) => entry.cartKey === item.cartKey ? { ...entry, qty: entry.qty + item.qty } : entry)
      : [...cartRef.current, item];
    const resolved = core.reconcileCart(next, catalogRef.current || []).items;
    const gained = (resolved.find((entry) => entry.cartKey === item.cartKey)?.qty || 0) - (existing?.qty || 0);
    replaceCart(resolved);
    if (gained > 0) emitCommerce('add_to_cart', {
      value: core.money(gained * item.price),
      items: [{ item_id: item.id, item_name: item.name, price: item.price, quantity: gained }],
    });
    setNotice(gained === item.qty ? 'اتضاف للسلة.' : gained ? 'أضفنا الكمية المتاحة بس.' : 'وصلت لأقصى كمية متاحة.');
    show('cart');
    return gained;
  }

  function update(item, quantity) {
    const next = quantity < 1 ? cartRef.current.filter((entry) => entry.cartKey !== item.cartKey)
      : cartRef.current.map((entry) => entry.cartKey === item.cartKey ? { ...entry, qty: quantity } : entry);
    replaceCart(catalogRef.current ? core.reconcileCart(next, catalogRef.current).items : next);
  }

  function persistSaved(items) {
    setSaved(items);
    try { localStorage.setItem(savedKey, JSON.stringify(items)); } catch {}
  }

  function saveForLater(item) {
    const prior = saved.find((entry) => entry.cartKey === item.cartKey);
    const later = { ...item, qty: item.qty + (prior?.qty || 0) };
    persistSaved([...saved.filter((entry) => entry.cartKey !== item.cartKey), later]);
    update(item, 0);
  }

  function removeSaved(item) {
    persistSaved(saved.filter((entry) => entry.cartKey !== item.cartKey));
  }

  function restoreSaved(item) {
    const current = core.catalogItem(item, catalogRef.current || []);
    if (!current) { setNotice('المنتج ده مش متاح حاليًا.'); return; }
    if (add({ ...current, qty: item.qty }) > 0) removeSaved(item);
  }

  function openProduct(product) { setSelected(product); show('product'); }

  function openSheet(name) {
    if (name === 'checkout') emitCommerce('begin_checkout', { value: core.totals({ cart: cartRef.current }).subtotal });
    if (name === 'track') setReceipt(null);
    setNotice('');
    show(name);
  }

  function onOrder(result) {
    replaceCart([]);
    setReceipt(result);
    emitCommerce('order_submitted', {
      transaction_id: result.number, value: result.total,
      items: result.items.map((item) => ({ item_id: item.id, item_name: item.name, price: item.price, quantity: item.qty })),
    });
    show('receipt');
  }

  function onCategory(value) { setCategory(value); close(); }

  return <>
    <a className="skip-link" href="#main">انقل للمحتوى</a>
    <Header count={cart.reduce((sum, item) => sum + item.qty, 0)} open={open} show={openSheet} onCategory={onCategory} />
    <main id="main">
      <Hero />
      <ProductArea products={products} status={status} category={category} setCategory={setCategory} query={query} setQuery={setQuery}
        filters={filters} ranking={ranking} reset={() => { setFilters(filtersInitial); setQuery(''); setCategory(''); }}
        show={openSheet} reload={reload} openProduct={openProduct} />
      <ScentQuiz open={open === 'quiz'} show={openSheet} close={close} products={products} onProduct={openProduct} />
      <section className="section story"><div className="container story-layout">
        <div><div className="gold-rule" /><h2>أكتر من مجرد عطر</h2></div>
        <div><p>في مونسيلا بنختار كل تفصيلة بعناية، من أول نوتة في العطر لحد آخر لمسة في التغليف.</p><Button tone="outline" href="/about.html">اعرف حكايتنا</Button></div>
      </div></section>
      <FAQ />
      <Newsletter />
    </main>
    <Footer show={openSheet} />
    <BottomNav active={active} show={openSheet} open={open} />
    <FloatingButtons open={open} />

    <NavDrawer open={open === 'menu'} close={close} show={openSheet} onCategory={onCategory} />
    <CartDrawer open={open === 'cart'} close={close} cart={cart} cartReady={status === 'ready'} browse={close} update={update} show={openSheet}
      saved={saved} save={saveForLater} restore={restoreSaved} removeSaved={removeSaved} />
    <FilterSheet open={open === 'filters'} close={close} products={products} filters={filters} onApply={(value) => { setFilters(value); close(); }} />
    <Dialog id="account-dialog" title="حسابي" open={open === 'account'} onClose={close} dark>
      {open === 'account' && <LoginForm account={account} />}
    </Dialog>
    <Dialog id="track-dialog" title="تتبع طلبك" open={open === 'track'} onClose={close}>
      {open === 'track' && <OrderTracking initial={receipt} />}
    </Dialog>
    <Dialog id="product-dialog" title={selected?.name || 'تفاصيل المنتج'} open={open === 'product'} onClose={close}>
      {open === 'product' && selected && <ProductDetails product={selected} add={add} />}
    </Dialog>
    <Dialog id="checkout-dialog" title="إتمام الطلب" open={open === 'checkout'} onClose={() => { if (!locked) show('cart'); }} closeDisabled={locked}>
      {open === 'checkout' && <CheckoutForm cart={cart} account={account} replaceCart={replaceCart} onOrder={onOrder} setLocked={setLocked} />}
    </Dialog>
    <Dialog id="receipt-dialog" title="استلمنا طلبك" open={open === 'receipt'} onClose={close}>
      {open === 'receipt' && receipt && <div className="form-stack">
        <p>احتفظ برقم الطلب عشان تتابعه.</p>
        <strong className="receipt-number" dir="ltr">{receipt.number}</strong>
        <p>الإجمالي المسجّل: {price(receipt.total)}</p>
        {receipt.expected !== receipt.total && <p>الإجمالي المسجّل مختلف عن المعروض قبل الإرسال. كلمنا قبل أي تحويل.</p>}
        {receipt.method !== 'cod' && <p>بيانات التحويل وصلت، والدفع قيد المراجعة.</p>}
        <Button tone="outline" onClick={async () => {
          try { await navigator.clipboard.writeText(receipt.number); setNotice('اتنسخ رقم الطلب.'); }
          catch { setNotice(`رقم الطلب ${receipt.number}`); }
        }}>نسخ رقم الطلب</Button>
        <p role="status" className="form-status">{notice}</p>
        <Button onClick={() => show('track')}>تتبع طلبك</Button>
        <Button tone="outline" href={core.whatsappURL(socials.whatsapp.split('/').at(-1), `عندي استفسار بخصوص طلب ${receipt.number}`)}>تواصل بخصوص الطلب</Button>
        <Button tone="outline" onClick={close}>كمّل التسوق</Button>
      </div>}
    </Dialog>
    <p role="status" className="sr-only">{open !== 'receipt' ? notice : ''}</p>
  </>;
}
