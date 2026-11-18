import { PackageOpen, SearchX, WifiOff } from 'lucide-react';
import Button from './Button';

export default function EmptyProductState({ state, onRetry, onReset }) {
  if (state === 'loading') return <div className="product-state" role="status">جاري تحميل المنتجات…</div>;
  const error = state === 'error';
  const filtered = state === 'filtered';
  const Icon = error ? WifiOff : filtered ? SearchX : PackageOpen;
  return <div className="product-state" role="status">
    <span className="state-icon"><Icon size={27} /></span>
    <h3>{error ? 'حصلت مشكلة في تحميل المنتجات' : filtered ? 'مفيش منتجات مطابقة' : 'المنتجات لسه ما نزلتش'}</h3>
    {!error && <p>{filtered ? 'جرّب تغيّر البحث أو الفلاتر.' : 'مجموعتنا بتتجهز. تابعنا عشان تعرف أول ما تنزل.'}</p>}
    {error && <Button tone="gold" onClick={onRetry}>حاول تاني</Button>}
    {filtered && <Button tone="outline" onClick={onReset}>مسح الفلاتر</Button>}
  </div>;
}
