/* Routes from the React storefront into features retained from the original. */
(() => {
  const parameters = new URLSearchParams(location.search);
  const view = parameters.get('view');
  const product = parameters.get('product');
  window.addEventListener('DOMContentLoaded', async () => {
    if (view === 'checkout') {
      document.getElementById('checkoutBtn').click();
      if (getComputedStyle(document.getElementById('checkoutOverlay')).display === 'none') openCart();
    }
    if (view === 'account') {
      await refreshAccountView().catch(() => {});
      document.getElementById('accountOverlay').style.display = 'flex';
    }
    if (view === 'product' && product) {
      const entry = await sb.from('products').select('*').eq('id', product).maybeSingle();
      if (entry.data && entry.data.active !== false && entry.data.is_active !== false) {
        if (!allProducts.some((item) => String(item.id) === product)) allProducts.push(entry.data);
        openProductDetail(entry.data.id);
      }
    }
  }, { once: true });
})();
