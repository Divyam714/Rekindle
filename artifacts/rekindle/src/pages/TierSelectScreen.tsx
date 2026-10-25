import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useParams } from 'wouter';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { BASE_PRICES, getBundledAddons, computeTotal, TierKey } from '@/data/tiers';
import { useBooking } from '@/context/BookingContext';

const PLATFORM_FEE = 99;

export default function TierSelectScreen() {
  const params = useParams<{ occasionType: string }>();
  const occasionType = params.occasionType ?? 'date_night';
  const [, setLocation] = useLocation();
  const { addonCart, setSelectedTier } = useBooking();
  const [selected, setSelected] = useState<TierKey | null>(null);

  const basePrice = BASE_PRICES[occasionType] ?? 0;

  const silverAddons = addonCart;
  const goldBundled = getBundledAddons('gold', occasionType);
  const platinumBundled = getBundledAddons('platinum', occasionType);

  const goldBundledIds = new Set(goldBundled.map(a => a.id));

  const goldExtras = addonCart.filter(a => !goldBundledIds.has(a.id));

  const silverTotal = computeTotal(occasionType, 'silver', addonCart) + PLATFORM_FEE;
  const goldTotal = computeTotal(occasionType, 'gold', addonCart) + PLATFORM_FEE;
  const platTotal = computeTotal(occasionType, 'platinum', addonCart) + PLATFORM_FEE;

  const handleSelect = (tier: TierKey) => {
    setSelected(tier);
    const bundled = getBundledAddons(tier, occasionType);
    const bundledIds = new Set(bundled.map(a => a.id));
    const extras = addonCart.filter(a => !bundledIds.has(a.id));
    const allAddons = [...bundled, ...extras];
    const total = computeTotal(occasionType, tier, addonCart);

    setSelectedTier({
      occasionType,
      tier,
      basePrice,
      addOns: allAddons,
      totalPrice: total + PLATFORM_FEE,
    });

    setTimeout(() => setLocation(`/book/${occasionType}`), 220);
  };

  const BASE_INCLUSIONS = ['Private venue booking', 'Ambiance setup', 'Reserved seating', 'REKINDLE coordinator on-call'];

  return (
    <div className="fixed inset-0 overflow-y-auto no-scrollbar" style={{ background: '#0A0A0A' }}>
      <div className="px-4 pt-12 pb-4">
        <motion.button whileTap={{ scale: 0.93 }} onClick={() => setLocation('/addon-marketplace')} className="mb-6">
          <ArrowLeft size={22} color="#FFFFFF" />
        </motion.button>
        <h1 className="font-bold text-white mb-1" style={{ fontSize: 24 }}>Choose Your Tier</h1>
        <p style={{ color: '#AAAAAA', fontSize: 14 }}>Pick the experience level that's right for you</p>
      </div>

      <div className="px-4 flex flex-col gap-4 pb-10">
        {/* SILVER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={selected === 'silver' ? { opacity: 1, y: 0, scale: 1.02 } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.05, type: 'spring', stiffness: 300, damping: 26 }}
          onClick={() => handleSelect('silver')}
          className="p-5 rounded-2xl cursor-pointer relative"
          style={{
            background: '#161616',
            border: `${selected === 'silver' ? 2 : 1}px solid ${selected === 'silver' ? '#E8401C' : '#2C2C2C'}`,
            transition: 'border-color 0.15s',
          }}
        >
          <span className="absolute top-4 right-4 px-2 py-1 rounded-full text-white font-bold" style={{ background: '#6B7280', fontSize: 11 }}>SILVER</span>
          <h2 className="font-bold text-white mb-1" style={{ fontSize: 18 }}>Core Experience</h2>
          <p style={{ color: '#AAAAAA', fontSize: 13 }} className="mb-4">Just the essentials — clean, simple, perfect</p>
          <p className="font-bold text-white mb-3" style={{ fontSize: 22 }}>₹{silverTotal.toLocaleString('en-IN')}</p>
          <div className="flex flex-col gap-1.5 mb-4">
            {BASE_INCLUSIONS.map(inc => (
              <div key={inc} className="flex items-center gap-2">
                <CheckCircle size={14} color="#2ECC71" />
                <span style={{ color: '#AAAAAA', fontSize: 13 }}>{inc}</span>
              </div>
            ))}
            {silverAddons.map(a => (
              <div key={a.id} className="flex items-center gap-2">
                <CheckCircle size={14} color="#2ECC71" />
                <span style={{ color: '#AAAAAA', fontSize: 13 }}>{a.label}</span>
              </div>
            ))}
          </div>
          <button
            className="w-full py-3 rounded-xl font-semibold"
            style={{ border: '1.5px solid #E8401C', color: '#E8401C', fontSize: 14, background: 'transparent' }}
          >
            Select Silver
          </button>
        </motion.div>

        {/* GOLD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={selected === 'gold' ? { opacity: 1, y: 0, scale: 1.02 } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.12, type: 'spring', stiffness: 300, damping: 26 }}
          onClick={() => handleSelect('gold')}
          className="p-5 rounded-2xl cursor-pointer relative"
          style={{
            background: '#161616',
            border: `${selected === 'gold' ? 2 : 1}px solid ${selected === 'gold' ? '#E8401C' : '#2C2C2C'}`,
            transition: 'border-color 0.15s',
          }}
        >
          <span className="absolute top-4 right-4 px-2 py-1 rounded-full text-white font-bold" style={{ background: '#E8401C', fontSize: 11 }}>MOST LOVED ♥</span>
          <h2 className="font-bold text-white mb-1" style={{ fontSize: 18 }}>The Full Evening</h2>
          <p style={{ color: '#AAAAAA', fontSize: 13 }} className="mb-4">Our most popular — everything you need, nothing you don't</p>
          <p className="font-bold text-white mb-3" style={{ fontSize: 22 }}>₹{goldTotal.toLocaleString('en-IN')}</p>
          <div className="flex flex-col gap-1.5 mb-4">
            {BASE_INCLUSIONS.map(inc => (
              <div key={inc} className="flex items-center gap-2">
                <CheckCircle size={14} color="#2ECC71" />
                <span style={{ color: '#AAAAAA', fontSize: 13 }}>{inc}</span>
              </div>
            ))}
            {goldBundled.map(a => (
              <div key={a.id} className="flex items-center gap-2">
                <CheckCircle size={14} color="#2ECC71" />
                <span style={{ color: '#AAAAAA', fontSize: 13 }}>{a.label}</span>
              </div>
            ))}
            {goldExtras.map(a => (
              <div key={a.id} className="flex items-center gap-2">
                <CheckCircle size={14} color="#2ECC71" />
                <span style={{ color: '#AAAAAA', fontSize: 13 }}>{a.label} (your pick)</span>
              </div>
            ))}
          </div>
          <button
            className="w-full py-3 rounded-xl font-semibold text-white"
            style={{ background: '#E8401C', fontSize: 14 }}
          >
            Select Gold
          </button>
        </motion.div>

        {/* PLATINUM */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={selected === 'platinum' ? { opacity: 1, y: 0, scale: 1.02 } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.19, type: 'spring', stiffness: 300, damping: 26 }}
          onClick={() => handleSelect('platinum')}
          className="p-5 rounded-2xl cursor-pointer relative"
          style={{
            background: 'linear-gradient(160deg, #0F0606 0%, #161616 100%)',
            border: `${selected === 'platinum' ? 2 : 1}px solid ${selected === 'platinum' ? '#D4A853' : '#2C2C2C'}`,
            transition: 'border-color 0.15s',
          }}
        >
          <span className="absolute top-4 right-4 px-2 py-1 rounded-full font-bold" style={{ background: '#D4A853', color: '#0A0A0A', fontSize: 11 }}>✦ PLATINUM</span>
          <h2 className="font-bold text-white mb-1" style={{ fontSize: 18 }}>Luxury Full Experience</h2>
          <p style={{ color: '#AAAAAA', fontSize: 13 }} className="mb-4">Every detail handled. Nothing left to chance.</p>
          <p className="font-bold text-white mb-3" style={{ fontSize: 22 }}>₹{platTotal.toLocaleString('en-IN')}</p>
          <div className="flex flex-col gap-1.5 mb-4">
            {BASE_INCLUSIONS.map(inc => (
              <div key={inc} className="flex items-center gap-2">
                <CheckCircle size={14} color="#D4A853" />
                <span style={{ color: '#AAAAAA', fontSize: 13 }}>{inc}</span>
              </div>
            ))}
            {platinumBundled.map(a => (
              <div key={a.id} className="flex items-center gap-2">
                <CheckCircle size={14} color="#D4A853" />
                <span style={{ color: '#AAAAAA', fontSize: 13 }}>{a.label}</span>
              </div>
            ))}
          </div>
          <button
            className="w-full py-3 rounded-xl font-semibold"
            style={{ border: '1.5px solid #D4A853', color: '#D4A853', fontSize: 14, background: 'transparent' }}
          >
            Select Platinum
          </button>
        </motion.div>

        {/* Comparison helper */}
        <p className="text-center" style={{ color: '#555555', fontSize: 12 }}>
          Silver saves you ₹{(platTotal - silverTotal).toLocaleString('en-IN')} vs Platinum • Gold is our most booked tier
        </p>
      </div>
    </div>
  );
}
