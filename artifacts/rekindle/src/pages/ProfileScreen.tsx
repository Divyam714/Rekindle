import { getActiveUser } from '@/services/userService';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, User, Bell, Calendar, LogOut, MessageCircle,
  Info, Star, Heart, BookOpen, Wallet, Sparkles, Gift, Crown, BookHeart
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { LoyaltyTier } from '@/context/AppContext';




function AnimatedCounter({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / 800, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(ease * target));
      if (t < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [target]);
  return <span>{val}</span>;
}

function LoyaltyBadge({ tier }: { tier: LoyaltyTier }) {
  if (tier === 'none') return null;
  const configs = {
    member: { color: '#E8401C', bg: 'rgba(232,64,28,0.1)', border: 'rgba(232,64,28,0.3)', emoji: '🔥', label: 'REKINDLE Member' },
    gold: { color: '#D4A853', bg: 'linear-gradient(90deg, rgba(212,168,83,0.15), rgba(212,168,83,0.08))', border: 'rgba(212,168,83,0.5)', emoji: '🥇', label: 'REKINDLE Gold' },
    platinum: { color: '#A8DADC', bg: 'linear-gradient(90deg, rgba(168,218,220,0.1), rgba(168,218,220,0.05))', border: 'rgba(168,218,220,0.4)', emoji: '💎', label: 'REKINDLE Platinum' },
  };
  const c = configs[tier];
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <span style={{ fontSize: 14 }}>{c.emoji}</span>
      <span className="font-bold" style={{ fontSize: 12, color: c.color }}>{c.label}</span>
    </motion.div>
  );
}

