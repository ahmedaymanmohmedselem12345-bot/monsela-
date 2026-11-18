'use client';

import { useState } from 'react';
import { filterChoices, filterGroups, filtersInitial, sortOptions } from '@/lib/catalog';
import Button from './Button';
import Dialog from './Dialog';

export default function FilterSheet({ open, close, products, filters, onApply }) {
  return <Dialog id="filter-sheet" title="الفلاتر والترتيب" open={open} onClose={close} variant="filters">
    {open && <FilterForm products={products} filters={filters} onApply={onApply} />}
  </Dialog>;
}

function FilterForm({ products, filters, onApply }) {
  const [draft, setDraft] = useState(filters);
  const set = (field, value) => setDraft((previous) => ({...previous, [field]: value}));
  const invalid = draft.min !== '' && draft.max !== '' && Number(draft.min) > Number(draft.max);

  return <form className="form-stack" onSubmit={(event) => { event.preventDefault(); if (!invalid) onApply(draft); }}>
    <label>رتّب المنتجات<select value={draft.sort} onChange={(event) => set('sort', event.target.value)}>
      {sortOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
    </select></label>
    {filterGroups.map(([field, label]) => {
      const choices = filterChoices(products, field);
      if (!choices.length) return null;
      return <fieldset className="filter-options" key={field}><legend>{label}</legend>
        {choices.map((choice) => <label className="check-line" key={choice}>
          <input type="checkbox" checked={draft[field].includes(choice)}
            onChange={(event) => set(field, event.target.checked ? [...draft[field], choice] : draft[field].filter((value) => value !== choice))} />
          {choice}
        </label>)}
      </fieldset>;
    })}
    <div className="field-pair">
      <label>السعر من<input type="number" inputMode="decimal" min="0" value={draft.min} onChange={(event) => set('min', event.target.value)} /></label>
      <label>السعر لحد<input type="number" inputMode="decimal" min="0" value={draft.max} onChange={(event) => set('max', event.target.value)} /></label>
    </div>
    {invalid && <p role="alert">الحد الأقصى لازم يكون أكبر من أو يساوي الحد الأدنى.</p>}
    <Button type="submit" disabled={invalid}>عرض المنتجات</Button>
    <Button tone="outline" onClick={() => setDraft(filtersInitial)}>مسح الفلاتر</Button>
  </form>;
}
