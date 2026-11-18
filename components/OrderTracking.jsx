'use client';

import { useRef, useState } from 'react';
import core from '@/public/assets/store-core';
import { price } from '@/lib/brand';
import { storeClient } from '@/lib/supabase';
import Button from './Button';

const stages = ['جديد', 'قيد التجهيز', 'في الطريق', 'اتسلم'];
const localDate = new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeZone: 'Africa/Cairo' });

export default function OrderTracking({ initial }) {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const last = useRef(0);

  async function track(event) {
    event.preventDefault();
    if (Date.now() - last.current < 3000 || busy) return;
    const fields = new FormData(event.currentTarget);
    const number = String(fields.get('order')).trim().toUpperCase();
    const phone = core.normalizePhone(fields.get('phone'));
    if (!number || !phone) { setMessage('اكتب رقم الطلب ورقم موبايل صحيح.'); return; }
    last.current = Date.now();
    setBusy(true);
    setMessage('جاري البحث…');
    setOrders([]);
    try {
      const { data, error } = await storeClient().rpc('track_order_logged', { p_order_number: number, p_phone: phone });
      if (error) throw error;
      const results = Array.isArray(data) ? data : data ? [data] : [];
      setOrders(results);
      setMessage(results.length ? '' : 'مفيش طلب مطابق. اتأكد من رقم الطلب ورقم الموبايل.');
    } catch { setMessage('حصلت مشكلة في تتبع الطلب. حاول تاني.'); }
    finally { setBusy(false); }
  }

  return <>
    <form className="form-stack" onSubmit={track}>
      <label>رقم الطلب<input name="order" dir="ltr" autoCapitalize="characters" autoComplete="off" defaultValue={initial?.number} maxLength={64} required /></label>
      <label>رقم الموبايل<input name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={initial?.phone} maxLength={20} required /></label>
      <Button type="submit" disabled={busy}>تتبع طلبك</Button>
      <p role="status" className="form-status">{message}</p>
    </form>
    {orders.map((order) => <article className="tracking-result" key={order.order_number}>
      <strong dir="ltr">{order.order_number}</strong><p>حالة الطلب: {order.status}</p><p>الإجمالي: {price(order.total)}</p>
      {stages.includes(order.status) && <ol className="tracking-stages">{stages.map((stage) =>
        <li key={stage} aria-current={order.status === stage ? 'step' : undefined}>{stage}</li>)}</ol>}
      {order.estimated_delivery_date && !['اتسلم', 'مرتجع'].includes(order.status) && Number.isFinite(Date.parse(order.estimated_delivery_date)) &&
        <p>ميعاد التوصيل المتوقع: {localDate.format(new Date(order.estimated_delivery_date))}</p>}
      {Array.isArray(order.items) && <ul>{order.items.map((item, index) => <li key={index}>{item.name} × {item.qty}</li>)}</ul>}
      {order.payment_status && order.payment_status !== 'cod' && <p>{({ pending_verification: 'الدفع قيد المراجعة', approved: 'الدفع مؤكد', rejected: 'الدفع مرفوض', need_new_proof: 'مطلوب إثبات دفع جديد' })[order.payment_status]}</p>}
      {order.payment_rejection_reason && ['rejected', 'need_new_proof'].includes(order.payment_status) && <p>{order.payment_rejection_reason}</p>}
      <Button tone="outline" href={core.whatsappURL('201068828900', `عندي استفسار بخصوص طلب ${order.order_number}`)} target="_blank" rel="noreferrer">اسألنا عن طلبك</Button>
    </article>)}
  </>;
}
