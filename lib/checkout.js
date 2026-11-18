import { isActive } from './catalog';

export const pendingOrderKey = 'monsela_pending_order';

export async function loadCheckout(client) {
  const [catalog, zones, settings] = await Promise.all([
    client.from('products').select('*'),
    client.from('delivery_zones').select('*').eq('active', true).order('sort_order', { ascending: true }),
    client.from('shop_settings').select('*').eq('id', 1).maybeSingle(),
  ]);
  if (catalog.error || zones.error || settings.error || !settings.data) throw new Error('تعذّر تحميل بيانات الطلب. حاول تاني.');
  return {
    products: (catalog.data || []).filter(isActive),
    zones: (zones.data || []).filter((zone) => Number.isFinite(Number(zone.fee)) && Number(zone.fee) >= 0),
    settings: settings.data,
  };
}

export async function checkCoupon(client, code, subtotal) {
  const { data, error } = await client.rpc('validate_coupon', { p_code: code, p_subtotal: subtotal });
  const result = Array.isArray(data) ? data[0] : data;
  const type = result?.discount_type;
  const value = Number(result?.discount_value);
  if (error || !result?.valid || !['percentage', 'fixed'].includes(type) || !Number.isFinite(value) || value <= 0) {
    throw new Error('الكوبون مش متاح للطلب ده. راجع الإجمالي.');
  }
  return { code, type, value, validatedSubtotal: subtotal };
}
