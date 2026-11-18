import { ArrowLeft, Plus } from 'lucide-react';

const questions = [
  ['إزاي أعرف سعر الشحن؟', 'اختار منطقتك وقت إتمام الطلب، وهتشوف تكلفة الشحن قبل ما تأكد.'],
  ['ينفع أدفع لما الطلب يوصل؟', 'أيوه، تقدر تختار الدفع كاش عند الاستلام من طرق الدفع وقت الطلب.'],
  ['أتابع طلبي إزاي؟', 'اضغط على «تتبع طلبك» واكتب رقم الطلب ورقم الموبايل اللي استخدمته وقت الشراء.'],
];

export default function FAQ() {
  return <section id="faq" className="section faq">
    <div className="container faq-layout">
      <div><h2>أسئلة شائعة</h2><a className="text-link" href="/faq.html">شوف كل الأسئلة <ArrowLeft size={18} /></a></div>
      <div className="faq-list">
        {questions.map(([question, answer]) => <details key={question}>
          <summary>{question}<Plus size={20} aria-hidden="true" /></summary>
          <p>{answer}</p>
        </details>)}
      </div>
    </div>
  </section>;
}
