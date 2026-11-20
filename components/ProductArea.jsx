'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { original, price } from '@/lib/brand';
import { filterCatalog } from '@/lib/catalog';
import Button from './Button';
import EmptyProductState from './EmptyProductState';

export default function ProductArea({ products, status, category, setCategory, query, setQuery, filters, ranking, reset, show, reload, openProduct }) {
  const [pagination, setPagination] = useState({ criteria: null, limit: 12 });
  const criteria = JSON.stringify([category, query, filters]);
  const limit = pagination.criteria === criteria ? pagination.limit : 12;
  const list = filterCatalog(products, { category, query, filters, ranking });
  const filterCount = Object.entries(filters).filter(([key, value]) => Array.isArray(value) ? value.length : key === 'sort' ? value !== 'default' : value !== '').length;
  const filtered = Boolean(category || query || filterCount);
  return <section id="store" className="section catalog">
    <div className="container">
      <div className="section-heading catalog-heading"><h2>{filtered ? category || 'نتائج المتجر' : 'مختارات مونسيلا'}</h2></div>
      <div className="catalog-controls">
        <label className="search-field"><Search size={19} /><span className="sr-only">ابحث في المنتجات</span><input type="search" value={query} placeholder="ابحث في المنتجات" onChange={(event) => setQuery(event.target.value)} /></label>
        {category && <button type="button" className="catalog-all" onClick={() => setCategory('')}>كل المنتجات</button>}
        <Button tone="dark-outline" onClick={() => show('filters')}><SlidersHorizontal size={18} /> الفلاتر والترتيب{filterCount > 0 && ` (${filterCount})`}</Button>
      </div>
      {status !== 'ready' || !list.length ? <EmptyProductState
        state={status !== 'ready' ? status : products.length && filtered ? 'filtered' : 'empty'} onRetry={reload} onReset={reset} /> :
        <>
          {filtered && <p role="status">{list.length.toLocaleString('ar-EG')} منتج</p>}
          <div className="product-grid">{list.slice(0, limit).map((product) => <ProductCard key={product.id} product={product} onClick={() => openProduct(product)} />)}</div>
          {limit < list.length && <div className="centered"><Button tone="dark-outline" onClick={() => setPagination({ criteria, limit: limit + 12 })}>شوف منتجات أكتر</Button></div>}
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
