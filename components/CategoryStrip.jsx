import { Droplet, Glasses, Watch, Wrench } from 'lucide-react';
import { categories } from '@/lib/brand';

function PerfumeIcon(props) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="5" y="9" width="14" height="12" rx="2" /><path d="M9 9V5h6v4M8 5V2h8v3Z" />
  </svg>;
}

function IncenseIcon(props) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 12h18a9 9 0 0 1-18 0Zm2 4h14m-9 4-2 2h8l-2-2M8 9c3-2-1-3 1-5m3 5c3-2-1-4 1-7m3 7c3-2-1-3 1-5" />
  </svg>;
}

const tiles = {
  عطور: ['العطور', PerfumeIcon],
  'زيوت عطرية': ['الزيوت', Droplet],
  بخور: ['البخور', IncenseIcon],
  ساعات: ['الساعات', Watch],
  نضارات: ['النظارات', Glasses],
  'أدوات صناعة العطور': ['أدوات التركيب', Wrench],
};

export default function CategoryStrip({ category, onCategory }) {
  return <nav className="category-strip" aria-label="أقسام المنتجات">
    <div className="container category-strip-grid">
      {categories.map(({ label }) => {
        const [title, Icon] = tiles[label];
        const selected = category === label;
        return <a href="#store" key={label} aria-current={selected || undefined} onClick={() => onCategory(selected ? '' : label)}>
          <Icon aria-hidden="true" /><span>{title}</span>
        </a>;
      })}
    </div>
  </nav>;
}
