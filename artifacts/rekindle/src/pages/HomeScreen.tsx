import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { MapPin, ChevronDown, Bell, Search, Heart, Star, CheckCircle, Car, Lock, Sparkles, X, Bell as BellIcon, Wallet, Timer } from 'lucide-react';
import { PACKAGES, REVIEWS } from '@/data/packages';
import { useApp } from '@/context/AppContext';
import { useBooking } from '@/context/BookingContext';
import { DATE_STYLES } from '@/data/styles';
import { getSmartOccasions, getDaysUntil } from '@/data/occasions';

const AI_PICKS = [
  { occasion: 'date_night', style: 'rooftop_dining', label: 'Rooftop Date Night', emoji: '🌃', price: '₹1,499', reason: 'Perfect for a breezy Patna evening' },
  { occasion: 'proposal', style: 'standard', label: 'Proposal Experience', emoji: '💍', price: '₹5,999', reason: 'Most booked proposal setup in Patna' },
  { occasion: 'anniversary', style: 'standard', label: 'Anniversary Surprise', emoji: '🕯️', price: '₹2,999', reason: 'Loved by 87+ couples this season' },
];

const BANNERS = [
  { image: 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=1200&q=85&auto=format', badge: 'PROPOSAL', name: 'REKINDLE Proposal', price: '₹5,999', id: 'proposal' },
  { image: 'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=1200&q=85&auto=format', badge: 'ANNIVERSARY', name: 'REKINDLE Anniversary', price: '₹2,999', id: 'anniversary' },
  { image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=85&auto=format', badge: 'DATE NIGHT', name: 'REKINDLE Date Night', price: '₹1,499', id: 'date-night' },
];

const CHIPS = [
  { label: '💍 Proposal', id: 'proposal' },
  { label: '🕯️ Anniversary', id: 'anniversary' },
  { label: '🌙 Date Night', id: 'date-night' },
];

const MOODS = [
  { id: 'romantic', emoji: '🌹', label: 'Romantic\n& Classic', packageId: 'anniversary', gradient: 'linear-gradient(135deg, #1A0808, #0A0A0A)' },
  { id: 'adventurous', emoji: '🎉', label: 'Adventurous\n& Fun', packageId: 'date-night', gradient: 'linear-gradient(135deg, #0A0A1A, #0A0A0A)' },
  { id: 'calm', emoji: '🕯️', label: 'Calm &\nLuxurious', packageId: 'date-night', gradient: 'linear-gradient(135deg, #0A0905, #0A0A0A)' },
  { id: 'spontaneous', emoji: '⚡', label: 'Spontaneous\n& Wild', packageId: 'date-night', gradient: 'linear-gradient(135deg, #0A0808, #0A0A0A)' },
  { id: 'grand', emoji: '👑', label: 'Grand &\nUnforgettable', packageId: 'proposal', gradient: 'linear-gradient(135deg, #100A00, #0A0A0A)' },
  { id: 'surprise', emoji: '✨', label: 'Surprise Me\nCompletely', packageId: null, gradient: 'linear-gradient(135deg, #0A0A10, #0A0A0A)' },
];

const LIVE_ACTIVITIES = [
  '🔴 Rahul just booked a Proposal in Patna · 2 min ago',
  '💑 Priya & Arjun celebrated their anniversary last night',
  '👀 3 couples are planning a date night right now',
  '🔴 Vikram booked the Rooftop Date Night · 5 min ago',
  '💍 Sneha surprised her partner with a proposal setup',
  '🎉 87 couples have used REKINDLE this month',
];

const VENUES = [
  { id: 'rooftop', name: 'The Rooftop Garden', location: 'Bailey Road', image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80', count: 12 },
  { id: 'lakeside', name: 'Lakeside Resort', location: 'Patna Sahib', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80', count: 8 },
  { id: 'riverside', name: 'Riverside Lounge', location: 'Gandhi Ghat', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', count: 15 },
  { id: 'heritage', name: 'Heritage Palace', location: 'Patna City', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=80', count: 6 },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function SkeletonCard() {
  return (
    <div style={{ background: '#161616', borderRadius: 16, border: '1px solid #222222', overflow: 'hidden' }}>
      <div className="shimmer" style={{ height: 160, width: '100%' }} />
      <div className="p-3 flex flex-col gap-2">
        <div className="shimmer" style={{ height: 14, width: '70%', borderRadius: 4 }} />
        <div className="shimmer" style={{ height: 12, width: '50%', borderRadius: 4 }} />
        <div className="shimmer" style={{ height: 20, width: '40%', borderRadius: 4 }} />
      </div>
    </div>
  );
}

export default function HomeScreen() {
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [imgLoaded, setImgLoaded] = useState<Record<string, boolean>>({});
  const [, setLocation] = useLocation();
  const { user, wishlist, toggleWishlist, dismissedBanner, dismissBanner, loyaltyTier, walletBalance, occasions, bookings } = useApp();
  const { aiRecommendations, setSelectedStyle } = useBooking();
  const bannerRef = useRef<NodeJS.Timeout | null>(null);
  const tickerRef = useRef<NodeJS.Timeout | null>(null);

  const handleAIPick = (occasion: string, style: string) => {
    setSelectedStyle({ occasionType: occasion, styleKey: style, styleLabel: style });
    setLocation(`/style-select/${occasion}`);
  };

  const greeting = getGreeting();
  const firstName = user?.name?.split(' ')[0] || null;
  const userInitial = firstName?.[0]?.toUpperCase() || 'U';

  const nextUpcoming = bookings.find(b => b.status === 'UPCOMING');

  useEffect(() => {
    bannerRef.current = setInterval(() => setBannerIdx(i => (i + 1) % BANNERS.length), 5000);
    return () => { if (bannerRef.current) clearInterval(bannerRef.current); };
  }, []);

  useEffect(() => {
    tickerRef.current = setInterval(() => setTickerIdx(i => (i + 1) % LIVE_ACTIVITIES.length), 4000);
    return () => { if (tickerRef.current) clearInterval(tickerRef.current); };
  }, []);

  const filteredPackages = useMemo(() => {
    let result = PACKAGES;
    if (activeChip) result = result.filter(p => p.id === activeChip);
    if (activeMood) {
      const mood = MOODS.find(m => m.id === activeMood);
      if (mood?.packageId) result = result.filter(p => p.id === mood.packageId);
    }
    return result;
  }, [activeChip, activeMood]);

  const smartOccasions = useMemo(() => getSmartOccasions(), []);
  const userOccasions = useMemo(() => {
    return occasions.map(o => ({
      label: `${o.partnerName}'s ${o.label}`,
      emoji: '🗓️',
      daysUntil: getDaysUntil(o.date),
      occasionType: 'date_night',
    })).filter(o => o.daysUntil <= 60).slice(0, 2);
  }, [occasions]);

  const allOccasions = [...userOccasions, ...smartOccasions].slice(0, 5);

  return (
    <div
      data-testid="home-screen"
      className="flex flex-col min-h-screen pb-20"
      style={{ background: '#0A0A0A' }}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 pt-12 pb-2">
        <div className="flex items-center gap-1">
          <MapPin size={16} color="#E8401C" />
          <span className="font-semibold text-white" style={{ fontSize: 14 }}>Patna, Bihar</span>
          <ChevronDown size={14} color="#555555" />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell size={22} color="#AAAAAA" />
            <span className="absolute -top-1 -right-1 rounded-full" style={{ width: 8, height: 8, background: '#E8401C' }} />
          </div>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setLocation('/profile')}
            className="flex items-center justify-center font-black text-white"
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: loyaltyTier === 'platinum'
                ? 'linear-gradient(135deg, #A8DADC, #6DB5B9)'
                : loyaltyTier === 'gold'
                ? 'linear-gradient(135deg, #D4A853, #E8401C)'
                : '#E8401C',
              fontSize: 15,
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            {userInitial}
          </motion.button>
        </div>
      </div>

      {/* Personalized Greeting */}
      <div className="px-4 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <p style={{ color: '#555555', fontSize: 13 }}>{greeting}{firstName ? ',' : ''}</p>
          <p className="font-black text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 24, lineHeight: 1.2 }}>
            {firstName ? firstName : 'Welcome to REKINDLE'} {!firstName && '✨'}
          </p>
          {firstName && <p style={{ color: '#555555', fontSize: 13 }}>What are we planning today?</p>}
        </motion.div>

        {loyaltyTier !== 'none' && walletBalance > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 mt-3 px-4 py-2.5 rounded-full"
            style={{ background: 'linear-gradient(90deg, rgba(212,168,83,0.12), rgba(212,168,83,0.05))', border: '1px solid rgba(212,168,83,0.25)' }}
          >
            <Wallet size={14} color="#D4A853" />
            <span className="font-semibold" style={{ color: '#D4A853', fontSize: 13 }}>
              ₹{walletBalance} wallet credit available
            </span>
          </motion.button>
        )}
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-4">
        <div
          className="flex items-center gap-3 w-full"
          style={{ background: '#161616', borderRadius: 28, height: 52, border: '1px solid #222222', padding: '0 16px' }}
        >
          <Search size={18} color="#555555" />
          <span className="flex-1" style={{ color: '#555555', fontSize: 14 }}>What are you celebrating?</span>
        </div>
      </div>

      {/* Upcoming countdown strip */}
      {nextUpcoming && (
        <motion.button
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setLocation('/countdown')}
          className="mx-4 mb-4 flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(212,168,83,0.08), rgba(232,64,28,0.06))', border: '1px solid rgba(212,168,83,0.25)' }}
        >
          <Timer size={18} color="#D4A853" />
          <div className="flex-1 text-left">
            <p className="font-bold text-white" style={{ fontSize: 13 }}>Your experience is coming up</p>
            <p style={{ color: '#D4A853', fontSize: 12 }}>{nextUpcoming.packageName} · {nextUpcoming.date}</p>
          </div>
          <span style={{ color: '#D4A853', fontSize: 14, fontWeight: 600 }}>Countdown →</span>
        </motion.button>
      )}

      {/* Occasions Intelligence Strip */}
      {allOccasions.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between px-4 mb-3">
            <span className="uppercase font-semibold" style={{ color: '#555555', fontSize: 11, letterSpacing: 2 }}>📅 UPCOMING OCCASIONS</span>
            <button onClick={() => setLocation('/occasion-reminders')} style={{ color: '#E8401C', fontSize: 12 }}>Manage →</button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-2">
            {allOccasions.map((occ, i) => (
              <motion.button
                key={`${occ.label}-${i}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07, type: 'spring', stiffness: 280, damping: 24 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setLocation(`/style-select/${occ.occasionType}`)}
                className="shrink-0 flex flex-col text-left p-4"
                style={{
                  width: 180,
                  background: occ.daysUntil <= 14 ? 'rgba(232,64,28,0.06)' : '#161616',
                  borderRadius: 16,
                  border: `1px solid ${occ.daysUntil <= 14 ? 'rgba(232,64,28,0.3)' : '#222222'}`,
                }}
              >
                <span style={{ fontSize: 26 }}>{occ.emoji}</span>
                <p className="font-bold text-white mt-1.5" style={{ fontSize: 13, lineHeight: 1.3 }}>{occ.label}</p>
                <p
                  className="font-semibold mt-1"
                  style={{ fontSize: 12, color: occ.daysUntil <= 7 ? '#E8401C' : occ.daysUntil <= 30 ? '#D4A853' : '#2ECC71' }}
                >
                  {occ.daysUntil === 0 ? 'Today! 🎉' : `In ${occ.daysUntil} day${occ.daysUntil > 1 ? 's' : ''}`}
                </p>
                <span className="font-semibold mt-2" style={{ color: '#E8401C', fontSize: 11 }}>Book Now →</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 px-4">
        {CHIPS.map(chip => (
          <motion.button
            key={chip.id}
            data-testid={`chip-${chip.id}`}
            whileTap={{ scale: 0.96 }}
            onClick={() => { setActiveChip(activeChip === chip.id ? null : chip.id); setActiveMood(null); }}
            animate={{ y: activeChip === chip.id ? -2 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="shrink-0 font-semibold"
            style={{
              background: activeChip === chip.id ? '#E8401C' : '#161616',
              border: activeChip === chip.id ? 'none' : '1px solid #222222',
              color: activeChip === chip.id ? '#FFFFFF' : '#AAAAAA',
              borderRadius: 20,
              height: 38,
              padding: '0 16px',
              fontSize: 13,
              transition: 'background 150ms, color 150ms',
            }}
          >
            {chip.label}
          </motion.button>
        ))}
      </div>

      {/* Urgency Banner */}
      <AnimatePresence>
        {!dismissedBanner && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="mx-4 mb-4 flex items-center justify-between relative"
            style={{ background: 'linear-gradient(135deg, #1A0808, #120505)', borderRadius: 14, borderLeft: '3px solid #E8401C', padding: '14px 16px' }}
          >
            <span className="text-white font-semibold pr-8" style={{ fontSize: 13 }}>
              🔥 Proposal slots filling fast — only 3 available this week
            </span>
            <button data-testid="button-dismiss-banner" onClick={dismissBanner} className="absolute top-3 right-3" style={{ color: '#AAAAAA' }}>
              <X size={16} />
            </button>
            <button data-testid="button-banner-book" onClick={() => setLocation('/package/proposal')} style={{ color: '#E8401C', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
              Book →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Banners */}
      <div className="mx-4 mb-0 relative overflow-hidden" style={{ borderRadius: 18, height: 196 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={bannerIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <img
              src={BANNERS[bannerIdx].image}
              alt={BANNERS[bannerIdx].name}
              className="w-full h-full object-cover"
              style={{ background: '#1E1E1E' }}
              loading="lazy"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.3) 50%, transparent 100%)' }} />
            <div className="absolute bottom-0 left-0 p-4">
              <span className="text-white font-semibold uppercase mb-1 block" style={{ background: '#E8401C', borderRadius: 20, padding: '2px 10px', fontSize: 10, display: 'inline-block' }}>
                {BANNERS[bannerIdx].badge}
              </span>
              <p className="font-black text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 20 }}>{BANNERS[bannerIdx].name}</p>
              <p style={{ color: '#AAAAAA', fontSize: 13 }}>From {BANNERS[bannerIdx].price} all inclusive</p>
            </div>
            <button
              data-testid={`banner-book-${bannerIdx}`}
              onClick={() => setLocation(`/package/${BANNERS[bannerIdx].id}`)}
              className="absolute bottom-4 right-4 font-semibold"
              style={{ background: '#FFFFFF', color: '#0A0A0A', borderRadius: 20, padding: '7px 16px', fontSize: 13 }}
            >
              Book Now
            </button>
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
          {BANNERS.map((_, i) => (
            <button key={i} onClick={() => setBannerIdx(i)}>
              <motion.div animate={{ width: i === bannerIdx ? 16 : 6, height: 6, opacity: i === bannerIdx ? 1 : 0.4, background: '#FFFFFF' }} style={{ borderRadius: 3 }} />
            </button>
          ))}
        </div>
      </div>

      {/* Social Proof Ticker — System 5 */}
      <div className="mx-4 mb-6 overflow-hidden" style={{ borderRadius: '0 0 14px 14px', background: 'rgba(232,64,28,0.05)', borderBottom: '1px solid rgba(232,64,28,0.12)', borderLeft: '1px solid rgba(232,64,28,0.12)', borderRight: '1px solid rgba(232,64,28,0.12)' }}>
        <div className="px-4 py-2.5 flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 7, height: 7, borderRadius: '50%', background: '#E8401C', flexShrink: 0 }}
          />
          <AnimatePresence mode="wait">
            <motion.p
              key={tickerIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              style={{ color: '#AAAAAA', fontSize: 12, fontWeight: 500 }}
            >
              {LIVE_ACTIVITIES[tickerIdx]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Mood Cards — System 2 */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <span className="uppercase font-semibold" style={{ color: '#555555', fontSize: 11, letterSpacing: 2 }}>🌸 WHAT'S YOUR MOOD?</span>
          {activeMood && (
            <button onClick={() => setActiveMood(null)} style={{ color: '#E8401C', fontSize: 12 }}>Clear ×</button>
          )}
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
          {MOODS.map((mood, i) => {
            const isActive = activeMood === mood.id;
            return (
              <motion.button
                key={mood.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 24 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveMood(isActive ? null : mood.id);
                  setActiveChip(null);
                  if (!isActive && mood.packageId) {
                    // just filter, don't navigate
                  }
                  if (!isActive && !mood.packageId) {
                    setLocation('/discover');
                  }
                }}
                className="shrink-0 flex flex-col items-center gap-1.5 p-3"
                style={{
                  width: 88,
                  background: isActive ? 'rgba(232,64,28,0.12)' : mood.gradient,
                  borderRadius: 18,
                  border: isActive ? '1.5px solid #E8401C' : '1px solid #1E1E1E',
                  transition: 'all 150ms',
                }}
              >
                <span style={{ fontSize: 28 }}>{mood.emoji}</span>
                <p
                  className="font-semibold text-center"
                  style={{ color: isActive ? '#E8401C' : '#AAAAAA', fontSize: 10, lineHeight: 1.4, whiteSpace: 'pre-line' }}
                >
                  {mood.label}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Our Packages */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="uppercase font-semibold" style={{ color: '#555555', fontSize: 11, letterSpacing: 2 }}>OUR PACKAGES</span>
          <button data-testid="link-see-all" style={{ color: '#E8401C', fontSize: 13 }}>See all</button>
        </div>
        {filteredPackages.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <span style={{ fontSize: 36 }}>🌟</span>
            <p className="text-white font-semibold" style={{ fontSize: 15 }}>No packages match this mood</p>
            <button onClick={() => { setActiveMood(null); setActiveChip(null); }} style={{ color: '#E8401C', fontSize: 13 }}>Show all →</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredPackages.map((pkg, idx) => {
              const inWishlist = wishlist.includes(pkg.id);
              const loaded = imgLoaded[pkg.id];
              return (
                <motion.div
                  key={pkg.id}
                  data-testid={`card-package-${pkg.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, type: 'spring', stiffness: 260, damping: 24 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex flex-col overflow-hidden cursor-pointer"
                  onClick={() => setLocation(`/package/${pkg.id}`)}
                  style={{ background: '#161616', borderRadius: 18, border: pkg.cardBorder ? `1px solid ${pkg.cardBorder}` : '1px solid #1E1E1E' }}
                >
                  <div className="relative overflow-hidden" style={{ height: 160 }}>
                    {!loaded && <div className="shimmer absolute inset-0" />}
                    <img
                      src={pkg.thumbImage}
                      alt={pkg.name}
                      className="w-full h-full object-cover"
                      style={{ background: '#1E1E1E', opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }}
                      loading="lazy"
                      onLoad={() => setImgLoaded(s => ({ ...s, [pkg.id]: true }))}
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(22,22,22,0.85) 0%, transparent 55%)' }} />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <span className="text-white font-semibold uppercase" style={{ background: '#E8401C', borderRadius: 20, padding: '2px 8px', fontSize: 9 }}>
                        {pkg.occasion}
                      </span>
                      <span
                        className="font-semibold uppercase"
                        style={{ background: pkg.valueBadgeGold ? '#D4A853' : 'rgba(0,0,0,0.6)', color: pkg.valueBadgeGold ? '#0A0A0A' : '#FFFFFF', borderRadius: 20, padding: '2px 8px', fontSize: 9 }}
                      >
                        {pkg.valueBadge}
                      </span>
                    </div>
                    <motion.button
                      data-testid={`button-wishlist-${pkg.id}`}
                      whileTap={{ scale: 1.4 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      onClick={e => { e.stopPropagation(); toggleWishlist(pkg.id); }}
                      className="absolute top-2 right-2 flex items-center justify-center"
                      style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.5)' }}
                    >
                      <Heart size={20} color={inWishlist ? '#E8401C' : '#FFFFFF'} fill={inWishlist ? '#E8401C' : 'none'} />
                    </motion.button>
                  </div>
                  <div className="p-3 flex flex-col gap-1.5">
                    <p className="font-bold text-white" style={{ fontSize: 14, lineHeight: 1.3 }}>{pkg.name}</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, j) => (
                        <motion.div
                          key={j}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + j * 0.06 }}
                        >
                          <Star size={11} color="#E8401C" fill="#E8401C" />
                        </motion.div>
                      ))}
                      <span className="font-bold text-white" style={{ fontSize: 11, marginLeft: 2 }}>{pkg.rating}</span>
                      <span style={{ color: '#555555', fontSize: 10 }}>({pkg.ratingCount})</span>
                    </div>
                    {pkg.inclusions.slice(0, 2).map(inc => (
                      <div key={inc} className="flex items-start gap-1.5">
                        <CheckCircle size={11} color="#2ECC71" className="mt-0.5 shrink-0" />
                        <span className="text-white" style={{ fontSize: 11, lineHeight: 1.4 }}>{inc}</span>
                      </div>
                    ))}
                    <div className="flex items-end justify-between mt-1">
                      <span style={{ color: '#555555', fontSize: 10 }}>All inclusive</span>
                      <span className="font-black text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 18 }}>₹{pkg.price.toLocaleString('en-IN')}</span>
                    </div>
                    <motion.button
                      data-testid={`button-book-${pkg.id}`}
                      whileTap={{ scale: 0.96 }}
                      onClick={e => { e.stopPropagation(); setLocation(`/package/${pkg.id}`); }}
                      className="w-full font-bold text-white flex items-center justify-center mt-1"
                      style={{ background: '#E8401C', height: 44, borderRadius: 10, fontSize: 13 }}
                    >
                      Book Now
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Picks */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 mb-4">
          <span className="uppercase font-semibold" style={{ color: '#555555', fontSize: 11, letterSpacing: 2 }}>✨ AI PICKS FOR YOU</span>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-2">
          {AI_PICKS.map((pick, i) => (
            <motion.button
              key={pick.style + pick.occasion}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 300, damping: 24 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleAIPick(pick.occasion, pick.style)}
              className="shrink-0 flex flex-col text-left p-4"
              style={{ width: 180, background: '#161616', borderRadius: 16, border: '1px solid #1E1E1E' }}
            >
              <span style={{ fontSize: 28 }}>{pick.emoji}</span>
              <p className="font-bold text-white mt-2" style={{ fontSize: 14 }}>{pick.label}</p>
              <p style={{ color: '#AAAAAA', fontSize: 11, marginTop: 2 }}>{pick.reason}</p>
              <p className="font-black mt-2" style={{ fontFamily: 'Poppins, sans-serif', color: '#E8401C', fontSize: 15 }}>From {pick.price}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Venue Explorer — System 12 */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 mb-4">
          <span className="uppercase font-semibold" style={{ color: '#555555', fontSize: 11, letterSpacing: 2 }}>📍 EXPLORE VENUES</span>
          <button style={{ color: '#E8401C', fontSize: 12 }}>View all</button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-2">
          {VENUES.map((venue, i) => (
            <motion.button
              key={venue.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 280, damping: 24 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setLocation('/discover')}
              className="shrink-0 flex flex-col overflow-hidden"
              style={{ width: 160, background: '#161616', borderRadius: 16, border: '1px solid #1E1E1E' }}
            >
              <div className="relative" style={{ height: 100 }}>
                <img
                  src={venue.image}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(22,22,22,0.8) 0%, transparent 50%)' }} />
                <span
                  className="absolute bottom-2 right-2 font-bold"
                  style={{ background: 'rgba(0,0,0,0.7)', color: '#FFFFFF', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}
                >
                  {venue.count} dates
                </span>
              </div>
              <div className="p-3">
                <p className="font-bold text-white" style={{ fontSize: 12, lineHeight: 1.3 }}>{venue.name}</p>
                <p style={{ color: '#555555', fontSize: 11, marginTop: 2 }}>{venue.location}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Trending Styles */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 mb-4">
          <span className="uppercase font-semibold" style={{ color: '#555555', fontSize: 11, letterSpacing: 2 }}>TRENDING DATE STYLES</span>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-2">
          {DATE_STYLES.slice(0, 5).map((style, i) => (
            <motion.button
              key={style.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setLocation('/style-select/date_night')}
              className="shrink-0 flex flex-col items-center gap-1 px-3 py-3"
              style={{ background: '#161616', borderRadius: 14, border: '1px solid #1E1E1E', minWidth: 90 }}
            >
              <span style={{ fontSize: 26 }}>{style.emoji}</span>
              <p className="text-white text-center" style={{ fontSize: 11, fontWeight: 600 }}>{style.label}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-6">
        <div className="px-4 mb-4">
          <span className="uppercase font-semibold" style={{ color: '#555555', fontSize: 11, letterSpacing: 2 }}>HOW IT WORKS</span>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-2">
          {[
            { step: '1', Icon: Car, title: 'Choose package', sub: '3 curated options' },
            { step: '2', Icon: Lock, title: 'Pay once', sub: 'UPI or card' },
            { step: '3', Icon: Sparkles, title: 'Show up', sub: 'We handle everything' },
          ].map(({ step, Icon, title, sub }) => (
            <div key={step} className="shrink-0 flex flex-col gap-2 p-4" style={{ width: 140, height: 140, background: '#161616', borderRadius: 16 }}>
              <span className="font-black" style={{ color: '#E8401C', fontSize: 32, opacity: 0.35 }}>{step}</span>
              <Icon size={24} color="#FFFFFF" />
              <p className="font-semibold text-white" style={{ fontSize: 13 }}>{title}</p>
              <p style={{ color: '#555555', fontSize: 11 }}>{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="mb-6">
        <div className="px-4 mb-4">
          <span className="uppercase font-semibold" style={{ color: '#555555', fontSize: 11, letterSpacing: 2 }}>WHAT COUPLES SAY</span>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-2">
          {REVIEWS.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="shrink-0 p-5 flex flex-col gap-2"
              style={{ width: 260, background: '#161616', borderRadius: 16, border: '1px solid #1E1E1E' }}
            >
              <div className="flex gap-0.5">
                {Array.from({ length: r.stars }).map((_, j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + j * 0.07 }}
                  >
                    <Star size={14} color="#E8401C" fill="#E8401C" />
                  </motion.div>
                ))}
              </div>
              <p className="italic text-white" style={{ fontSize: 14, lineHeight: 1.6 }}>"{r.review}"</p>
              <p style={{ color: '#AAAAAA', fontSize: 12 }}>{r.name} · {r.location}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Occasion Reminder CTA */}
      <div className="px-4 mb-6">
        <motion.button
          data-testid="button-occasion-reminder"
          whileTap={{ scale: 0.98 }}
          onClick={() => setLocation('/occasion-reminders')}
          className="w-full flex items-center justify-between p-4 text-left"
          style={{ background: '#161616', borderRadius: 16, borderLeft: '3px solid #E8401C', border: '1px solid #1E1E1E' }}
        >
          <div className="flex items-center gap-3">
            <BellIcon size={20} color="#E8401C" />
            <div>
              <p className="font-bold text-white" style={{ fontSize: 15 }}>Never miss an occasion</p>
              <p style={{ color: '#AAAAAA', fontSize: 13 }}>Set reminders for anniversaries and birthdays</p>
            </div>
          </div>
          <span style={{ color: '#AAAAAA', fontSize: 18 }}>→</span>
        </motion.button>
      </div>

      {/* Floating AI FAB */}
      <motion.button
        data-testid="button-ai-concierge-fab"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 400, damping: 20 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setLocation('/style-select/date_night')}
        className="fixed flex items-center gap-2"
        style={{
          bottom: 84,
          right: 16,
          background: '#E8401C',
          borderRadius: 28,
          height: 50,
          padding: '0 18px',
          boxShadow: '0 4px 24px rgba(232,64,28,0.45)',
          zIndex: 40,
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', times: [0, 0.5, 1] }}
        >
          <Sparkles size={18} color="#FFFFFF" />
        </motion.div>
        <span className="font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13 }}>Plan with AI</span>
      </motion.button>
    </div>
  );
}
