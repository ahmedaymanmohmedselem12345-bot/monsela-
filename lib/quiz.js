/* Existing MonSela questionnaire and scoring algorithm. */
export const quizQuestions = [
  { key: 'usage', q: 'هتستخدم العطر إمتى؟', opts: ['يوميًا','شغل','خروجات','مناسبات','سهرة'] },
  { key: 'intensity', q: 'بتحب الريحة تكون؟', opts: ['هادية','متوسطة','واضحة وقوية'] },
  { key: 'season', q: 'صيفي ولا شتوي؟', opts: ['صيفي','شتوي','مناسب لكل الفصول'] },
  { key: 'scent', q: 'تحب الرائحة تكون؟', opts: ['حلوة','منعشة','خشبية','شرقية','زهرية','دافئة'] },
  { key: 'budget', q: 'ميزانيتك؟', opts: ['أقل من 500 جنيه','500–1000 جنيه','1000–2000 جنيه','أكثر من 2000 جنيه'] }
];

export function scoreProduct(p, ans){
  let score = 0, maxScore = 0, reasons = [];

  // Usage time / occasion (weight 3)
  maxScore += 3;
  if (ans.usage) {
    const usageMap = { 'يوميًا':'يومي', 'شغل':'عمل', 'خروجات':'خروج', 'مناسبات':'مناسبات', 'سهرة':'سهرة' };
    const target = usageMap[ans.usage] || ans.usage;
    const pOcc = (p.occasion || '').toLowerCase();
    const pUsage = (p.usage_time || '').toLowerCase();
    if (pOcc.includes(target) || pUsage.includes(target) || pOcc.includes(ans.usage)) {
      score += 3; reasons.push('مناسب للاستخدام اللي اخترته');
    }
  }

  // Intensity (weight 2)
  maxScore += 2;
  if (ans.intensity && p.intensity) {
    if (p.intensity === ans.intensity) { score += 2; reasons.push(`قوة رائحته ${p.intensity}`); }
  } else if (ans.intensity && (p.projection || p.longevity)) {
    score += 1; // partial: has strength data
  }

  // Season (weight 3)
  maxScore += 3;
  if (ans.season) {
    const pSeason = (p.season || '').toLowerCase();
    if (ans.season === 'مناسب لكل الفصول') {
      if (pSeason.includes('كل')) { score += 3; reasons.push('مناسب لكل الفصول'); }
      else { score += 1; }
    } else if (pSeason.includes(ans.season) || pSeason.includes('كل')) {
      score += 3; reasons.push(ans.season === 'صيفي' ? 'صيفي ومنعش' : 'دافئ ومناسب للشتاء');
    }
  }

  // Scent type (weight 3) — matches scent_tags or fragrance_family
  maxScore += 3;
  if (ans.scent) {
    const tags = (p.scent_tags || '').toLowerCase();
    const family = (p.fragrance_family || '').toLowerCase();
    if (tags.includes(ans.scent) || family.includes(ans.scent)) {
      score += 3; reasons.push(`رائحته ${ans.scent}`);
    }
  }

  // Budget (weight 2)
  maxScore += 2;
  if (ans.budget) {
    const price = Number(p.price) || 0;
    let inRange = false;
    if (ans.budget === 'أقل من 500 جنيه' && price < 500) inRange = true;
    else if (ans.budget === '500–1000 جنيه' && price >= 500 && price <= 1000) inRange = true;
    else if (ans.budget === '1000–2000 جنيه' && price > 1000 && price <= 2000) inRange = true;
    else if (ans.budget === 'أكثر من 2000 جنيه' && price > 2000) inRange = true;
    if (inRange) { score += 2; reasons.push('في حدود ميزانيتك'); }
  }

  const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  return { score, percent, reasons };
}

