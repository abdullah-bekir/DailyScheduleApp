import Purchases from 'react-native-purchases';

/** RevenueCat offering boş olsa bile Play / App Store product id'leri (Android ile aynı isimler). */
export function getConfiguredProductIds(extra = {}) {
  const monthly = String(extra.revenueCatProductIdMonthly ?? 'planly_premium_monthly').trim();
  const annual = String(extra.revenueCatProductIdAnnual ?? 'planly_premium_annual').trim();
  return { monthly, annual };
}

function packagesFromOffering(offering) {
  const list = offering?.availablePackages;
  return Array.isArray(list) ? list : [];
}

/** `current` boşsa `default` veya ilk dolu offering. */
export function resolveOffering(offerings) {
  if (!offerings) return null;
  if (offerings.current?.availablePackages?.length) return offerings.current;
  const all = offerings.all ?? {};
  if (all.default?.availablePackages?.length) return all.default;
  for (const key of Object.keys(all)) {
    if (all[key]?.availablePackages?.length) return all[key];
  }
  return offerings.current ?? null;
}

export function pickPackagesFromOfferings(offerings) {
  const list = packagesFromOffering(resolveOffering(offerings));
  return {
    monthly: list.find((p) => p.packageType === Purchases.PACKAGE_TYPE.MONTHLY) ?? null,
    annual: list.find((p) => p.packageType === Purchases.PACKAGE_TYPE.ANNUAL) ?? null,
  };
}

export async function fetchDirectStoreProducts(productIds) {
  const ids = [productIds.monthly, productIds.annual].filter(Boolean);
  if (!ids.length) return { monthly: null, annual: null };
  const products = await Purchases.getProducts(ids);
  const map = new Map(products.map((p) => [p.identifier, p]));
  return {
    monthly: map.get(productIds.monthly) ?? null,
    annual: map.get(productIds.annual) ?? null,
  };
}

export function planDisplayPrice(plan) {
  if (!plan) return null;
  return plan.product?.priceString ?? plan.priceString ?? null;
}

export function planDisplayTitle(plan) {
  if (!plan) return '';
  return plan.product?.title ?? plan.title ?? '';
}

export function hasPurchasablePlan(plans) {
  return Boolean(plans?.monthly?.package || plans?.monthly?.product || plans?.annual?.package || plans?.annual?.product);
}
