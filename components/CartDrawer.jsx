import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import core from '@/public/assets/store-core';
import { price } from '@/lib/brand';
import Button from './Button';
import Dialog from './Dialog';

export default function CartDrawer({ open, close, cart, cartReady, browse, update, show, saved, save, restore, removeSaved }) {
  const { subtotal } = core.totals({ cart });
  return <Dialog id="cart-drawer" open={open} onClose={close} title="السلة" variant="end"
    footer={cart.length > 0 && <><div className="cart-line"><strong>الإجمالي قبل الشحن</strong><strong>{price(subtotal)}</strong></div>
      <Button onClick={() => show('checkout')} disabled={!cartReady}>إتمام الطلب</Button></>}>
    {!cart.length && <div className="cart-empty"><ShoppingBag size={38} /><h3>السلة فاضية لسه</h3><Button href="#store" onClick={browse}>تصفح المنتجات</Button></div>}
    {cart.length > 0 && <ul className="cart-items">{cart.map((item) => <li key={item.cartKey}>
      <strong>{item.name}</strong><p>{price(item.price)}</p>
      <div className="quantity-row">
        <button className="icon-button" aria-label={`زود كمية ${item.name}`} onClick={() => update(item, item.qty + 1)} disabled={!cartReady}><Plus size={18} /></button>
        <span aria-live="polite">{item.qty.toLocaleString('ar-EG')}</span>
        <button className="icon-button" aria-label={`قلل كمية ${item.name}`} onClick={() => update(item, item.qty - 1)} disabled={!cartReady || item.qty < 2}><Minus size={18} /></button>
        <button className="icon-button" aria-label={`احذف ${item.name}`} onClick={() => update(item, 0)}><Trash2 size={18} /></button>
      </div>
      <button className="inline-button" onClick={() => save(item)}>احفظ لبعدين</button>
    </li>)}</ul>}
    {saved.length > 0 && <section className="saved-items"><h3>محفوظ لبعدين</h3><ul className="cart-items">{saved.map((item) => <li key={item.cartKey}>
      <strong>{item.name}</strong>
      <div className="form-links">
        <button type="button" disabled={!cartReady} onClick={() => restore(item)}>رجّع للسلة</button>
        <button type="button" onClick={() => removeSaved(item)}>احذف</button>
      </div>
    </li>)}</ul></section>}
  </Dialog>;
}
