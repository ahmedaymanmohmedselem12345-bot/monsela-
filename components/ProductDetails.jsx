'use client';

import { useState } from 'react';
import core from '@/public/assets/store-core';
import { original, price, socials } from '@/lib/brand';
import { productImage } from './ProductArea';
import Button from './Button';

export default function ProductDetails({ product, add }) {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const colors = Array.isArray(product.bottle_colors) ? product.bottle_colors : [];
  const [variantLabel, setVariant] = useState(variants[0]?.label || '');
  const [bottleColor, setColor] = useState(colors[0]?.name || '');
  const [quantity, setQuantity] = useState('1');
  const item = core.catalogItem({ id: product.id, variantLabel, bottleColor }, [product]);
  const image = productImage(product);

  return <div className="product-details">
    {image && <img src={image} alt={product.name} decoding="async" />}
    <p>{product.description || product.notes}</p>
    <dl>{[['الماركة', 'brand'], ['تركيز العطر', 'concentration'], ['المقدمة', 'top_notes'],
      ['القلب', 'heart_notes'], ['القاعدة', 'base_notes']].filter(([, field]) => product[field]).map(([label, field]) =>
      <div key={field}><dt>{label}</dt><dd>{product[field]}</dd></div>)}</dl>
    <form className="form-stack" onSubmit={(event) => {
      event.preventDefault();
      if (item) add({ ...item, qty: Number(quantity) });
    }}>
      {variants.length > 0 && <label>الحجم<select value={variantLabel} onChange={(event) => { setVariant(event.target.value); setQuantity('1'); }}>
        {variants.map((variant) => <option key={variant.label} value={variant.label}>{variant.label}</option>)}</select></label>}
      {colors.length > 0 && <label>لون الزجاجة<select value={bottleColor} onChange={(event) => setColor(event.target.value)}>
        {colors.map((color) => <option key={color.name} value={color.name}>{color.name}</option>)}</select></label>}
      {item ? <>
        <strong>{price(item.price)}</strong>
        <label>الكمية<input type="number" min={1} max={item.stock} value={quantity} onChange={(event) => setQuantity(event.target.value)} required /></label>
        <Button type="submit">أضف للسلة</Button>
      </> : <p role="status">الاختيار ده مش متاح دلوقتي.</p>}
    </form>
    <Button tone="outline" href={`${original}?view=product&product=${encodeURIComponent(product.id)}`}>تفاصيل وتقييمات أكتر</Button>
  </div>;
}
