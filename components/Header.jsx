'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Menu, ShoppingBag, UserRound } from 'lucide-react';
import { categories } from '@/lib/brand';

export default function Header({ count, open, show, onCategory }) {
  const [scrolled, setScrolled] = useState(false);
  const sections = useRef(null);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
    <div className="container header-inner">
      <button className="icon-button menu-toggle" aria-label="فتح القائمة" aria-expanded={open === 'menu'} aria-controls="mobile-menu" onClick={() => show('menu')}><Menu /></button>
      <a className="wordmark" href="#home" aria-label="MonSela الرئيسية" lang="en" dir="ltr">MONSELA</a>
      <nav className="desktop-nav" aria-label="التنقل الرئيسي">
        <a href="#home">الرئيسية</a>
        <details ref={sections} className="category-menu"
          onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false; }}
          onKeyDown={(event) => { if (event.key === 'Escape') { event.currentTarget.open = false; event.currentTarget.querySelector('summary').focus(); } }}>
          <summary>المتجر <ChevronDown size={15} /></summary>
          <div className="category-menu-list">
            <a href="#store" onClick={() => { onCategory(''); sections.current.open = false; }}>كل المنتجات</a>
            {categories.map(({ label }) => <a key={label} href="#store" onClick={() => { onCategory(label); sections.current.open = false; }}>{label}</a>)}
          </div>
        </details>
        <a href="#quiz">اختبار العطور</a>
        <button type="button" className="nav-track" onClick={() => show('track')}>تتبع طلبك</button>
      </nav>
      <div className="header-actions">
        <button className="icon-button header-account" aria-label="حسابي" onClick={() => show('account')}><UserRound /></button>
        <button className="icon-button header-cart" aria-label={`السلة، ${count} منتج`} onClick={() => show('cart')}>
          <ShoppingBag /><span className="cart-badge" aria-hidden="true">{count > 99 ? '٩٩+' : count.toLocaleString('ar-EG')}</span>
        </button>
      </div>
    </div>
  </header>;
}
