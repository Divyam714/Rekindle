import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { ArrowLeft, Check, Star, Crown, Zap } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const TIERS = [
  {
    id: 'explorer',
    name: 'Explorer',
    emoji: '⭐',
    color: '#AAAAAA',
    bg: 'rgba(170,170,170,0.08)',
    border: 'rgba(170,170,170,0.2)',
    bookingsRequired: 0,
    benefits: [
      'Access to all 3 curated packages',
      'Standard WhatsApp coordinator support',
      'Free cancellation up to 48 hours',
      'Occasion reminder feature',
    ],
    nextAt: 'Complete 1 booking to unlock Member',
  },
  {
    id: 'member',
    name: 'Member',
    emoji: '🔥',
    color: '#E8401C',
    bg: 'rgba(232,64,28,0.08)',
    border: 'rgba(232,64,28,0.3)',
    bookingsRequired: 1,
    benefits: [
      'Everything in Explorer',
      'Priority coordinator assignment',
      'Early access to new experiences',
      'Member badge on profile',
    ],
    nextAt: 'Complete 2 bookings to unlock Gold',
  },
  {
    id: 'gold',
    name: 'Gold',
    emoji: '🥇',
    color: '#D4A853',
    bg: 'rgba(212,168,83,0.08)',
    border: 'rgba(212,168,83,0.35)',
    bookingsRequired: 2,
    benefits: [
      'Everything in Member',
      '5% wallet credit on every booking',
      'Dedicated Gold coordinator',
      'Surprise upgrades on select dates',
      'Gold badge on profile',
    ],
    nextAt: 'Complete 5 bookings to unlock Platinum',
  },
  {
    id: 'platinum',
    name: 'Platinum',
    emoji: '💎',
    color: '#A8DADC',
    bg: 'rgba(168,218,220,0.06)',
    border: 'rgba(168,218,220,0.25)',
    bookingsRequired: 5,
    benefits: [
      'Everything in Gold',
      '10% wallet credit on every booking',
      'Dedicated Platinum concierge',
      'One complimentary upgrade per year',
      'Exclusive access to off-menu experiences',
      'Platinum badge on profile',
    ],
    nextAt: null,
  },
];

function getTierIndex(tier: string) {
  if (tier === 'platinum') return 3;
  if (tier === 'gold') return 2;
  if (tier === 'member') return 1;
  return 0;
}

export default function MembershipScreen() {
  const [, setLocation] = useLocation();
  const { bookings, loyaltyTier } = useApp();
  const currentIdx = getTierIndex(loyaltyTier);
  const nextTier = TIERS[currentIdx + 1];

  return (
    <div className="flex flex-col min-h-screen pb-20" style={{ background: '#0A0A0A' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-6">
        <motion.button whileTap={{ scale: 0.93 }} onClick={() => setLocation('/profile')}>
          <ArrowLeft size={22} color="#FFFFFF" />
        </motion.button>
        <div className="flex-1">
          <p className="font-black text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 22 }}>Membership</p>
          <p style={{ color: '#555555', fontSize: 13 }}>Your REKINDLE status & benefits</p>
        </div>
        <Crown size={22} color="#D4A853" />
      </div>

      {/* Current status card */}
      <div className="px-4 mb-6">
        {(() => {
          const current = TIERS[currentIdx];
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5"
              style={{ background: current.bg, borderRadius: 20, border: `1px solid ${current.border}` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span style={{ fontSize: 36 }}>{current.emoji}</span>
                <div>
                  <p style={{ color: current.color, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
                    Current Tier
                  </p>
                  <p className="font-black text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 24 }}>
                    REKINDLE {current.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Star size={14} color={current.color} />
                <span style={{ color: current.color, fontSize: 13, fontWeight: 600 }}>
                  {bookings.length} booking{bookings.length !== 1 ? 's' : ''} completed
                </span>
              </div>
              {nextTier && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span style={{ color: '#555555', fontSize: 12 }}>Progress to {nextTier.name}</span>
                    <span style={{ color: '#AAAAAA', fontSize: 12 }}>{bookings.length}/{nextTier.bookingsRequired}</span>
                  </div>
                  <div style={{ background: '#1E1E1E', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (bookings.length / nextTier.bookingsRequired) * 100)}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                      style={{ height: '100%', background: `linear-gradient(90deg, ${current.color}, ${nextTier.color})`, borderRadius: 4 }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })()}
      </div>

      {/* All tiers */}
      <div className="px-4 flex flex-col gap-4">
        <p className="uppercase font-semibold" style={{ color: '#555555', fontSize: 11, letterSpacing: 2 }}>ALL MEMBERSHIP TIERS</p>
        {TIERS.map((tier, i) => {
          const isCurrent = i === currentIdx;
          const isLocked = i > currentIdx;
          const isUnlocked = i < currentIdx;

          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 280, damping: 24 }}
              className="p-4"
              style={{
                background: isCurrent ? tier.bg : '#161616',
                borderRadius: 16,
                border: `1px solid ${isCurrent ? tier.border : isLocked ? '#1E1E1E' : '#2C2C2C'}`,
                opacity: isLocked ? 0.6 : 1,
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span style={{ fontSize: 26 }}>{tier.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white" style={{ fontSize: 16 }}>REKINDLE {tier.name}</p>
                    {isCurrent && (
                      <span className="font-bold uppercase" style={{ background: tier.color, color: '#0A0A0A', borderRadius: 20, padding: '2px 8px', fontSize: 9 }}>
                        CURRENT
                      </span>
                    )}
                    {isUnlocked && <Check size={14} color="#2ECC71" />}
                    {isLocked && <Zap size={14} color="#555555" />}
                  </div>
                  <p style={{ color: '#555555', fontSize: 12 }}>
                    {tier.bookingsRequired === 0 ? 'All new members' : `${tier.bookingsRequired}+ bookings`}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                {tier.benefits.map(b => (
                  <div key={b} className="flex items-start gap-2">
                    <Check size={12} color={isCurrent ? tier.color : isUnlocked ? '#2ECC71' : '#333333'} className="mt-0.5 shrink-0" />
                    <span style={{ color: isLocked ? '#444444' : '#AAAAAA', fontSize: 13 }}>{b}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}

        {nextTier && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setLocation('/home')}
            className="w-full py-4 rounded-2xl font-bold text-white"
            style={{ background: '#E8401C', fontSize: 15, fontFamily: 'Poppins, sans-serif' }}
          >
            Book to unlock {nextTier.name} →
          </motion.button>
        )}
      </div>
    </div>
  );
}
