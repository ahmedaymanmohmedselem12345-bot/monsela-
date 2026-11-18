'use client';

import Image from 'next/image';
import { useState } from 'react';
import Button from './Button';

export default function Hero() {
  const [imageFailed, setImageFailed] = useState(false);
  return <section id="home" className="hero section">
    <div className="container hero-layout">
      <div className="hero-image">
        <div className="hero-fallback" aria-hidden="true"><span className="wordmark" lang="en">MONSELA</span></div>
        {!imageFailed && <Image src="/assets/monsela-hero.webp" alt="زجاجة عطر مونسيلا بغطاء ذهبي على حجر فاتح" fill
          sizes="(max-width: 767px) 100vw, (max-width: 1120px) 55vw, 600px" preload onError={() => setImageFailed(true)} />}
      </div>
      <div className="hero-copy">
        <p className="hero-tagline">عطور فاخرة تليق بذوقك</p>
        <div className="gold-rule" />
        <h1>عطرك اللي يشبهك</h1>
        <p className="hero-description">اكتشف عطور مختارة بعناية، واختار الرائحة اللي تناسب ذوقك وشخصيتك.</p>
        <Button href="#store" tone="ivory" className="hero-cta">تسوق دلوقتي</Button>
      </div>
    </div>
  </section>;
}
