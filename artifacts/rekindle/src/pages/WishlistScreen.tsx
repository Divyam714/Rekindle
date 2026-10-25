import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { Heart, Star, CheckCircle, Share2 } from 'lucide-react';
import { PACKAGES } from '@/data/packages';
import { useApp } from '@/context/AppContext';

const PROMO_IDS = new Set(['date-night']);

export default function WishlistScreen() {
  const { wishlist, toggleWishlist, user } = useApp();
  const [, setLocation] = useLocation();
  const [shared, setShared] = useState(false);
  const saved = PACKAGES.filter(p => wishlist.includes(p.id));

  const handleShareWishlist = () => {
    const lines = saved.map(p => `• ${p.name} — ₹${p.price.toLocaleString('en-IN')}`).join('\n');
    const msg = encodeURIComponent(
      `Hey! Here are the REKINDLE experiences I'm dreaming of 💑\n\n${lines}\n\nBook yours at rekindle.in`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
    setShared(true);
    setTimeout(() => setShared(false), 3000);
  };

  return (
    <div data-testid="wishlist-screen" className="flex flex-col min-h-screen pb-20" style={{ background: '#0A0A0A' }}>
      <div className="px-4 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-black text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 22 }}>Saved Experiences</h1>
          {saved.length > 0 && (
            <p style={{ color: '#555555', fontSize: 13 }}>{saved.length} experience{saved.length > 1 ? 's' : ''} saved</p>
          )}
        </div>
        {saved.length > 0 && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleShareWishlist}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold"
            style={{
              background: shared ? 'rgba(37,211,102,0.12)' : 'rgba(232,64,28,0.1)',
              border: `1px solid ${shared ? '#25D366' : 'rgba(232,64,28,0.3)'}`,
              color: shared ? '#25D366' : '#E8401C',
              fontSize: 13,
              transition: 'all 0.3s',
            }}
          >
            <Share2 size={14} color={shared ? '#25D366' : '#E8401C'} />
            {shared ? 'Shared!' : 'Share'}
          </motion.button>
        )}
      </div>

      {saved.length === 0 ? (
        <div className="flex flex-col items-center gap-4 pt-20 px-6">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Heart size={80} color="#E8401C" />
          </motion.div>
          <p className="font-bold text-white text-center" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 22 }}>Nothing saved yet.</p>
          <p className="text-center" style={{ color: '#AAAAAA', fontSize: 14, lineHeight: 1.6 }}>Tap the ♥ on any package to save it here for later.</p>
          <motion.button
            data-testid="button-browse-from-wishlist"
            whileTap={{ scale: 0.96 }}
            onClick={() => setLocation('/home')}
            className="font-bold text-white px-8 py-4 rounded-2xl"
            style={{ background: '#E8401C', fontSize: 15 }}
          >
            Browse Packages →
          </motion.button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-4">
          <AnimatePresence>
            {saved.map((pkg, index) => {
              const isPromo = PROMO_IDS.has(pkg.id);
              return (
                <motion.div
                  key={pkg.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 300, transition: { duration: 0.2 } }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30, delay: index * 0.05 }}
                  data-testid={`card-wishlist-${pkg.id}`}
                  className="overflow-hidden"
                  style={{ background: '#161616', borderRadius: 18, border: `1px solid ${isPromo ? 'rgba(212,168,83,0.3)' : '#222222'}` }}
                >
                  {isPromo && (
                    <div
                      className="flex items-center gap-2 px-4 py-2"
                      style={{ background: 'linear-gradient(90deg, rgba(212,168,83,0.15), rgba(212,168,83,0.05))' }}
                    >
                      <span style={{ fontSize: 14 }}>🔥</span>
                      <span className="font-semibold" style={{ color: '#D4A853', fontSize: 12 }}>Weekend Special — Limited availability</span>
                    </div>
                  )}
                  <div className="flex gap-3 p-3">
                    <div className="relative shrink-0">
                      <img
                        src={pkg.thumbImage}
                        alt={pkg.name}
                        className="object-cover rounded-xl"
                        style={{ width: 100, height: 100, background: '#1E1E1E' }}
                        loading="lazy"
                      />
                      {isPromo && (
                        <div
                          className="absolute -top-1 -right-1 flex items-center justify-center font-bold"
                          style={{ background: '#D4A853', color: '#0A0A0A', borderRadius: 8, padding: '2px 5px', fontSize: 9 }}
                        >
                          DEAL
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span
                            className="text-white font-semibold uppercase"
                            style={{ background: '#E8401C', borderRadius: 20, padding: '2px 8px', fontSize: 9 }}
                          >
                            {pkg.occasion}
                          </span>
                          <p className="font-bold text-white mt-1.5" style={{ fontSize: 15, lineHeight: 1.2 }}>{pkg.name}</p>
                        </div>
                        <motion.button
                          data-testid={`button-remove-wishlist-${pkg.id}`}
                          whileTap={{ scale: 1.4 }}
                          onClick={() => toggleWishlist(pkg.id)}
                          className="flex items-center justify-center shrink-0 ml-2"
                          style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(232,64,28,0.12)' }}
                        >
                          <Heart size={18} color="#E8401C" fill="#E8401C" />
                        </motion.button>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={12} color="#E8401C" fill="#E8401C" />
                        <span className="font-bold text-white" style={{ fontSize: 12 }}>{pkg.rating}</span>
                        <span style={{ color: '#555555', fontSize: 11 }}>({pkg.ratingCount})</span>
                      </div>
                      {pkg.inclusions.slice(0, 2).map(inc => (
                        <div key={inc} className="flex items-start gap-1.5">
                          <CheckCircle size={11} color="#2ECC71" className="mt-0.5 shrink-0" />
                          <span className="text-white" style={{ fontSize: 11, lineHeight: 1.4 }}>{inc}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-bold text-white" style={{ fontSize: 18, fontFamily: 'Poppins, sans-serif' }}>
                          ₹{pkg.price.toLocaleString('en-IN')}
                        </span>
                        <motion.button
                          data-testid={`button-book-wishlist-${pkg.id}`}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setLocation(`/package/${pkg.id}`)}
                          className="font-bold text-white px-4 py-2 rounded-xl"
                          style={{ background: '#E8401C', fontSize: 13 }}
                        >
                          Book Now
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {saved.length > 0 && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleShareWishlist}
              className="w-full font-bold flex items-center justify-center gap-2 py-4 rounded-2xl mt-2"
              style={{ background: '#25D366', color: '#FFFFFF', fontSize: 15 }}
            >
              💚 Share Wishlist on WhatsApp
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
}
