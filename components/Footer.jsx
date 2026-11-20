import { Banknote, Facebook, Instagram, MessageCircle, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { original, socials } from '@/lib/brand';

export default function Footer({ show }) {
  const trust = [[ShieldCheck, 'دفع آمن ومشفر'], [Sparkles, 'عطور أصلية 100%'], [Banknote, 'كاش عند الاستلام'], [Truck, 'توصيل لكل المحافظات']];
  return <footer id="footer" className="site-footer">
    <div className="container">
      <ul className="trust-row">{trust.map(([Icon, label]) => <li key={label}><Icon aria-hidden="true" />{label}</li>)}</ul>
      <div className="footer-main">
        <div className="footer-brand">
          <a className="wordmark" href="#home" lang="en" dir="ltr">MonSela</a>
          <p lang="en" dir="ltr">Where Elegance Meets Scent</p>
          <div className="socials">
            {[[MessageCircle, 'واتساب', socials.whatsapp], [Facebook, 'فيسبوك', socials.facebook], [Instagram, 'إنستجرام', socials.instagram]].map(([Icon, name, url]) =>
              <a className="icon-button" key={name} href={url} target="_blank" rel="noreferrer" aria-label={name}><Icon /></a>)}
          </div>
        </div>
        <nav aria-label="روابط المتجر"><h3>المتجر</h3><a href="#store">كل المنتجات</a><a href="#quiz">اختبار العطور</a><a href={`${original}#giftBuilder`}>تجهيز الهدايا</a><a href={`${original}#perfumeLab`}>معمل العطور</a><a href={`${original}#offersCarousel`}>العروض</a></nav>
        <nav aria-label="روابط المساعدة"><h3>المساعدة</h3><button onClick={() => show('track')}>تتبع طلبك</button><a href="/shipping.html">الشحن والتوصيل</a><a href="/returns.html">الاستبدال والاسترجاع</a></nav>
        <nav aria-label="روابط الشركة"><h3>الشركة</h3><a href="/about.html">عن MonSela</a><a href="/contact.html">كلمنا</a><a href="/privacy.html">الخصوصية</a><a href="/terms.html">الشروط</a></nav>
      </div>
      <div className="footer-bottom"><span>صنع بحب في مصر</span><small>© 2026 MonSela. جميع الحقوق محفوظة.</small></div>
    </div>
  </footer>;
}