export default function ProfileScreen() {
  const { user, wishlist, bookings, logout, loyaltyTier, walletBalance, momentsCreated } = useApp();
  const [, setLocation] = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const currentUser = getActiveUser();


  const initial = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U';

  const avatarBg =
    loyaltyTier === 'platinum'
      ? 'linear-gradient(135deg, #A8DADC, #6DB5B9)'
      : loyaltyTier === 'gold'
      ? 'linear-gradient(135deg, #D4A853, #E8401C)'
      : '#E8401C';
  const avatarShadow =
    loyaltyTier === 'platinum'
      ? '0 0 24px rgba(168,218,220,0.3)'
      : loyaltyTier === 'gold'
      ? '0 0 24px rgba(212,168,83,0.3)'
      : '0 0 20px rgba(232,64,28,0.25)';

  const walletCaption =
    loyaltyTier === 'platinum'
      ? 'Platinum member 10% credit'
      : 'Gold member 5% credit';



  




  const menuGroups = [
    {
      title: 'MY ACTIVITY',
      items: [
        { icon: BookOpen, label: 'My Bookings', onClick: () => setLocation('/bookings') },
        { icon: BookHeart, label: 'Our Story', onClick: () => setLocation('/our-story') },
        { icon: Heart, label: 'Saved Experiences', onClick: () => setLocation('/wishlist') },
        { icon: Calendar, label: 'Occasion Reminders', onClick: () => setLocation('/occasion-reminders') },
        { icon: Sparkles, label: 'My AI Plans', onClick: () => setLocation('/style-select/date_night') },
        { icon: Crown, label: 'Membership', badge: loyaltyTier !== 'none' ? loyaltyTier.charAt(0).toUpperCase() + loyaltyTier.slice(1) : undefined, onClick: () => setLocation('/membership') },
        { icon: Wallet, label: 'Wallet & Credits', badge: walletBalance > 0 ? `₹${walletBalance}` : undefined, onClick: () => {} },
        { icon: Gift, label: 'Refer a Friend', onClick: () => setLocation('/referral') },
      ],
    },
    {
      title: 'SUPPORT',
      items: [
        { icon: MessageCircle, label: 'Help & Support', onClick: () => window.open('https://wa.me/917870000000') },
        { icon: Bell, label: 'Notifications', onClick: () => setLocation('/settings') },
        { icon: Info, label: 'About REKINDLE', onClick: () => {} },
        { icon: Star, label: 'Rate the App', onClick: () => {} },
      ],
    },
  ];

  return (
    <div data-testid="profile-screen" className="flex flex-col min-h-screen pb-24 px-4" style={{ background: '#0A0A0A' }}>
      <div className="pt-12 pb-6 flex flex-col items-center gap-3">
        <div className="flex flex-col items-center pt-12 pb-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-3"
          style={{ background: '#E8401C' }}>
          {initial}
        </div>
        
        <h2 className="text-2xl font-bold text-white">
          {currentUser?.name || 'Guest'}
        </h2>
        
        <p className="text-sm mt-1" style={{ color: '#AAAAAA' }}>
          {currentUser?.phone || 'No phone added'}
        </p>

        <button className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 transition-colors">
          Edit Profile
        </button>
      </div>
      </div>

      {walletBalance > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 mb-5 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(212,168,83,0.1), rgba(212,168,83,0.04))', border: '1px solid rgba(212,168,83,0.2)' }}
        >
          <Wallet size={22} color="#D4A853" />
          <div className="flex-1">
            <p className="font-semibold text-white" style={{ fontSize: 14 }}>Wallet Balance</p>
            <p style={{ color: '#555555', fontSize: 12 }}>{walletCaption}</p>
          </div>
          <span className="font-black" style={{ fontFamily: 'Poppins, sans-serif', color: '#D4A853', fontSize: 22 }}>₹{walletBalance}</span>
        </motion.div>
      )}

      <div className="flex mb-6" style={{ background: '#161616', borderRadius: 18, overflow: 'hidden', border: '1px solid #1E1E1E' }}>
        {[
          { label: 'BOOKINGS', value: bookings.length },
          { label: 'SAVED', value: wishlist.length },
          { label: 'MOMENTS', value: momentsCreated },
        ].map((s, i) => (
          <div
            key={s.label}
            className="flex-1 flex flex-col items-center py-5 gap-2"
            style={{ borderRight: i < 2 ? '1px solid #2C2C2C' : 'none' }}
          >
            <span className="font-black text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 28 }}>
              <AnimatedCounter target={s.value} />
            </span>
            <div style={{ width: 20, height: 2, background: '#E8401C', borderRadius: 1 }} />
            <span className="uppercase" style={{ color: '#555555', fontSize: 9, letterSpacing: 1 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {momentsCreated > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 px-4 py-3 mb-5 rounded-xl"
          style={{ background: 'rgba(232,64,28,0.06)', border: '1px solid rgba(232,64,28,0.12)' }}
        >
          <span style={{ fontSize: 18 }}>💑</span>
          <p style={{ color: '#AAAAAA', fontSize: 13 }}>
            You've created{' '}
            <span className="font-bold text-white">{momentsCreated} perfect moment{momentsCreated > 1 ? 's' : ''}</span>
            {' '}— and counting.
          </p>
        </motion.div>
      )}

      <div className="flex flex-col gap-5">
        {menuGroups.map(group => (
          <div key={group.title}>
            <p className="uppercase mb-2" style={{ color: '#555555', fontSize: 11, letterSpacing: 2 }}>{group.title}</p>
            <div style={{ background: '#161616', borderRadius: 18, overflow: 'hidden', border: '1px solid #1E1E1E' }}>
              {group.items.map(({ icon: Icon, label, onClick, badge }, i) => (
                <motion.button
                  key={label}
                  data-testid={`menu-${label.toLowerCase().replace(/ /g, '-')}`}
                  whileTap={{ scale: 0.98, backgroundColor: 'rgba(255,255,255,0.02)' }}
                  onClick={onClick}
                  className="w-full flex items-center gap-3 px-4 py-4"
                  style={{ borderBottom: i < group.items.length - 1 ? '1px solid #1E1E1E' : 'none' }}
                >
                  <div className="flex items-center justify-center" style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(232,64,28,0.1)' }}>
                    <Icon size={17} color="#E8401C" />
                  </div>
                  <span className="flex-1 text-left text-white" style={{ fontSize: 14 }}>{label}</span>
                  {badge && (
                    <span
                      className="font-bold"
                      style={{ background: 'rgba(212,168,83,0.15)', color: '#D4A853', borderRadius: 8, padding: '2px 8px', fontSize: 12 }}
                    >
                      {badge}
                    </span>
                  )}
                  <ChevronRight size={16} color="#333333" />
                </motion.button>
              ))}
            </div>
          </div>
        ))}

        <button
          data-testid="button-logout"
          onClick={() => setShowLogoutConfirm(true)}
          className="font-semibold text-center py-4"
          style={{ color: '#555555', fontSize: 14 }}
        >
          <LogOut size={14} style={{ display: 'inline', marginRight: 6 }} />
          Log out
        </button>
      </div>

      <AnimatePresence>
        {showLogoutConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.75)' }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-8"
            >
              <div className="w-full p-6 flex flex-col gap-4" style={{ background: '#161616', borderRadius: 24, border: '1px solid #222222' }}>
                <p className="font-black text-white text-center" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 18 }}>Log out of REKINDLE?</p>
                <p className="text-center" style={{ color: '#AAAAAA', fontSize: 14, lineHeight: 1.6 }}>You'll need to verify your number again to access your bookings.</p>
                <motion.button data-testid="button-confirm-logout" whileTap={{ scale: 0.96 }} onClick={() => { logout(); setLocation('/login'); }} className="w-full font-bold text-white py-4 rounded-2xl" style={{ background: '#E8401C', fontFamily: 'Poppins, sans-serif', fontSize: 16 }}>
                  Yes, log out
                </motion.button>
                <button data-testid="button-cancel-logout" onClick={() => setShowLogoutConfirm(false)} style={{ color: '#555555', fontSize: 14 }}>Cancel</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
