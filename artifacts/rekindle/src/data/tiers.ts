import { AddonItem, ADDONS } from './addons';

export type TierKey = 'silver' | 'gold' | 'platinum';

export const BASE_PRICES: Record<string, number> = {
  date_night: 1499,
  anniversary: 2999,
  proposal: 5999,
};

const GOLD_BUNDLES: Record<string, string[]> = {
  date_night:  ['cab_pickup', 'cab_drop', 'cake', 'bouquet', 'decor_basic'],
  anniversary: ['cab_pickup', 'cab_drop', 'cake', 'bouquet', 'decor_premium', 'photography_1hr'],
  proposal:    ['cab_pickup', 'decor_premium', 'photography_2hr', 'cake', 'bouquet'],
};

export function getBundledAddons(tier: TierKey, occasionType: string): AddonItem[] {
  const eligible = ADDONS.filter(a => a.availableFor.includes(occasionType));
  if (tier === 'silver') return [];
  if (tier === 'gold') {
    const ids = GOLD_BUNDLES[occasionType] ?? [];
    return eligible.filter(a => ids.includes(a.id));
  }
  return eligible;
}

export function computeTotal(
  occasionType: string,
  tier: TierKey,
  extraAddons: AddonItem[],
): number {
  const base = BASE_PRICES[occasionType] ?? 0;
  const bundled = getBundledAddons(tier, occasionType);
  const bundledIds = new Set(bundled.map(a => a.id));
  const extras = extraAddons.filter(a => !bundledIds.has(a.id));
  const addonSum = [...bundled, ...extras].reduce((s, a) => s + a.price, 0);
  return base + addonSum;
}

export interface SelectedTier {
  occasionType: string;
  tier: TierKey;
  basePrice: number;
  addOns: AddonItem[];
  totalPrice: number;
}
