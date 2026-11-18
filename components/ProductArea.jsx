'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { categories, original, price } from '@/lib/brand';
import { filterCatalog } from '@/lib/catalog';
import Button from './Button';
import EmptyProductState from './EmptyProductState';

export default function ProductArea({ products, status, category, setCategory, query, setQuery, filters, ranking, reset, show, reload, openProduct }) {
  const [limit, setLimit] = useState(12);
  const list = filterCatalog(products, { category, query, filters, ranking });
  const filterCount = Object.entries(filters).filter(([key, value]) => Array.isArray(value) ? value.length : key === 'sort' ? value !== 'default' : value !== '').length;
  const filtered = Boolean(category || query || filterCount);
  return <section id="store" className="section catalog">
    <div className="container">
      <div className="section-heading"><h2>المتجر</h2><p>اختار القسم اللي بتحب تتصفح فيه.</p></div>
      <div className="catalog-controls">
        <label className="search-field"><Search size={19} /><span className="sr-only">ابحث في المنتجات</span><input type="search" value={query} placeholder="ابحث في المنتجات" onChange={(event) => { setLimit(12); setQuery(event.target.value); }} /></label>
        <Button tone="outline" onClick={() => show('filters')}><SlidersHorizontal size={18} /> الفلاتر والترتيب{filterCount > 0 && ` (${filterCount})`}</Button>
      </div>
      <div className="chips" aria-label="أقسام المنتجات" role="group">
        {['', ...categories.map(({ label }) => label)].map((label) => <button key={label} type="button" aria-pressed={category === label}
          onClick={() => { setLimit(12); setCategory(label); }}>{label || 'الكل'}</button>)}
      </div>
      {status !== 'ready' || !list.length ? <EmptyProductState
        state={status !== 'ready' ? status : products.length && filtered ? 'filtered' : 'empty'} onRetry={reload} onReset={reset} /> :
        <>
          {filtered && <p role="status">{list.length.toLocaleString('ar-EG')} منتج</p>}
          <div className="product-grid">{list.slice(0, limit).map((product) => <ProductCard key={product.id} product={product} onClick={() => openProduct(product)} />)}</div>
          {limit < list.length && <div className="centered"><Button tone="outline" onClick={() => setLimit((previous) => previous + 12)}>شوف منتجات أكتر</Button></div>}
        </>}
    </div>
  </section>;
}

export function productImage(product) {
  const raw = product.image_url || (Array.isArray(product.images) ? product.images[0] : null) || product.image;
  if (typeof raw !== 'string') return null;
  try {
    const url = new URL(raw, 'https://monsela-xi.vercel.app');
    return ['https:', 'http:'].includes(url.protocol) ? (raw.startsWith('/') && !raw.startsWith('//') ? raw : url.href) : null;
  } catch { return null; }
}

export function ProductCard({ product, onClick }) {
  const image = productImage(product);
  const first = Array.isArray(product.variants) && product.variants.length ? product.variants[0] : product;
  return <article className="product-card">
    <a href={`${original}?view=product&product=${encodeURIComponent(product.id)}`} onClick={(event) => {
      if (!event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey) { event.preventDefault(); onClick(); }
    }}>
      <div className="product-image">{image ? <img src={image} alt="" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.hidden = true; }} /> : null}<span aria-hidden="true">M</span></div>
      <div className="product-caption">
        <h3>{product.name}</h3>
        {Number(first.price) > 0 && <p>{price(first.price)}</p>}
        <span className="product-action">شوف التفاصيل</span>
      </div>
    </a>
  </article>;
}
