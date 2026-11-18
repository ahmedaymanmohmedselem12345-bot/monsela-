'use client';

import { useEffect, useRef, useState } from 'react';
import core from '@/public/assets/store-core';
import { price, socials } from '@/lib/brand';
import { checkCoupon, loadCheckout, pendingOrderKey } from '@/lib/checkout';
import { storeClient } from '@/lib/supabase';
import Button from './Button';

function summarize(data, cart, coupon, zone, gift) {
  return core.totals({
    cart, coupon, zone: data.zones.find((entry) => String(entry.id) === zone),
    gift, freeShippingThreshold: data.settings.free_shipping_threshold, giftWrapPrice: data.settings.gift_wrap_price,
  });
}

const paymentOptions = { cod: 'كاش عند الاستلام', vodafone_cash: 'فودافون كاش', instapay: 'InstaPay' };
function paymentDetail(settings, method) {
  if (method === 'vodafone_cash') return settings.vodafone_cash_number;
  if (method === 'instapay') return settings.instapay_info;
  return null;
}

export default function CheckoutForm({ cart, account, replaceCart, onOrder, setLocked }) {
  const [data, setData] = useState(null);
  const [failure, setFailure] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [message, setMessage] = useState('');
  const [zone, setZone] = useState('');
  const [gift, setGift] = useState(false);
  const [method, setMethod] = useState('cod');
  const [code, setCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [busy, setBusy] = useState(false);
  const running = useRef(false);
  const uncertain = useRef(false);
  const total = data ? summarize(data, cart, coupon, zone, gift) : null;

  useEffect(() => {
    let current = true;
    loadCheckout(storeClient()).then((fresh) => {
      if (!current) return;
      const reconciled = core.reconcileCart(cart, fresh.products);
      if (reconciled.changed) {
        replaceCart(reconciled.items, fresh.products);
        setMessage('حدّثنا السلة حسب السعر والمخزون الحالي. راجعها قبل التأكيد.');
      }
      setFailure(false);
      setData(fresh);
    }).catch(() => { if (current) setFailure(true); });
    return () => { current = false; };
    // This snapshot is refreshed explicitly before every submission.
  }, [attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  async function applyCoupon() {
    if (running.current) return;
    const entered = code.trim().toUpperCase();
    if (!entered) { setMessage('اكتب الكوبون الأول.'); return; }
    running.current = true;
    setBusy(true);
    try {
      const result = await checkCoupon(storeClient(), entered, total.subtotal);
      setCoupon(result);
      setMessage('تم تطبيق الكوبون.');
    } catch (error) { setCoupon(null); setMessage(error.message); }
    finally { running.current = false; setBusy(false); }
  }

  async function submit(event) {
    event.preventDefault();
    if (running.current || !data || !total.shippingKnown || !cart.length) return;
    const fields = new FormData(event.currentTarget);
    const name = String(fields.get('name')).trim();
    const phone = core.normalizePhone(fields.get('phone'));
    const address = String(fields.get('address')).trim();
    if (fields.get('website')) return;
    if (name.length < 2 || !phone || address.length < 10) {
      setMessage('راجع الاسم ورقم الموبايل واكتب عنوان واضح للتوصيل.'); return;
    }
    const sender = method === 'cod' ? null : core.normalizePhone(fields.get('sender'));
    const transfer = method === 'cod' ? null : Number(fields.get('amount'));
    if (method !== 'cod' && (!sender || !Number.isFinite(transfer) || transfer <= 0 || Math.abs(transfer - total.total) > 0.01)) {
      setMessage('راجع رقم التحويل. المبلغ المحوّل لازم يساوي الإجمالي النهائي.'); return;
    }
    let pending;
    try { pending = sessionStorage.getItem(pendingOrderKey); } catch {}
    if (pending || uncertain.current) {
      setMessage('في محاولة طلب نتيجتها غير مؤكدة. كلمنا على واتساب قبل ما تعيد الإرسال.'); return;
    }
    running.current = true;
    setBusy(true);
    setLocked(true);
    setMessage('بنراجع بيانات الطلب…');
    const client = storeClient();
    try {
      const fresh = await loadCheckout(client);
      setData(fresh);
      const reconciled = core.reconcileCart(cart, fresh.products);
      let refreshedCoupon = coupon;
      if (reconciled.changed) replaceCart(reconciled.items, fresh.products);
      if (coupon) {
        try {
          refreshedCoupon = await checkCoupon(client, coupon.code, core.totals({ cart: reconciled.items }).subtotal);
          setCoupon(refreshedCoupon);
        } catch (error) { setCoupon(null); throw error; }
      }
      const current = summarize(fresh, reconciled.items, refreshedCoupon, zone, gift);
      if (!current.shippingKnown) throw new Error('منطقة التوصيل مش متاحة دلوقتي. اختار منطقة تانية.');
      if (method !== 'cod' && paymentDetail(fresh.settings, method) !== paymentDetail(data.settings, method)) {
        if (!paymentDetail(fresh.settings, method)) setMethod('cod');
        throw new Error('بيانات التحويل اتغيرت. راجع طريقة الدفع قبل ما تأكد الطلب.');
      }
      if (reconciled.changed || JSON.stringify([current.total, current.discount, current.deliveryFee, current.giftFee, current.zone.name]) !==
          JSON.stringify([total.total, total.discount, total.deliveryFee, total.giftFee, total.zone.name])) {
        throw new Error('بيانات الطلب اتغيرت. راجع السلة والإجمالي وأكّد من جديد.');
      }
      const giftMessage = gift ? [fields.get('recipient'), fields.get('giftMessage')].map((part) => String(part || '').trim()).filter(Boolean).join(' — ') : null;
      uncertain.current = true;
      try { sessionStorage.setItem(pendingOrderKey, JSON.stringify({ at: new Date().toISOString() })); } catch {}
      setMessage('جاري تسجيل الطلب…');
      const result = await client.rpc('place_order', {
        p_customer_name: name, p_customer_phone: phone, p_customer_address: address,
        p_customer_id: account?.id || null, p_notes: String(fields.get('notes') || '').trim() || null,
        p_items: reconciled.items, p_total: current.total, p_coupon_code: refreshedCoupon?.code || null,
        p_discount: current.discount, p_delivery_zone: current.zone.name, p_delivery_fee: current.deliveryFee,
        p_is_gift: gift, p_gift_message: giftMessage || null, p_payment_method: method,
        p_payment_status: method === 'cod' ? 'cod' : 'pending_verification',
        p_payment_transaction_id: sender, p_payment_amount: transfer, p_payment_proof_url: null,
      });
      if (result.error) {
        if (!/fetch|network|timeout|abort|failed to send/i.test(result.error.message || '')) {
          uncertain.current = false;
          try { sessionStorage.removeItem(pendingOrderKey); } catch {}
          throw new Error('تعذّر تسجيل الطلب. راجع بيانات الطلب أو كلمنا.');
        }
        throw result.error;
      }
      const order = Array.isArray(result.data) ? result.data[0] : result.data;
      if (!order?.order_number && !order?.id) throw new Error('مفيش رقم تأكيد.');
      uncertain.current = false;
      try { sessionStorage.removeItem(pendingOrderKey); } catch {}
      if (account) client.from('customer_profiles').upsert({ id: account.id, name, phone, address }).then(() => {}, () => {});
      onOrder({
        number: String(order.order_number || order.id), phone, method,
        total: order.total != null && Number.isFinite(Number(order.total)) ? Number(order.total) : current.total,
        expected: current.total, items: reconciled.items,
      });
    } catch (error) {
      setMessage(uncertain.current ? 'نتيجة الإرسال مش مؤكدة. كلمنا على واتساب قبل ما تعيد إرسال الطلب.' : error.message);
    } finally {
      running.current = false;
      setBusy(false);
      setLocked(false);
    }
  }

  if (!data && !failure) return <p role="status">بنراجع الأسعار والمخزون والتوصيل…</p>;
  if (failure) return <div className="form-stack"><p role="status">حصلت مشكلة في تحميل بيانات الطلب.</p><Button tone="gold" onClick={() => { setFailure(false); setAttempt((value) => value + 1); }}>حاول تاني</Button></div>;
  if (!cart.length) return <p role="status">المنتجات اللي في سلتك خلصت. ارجع للمتجر واختار منتجات تانية.</p>;

  return <form className="form-stack checkout-form" onSubmit={submit}>
    <fieldset className="form-stack" disabled={busy}>
      <label>اسمك بالكامل<input name="name" autoComplete="name" defaultValue={account?.user_metadata?.full_name} maxLength={100} minLength={2} required /></label>
      <label>رقم الموبايل<input name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={20} defaultValue={account?.user_metadata?.phone} required /></label>
      <label>عنوان التوصيل<textarea name="address" autoComplete="street-address" minLength={10} maxLength={600} required /></label>
      <label>منطقة التوصيل<select value={zone} onChange={(event) => setZone(event.target.value)} required>
        <option value="">اختار منطقة التوصيل</option>
        {data.zones.map((entry) => <option key={entry.id} value={entry.id}>{entry.name} — {price(entry.fee)}</option>)}
      </select></label>
      {!data.zones.length && <p>مفيش مناطق توصيل متاحة دلوقتي. <a href={socials.whatsapp}>كلمنا على واتساب</a>.</p>}
      <label>كوبون الخصم<input value={code} maxLength={64} onChange={(event) => { setCode(event.target.value); setCoupon(null); }} /></label>
      <Button tone="outline" onClick={applyCoupon}>طبّق الكوبون</Button>
      <label className="check-line"><input type="checkbox" checked={gift} onChange={(event) => setGift(event.target.checked)} /> الطلب هدية؟</label>
      {gift && <><label>اسم اللي هتوصله الهدية<input name="recipient" maxLength={100} /></label><label>رسالة الهدية<textarea name="giftMessage" maxLength={500} /></label></>}
      <label>ملاحظات على الطلب<textarea name="notes" maxLength={1000} /></label>
      <label>طريقة الدفع<select value={method} onChange={(event) => setMethod(event.target.value)}>
        {Object.entries(paymentOptions).filter(([value]) => value === 'cod' || paymentDetail(data.settings, value)).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select></label>
      {method !== 'cod' && <>
        <p>{paymentOptions[method]}: {paymentDetail(data.settings, method)}. اتأكد من الإجمالي قبل التحويل.</p>
        {data.settings.payment_instructions && <p>{data.settings.payment_instructions}</p>}
        <label>رقم الموبايل اللي اتحوّل منه المبلغ<input name="sender" type="tel" inputMode="tel" maxLength={20} required /></label>
        <label>المبلغ اللي حوّلته<input name="amount" type="number" inputMode="decimal" step="0.01" min="0.01" required /></label>
      </>}
      <div hidden aria-hidden="true"><label>موقعك<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <div className="checkout-total">
        {cart.map((item) => <p key={item.cartKey}>{item.name} × {item.qty}</p>)}
        <p>قيمة المنتجات: {price(total.subtotal)}</p>
        {total.discount > 0 && <p>الخصم: {price(total.discount)}</p>}
        <p>التوصيل: {total.shippingKnown ? total.deliveryFee ? price(total.deliveryFee) : 'مجاني' : 'اختار منطقتك'}</p>
        {total.giftFee > 0 && <p>تغليف الهدية: {price(total.giftFee)}</p>}
        <strong>{total.shippingKnown ? 'الإجمالي' : 'الإجمالي قبل الشحن'}: {price(total.total)}</strong>
      </div>
      <div className="check-line"><input id="order-agreement" type="checkbox" required /><label htmlFor="order-agreement">قرأت <a href="/terms.html" target="_blank" rel="noreferrer">شروط الطلب</a> و<a href="/privacy.html" target="_blank" rel="noreferrer">سياسة الخصوصية</a>.</label></div>
      <Button type="submit" disabled={busy || !total.shippingKnown}>أكد الطلب</Button>
    </fieldset>
    <p role="status" className="form-status">{message}</p>
    {message.includes('غير مؤكدة') || message.includes('مش مؤكدة') ? <Button href={socials.whatsapp} tone="outline">كلمنا على واتساب</Button> : null}
  </form>;
}
