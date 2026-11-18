'use client';

import { useEffect, useState } from 'react';
import { quizQuestions, scoreProduct } from '@/lib/quiz';
import Button from './Button';
import Dialog from './Dialog';

function QuizForm({ products, onProduct }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saved, setSaved] = useState(null);
  useEffect(() => {
    try { setSaved(JSON.parse(localStorage.getItem('monsela_quiz') || 'null')); } catch {}
  }, []);
  const current = quizQuestions[step];
  function choose(value) {
    const next = { ...answers, [current.key]: value };
    setAnswers(next);
    setStep(step + 1);
    if (step === quizQuestions.length - 1) {
      try { localStorage.setItem('monsela_quiz', JSON.stringify(next)); } catch {}
      setSaved(next);
    }
  }
  if (!current) {
    const matches = products.map((p) => ({ p, ...scoreProduct(p, answers) })).filter(({ percent }) => percent >= 30).sort((a, b) => b.percent - a.percent).slice(0, 4);
    return <div className="form-stack">
      <h3>العطور الأقرب لذوقك</h3>
      {!matches.length && <p>مفيش منتجات مطابقة لاختياراتك دلوقتي.</p>}
      {matches.map(({ p, reasons }) => <div className="quiz-match" key={p.id}><strong>{p.name}</strong>
        <p>{reasons.join('، ')}</p><Button tone="outline" onClick={() => onProduct(p)}>شوف التفاصيل</Button></div>)}
      <Button onClick={() => { setAnswers({}); setStep(0); }}>جرّب الاختبار تاني</Button>
    </div>;
  }
  return <div className="form-stack">
    <progress max={quizQuestions.length} value={step + 1} aria-label="تقدم اختبار العطور" />
    <h3 aria-live="polite">{current.q}</h3>
    {current.opts.map((option) => <Button key={option} tone="outline" onClick={() => choose(option)}>{option}</Button>)}
    {step > 0 && <Button onClick={() => setStep(step - 1)}>رجوع</Button>}
    {step === 0 && saved && <Button onClick={() => { setAnswers(saved); setStep(quizQuestions.length); }}>شوف اختياراتي السابقة</Button>}
  </div>;
}

export default function ScentQuiz({ open, show, close, products, onProduct }) {
  return <section id="quiz" className="section quiz">
    <div className="container quiz-layout">
      <div><h2>اختار عطرك بطريقتك</h2><p>جاوب على كام سؤال عن ذوقك، ونرشّح لك الروائح الأقرب ليك.</p></div>
      <Button tone="ivory" onClick={() => show('quiz')}>ابدأ الاختبار</Button>
    </div>
    <Dialog title="اختبار العطور" open={open} onClose={close}>
      {open && <QuizForm products={products} onProduct={onProduct} />}
    </Dialog>
  </section>;
}
