'use client';

import Image from 'next/image';
import { useState } from 'react';
import { categories } from '@/lib/brand';
import Button from './Button';

export default function Hero({ onCategory }) {
  const [imageFailed, setImageFailed] = useState(false);
  return <section id="home" className="hero">
    <div className="hero-layout">
      <div className="hero-copy">
        <h1>اكتشف عطرك المفضّل</h1>
        <Button href="#store" tone="gold" className="hero-cta" onClick={() => onCategory(categories[0].label)}>تسوّق العطور</Button>
      </div>
      <div className="hero-image">
        <div className="hero-fallback" aria-hidden="true"><span className="wordmark" lang="en">MonSela</span></div>
        {!imageFailed && <Image src="/assets/monsela-home-campaign.webp" alt="زجاجة عطر عنبر بغطاء خشبي على حجر داكن" fill
          sizes="(max-width: 767px) 100vw, 50vw" preload onError={() => setImageFailed(true)} />}
      </div>
    </div>
  </section>;
}
