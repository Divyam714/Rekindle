import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useParams } from 'wouter';
import { ArrowLeft, Heart, Share2, Star, CheckCircle, ChevronDown, Camera, Music, Video, Gift, Sparkles, Gem, Flower2 } from 'lucide-react';
import { PACKAGES } from '@/data/packages';
import { useApp } from '@/context/AppContext';

const ICON_MAP: Record<string, React.FC<{ size: number; color: string }>> = {
  Camera, Music, Video, Gift, Sparkles, Gem, Flower2,
};

export default function PackageDetailScreen() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { wishlist, toggleWishlist } = useApp();
  const pkg = PACKAGES.find(p => p.id === params.id);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [showFullTimeline, setShowFullTimeline] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => setShowStickyBar(el.scrollTop > 100);
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, []);

  if (!pkg) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0A0A0A' }}>
        <p className="text-white">Package not found</p>
      </div>
    );
  }

  const inWishlist = wishlist.includes(pkg.id);
  const addOnTotal = pkg.addOns
    .filter(a => selectedAddOns.includes(a.id))
    .reduce((s, a) => s + a.price, 0);

  const toggleAddOn = (id: string) => {
    setSelectedAddOns(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const otherPkgs = PACKAGES.filter(p => p.id !== pkg.id);

  const handleBook = () => {
    const ot = (pkg as typeof pkg & { occasionType?: string }).occasionType ?? pkg.id.replace(/-/g, '_');
    setLocation(`/style-select/${ot}`);
  };

  return (
    <div
      data-testid="package-detail-screen"
      ref={scrollRef}
      className="fixed inset-0 overflow-y-auto"
      style={{ background: '#0A0A0A' }}
    >
      {/* Hero Gallery */}
      <div className="relative" style={{ height: 280 }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={galleryIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            src={pkg.images[galleryIdx]}
            alt={pkg.name}
            className="w-full h-full object-cover"
            style={{ background: '#1E1E1E' }}
            loading="lazy"
          />
        </AnimatePresence>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, #0A0A0A 0%, rgba(10,10,10,0.5) 40%, transparent 80%)' }}
        />

        {/* Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
          {pkg.images.map((_, i) => (
            <button key={i} onClick={() => setGalleryIdx(i)}>
              <motion.div
                animate={{ width: i === galleryIdx ? 16 : 6, height: 6, opacity: i === galleryIdx ? 1 : 0.5, background: '#FFFFFF' }}
                style={{ borderRadius: 3 }}
              />
            </button>
          ))}
        </div>

        {/* Back */}
        <motion.button
          data-testid="button-back"
          whileTap={{ scale: 0.96 }}
          onClick={() => setLocation('/home')}
          className="absolute top-12 left-4 flex items-center justify-center"
          style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(8px)' }}
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </motion.button>

        {/* Heart + Share */}
        <div className="absolute top-12 right-4 flex gap-2">
          <motion.button
            data-testid="button-detail-wishlist"
            whileTap={{ scale: 1.4 }}
            onClick={() => toggleWishlist(pkg.id)}
            className="flex items-center justify-center"
            style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(8px)' }}
          >
            <Heart size={20} color={inWishlist ? '#E8401C' : '#FFFFFF'} fill={inWishlist ? '#E8401C' : 'none'} />
          </motion.button>
          <motion.button
            data-testid="button-share"
            whileTap={{ scale: 0.96 }}
            className="flex items-center justify-center"
            style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(8px)' }}
          >
            <Share2 size={18} color="#FFFFFF" />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-28 flex flex-col gap-6">
        <div className="flex flex-col gap-2 pt-2">
          <span className="font-semibold uppercase" style={{ color: '#E8401C', fontSize: 11, letterSpacing: 1 }}>{pkg.occasion}</span>
          <h1 className="font-bold text-white" style={{ fontSize: 24 }}>{pkg.name}</h1>
          <p className="italic" style={{ color: '#AAAAAA', fontSize: 14 }}>{pkg.tagline}</p>
          <div className="flex items-center gap-2">
            <Star size={14} color="#E8401C" fill="#E8401C" />
            <span className="font-bold text-white" style={{ fontSize: 14 }}>{pkg.rating}</span>
            <span style={{ color: '#AAAAAA', fontSize: 13 }}>({pkg.ratingCount} reviews)</span>
            <button style={{ color: '#E8401C', fontSize: 13, marginLeft: 'auto' }}>See all reviews →</button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex">
          {[
            { icon: '🛡️', label: '100% Guaranteed' },
            { icon: '📸', label: 'Photos Included' },
            { icon: '🔒', label: 'Secure Payment' },
          ].map((b, i) => (
            <div key={b.label} className="flex-1 flex flex-col items-center gap-1" style={{ borderRight: i < 2 ? '1px solid #2C2C2C' : 'none' }}>
              <span style={{ fontSize: 22 }}>{b.icon}</span>
              <span className="font-semibold text-white text-center" style={{ fontSize: 11 }}>{b.label}</span>
            </div>
          ))}
        </div>

        {/* Why REKINDLE */}
        <div className="flex flex-col gap-3">
          <span className="uppercase font-semibold" style={{ color: '#555555', fontSize: 11, letterSpacing: 2 }}>WHY REKINDLE</span>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '🏆', title: '100% Quality Guaranteed', desc: 'Every vendor is vetted and quality-checked before your booking.' },
              { icon: '👤', title: 'Dedicated Coordinator', desc: 'Your personal coordinator handles every detail from booking to execution.' },
              { icon: '🔐', title: 'Secure Payment', desc: 'Your payment is held safely. Zero deductions until your event is confirmed.' },
              { icon: '📷', title: 'Real Photos Included', desc: 'Professional photography delivered within 24 hours. Every time.' },
            ].map(item => (
              <div
                key={item.title}
                className="flex flex-col gap-2 p-4 rounded-2xl"
                style={{ background: '#161616', border: '1px solid #1E1E1E' }}
              >
                <span style={{ fontSize: 28 }}>{item.icon}</span>
                <p className="font-bold text-white" style={{ fontSize: 13, lineHeight: 1.3 }}>{item.title}</p>
                <p style={{ color: '#555555', fontSize: 11, lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Real Experiences Photo Strip */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="uppercase font-semibold" style={{ color: '#555555', fontSize: 11, letterSpacing: 2 }}>REAL EXPERIENCES</span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&q=80&auto=format',
              'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=80&auto=format',
              'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=80&auto=format',
              'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=400&q=80&auto=format',
              'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=400&q=80&auto=format',
            ].map((url, i) => (
              <div key={i} className="shrink-0 relative overflow-hidden" style={{ width: 120, height: 160, borderRadius: 14 }}>
                <img src={url} alt={`Real experience ${i + 1}`} className="w-full h-full object-cover" style={{ background: '#1E1E1E' }} loading="lazy" />
                {i === 0 && (
                  <div
                    className="absolute bottom-0 left-0 right-0 flex items-center justify-center py-2"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}
                  >
                    <span className="text-white font-semibold text-center" style={{ fontSize: 9, letterSpacing: 1 }}>REAL COUPLES.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p style={{ color: '#555555', fontSize: 12, textAlign: 'center' }}>Real couples. Real moments. ❤️</p>
        </div>

        {/* Price Block */}
        <div
          className="p-5 flex flex-col gap-3"
          style={{ background: '#161616', borderRadius: 16, borderLeft: '3px solid #E8401C' }}
        >
          <p style={{ color: '#AAAAAA', fontSize: 12 }}>All inclusive · Zero hidden charges</p>
          <div className="flex items-end gap-2">
            <span className="font-bold text-white" style={{ fontSize: 40 }}>₹{(pkg.price + addOnTotal).toLocaleString('en-IN')}</span>
            <span style={{ color: '#AAAAAA', fontSize: 13, paddingBottom: 6 }}>per couple</span>
          </div>
          <p style={{ color: '#E8401C', fontSize: 12 }}>{pkg.urgency}</p>
          <motion.button
            data-testid="button-check-availability"
            whileTap={{ scale: 0.96 }}
            onClick={handleBook}
            className="w-full font-bold text-white flex items-center justify-center"
            style={{ background: '#E8401C', height: 56, borderRadius: 14, fontSize: 16 }}
          >
            Check Availability →
          </motion.button>
          <p className="text-center" style={{ color: '#555555', fontSize: 11 }}>🔒 No charges until confirmed</p>
        </div>

        {/* What's Included */}
        <div className="flex flex-col gap-0">
          <span className="uppercase font-semibold mb-3" style={{ color: '#555555', fontSize: 11, letterSpacing: 2 }}>WHAT'S INCLUDED</span>
          {pkg.inclusions.map((inc, i) => (
            <div
              key={inc}
              className="flex items-center gap-3 py-3.5"
              style={{ borderBottom: i < pkg.inclusions.length - 1 ? '1px solid #1E1E1E' : 'none' }}
            >
              <div
                className="flex items-center justify-center shrink-0"
                style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(46,204,113,0.15)' }}
              >
                <CheckCircle size={14} color="#2ECC71" />
              </div>
              <span className="text-white" style={{ fontSize: 14 }}>{inc}</span>
            </div>
          ))}
        </div>

        {/* Add-ons */}
        <div className="flex flex-col gap-3">
          <span className="uppercase font-semibold" style={{ color: '#555555', fontSize: 11, letterSpacing: 2 }}>MAKE IT SPECIAL</span>
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {pkg.addOns.map(addon => {
              const on = selectedAddOns.includes(addon.id);
              const IconComp = ICON_MAP[addon.icon];
              return (
                <motion.button
                  key={addon.id}
                  data-testid={`toggle-addon-${addon.id}`}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => toggleAddOn(addon.id)}
                  className="shrink-0 flex flex-col items-start p-3.5 text-left"
                  style={{
                    width: 150,
                    background: on ? 'rgba(232,64,28,0.08)' : '#1E1E1E',
                    borderRadius: 14,
                    border: `1px solid ${on ? '#E8401C' : '#2C2C2C'}`,
                    transition: 'background 200ms, border-color 200ms',
                  }}
                >
                  {IconComp && <IconComp size={28} color={on ? '#E8401C' : '#AAAAAA'} />}
                  <p className="font-semibold text-white mt-2" style={{ fontSize: 12 }}>{addon.name}</p>
                  <div className="flex items-center justify-between w-full mt-1">
                    <p style={{ color: '#AAAAAA', fontSize: 12 }}>+₹{addon.price.toLocaleString('en-IN')}</p>
                    <div
                      style={{
                        width: 44,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: on ? '#E8401C' : '#333333',
                        transition: 'background-color 200ms ease',
                        padding: 2,
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor: '#FFFFFF',
                          transform: on ? 'translateX(20px)' : 'translateX(0px)',
                          transition: 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}
                      />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
          {addOnTotal > 0 && (
            <p className="font-semibold" style={{ color: '#AAAAAA', fontSize: 13 }}>
              Add-ons: <span className="text-white">+₹{addOnTotal.toLocaleString('en-IN')}</span>
            </p>
          )}
        </div>

        {/* Timeline */}
        <div className="flex flex-col gap-3">
          <span className="uppercase font-semibold" style={{ color: '#555555', fontSize: 11, letterSpacing: 2 }}>YOUR EVENING</span>
          <div className="relative pl-6">
            <div className="absolute left-2 top-0 bottom-0" style={{ width: 2, background: '#E8401C', opacity: 0.3, borderStyle: 'dashed' }} />
            {(showFullTimeline ? pkg.timeline : pkg.timeline.slice(0, 3)).map((item, i) => (
              <div key={i} className="relative mb-4">
                <div className="absolute -left-4 top-1.5 rounded-full" style={{ width: 10, height: 10, background: '#E8401C' }} />
                <p className="font-semibold text-white" style={{ fontSize: 14 }}>{item.time} — {item.title}</p>
                <p style={{ color: '#555555', fontSize: 12 }}>{item.note}</p>
              </div>
            ))}
            {!showFullTimeline && pkg.timeline.length > 3 && (
              <button
                data-testid="button-show-timeline"
                onClick={() => setShowFullTimeline(true)}
                style={{ color: '#E8401C', fontSize: 13 }}
              >
                Show full timeline ↓
              </button>
            )}
          </div>
        </div>

        {/* Similar Packages */}
        <div className="flex flex-col gap-3">
          <span className="uppercase font-semibold" style={{ color: '#555555', fontSize: 11, letterSpacing: 2 }}>YOU MIGHT ALSO LIKE</span>
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {otherPkgs.map(op => (
              <motion.button
                key={op.id}
                data-testid={`card-similar-${op.id}`}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLocation(`/package/${op.id}`)}
                className="shrink-0 overflow-hidden text-left"
                style={{ width: 160, background: '#161616', borderRadius: 14, border: '1px solid #222222' }}
              >
                <img src={op.thumbImage} alt={op.name} className="w-full object-cover" style={{ height: 100, background: '#1E1E1E' }} loading="lazy" />
                <div className="p-2">
                  <p className="font-bold text-white" style={{ fontSize: 12 }}>{op.name}</p>
                  <p className="font-bold text-white" style={{ fontSize: 14 }}>₹{op.price.toLocaleString('en-IN')}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-4"
            style={{ background: '#0A0A0A', borderTop: '1px solid #1E1E1E', height: 72, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            <div>
              <p className="font-bold text-white" style={{ fontSize: 22 }}>₹{(pkg.price + addOnTotal).toLocaleString('en-IN')}</p>
              <p style={{ color: '#555555', fontSize: 11 }}>all inclusive</p>
            </div>
            <motion.button
              data-testid="button-sticky-book"
              whileTap={{ scale: 0.96 }}
              onClick={handleBook}
              className="font-bold text-white flex items-center justify-center"
              style={{ background: '#E8401C', width: 140, height: 48, borderRadius: 24, fontSize: 15 }}
            >
              Book Now →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
