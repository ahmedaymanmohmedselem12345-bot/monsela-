'use client';

import { useEffect, useState } from 'react';
import { ArrowUp, MessageCircle } from 'lucide-react';
import { socials } from '@/lib/brand';

export default function FloatingButtons({ open }) {
  const [state, setState] = useState({ scrolled: false, obstructed: true });

  useEffect(() => {
    const obstruction = ['footer', 'newsletter'];
    const update = () => {
      const obstructed = obstruction.some((id) => {
        const box = document.getElementById(id)?.getBoundingClientRect();
        return box && box.top < window.innerHeight && box.bottom > 0;
      });
      setState((previous) => {
        const scrolled = window.scrollY > 460;
        return previous.scrolled === scrolled && previous.obstructed === obstructed ? previous : { scrolled, obstructed };
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const resize = new ResizeObserver(update);
    resize.observe(document.body);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      resize.disconnect();
    };
  }, []);

  if (open || state.obstructed) return null;
  return <aside className="float-tools" aria-label="أدوات سريعة">
    {state.scrolled && <button className="icon-button" type="button" aria-label="ارجع لأول الصفحة"
      onClick={() => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}><ArrowUp /></button>}
    <a className="icon-button" href={socials.whatsapp} target="_blank" rel="noreferrer" aria-label="كلمنا على واتساب"><MessageCircle /></a>
  </aside>;
}
