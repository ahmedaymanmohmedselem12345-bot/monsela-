'use client';

import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

export default function Dialog({ id, title, open, onClose, variant = 'sheet', children, footer, dark = false, closeDisabled = false }) {
  const heading = useId();
  const ref = useRef(null);
  const opener = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    opener.current = document.activeElement;
    dialog.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.querySelector('[data-dialog-close]').focus({ preventScroll: true });
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (opener.current?.isConnected) opener.current.focus({ preventScroll: true });
    };
  }, [open]);

  function loopTab(event) {
    if (event.key !== 'Tab') return;
    const controls = [...event.currentTarget.querySelectorAll(
      'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex="0"]',
    )].filter((element) => element.tabIndex >= 0 && element.getClientRects().length);
    const first = controls[0];
    const last = controls.at(-1);
    const target = event.shiftKey && document.activeElement === first ? last
      : !event.shiftKey && document.activeElement === last ? first : null;
    if (target) { event.preventDefault(); target.focus(); }
  }

  return (
    <dialog id={id} ref={ref} aria-labelledby={heading} onKeyDown={loopTab}
      className={`dialog dialog--${variant}${dark ? ' dialog--dark' : ''}`}
      onCancel={(event) => { event.preventDefault(); if (!closeDisabled) onClose(); }}
      onClick={(event) => { if (!closeDisabled && event.target === event.currentTarget) onClose(); }}>
      <div className="dialog-inner">
        <header className="dialog-header">
          <h2 id={heading}>{title}</h2>
          <button type="button" className="icon-button" aria-label="إغلاق" data-dialog-close disabled={closeDisabled} onClick={onClose}><X /></button>
        </header>
        <div className="dialog-body">{children}</div>
        {footer && <div className="dialog-footer">{footer}</div>}
      </div>
    </dialog>
  );
}
