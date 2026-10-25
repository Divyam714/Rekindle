import { UserPreferences } from '@/context/BookingContext';

export interface AIResult {
  title: string;
  items: string[];
  surprise: string;
}

const MOCKS: Record<string, AIResult> = {
  rooftop_dining: {
    title: 'City Lights Rooftop Romance — A Night Above Patna',
    items: [
      '🌃 Private corner table on a rooftop with panoramic city views',
      '🕯 Candle-lit setup with rose petals and fairy lights',
      '🍽 3-course curated dinner — starting with mocktail welcome',
      '🎵 Soft background playlist curated for the evening',
      '📸 Golden hour window for the most beautiful photos',
    ],
    surprise: '✨ A handwritten note from REKINDLE placed at the table before you arrive',
  },
  cafe_dinner: {
    title: 'Warm Corners & Warm Hearts — The Cosy Café Evening',
    items: [
      '☕ A cosy private corner reserved just for you two',
      '🕯 Soft candlelight and warm fairy lights all around',
      '🍰 Dessert-led menu with custom couple\'s platter',
      '🎵 Acoustic playlist tuned to your romantic intensity',
      '📷 Candid memory shots by your REKINDLE coordinator',
    ],
    surprise: '✨ A secret message delivered with your dessert, from you to them',
  },
  candlelight_dinner: {
    title: 'The Classic — 100 Candles, One Perfect Evening',
    items: [
      '🕯 100-candle arrangement surrounding your private table',
      '🌹 Rose petal pathway from entrance to your seat',
      '🍰 Custom-message dessert served at the end of dinner',
      '🎶 Soft live guitar for the first 45 minutes',
      '📷 Dedicated photography capturing every moment',
    ],
    surprise: '✨ A surprise bouquet delivery mid-dinner through our coordinator',
  },
  movie_night: {
    title: 'Lights Down, Hearts Up — Your Private Cinema Evening',
    items: [
      '🎬 Private screening room with your favourite film',
      '🍿 Couple\'s snack tray — popcorn, nachos and more',
      '🛋 Cosy setup with cushions and fairy lights',
      '🎵 Pre-show music playlist to set the mood',
      '📸 Entrance photo moment before the lights go down',
    ],
    surprise: '✨ A personalized opening "trailer" — photos of you two set to music',
  },
  bowling: {
    title: 'Strike & Sparks — A Date as Fun as It Is Romantic',
    items: [
      '🎳 Private lane reserved for just the two of you',
      '🏆 Personalised scorecard with your names printed',
      '🍕 Couple\'s food spread delivered to your lane',
      '🎵 Your chosen playlist for the evening',
      '📸 Candid action shots throughout the game',
    ],
    surprise: '✨ A trophy waiting at the end — "Best Couple of the Evening"',
  },
  spa: {
    title: 'Unwind Together — The Luxury Couple\'s Retreat',
    items: [
      '🧖 60-minute couple\'s spa session at a premium Patna spa',
      '🍵 Herbal welcome tea and aromatherapy setup',
      '🌿 Poolside or lounge time after the session',
      '🎵 Ambient relaxation playlist throughout',
      '🎁 Surprise wellness gift box at checkout',
    ],
    surprise: '✨ Personalized scent selection for your spa session based on your vibe',
  },
  resort_lounge: {
    title: 'Elevated Evenings — The Resort Lounge Experience',
    items: [
      '🏨 Premium resort lounge access for the evening',
      '🍹 Welcome mocktail and curated bites on arrival',
      '🌿 Poolside or garden seating under the stars',
      '🎵 Live or curated ambient music for the evening',
      '📸 Professional couple photo session at sunset',
    ],
    surprise: '✨ A floating rose and candle arrangement waiting at your table',
  },
  poolside: {
    title: 'Breezy Nights, Beautiful Moments — Poolside Romance',
    items: [
      '🌊 Private poolside setup with fairy lights overhead',
      '🕯 Candle-lit table right at the water\'s edge',
      '🍽 Light Mediterranean dinner curated for two',
      '🎵 Breezy lounge music to complement the night',
      '📸 Reflections in the water — perfect photo backdrop',
    ],
    surprise: '✨ A floating message in a bottle delivered to you mid-evening',
  },
  standard: {
    title: 'A Perfectly Curated Evening — Designed Just For You',
    items: [
      '🌹 Venue styled to match your exact preferences',
      '🍽 Curated dining experience with your food choices in mind',
      '🎵 Music vibe matched to your romantic intensity',
      '📸 Memory capture at the best moments',
      '🎁 One surprise element chosen by your REKINDLE coordinator',
    ],
    surprise: '✨ A personalized moment designed by your coordinator based on your story',
  },
};

