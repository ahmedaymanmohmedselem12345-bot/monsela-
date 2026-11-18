'use client';

import { useRef, useState } from 'react';
import core from '@/public/assets/store-core';
import { original } from '@/lib/brand';
import { storeClient } from '@/lib/supabase';
import Button from './Button';

export default function LoginForm({ account }) {
  const [mode, setMode] = useState('login');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const running = useRef(false);

  function switchMode(next) { setMessage(''); setMode(next); }

  async function submit(event) {
    event.preventDefault();
    if (running.current) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const client = storeClient();
    const entered = String(fields.get('email') || '').trim().toLowerCase();
    const phone = core.normalizePhone(mode === 'login' ? entered : fields.get('phone'));
    const email = mode === 'login' && phone ? `${phone}@monsela.customer` : entered;
    const password = String(fields.get('password') || '');
    const name = String(fields.get('name') || '').trim();
    if (mode === 'signup' && (!phone || name.length < 2 || email.endsWith('@monsela.customer'))) {
      setMessage('راجع الاسم ورقم الموبايل والبريد الإلكتروني.'); return;
    }
    running.current = true;
    setBusy(true);
    setMessage('');
    try {
      if (mode === 'login') {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        form.reset();
      } else if (mode === 'signup') {
        const { data, error } = await client.auth.signUp({
          email, password, options: { emailRedirectTo: location.origin + '/', data: { full_name: name, phone } },
        });
        if (error) throw error;
        if (data.session && data.user) await client.from('customer_profiles').upsert({ id: data.user.id, name, phone, email });
        form.reset();
        setMessage('راجع بريدك عشان تأكد حسابك وتقدر تسجّل الدخول.');
      } else {
        const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: location.origin + '/reset-password.html' });
        if (error) throw error;
        form.reset();
        setMessage('لو البريد مرتبط بحساب، هيوصلك رابط تغيير كلمة المرور.');
      }
    } catch {
      setMessage(mode === 'login' ? 'راجع بيانات الدخول وتأكيد بريدك الإلكتروني.' : 'العملية ما تمّتش دلوقتي. حاول تاني.');
    } finally { running.current = false; setBusy(false); }
  }

  async function logout() {
    const { error } = await storeClient().auth.signOut();
    if (error) setMessage('تعذّر تسجيل الخروج. حاول تاني.');
    else switchMode('login');
  }

  if (account) return <div className="form-stack">
    <p>أهلًا {account.user_metadata?.full_name || 'بيك'}.</p>
    <Button href={`${original}?view=account`} tone="ivory">طلباتي والبيانات الشخصية</Button>
    <Button tone="dark-outline" onClick={logout}>تسجيل الخروج</Button>
    <p role="status" className="form-status">{message}</p>
  </div>;

  return <form className="form-stack dark-form" onSubmit={submit} key={mode}>
    {mode === 'signup' && <>
      <label>الاسم بالكامل<input name="name" autoComplete="name" minLength={2} maxLength={100} required /></label>
      <label>رقم الموبايل<input name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={20} required /></label>
    </>}
    <label>{mode === 'login' ? 'البريد الإلكتروني أو رقم الحساب القديم' : 'البريد الإلكتروني'}
      <input name="email" type={mode === 'login' ? 'text' : 'email'} autoComplete={mode === 'login' ? 'username' : 'email'} dir="ltr" maxLength={254} required />
    </label>
    {mode !== 'recover' && <label>كلمة المرور<input name="password" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={mode === 'signup' ? 8 : undefined} required /></label>}
    <Button type="submit" tone="ivory" disabled={busy}>{busy ? 'لحظة واحدة…' : mode === 'login' ? 'دخول' : mode === 'signup' ? 'إنشاء حساب' : 'ابعت رابط الاستعادة'}</Button>
    <div className="form-links">
      {mode !== 'login' && <button type="button" onClick={() => switchMode('login')} disabled={busy}>رجوع للدخول</button>}
      {mode === 'login' && <button type="button" onClick={() => switchMode('signup')} disabled={busy}>اعمل حساب جديد</button>}
      {mode === 'login' && <button type="button" onClick={() => switchMode('recover')} disabled={busy}>نسيت كلمة المرور؟</button>}
    </div>
    <p role="status" className="form-status">{message}</p>
  </form>;
}
