import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      data-testid="toggle-setting"
      onClick={onToggle}
      className="flex items-center"
      style={{ width: 46, height: 26, borderRadius: 13, background: on ? '#2ECC71' : '#333333', padding: 3, transition: 'background 200ms' }}
    >
      <motion.div
        animate={{ x: on ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        style={{ width: 20, height: 20, borderRadius: '50%', background: '#FFFFFF' }}
      />
    </button>
  );
}

export default function SettingsScreen() {
  const [, setLocation] = useLocation();
  const [notifications, setNotifications] = useState({ occasion: true, booking: true, offers: false });
  const [partnerBirthday, setPartnerBirthday] = useState('');
  const [anniversary, setAnniversary] = useState('');
  const [valentine, setValentine] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('rekindle_occasions', JSON.stringify({ partnerBirthday, anniversary, valentine }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div data-testid="settings-screen" className="flex flex-col min-h-screen pb-20 px-4" style={{ background: '#0A0A0A' }}>
      <div className="flex items-center gap-4 pt-12 pb-6">
        <motion.button data-testid="button-settings-back" whileTap={{ scale: 0.96 }} onClick={() => setLocation('/profile')}>
          <ArrowLeft size={22} color="#FFFFFF" />
        </motion.button>
        <h1 className="font-bold text-white" style={{ fontSize: 22 }}>Settings</h1>
      </div>

      {/* Notifications */}
      <div className="mb-6">
        <p className="uppercase mb-3" style={{ color: '#555555', fontSize: 11, letterSpacing: 2 }}>NOTIFICATIONS</p>
        <div style={{ background: '#161616', borderRadius: 16, overflow: 'hidden' }}>
          {[
            { key: 'occasion', label: 'Occasion reminders' },
            { key: 'booking', label: 'Booking updates' },
            { key: 'offers', label: 'Offers and deals' },
          ].map(({ key, label }, i) => (
            <div
              key={key}
              className="flex items-center justify-between px-4 py-4"
              style={{ borderBottom: i < 2 ? '1px solid #222222' : 'none' }}
            >
              <span className="text-white" style={{ fontSize: 14 }}>{label}</span>
              <Toggle
                on={notifications[key as keyof typeof notifications]}
                onToggle={() => setNotifications(n => ({ ...n, [key]: !n[key as keyof typeof notifications] }))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Add Occasions */}
      <div className="mb-6">
        <p className="uppercase mb-3" style={{ color: '#555555', fontSize: 11, letterSpacing: 2 }}>ADD OCCASIONS</p>
        <div style={{ background: '#161616', borderRadius: 16, overflow: 'hidden' }}>
          <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid #222222' }}>
            <span className="text-white" style={{ fontSize: 14 }}>Partner's birthday</span>
            <input
              data-testid="input-partner-birthday"
              type="date"
              value={partnerBirthday}
              onChange={e => setPartnerBirthday(e.target.value)}
              className="outline-none"
              style={{ background: 'transparent', color: '#E8401C', fontSize: 13, colorScheme: 'dark' }}
            />
          </div>
          <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid #222222' }}>
            <span className="text-white" style={{ fontSize: 14 }}>Anniversary date</span>
            <input
              data-testid="input-anniversary"
              type="date"
              value={anniversary}
              onChange={e => setAnniversary(e.target.value)}
              className="outline-none"
              style={{ background: 'transparent', color: '#E8401C', fontSize: 13, colorScheme: 'dark' }}
            />
          </div>
          <div className="flex items-center justify-between px-4 py-4">
            <span className="text-white" style={{ fontSize: 14 }}>Valentine's Day</span>
            <Toggle on={valentine} onToggle={() => setValentine(v => !v)} />
          </div>
        </div>
      </div>

      <motion.button
        data-testid="button-save-settings"
        whileTap={{ scale: 0.96 }}
        onClick={handleSave}
        className="w-full font-bold text-white flex items-center justify-center mb-6"
        style={{ background: saved ? '#2ECC71' : '#E8401C', height: 56, borderRadius: 14, fontSize: 16, transition: 'background 0.3s' }}
      >
        {saved ? 'Saved ✓' : 'Save'}
      </motion.button>

      {/* Display */}
      <div className="mb-6">
        <p className="uppercase mb-3" style={{ color: '#555555', fontSize: 11, letterSpacing: 2 }}>DISPLAY</p>
        <div className="flex items-center justify-between px-4 py-4" style={{ background: '#161616', borderRadius: 16 }}>
          <span className="text-white" style={{ fontSize: 14 }}>App language</span>
          <span style={{ color: '#AAAAAA', fontSize: 14 }}>English</span>
        </div>
      </div>

      {/* Account */}
      <div>
        <p className="uppercase mb-3" style={{ color: '#555555', fontSize: 11, letterSpacing: 2 }}>ACCOUNT</p>
        <button data-testid="button-delete-account" style={{ color: '#E8401C', fontSize: 14 }}>
          Delete account
        </button>
      </div>
    </div>
  );
}
