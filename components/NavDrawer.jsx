import { ArrowLeft, ShoppingBag, UserRound } from 'lucide-react';
import { categories, original } from '@/lib/brand';
import Dialog from './Dialog';

export default function NavDrawer({ open, close, show, onCategory }) {
  return <Dialog id="mobile-menu" title="القائمة" open={open} onClose={close} variant="start" dark
    footer={<div className="drawer-account">
      <button onClick={() => show('account')}><UserRound /> حسابي</button>
      <button onClick={() => show('cart')}><ShoppingBag /> السلة</button>
    </div>}>
    <nav aria-label="أقسام المتجر" className="drawer-links">
      <a href="#home" onClick={close}>الرئيسية</a>
      <a href="#store" onClick={() => onCategory('')}>المتجر</a>
      {categories.map(({ label }) => <a key={label} href="#store" onClick={() => onCategory(label)}>{label}<ArrowLeft size={16} /></a>)}
      <a href="#quiz" onClick={close}>اختبار العطور</a>
      <button type="button" onClick={() => show('track')}>تتبع طلبك</button>
      <a href={`${original}?view=account`}>المفضلة وحسابي الكامل</a>
      <a href={`${original}#giftBuilder`}>تجهيز الهدايا</a><a href={`${original}#perfumeLab`}>معمل العطور</a><a href={`${original}#offersCarousel`}>العروض</a>
    </nav>
  </Dialog>;
}
