/* Monsela commerce rules. Shared by storefront and automated tests. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MonselaCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const money=n=>Math.round((Number(n)||0)*100)/100;
  const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function normalizePhone(value){
    let p=String(value??'').trim().replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776)).replace(/[\s()\-]/g,'');
    if(p.startsWith('+20'))p='0'+p.slice(3);else if(p.startsWith('0020'))p='0'+p.slice(4);else if(/^201[0125]\d{8}$/.test(p))p='0'+p.slice(2);
    return /^01[0125]\d{8}$/.test(p)?p:'';
  }
  function safeURL(value){try{const u=new URL(String(value),'https://monsela-xi.vercel.app/');return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}}
  function whatsappURL(phone,message){return 'https://wa.me/'+String(phone).replace(/\D/g,'')+'?text='+encodeURIComponent(String(message));}
  function itemKey(id,variant,color){return String(id)+(variant?'::'+variant:'')+(color?'::'+color:'');}
  function catalogItem(item,products){
    const p=products.find(p=>String(p.id)===String(item.id));
    if(!p||p.active===false||p.is_active===false)return null;
    const variants=Array.isArray(p.variants)?p.variants:[];
    const v=variants.length?variants.find(v=>v.label===item.variantLabel):null;
    if(variants.length&&!v)return null;
    const price=Number(v?v.price:p.price),stock=Math.max(0,Math.floor(Number(v?v.stock:p.stock)||0));
    if(!Number.isFinite(price)||price<=0||stock===0)return null;
    const colors=Array.isArray(p.bottle_colors)?p.bottle_colors:[];
    if(item.bottleColor&&!colors.some(c=>c.name===item.bottleColor))return null;
    const variantLabel=v?v.label:null,color=item.bottleColor||null;
    return {id:p.id,variantLabel,bottleColor:color,cartKey:itemKey(p.id,variantLabel,color),name:p.name+(v?' ('+v.label+')':'')+(color?' — لون '+color:''),price:money(price),stock,inventoryKey:JSON.stringify([p.id,variantLabel])};
  }
  function reconcileCart(input,products){
    const list=Array.isArray(input)?input:[],out=[],used=new Map();let changed=!Array.isArray(input);
    for(const old of list){
      if(!old||typeof old!=='object'){changed=true;continue;}
      const info=catalogItem(old,products);if(!info){changed=true;continue;}
      const want=Math.floor(Number(old.qty));if(!Number.isFinite(want)||want<1){changed=true;continue;}
      const left=Math.max(0,info.stock-(used.get(info.inventoryKey)||0)),qty=Math.min(want,left);
      if(!qty){changed=true;continue;}used.set(info.inventoryKey,(used.get(info.inventoryKey)||0)+qty);
      const {stock,inventoryKey,...item}=info;item.qty=qty;
      const existing=out.find(x=>x.cartKey===item.cartKey);
      if(existing){existing.qty+=qty;changed=true;}else out.push(item);
      if(old.price!==item.price||old.name!==item.name||old.qty!==qty||old.cartKey!==item.cartKey)changed=true;
    }
    return {items:out,changed};
  }
  function totals({cart=[],coupon=null,zone=null,freeShippingThreshold=0,gift=false,giftWrapPrice=0}){
    const subtotal=money(cart.reduce((sum,i)=>sum+money(i.price)*Math.max(0,Math.floor(Number(i.qty)||0)),0));
    let discount=0;
    if(coupon&&Number(coupon.validatedSubtotal)===subtotal&&['percentage','fixed'].includes(coupon.type)&&Number(coupon.value)>0){discount=coupon.type==='percentage'?subtotal*Math.min(100,Number(coupon.value))/100:Number(coupon.value);}
    discount=money(Math.min(subtotal,Math.max(0,discount)));
    // Eligibility is based on merchandise subtotal BEFORE coupon discount, matching the cart bar.
    const freeShipping=Number(freeShippingThreshold)>0&&subtotal>=Number(freeShippingThreshold);
    const deliveryFee=zone?(freeShipping?0:money(Math.max(0,Number(zone.fee)||0))):0;
    const giftFee=gift?money(Math.max(0,Number(giftWrapPrice)||0)):0;
    return {subtotal,discount,deliveryFee,giftFee,total:money(subtotal-discount+deliveryFee+giftFee),zone,freeShipping,shippingKnown:!!zone};
  }
  async function fetchTimed(input,options={}){
    const controller=new AbortController(),upstream=options.signal;
    const abort=()=>controller.abort();
    if(upstream?.aborted)abort();else upstream?.addEventListener('abort',abort,{once:true});
    const timeout=setTimeout(abort,25000);
    try{return await fetch(input,{...options,signal:controller.signal});}
    finally{clearTimeout(timeout);upstream?.removeEventListener('abort',abort);}
  }
  return {money,escapeHTML,normalizePhone,safeURL,whatsappURL,itemKey,catalogItem,reconcileCart,totals,fetchTimed};
});