function summarisePreferences(prefs: UserPreferences, style: string): string {
  const parts: string[] = [];
  if (style && style !== 'standard') {
    const label = style.replace(/_/g, ' ');
    parts.push(`a ${label}`);
  }
  if (prefs.indoorOutdoor === 'indoor') parts.push('indoors');
  if (prefs.indoorOutdoor === 'outdoor') parts.push('outdoors');
  if (prefs.foodPreference === 'veg') parts.push('with a veg menu');
  if (prefs.foodPreference === 'nonveg') parts.push('with a non-veg menu');
  if (prefs.musicPreference === 'live') parts.push('with live music');
  if (prefs.musicPreference === 'playlist') parts.push('with a curated playlist');
  if (prefs.musicPreference === 'silent') parts.push('in peaceful silence');
  if (prefs.romanticIntensity >= 4) parts.push('keeping it deeply romantic');
  else if (prefs.romanticIntensity <= 2) parts.push('keeping it light and fun');
  return parts.join(', ') || 'a wonderful evening together';
}

export async function getAIRecommendation(
  preferences: UserPreferences,
  style: string,
  occasion: string,
): Promise<AIResult & { summary: string }> {
  const summary = summarisePreferences(preferences, style);
  const GEMINI_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) || null;

  if (!GEMINI_API_KEY) {
    const mock = MOCKS[style] ?? MOCKS['standard'];
    return { ...mock, summary };
  }

  const prompt = `You are REKINDLE Romance Concierge, an AI assistant for a premium romantic experience platform in Patna, India.

User preferences:
- Occasion: ${occasion}
- Date Style: ${style}
- Indoor/Outdoor: ${preferences.indoorOutdoor}
- Food: ${preferences.foodPreference}
- Music: ${preferences.musicPreference}
- Venue Type: ${preferences.venueType}
- Budget: ${preferences.budget}
- Romantic Intensity: ${preferences.romanticIntensity}/5

Generate a personalized romantic date recommendation for Patna, India. Include:
1. A compelling 1-line title for the experience
2. 4-5 specific recommendation items with emojis
3. One surprise element suggestion

Keep it warm, personal, and aspirational. Reference local Patna context where natural. Return JSON only:
{ "title": "", "items": [], "surprise": "" }`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
    );
    const data = await response.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned) as AIResult;
    return { ...parsed, summary };
  } catch {
    const mock = MOCKS[style] ?? MOCKS['standard'];
    return { ...mock, summary };
  }
}

const FREE_FORM_RESPONSES = [
  'Great idea! But I\'d suggest adding a live musician —  As it elevates the entire evening effortlessly. 🎸',
  'For a deeply romantic intensity like you have (naughtyyy), Well if it was me I\'d lean toward a completely private venue. No distractions. Just the two of you.',
  'Awww, That\'s a beautiful surprise to add. Your coordinator will make sure it lands perfectly.',
  'With your budget, you can absolutely include photography — and trust me, the photos we click become priceless. 📸',
  'Patna has some incredible rooftops with city views. But if it was me I\'d prioritise that if outdoor is on the table then it would be beautiful like her.',
  'Adding a live guitarist changes the entire energy of the evening. Even 45 minutes feels transformative. 🎶',
  'I love that idea — your coordinator will make it happen seamlessly, without you lifting a finger. 💫',
  'Sounds perfect. That detail will make the evening feel truly personal and unforgettable. 🌹',
];

export function getMockFreeFormResponse(): string {
  return FREE_FORM_RESPONSES[Math.floor(Math.random() * FREE_FORM_RESPONSES.length)];
}
