export interface AddonItem {
  id: string;
  label: string;
  price: number;
  icon: string;
  availableFor: string[];
}

export const ADDONS: AddonItem[] = [
  { id: 'cab_pickup',      label: 'Cab Pickup',              price: 299,  icon: 'Car',      availableFor: ['date_night','anniversary','proposal'] },
  { id: 'cab_drop',        label: 'Cab Drop',                price: 299,  icon: 'Car',      availableFor: ['date_night','anniversary','proposal'] },
  { id: 'cake',            label: 'Custom Cake (1kg)',       price: 599,  icon: 'Cake',     availableFor: ['date_night','anniversary','proposal'] },
  { id: 'photography_1hr', label: 'Photography 1hr',         price: 999,  icon: 'Camera',   availableFor: ['date_night','anniversary','proposal'] },
  { id: 'photography_2hr', label: 'Photography 2hr',         price: 1599, icon: 'Camera',   availableFor: ['anniversary','proposal'] },
  { id: 'bouquet',         label: 'Rose Bouquet (50 roses)', price: 299,  icon: 'Flower2',  availableFor: ['date_night','anniversary','proposal'] },
  { id: 'decor_basic',     label: 'Basic Décor',             price: 499,  icon: 'Sparkles', availableFor: ['date_night','anniversary'] },
  { id: 'decor_premium',   label: 'Premium Décor',           price: 999,  icon: 'Sparkles', availableFor: ['anniversary','proposal'] },
  { id: 'guitarist',       label: 'Live Guitarist (45min)',  price: 1499, icon: 'Music',    availableFor: ['date_night','anniversary','proposal'] },
  { id: 'violinist',       label: 'Live Violinist',          price: 2499, icon: 'Music',    availableFor: ['proposal'] },
  { id: 'videographer',    label: 'Videographer',            price: 1999, icon: 'Video',    availableFor: ['anniversary','proposal'] },
  { id: 'fireworks',       label: 'Fireworks',               price: 3999, icon: 'Zap',      availableFor: ['proposal'] },
  { id: 'ring_delivery',   label: 'Ring Delivery Moment',    price: 499,  icon: 'Heart',    availableFor: ['proposal'] },
  { id: 'led_letters',     label: 'LED Letter Lights',       price: 799,  icon: 'Type',     availableFor: ['proposal'] },
  { id: 'spa',             label: 'Spa Session (couple)',    price: 1999, icon: 'Leaf',     availableFor: ['date_night','anniversary'] },
  { id: 'surprise_box',    label: 'Surprise Gift Box',       price: 599,  icon: 'Gift',     availableFor: ['date_night','anniversary','proposal'] },
];

export const getAddonsForOccasion = (occasionType: string): AddonItem[] =>
  ADDONS.filter(a => a.availableFor.includes(occasionType));
