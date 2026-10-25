import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useParams } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { useBooking, UserPreferences } from '@/context/BookingContext';

type PillRow = {
  label: string;
  key: keyof Omit<UserPreferences, 'romanticIntensity'>;
  options: { label: string; value: string }[];
};

const ROWS: PillRow[] = [
  {
    label: 'Venue Setting',
    key: 'indoorOutdoor',
    options: [
      { label: 'Indoor 🏠', value: 'indoor' },
      { label: 'Outdoor 🌿', value: 'outdoor' },
      { label: 'No Preference', value: 'no_preference' },
    ],
  },
  {
    label: 'Food Preference',
    key: 'foodPreference',
    options: [
      { label: 'Veg 🥗', value: 'veg' },
      { label: 'Non-Veg 🍗', value: 'nonveg' },
      { label: 'No Preference', value: 'no_preference' },
    ],
  },
  {
    label: 'Music Vibe',
    key: 'musicPreference',
    options: [
      { label: 'Live Music 🎸', value: 'live' },
      { label: 'Curated Playlist 🎵', value: 'playlist' },
      { label: 'Keep It Silent 🤫', value: 'silent' },
    ],
  },
  {
    label: 'Venue Type',
    key: 'venueType',
    options: [
      { label: 'Private & Exclusive 🔒', value: 'private' },
      { label: 'Lively & Social 🎉', value: 'social' },
      { label: 'No Preference', value: 'no_preference' },
    ],
  },
  {
    label: 'Budget Range',
    key: 'budget',
    options: [
      { label: 'Under ₹2,000', value: 'under_2000' },
      { label: '₹2,000–₹5,000', value: '2000_5000' },
      { label: '₹5,000–₹10,000', value: '5000_10000' },
      { label: 'Above ₹10,000', value: 'above_10000' },
    ],
  },
];

export default function CustomizationScreen() {
  const params = useParams<{ occasionType: string; style: string }>();
  const occasionType = params.occasionType ?? 'date_night';
  const style = params.style ?? 'standard';
  const [, setLocation] = useLocation();
  const { setCustomizations, setPreferences } = useBooking();

  const [prefs, setPrefs] = useState<UserPreferences>({
    budget: '',
    indoorOutdoor: '',
    foodPreference: '',
    musicPreference: '',
    venueType: '',
    romanticIntensity: 3,
  });

  const setPref = (key: keyof UserPreferences, value: string | number) => {
    setPrefs(p => ({ ...p, [key]: value }));
  };

  const handleContinue = () => {
    setCustomizations(prefs);
    setPreferences(prefs);
    setLocation('/ai-concierge');
  };

  const canContinue = prefs.indoorOutdoor && prefs.foodPreference && prefs.musicPreference && prefs.venueType && prefs.budget;

  const backPath = occasionType === 'date_night' ? `/style-select/${occasionType}` : `/home`;

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#0A0A0A' }}>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <div className="px-4 pt-12 pb-6">
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => setLocation(backPath)}
            className="mb-6"
          >
            <ArrowLeft size={22} color="#FFFFFF" />
          </motion.button>
          <h1 className="font-bold text-white mb-1" style={{ fontSize: 24 }}>Personalise Your Experience</h1>
          <p style={{ color: '#AAAAAA', fontSize: 14 }}>Tell us what makes it perfect for you.</p>
        </div>

        <div className="px-4 flex flex-col gap-7">
          {ROWS.map((row, i) => (
            <motion.div
              key={row.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <p className="mb-3 font-semibold text-white" style={{ fontSize: 14 }}>{row.label}</p>
              <div className="flex flex-wrap gap-2">
                {row.options.map(opt => {
                  const active = prefs[row.key] === opt.value;
                  return (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPref(row.key, opt.value)}
                      className="px-4 py-2 rounded-full font-medium"
                      style={{
                        background: active ? '#E8401C' : '#1E1E1E',
                        color: active ? '#FFFFFF' : '#AAAAAA',
                        border: `1px solid ${active ? '#E8401C' : '#2C2C2C'}`,
                        fontSize: 13,
                        transition: 'all 0.15s',
                      }}
                    >
                      {opt.label}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: ROWS.length * 0.08 }}
          >
            <p className="mb-3 font-semibold text-white" style={{ fontSize: 14 }}>Romantic Intensity</p>
            <div className="flex items-center gap-3">
              <span style={{ color: '#AAAAAA', fontSize: 13 }}>Chill 😌</span>
              <div className="flex-1 relative" style={{ height: 24 }}>
                <div
                  className="absolute top-1/2 left-0 right-0 -translate-y-1/2 rounded-full"
                  style={{ height: 6, background: '#2C2C2C' }}
                />
                <div
                  className="absolute top-1/2 left-0 -translate-y-1/2 rounded-full"
                  style={{
                    height: 6,
                    width: `${((prefs.romanticIntensity - 1) / 4) * 100}%`,
                    background: '#E8401C',
                    transition: 'width 0.15s',
                  }}
                />
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={prefs.romanticIntensity}
                  onChange={e => setPref('romanticIntensity', Number(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  style={{ height: 24 }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                  style={{
                    left: `${((prefs.romanticIntensity - 1) / 4) * 100}%`,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    boxShadow: '0 0 0 3px #E8401C, 0 0 12px #E8401C80',
                    pointerEvents: 'none',
                    transition: 'left 0.15s',
                  }}
                />
              </div>
              <span style={{ color: '#AAAAAA', fontSize: 13 }}>Deeply Romantic 💞</span>
            </div>
            <div className="flex justify-between mt-1">
              {[1, 2, 3, 4, 5].map(n => (
                <span key={n} style={{ color: prefs.romanticIntensity === n ? '#E8401C' : '#555555', fontSize: 11, fontWeight: prefs.romanticIntensity === n ? 700 : 400 }}>
                  {n}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4" style={{ background: 'linear-gradient(to top, #0A0A0A 80%, transparent)' }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleContinue}
          disabled={!canContinue}
          className="w-full font-semibold text-white flex items-center justify-center"
          style={{
            background: canContinue ? '#E8401C' : '#333333',
            height: 52,
            borderRadius: 14,
            fontSize: 16,
            transition: 'background 0.2s',
          }}
        >
          Get AI Recommendation →
        </motion.button>
      </div>
    </div>
  );
}
