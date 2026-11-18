import { categories } from './brand';

export const filtersInitial = {
  department: [], category: [], brand: [], concentration: [], scent_tags: [], season: [], size: [],
  min: '', max: '', sort: 'default',
};
export const filterGroups = [
  ['department', 'القسم'], ['category', 'الفئة'], ['brand', 'الماركة'], ['concentration', 'تركيز العطر'],
  ['scent_tags', 'نوع الرائحة'], ['season', 'الموسم'], ['size', 'الحجم'],
];
export const sortOptions = [
  ['default', 'مختارات المتجر'], ['newest', 'الأحدث'], ['bestselling', 'الأكثر مبيعًا'],
  ['price_asc', 'السعر من الأقل للأعلى'], ['price_desc', 'السعر من الأعلى للأقل'],
  ['name_asc', 'الاسم تصاعدي'], ['name_desc', 'الاسم تنازلي'],
];

export const isActive = (product) => product.active !== false && product.is_active !== false;

function filterValues(product, field) {
  if (field === 'scent_tags') return (product.scent_tags || '').split(/[،,]/).map((value) => value.trim()).filter(Boolean);
  if (field === 'size') return Array.isArray(product.variants) ? product.variants.map((item) => String(item?.label || '').trim()).filter(Boolean) : [];
  return product[field] ? [product[field]] : [];
}

export function filterChoices(products, field) {
  return [...new Set(products.flatMap((product) => filterValues(product, field)))].sort((a, b) => String(a).localeCompare(String(b), 'ar'));
}

export function filterCatalog(products, { category, query, filters, ranking }) {
  const aliases = categories.find((entry) => entry.label === category)?.aliases;
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const result = products.filter((product) => {
    if (aliases && ![product.department, product.category].some((name) => aliases.includes(String(name || '').trim().toLowerCase()))) return false;
    if (filterGroups.some(([field]) => filters[field].length && !filterValues(product, field).some((value) => filters[field].includes(value)))) return false;
    const amount = product.price ?? 0;
    if ((filters.min !== '' && amount < Number(filters.min)) || (filters.max !== '' && amount > Number(filters.max))) return false;
    if (!words.length) return true;
    const searchable = [
      product.name, product.name_en, product.notes, product.tag, product.top_notes, product.heart_notes, product.base_notes,
      product.fragrance_family, product.season, product.occasion, product.brand, product.concentration,
      product.scent_tags, product.intensity, product.usage_time, product.department, product.category,
    ].filter(Boolean).join(' ').toLowerCase();
    return words.every((word) => searchable.includes(word));
  });
  const sorts = {
    newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
    bestselling: (a, b) => (ranking[b.id] || 0) - (ranking[a.id] || 0),
    price_asc: (a, b) => (a.price || 0) - (b.price || 0),
    price_desc: (a, b) => (b.price || 0) - (a.price || 0),
    name_asc: (a, b) => a.name.localeCompare(b.name, 'ar'),
    name_desc: (a, b) => b.name.localeCompare(a.name, 'ar'),
  };
  return sorts[filters.sort] ? result.sort(sorts[filters.sort]) : result;
}
