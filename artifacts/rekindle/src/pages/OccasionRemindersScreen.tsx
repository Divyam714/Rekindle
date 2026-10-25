import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { ArrowLeft, Bell, Plus, Trash2, BellOff } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { OccasionReminder, OccasionType, OCCASION_TYPE_LABELS, OCCASION_EMOJIS, getDaysUntil } from '@/data/occasions';

const OCCASION_TYPES: OccasionType[] = ['anniversary', 'birthday', 'valentines', 'propose', 'other'];

function AddOccasionSheet({ onClose, onAdd }: { onClose: () => void; onAdd: (o: OccasionReminder) => void }) {
  const [type, setType] = useState<OccasionType>('anniversary');
  const [partnerName, setPartnerName] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');

  const handleAdd = () => {
    if (!month || !day) return;
    const id = `occ_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const dateStr = `${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    onAdd({
      id,
      type,
      label: OCCASION_TYPE_LABELS[type],
      partnerName: partnerName.trim() || 'Partner',
      date: dateStr,
      createdAt: Date.now(),
    });
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.75)' }}
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col px-5 pb-10"
        style={{ background: '#161616', borderRadius: '24px 24px 0 0', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="flex justify-center pt-3 pb-4">
          <div style={{ width: 44, height: 4, background: '#333333', borderRadius: 2 }} />
        </div>
        <p className="font-black text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 20 }}>Add Occasion</p>

        <div className="flex flex-col gap-5">
          <div>
            <p className="uppercase mb-2" style={{ color: '#555555', fontSize: 11, letterSpacing: 2 }}>OCCASION TYPE</p>
            <div className="flex flex-wrap gap-2">
              {OCCASION_TYPES.map(t => (
                <motion.button
                  key={t}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setType(t)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full font-semibold"
                  style={{
                    background: type === t ? '#E8401C' : '#222222',
                    color: '#FFFFFF',
                    fontSize: 13,
                    border: type === t ? 'none' : '1px solid #333333',
                    transition: 'background 0.15s',
                  }}
                >
                  <span>{OCCASION_EMOJIS[t]}</span>
                  <span>{OCCASION_TYPE_LABELS[t]}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <p className="uppercase mb-2" style={{ color: '#555555', fontSize: 11, letterSpacing: 2 }}>PARTNER'S NAME (optional)</p>
            <input
              value={partnerName}
              onChange={e => setPartnerName(e.target.value)}
              placeholder="e.g. Priya"
              style={{
                width: '100%',
                background: '#1E1E1E',
                border: '1px solid #2C2C2C',
                borderRadius: 12,
                padding: '12px 16px',
                fontSize: 15,
                color: '#FFFFFF',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <p className="uppercase mb-2" style={{ color: '#555555', fontSize: 11, letterSpacing: 2 }}>DATE (Day & Month)</p>
            <div className="flex gap-3">
              <input
                value={day}
                onChange={e => setDay(e.target.value.replace(/\D/g, '').slice(0, 2))}
                placeholder="DD"
                maxLength={2}
                style={{
                  flex: 1,
                  background: '#1E1E1E',
                  border: '1px solid #2C2C2C',
                  borderRadius: 12,
                  padding: '12px 16px',
                  fontSize: 15,
                  color: '#FFFFFF',
                  outline: 'none',
                  textAlign: 'center',
                }}
              />
              <input
                value={month}
                onChange={e => setMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                placeholder="MM"
                maxLength={2}
                style={{
                  flex: 1,
                  background: '#1E1E1E',
                  border: '1px solid #2C2C2C',
                  borderRadius: 12,
                  padding: '12px 16px',
                  fontSize: 15,
                  color: '#FFFFFF',
                  outline: 'none',
                  textAlign: 'center',
                }}
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAdd}
            disabled={!month || !day}
            className="w-full font-bold text-white flex items-center justify-center"
            style={{
              fontFamily: 'Poppins, sans-serif',
              background: month && day ? '#E8401C' : '#333333',
              height: 56,
              borderRadius: 14,
              fontSize: 16,
              transition: 'background 0.2s',
            }}
          >
            Add Reminder
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

export default function OccasionRemindersScreen() {
  const [, setLocation] = useLocation();
  const { occasions, addOccasion, removeOccasion, notificationsEnabled, setNotificationsEnabled } = useApp();
  const [showAdd, setShowAdd] = useState(false);

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      if (typeof Notification !== 'undefined') {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          setNotificationsEnabled(true);
        }
      } else {
        setNotificationsEnabled(true);
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  return (
    <>
      <div data-testid="occasion-reminders-screen" className="flex flex-col min-h-screen pb-24 px-4" style={{ background: '#0A0A0A' }}>
        <div className="flex items-center gap-3 pt-12 pb-6">
          <motion.button whileTap={{ scale: 0.93 }} onClick={() => setLocation('/profile')}>
            <ArrowLeft size={22} color="#FFFFFF" />
          </motion.button>
          <div className="flex-1">
            <h1 className="font-black text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 22 }}>Occasion Reminders</h1>
            <p style={{ color: '#555555', fontSize: 13 }}>Never miss a special moment</p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleToggleNotifications}
          className="flex items-center justify-between p-4 mb-6 rounded-2xl"
          style={{
            background: notificationsEnabled ? 'rgba(232,64,28,0.08)' : '#161616',
            border: `1px solid ${notificationsEnabled ? 'rgba(232,64,28,0.3)' : '#222222'}`,
          }}
        >
          <div className="flex items-center gap-3">
            {notificationsEnabled ? <Bell size={20} color="#E8401C" /> : <BellOff size={20} color="#555555" />}
            <div>
              <p className="font-semibold text-white" style={{ fontSize: 14 }}>Reminders</p>
              <p style={{ color: '#555555', fontSize: 12 }}>30, 14, 7 & 2 days before</p>
            </div>
          </div>
          <div
            style={{
              width: 48,
              height: 28,
              borderRadius: 14,
              background: notificationsEnabled ? '#E8401C' : '#333333',
              transition: 'background 0.3s',
              padding: 3,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: '#FFFFFF',
                transform: notificationsEnabled ? 'translateX(20px)' : 'translateX(0)',
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            />
          </div>
        </motion.button>

        {occasions.length === 0 ? (
          <div className="flex flex-col items-center gap-4 pt-12 pb-8">
            <div
              className="flex items-center justify-center"
              style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(232,64,28,0.08)' }}
            >
              <span style={{ fontSize: 36 }}>🗓️</span>
            </div>
            <p className="font-bold text-white text-center" style={{ fontSize: 18 }}>No reminders yet</p>
            <p className="text-center" style={{ color: '#AAAAAA', fontSize: 14, lineHeight: 1.6, maxWidth: 260 }}>
              Add your anniversary, birthday, or any special date and we'll remind you in advance.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mb-6">
            <AnimatePresence>
              {occasions.map(occ => {
                const days = getDaysUntil(occ.date);
                return (
                  <motion.div
                    key={occ.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 300 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{ background: '#161616', border: '1px solid #222222' }}
                  >
                    <div
                      className="flex items-center justify-center shrink-0"
                      style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(232,64,28,0.1)', fontSize: 24 }}
                    >
                      {OCCASION_EMOJIS[occ.type]}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white" style={{ fontSize: 15 }}>{occ.label} with {occ.partnerName}</p>
                      <p style={{ color: '#AAAAAA', fontSize: 13 }}>
                        {occ.date.split('-').reverse().join('/')}
                      </p>
                      <p
                        className="font-semibold mt-0.5"
                        style={{ color: days <= 7 ? '#E8401C' : days <= 30 ? '#D4A853' : '#2ECC71', fontSize: 12 }}
                      >
                        {days === 0 ? '🎉 Today!' : `${days} day${days > 1 ? 's' : ''} away`}
                      </p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeOccasion(occ.id)}
                      className="flex items-center justify-center"
                      style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(232,64,28,0.08)' }}
                    >
                      <Trash2 size={16} color="#E8401C" />
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <motion.button
        data-testid="button-add-occasion"
        whileTap={{ scale: 0.94 }}
        onClick={() => setShowAdd(true)}
        className="fixed flex items-center gap-2"
        style={{
          bottom: 28,
          right: 20,
          background: '#E8401C',
          borderRadius: 28,
          height: 54,
          padding: '0 20px',
          boxShadow: '0 4px 24px rgba(232,64,28,0.4)',
          zIndex: 30,
        }}
      >
        <Plus size={20} color="#FFFFFF" />
        <span className="font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14 }}>Add Occasion</span>
      </motion.button>

      <AnimatePresence>
        {showAdd && (
          <AddOccasionSheet
            onClose={() => setShowAdd(false)}
            onAdd={o => { addOccasion(o); setShowAdd(false); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
