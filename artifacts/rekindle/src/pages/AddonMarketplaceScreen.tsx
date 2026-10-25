import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { ArrowLeft, Car, Cake, Camera, Flower2, Sparkles, Music, Video, Zap, Heart, Type, Leaf, Gift, X } from 'lucide-react';
import { getAddonsForOccasion, AddonItem } from '@/data/addons';
import { useBooking } from '@/context/BookingContext';

const ICON_MAP: Record<string, React.FC<{ size: number; color: string }>> = {
  Car, Cake, Camera, Flower2, Sparkles, Music, Video, Zap, Heart, Type, Leaf, Gift,
};

export default function AddonMarketplaceScreen() {
  const [, setLocation] = useLocation();
  const { selectedStyle, addonCart, setAddonCart, aiRecommendations } = useBooking();

  const occasionType = selectedStyle?.occasionType ?? 'date_night';
  const addons = getAddonsForOccasion(occasionType);
  const latestRec = aiRecommendations[0];

  const isInCart = (id: string) => addonCart.some(a => a.id === id);
  const isAIPick = (addon: AddonItem) => {
    if (!latestRec) return false;
    return latestRec.items.some(item => item.toLowerCase().includes(addon.label.toLowerCase().split(' ')[0].toLowerCase()));
  };

  const toggle = (addon: AddonItem) => {
    if (isInCart(addon.id)) {
      setAddonCart(addonCart.filter(a => a.id !== addon.id));
    } else {
      setAddonCart([...addonCart, addon]);
    }
  };

  const totalAddons = addonCart.reduce((s, a) => s + a.price, 0);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const handleContinue = () => {
    setLocation(`/tier-select/${occasionType}`);
  };

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#0A0A0A' }}>
      <div className="overflow-y-auto no-scrollbar pb-32">
        {/* Header */}
        <div className="px-4 pt-12 pb-4">
          <motion.button whileTap={{ scale: 0.93 }} onClick={() => setLocation('/ai-concierge')} className="mb-6">
            <ArrowLeft size={22} color="#FFFFFF" />
          </motion.button>
          <h1 className="font-bold text-white mb-1" style={{ fontSize: 24 }}>Make It Yours</h1>
          <p style={{ color: '#AAAAAA', fontSize: 14 }}>Add the extras that matter</p>
        </div>

        {/* Note Banner */}
        <AnimatePresence>
          {!bannerDismissed && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-4 mb-4 flex items-start gap-3 p-4 rounded-xl"
              style={{ background: '#1E1E1E', borderLeft: '3px solid #E8401C' }}
            >
              <p style={{ color: '#AAAAAA', fontSize: 13, flex: 1 }}>
                You're building your own experience. Everything is optional — add only what you love.
              </p>
              <button onClick={() => setBannerDismissed(true)}>
                <X size={16} color="#555555" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        <div className="px-4 grid grid-cols-2 gap-3">
          {addons.map((addon, i) => {
            const selected = isInCart(addon.id);
            const aiPick = isAIPick(addon);
            const Icon = ICON_MAP[addon.icon] ?? Gift;
            return (
              <motion.div
                key={addon.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 26 }}
                className="relative flex flex-col items-center p-4 rounded-2xl"
                style={{
                  background: selected ? '#1E1E1E' : '#161616',
                  border: `1px solid ${selected ? '#E8401C' : '#2C2C2C'}`,
                  boxShadow: selected ? '0 0 0 1px #E8401C40' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {aiPick && (
                  <span
                    className="absolute top-2 right-2 px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: 'rgba(212,168,83,0.15)', color: '#D4A853', fontSize: 9 }}
                  >
                    ✨ AI Pick
                  </span>
                )}

                <div
                  className="flex items-center justify-center mb-2"
                  style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(232,64,28,0.10)' }}
                >
                  <Icon size={20} color="#E8401C" />
                </div>

                <p className="font-semibold text-white text-center mb-1" style={{ fontSize: 13 }}>{addon.label}</p>
                <p className="font-bold mb-3" style={{ color: '#E8401C', fontSize: 15 }}>₹{addon.price.toLocaleString('en-IN')}</p>

                {/* Toggle */}
                <motion.button
                  onClick={() => toggle(addon)}
                  whileTap={{ scale: 0.95 }}
                  className="relative flex items-center"
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    background: selected ? '#E8401C' : '#333333',
                    transition: 'background 0.2s',
                  }}
                >
                  <motion.div
                    animate={{ x: selected ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    style={{ width: 20, height: 20, borderRadius: '50%', background: '#FFFFFF', marginLeft: 2 }}
                  />
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Sticky Price Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-5 py-4"
        style={{ background: '#161616', borderTop: '1px solid #2C2C2C' }}
      >
        <div>
          <p style={{ color: '#AAAAAA', fontSize: 12 }}>Selected: {addonCart.length} add-ons</p>
          <p className="font-bold text-white" style={{ fontSize: 18 }}>
            {addonCart.length > 0 ? `₹${totalAddons.toLocaleString('en-IN')}` : '₹0'}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleContinue}
          className="px-6 py-3 rounded-full font-semibold text-white"
          style={{ background: '#E8401C', fontSize: 14 }}
        >
          Continue →
        </motion.button>
      </div>
    </div>
  );
}
