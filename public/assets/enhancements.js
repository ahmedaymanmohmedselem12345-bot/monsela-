/* Optional UI additions: failures here never stop cart / checkout. */
(function(){
  'use strict';
  const skip=document.createElement('a');skip.className='skip-link';skip.href='#gallery';skip.textContent='انتقل للمنتجات';document.body.prepend(skip);
  document.querySelectorAll('a[target="_blank"]').forEach(a=>a.rel='noopener noreferrer');
  document.querySelectorAll('[id$="Status"]').forEach(el=>{el.setAttribute('role','status');el.setAttribute('aria-live','polite');});
  // Lightweight first-party event interface. No trackers load without actual account setup.
  window.dataLayer=window.dataLayer||[];
  window.addEventListener('monsela:commerce',event=>{
    const detail=event.detail||{};
    if(!['add_to_cart','begin_checkout','order_submitted'].includes(detail.event))return;
    window.dataLayer.push({event:'monsela_'+detail.event,ecommerce:{currency:detail.currency,value:detail.value,items:detail.items,transaction_id:detail.transaction_id}});
  });
  // Focus containment for visible modal surfaces; supports dynamically added confirmation.
  const selectors='#checkoutOverlay,#accountOverlay,#productDetailOverlay,#trackOrderOverlay,#orderConfirmation';
  document.addEventListener('keydown',event=>{
    if(event.key!=='Tab')return;
    const visible=[...document.querySelectorAll(selectors)].filter(el=>getComputedStyle(el).display!=='none');
    const modal=visible.sort((a,b)=>(Number(getComputedStyle(b).zIndex)||0)-(Number(getComputedStyle(a).zIndex)||0))[0];
    if(!modal)return;
    const focusable=[...modal.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')].filter(el=>el.getClientRects().length&&el.tabIndex>=0);
    if(!focusable.length)return;
    const first=focusable[0],last=focusable.at(-1);
    if(!modal.contains(document.activeElement)){event.preventDefault();first.focus();}
    else if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });
})();
