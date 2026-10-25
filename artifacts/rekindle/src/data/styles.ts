export interface DateStyle {
  key: string;
  label: string;
  emoji: string;
  description: string;
  category: string;
}

export const DATE_STYLES: DateStyle[] = [
  { key: 'rooftop_dining',     label: 'Rooftop Dining',     emoji: '🌃', description: 'City lights, private table, curated menu',       category: 'Classic Date' },
  { key: 'cafe_dinner',        label: 'Café Dinner',        emoji: '☕', description: 'Cosy corner, warm lighting, intimate vibe',       category: 'Classic Date' },
  { key: 'candlelight_dinner', label: 'Candlelight Dinner', emoji: '🕯', description: 'Classic romance, candles, rose petals',           category: 'Classic Date' },
  { key: 'movie_night',        label: 'Movie Night',        emoji: '🎬', description: 'Private screening, popcorn, cosy setup',          category: 'Adventure Date' },
  { key: 'bowling',            label: 'Bowling',            emoji: '🎳', description: 'Fun, competitive, casual and memorable',          category: 'Adventure Date' },
  { key: 'volleyball',         label: 'Volleyball',         emoji: '🏐', description: 'Active, playful, great energy',                   category: 'Adventure Date' },
  { key: 'basketball',         label: 'Basketball',         emoji: '🏀', description: 'Sporty, energetic, uniquely fun',                 category: 'Adventure Date' },
  { key: 'spa',                label: 'Spa Experience',     emoji: '🧖', description: 'Rejuvenate together, calm and luxurious',         category: 'Relax Date' },
  { key: 'resort_lounge',      label: 'Resort Lounge',      emoji: '🏨', description: 'Premium poolside or lounge evening',              category: 'Relax Date' },
  { key: 'poolside',           label: 'Poolside Evening',   emoji: '🌊', description: 'Breezy, beautiful, effortlessly elegant',         category: 'Relax Date' },
];

export const STYLE_CATEGORIES = ['Classic Date', 'Adventure Date', 'Relax Date'];

export const getStyleByKey = (key: string) => DATE_STYLES.find(s => s.key === key);
