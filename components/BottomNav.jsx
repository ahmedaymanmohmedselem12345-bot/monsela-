import { FlaskConical, House, Store, UserRound } from 'lucide-react';

export default function BottomNav({ active, show, open }) {
  const links = [
    { id: 'home', label: 'الرئيسية', Icon: House },
    { id: 'store', label: 'المتجر', Icon: Store },
    { id: 'quiz', label: 'الاختبار', Icon: FlaskConical },
  ];
  return <nav className="bottom-nav" aria-label="التنقل السريع">
    {links.map(({ id, label, Icon }) => <a key={id} href={`#${id}`} aria-current={!open && active === id ? 'location' : undefined}><Icon /><span>{label}</span></a>)}
    <button type="button" aria-pressed={open === 'account'} onClick={() => show('account')}><UserRound /><span>حسابي</span></button>
  </nav>;
}
