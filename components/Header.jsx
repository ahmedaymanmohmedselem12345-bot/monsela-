'use client';

import { useEffect, useState } from 'react';
import { Menu, Search, ShoppingBag, UserRound } from 'lucide-react';

export default function Header({ count, open, show, query, setQuery, onSearch }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
    <div className="container header-inner">
      <button type="button" className="icon-button menu-toggle" aria-label="فتح القائمة" aria-expanded={open === 'menu'} aria-controls="mobile-menu" onClick={() => show('menu')}><Menu /></button>
      <a className="wordmark" href="#home" aria-label="MonSela الرئيسية" lang="en" dir="ltr">MonSela</a>
      <form className="header-search" role="search" aria-label="بحث الهيدر" onSubmit={(event) => {
        event.preventDefault();
        onSearch();
        document.getElementById('store')?.scrollIntoView();
      }}>
        <button type="submit" aria-label="عرض نتائج البحث"><Search size={21} /></button>
        <input type="search" aria-label="ابحث عن منتج" placeholder="ابحث عن منتج…" value={query} onChange={(event) => setQuery(event.target.value)} />
      </form>
      <div className="header-actions">
        <button type="button" className="icon-button header-account" aria-label="حسابي" onClick={() => show('account')}><UserRound /></button>
        <button type="button" className="icon-button header-cart" aria-label={`السلة، ${count} منتج`} onClick={() => show('cart')}>
          <ShoppingBag />{count > 0 && <span className="cart-badge" aria-hidden="true">{count > 99 ? '٩٩+' : count.toLocaleString('ar-EG')}</span>}
        </button>
      </div>
    </div>
  </header>;
}
