import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { Heart, Bookmark, TrendingUp } from 'lucide-react';
import { PACKAGES } from '@/data/packages';
import { useApp } from '@/context/AppContext';

const DISCOVER_CARDS = [
  {
    id: 'discover-1',
    packageId: 'proposal',
    title: 'A Proposal Under the Stars',
    location: 'Rooftop, Patna',
    price: '₹14,999',
    image: 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=800&q=85&auto=format',
    tag: '🔥 Most Booked',
    mood: 'grand',
  },
  {
    id: 'discover-2',
    packageId: 'anniversary',
    title: 'Candlelit Anniversary Evening',
    location: 'Private Venue, Patna',
    price: '₹5,999',
    image: 'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=800&q=85&auto=format',
    tag: '💕 Trending',
    mood: 'romantic',
  },
  {
    id: 'discover-3',
    packageId: 'date-night',
    title: 'Rooftop Date Night for Two',
    location: 'City View Rooftop, Patna',
    price: '₹3,499',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=85&auto=format',
    tag: '✨ AI Pick',
    mood: 'calm',
  },
  {
    id: 'discover-4',
    packageId: 'proposal',
    title: 'Surprise Flash Mob Proposal',
    location: 'Garden Venue, Patna',
    price: '₹14,999',
    image: 'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=800&q=85&auto=format',
    tag: '⚡ New',
    mood: 'adventurous',
  },
  {
    id: 'discover-5',
    packageId: 'anniversary',
    title: 'Riverside Dinner Experience',
    location: 'Gandhi Ghat, Patna',
    price: '₹5,999',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=85&auto=format',
    tag: '🌊 New Venue',
    mood: 'romantic',
  },
  {
    id: 'discover-6',
    packageId: 'date-night',
    title: 'Private Cinema Date Night',
    location: 'Boutique Hotel, Patna',
    price: '₹3,499',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=85&auto=format',
    tag: '🎬 Popular',
    mood: 'spontaneous',
  },
];

const MOOD_FILTERS = [
  { id: null, label: 'All' },
  { id: 'romantic', label: '🌹 Romantic' },
  { id: 'adventurous', label: '🎉 Adventurous' },
  { id: 'calm', label: '🕯️ Calm' },
  { id: 'grand', label: '👑 Grand' },
  { id: 'spontaneous', label: '⚡ Spontaneous' },
];

export default function DiscoverScreen() {
  const [, setLocation] = useLocation();
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [savedCards, setSavedCards] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { wishlist, toggleWishlist } = useApp();

  const filtered = activeMood
    ? DISCOVER_CARDS.filter(c => c.mood === activeMood)
    : DISCOVER_CARDS;

  const toggleSave = (id: string) => {
    setSavedCards(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="flex flex-col min-h-screen pb-20" style={{ background: '#0A0A0A' }}>
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="font-black text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 26 }}>Discover</p>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full" style={{ background: 'rgba(232,64,28,0.1)', border: '1px solid rgba(232,64,28,0.2)' }}>
            <TrendingUp size={12} color="#E8401C" />
            <span style={{ color: '#E8401C', fontSize: 11, fontWeight: 700 }}>87 booked this month</span>
          </div>
        </div>
        <p style={{ color: '#555555', fontSize: 13 }}>Experiences curated for Patna</p>
      </div>

      {/* Mood filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-4">
        {MOOD_FILTERS.map(f => (
          <motion.button
            key={String(f.id)}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveMood(f.id)}
            className="shrink-0 font-semibold"
            style={{
              background: activeMood === f.id ? '#E8401C' : '#161616',
              color: activeMood === f.id ? '#FFFFFF' : '#AAAAAA',
              border: activeMood === f.id ? 'none' : '1px solid #222222',
              borderRadius: 20,
              height: 36,
              padding: '0 14px',
              fontSize: 13,
              transition: 'all 150ms',
            }}
          >
            {f.label}
          </motion.button>
        ))}
      </div>

      {/* Full-screen scroll feed */}
      <div ref={containerRef} className="flex-1 overflow-y-auto snap-y snap-mandatory no-scrollbar" style={{ height: 'calc(100vh - 200px)' }}>
        <AnimatePresence>
          {filtered.map((card, i) => {
            const isSaved = savedCards.includes(card.id);
            const inWishlist = wishlist.includes(card.packageId);

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative snap-start flex-shrink-0"
                style={{ height: 'calc(100vh - 200px)', width: '100%' }}
              >
                {/* Background image */}
                <img
                  src={card.image}
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  style={{ borderRadius: 0 }}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.98) 0%, rgba(10,10,10,0.4) 50%, rgba(10,10,10,0.2) 100%)' }}
                />

                {/* Tag */}
                <div className="absolute top-4 left-4">
                  <span className="font-bold text-white" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '4px 12px', fontSize: 12 }}>
                    {card.tag}
                  </span>
                </div>

                {/* Right actions */}
                <div className="absolute right-4 flex flex-col gap-4" style={{ top: '40%', transform: 'translateY(-50%)' }}>
                  <motion.button
                    whileTap={{ scale: 1.3 }}
                    onClick={() => toggleWishlist(card.packageId)}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="flex items-center justify-center" style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
                      <Heart size={22} color={inWishlist ? '#E8401C' : '#FFFFFF'} fill={inWishlist ? '#E8401C' : 'none'} />
                    </div>
                    <span style={{ color: '#FFFFFF', fontSize: 10 }}>{inWishlist ? 'Saved' : 'Save'}</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 1.3 }}
                    onClick={() => toggleSave(card.id)}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="flex items-center justify-center" style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
                      <Bookmark size={22} color={isSaved ? '#D4A853' : '#FFFFFF'} fill={isSaved ? '#D4A853' : 'none'} />
                    </div>
                    <span style={{ color: '#FFFFFF', fontSize: 10 }}>Inspire</span>
                  </motion.button>
                </div>

                {/* Bottom content */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p style={{ color: '#AAAAAA', fontSize: 12, marginBottom: 4 }}>{card.location}</p>
                  <p className="font-black text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 22, lineHeight: 1.2 }}>
                    {card.title}
                  </p>
                  <p style={{ color: '#D4A853', fontSize: 14, marginBottom: 16 }}>
                    From {card.price} · All inclusive
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setLocation(`/package/${card.packageId}`)}
                    className="w-full font-bold text-white flex items-center justify-center"
                    style={{ background: '#E8401C', height: 52, borderRadius: 14, fontSize: 16, fontFamily: 'Poppins, sans-serif' }}
                  >
                    Book This Experience →
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
