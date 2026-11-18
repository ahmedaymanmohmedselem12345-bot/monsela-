'use client';

import { useRef, useState } from 'react';
import core from '@/public/assets/store-core';
import { storeClient } from '@/lib/supabase';
import Button from './Button';

export default function Newsletter() {
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function subscribe(event) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const phone = core.normalizePhone(new FormData(form).get('phone'));
    if (!phone) { setMessage('اكتب رقم موبايل مصري صحيح.'); return; }
    submitting.current = true;
    setBusy(true);
    setMessage('');
    try {
      const { error } = await storeClient().from('newsletter_subscribers').insert({ phone });
      if (error?.code === '23505') { setMessage('الرقم ده مشترك بالفعل.'); return; }
      if (error) throw error;
      form.reset();
      setMessage('تم الاشتراك. هنبعتلك عروضنا على واتساب.');
    } catch { setMessage('الاشتراك ما تمّش دلوقتي. حاول تاني.'); }
    finally { submitting.current = false; setBusy(false); }
  }

  return <section id="newsletter" className="newsletter section">
    <div className="container newsletter-layout">
      <div><h2>خليك قريب من مونسيلا</h2><p>اعرف أول ما تنزل مجموعة جديدة.</p></div>
      <form className="newsletter-form dark-form" onSubmit={subscribe}>
        <label htmlFor="newsletter-phone">رقم موبايلك</label>
        <div className="newsletter-fields">
          <input id="newsletter-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={20} aria-describedby="newsletter-help" required />
          <Button tone="ivory" type="submit" disabled={busy}>{busy ? 'جاري الاشتراك…' : 'اشترك'}</Button>
        </div>
        <p id="newsletter-help">هنبعتلك العروض والتخفيضات على واتساب.</p>
        <p role="status" className="form-status">{message}</p>
      </form>
    </div>
  </section>;
}
