import { lazy, Suspense, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useParams } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { DATE_STYLES, STYLE_CATEGORIES } from '@/data/styles';
import { useBooking } from '@/context/BookingContext';

export default function StyleSelectScreen() {
  const params = useParams<{ occasionType: string }>();
  const occasionType = params.occasionType ?? 'date_night';
  const [, setLocation] = useLocation();
  const { setSelectedStyle } = useBooking();
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (occasionType !== 'date_night') {
      setSelectedStyle({ occasionType, styleKey: 'standard', styleLabel: 'Standard' });
      setLocation(`/customize/${occasionType}/standard`);
    }
  }, [occasionType, setLocation, setSelectedStyle]);

  const handleSelect = (key: string, label: string) => {
    setSelected(key);
    const style = { occasionType, styleKey: key, styleLabel: label };
    setSelectedStyle(style);
    setTimeout(() => setLocation(`/customize/${occasionType}/${key}`), 220);
  };

  if (occasionType !== 'date_night') return null;

  return (
    <div className="fixed inset-0 overflow-y-auto no-scrollbar" style={{ background: '#0A0A0A' }}>
      <div className="px-4 pt-12 pb-6">
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setLocation('/home')}
          className="mb-6"
        >
          <ArrowLeft size={22} color="#FFFFFF" />
        </motion.button>

        <h1 className="font-bold text-white mb-1" style={{ fontSize: 24 }}>Choose Your Date Style</h1>
        <p style={{ color: '#AAAAAA', fontSize: 14 }}>Every date is different. Pick yours.</p>
      </div>

      <div className="pb-10">
        {STYLE_CATEGORIES.map((cat, catIdx) => {
          const styles = DATE_STYLES.filter(s => s.category === cat);
          return (
            <div key={cat} className="mb-8">
              <p className="px-4 mb-3 font-semibold uppercase" style={{ color: '#555555', fontSize: 11, letterSpacing: 2 }}>
                {cat}
              </p>
              <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-2">
                {styles.map((style, i) => {
                  const isSelected = selected === style.key;
                  return (
                    <motion.button
                      key={style.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isSelected ? { opacity: 1, y: 0, scale: 1.03 } : { opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: catIdx * 0.1 + i * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleSelect(style.key, style.label)}
                      className="shrink-0 flex flex-col items-center text-left p-4"
                      style={{
                        width: 160,
                        background: isSelected ? '#1E1E1E' : '#161616',
                        border: `1px solid ${isSelected ? '#E8401C' : '#2C2C2C'}`,
                        borderRadius: 16,
                        transition: 'border-color 0.15s, background 0.15s',
                      }}
                    >
                      <span style={{ fontSize: 32 }}>{style.emoji}</span>
                      <p className="font-semibold text-white mt-2 text-left w-full" style={{ fontSize: 14 }}>{style.label}</p>
                      <p className="mt-1 text-left w-full" style={{ color: '#AAAAAA', fontSize: 11 }}>{style.description}</p>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
