import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { ArrowLeft, Heart, Camera, Edit3, Check, BookOpen } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PACKAGES } from '@/data/packages';

export default function OurStoryScreen() {
  const [, setLocation] = useLocation();
  const { bookings, memories, updateMemory } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const storyBookings = bookings.filter(b => b.status !== 'CANCELLED');

  const handleEditStart = (bookingId: string, currentNote: string) => {
    setEditingId(bookingId);
    setEditText(currentNote);
  };

  const handleEditSave = (bookingId: string) => {
    updateMemory(bookingId, editText.trim().slice(0, 120));
    setEditingId(null);
  };

  return (
    <div className="flex flex-col min-h-screen pb-20" style={{ background: '#0A0A0A' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-6">
        <motion.button whileTap={{ scale: 0.93 }} onClick={() => setLocation('/profile')}>
          <ArrowLeft size={22} color="#FFFFFF" />
        </motion.button>
        <div className="flex-1">
          <p className="font-black text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 22 }}>Our Story</p>
          <p style={{ color: '#555555', fontSize: 13 }}>Every moment, beautifully remembered</p>
        </div>
        <Heart size={20} color="#E8401C" fill="#E8401C" />
      </div>

      {storyBookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-5 pt-20 px-8 text-center"
        >
          <div
            className="flex items-center justify-center"
            style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(232,64,28,0.08)', border: '1px solid rgba(232,64,28,0.15)' }}
          >
            <BookOpen size={36} color="#E8401C" />
          </div>
          <div>
            <p className="font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 20 }}>Your story starts here</p>
            <p style={{ color: '#555555', fontSize: 14, lineHeight: 1.7 }}>
              Every experience you book becomes a chapter in your love story. Start your first experience to create your first memory.
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setLocation('/home')}
            className="font-bold text-white px-8 py-4 rounded-2xl"
            style={{ background: '#E8401C', fontSize: 15, fontFamily: 'Poppins, sans-serif' }}
          >
            Plan a Date Night →
          </motion.button>
        </motion.div>
      ) : (
        <div className="px-4 flex flex-col gap-5">
          {/* Story count */}
          <div
            className="flex items-center justify-between p-4 rounded-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(232,64,28,0.08), rgba(212,168,83,0.05))', border: '1px solid rgba(232,64,28,0.15)' }}
          >
            <div>
              <p className="font-black text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 28 }}>{storyBookings.length}</p>
              <p style={{ color: '#AAAAAA', fontSize: 13 }}>memories created together</p>
            </div>
            <span style={{ fontSize: 40 }}>🕯️</span>
          </div>

          {/* Memory Cards */}
          <AnimatePresence>
            {storyBookings.map((booking, i) => {
              const pkg = PACKAGES.find(p => p.id === booking.packageId);
              const memory = memories[booking.id];
              const isEditing = editingId === booking.id;

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, type: 'spring', stiffness: 280, damping: 24 }}
                  className="overflow-hidden"
                  style={{ background: '#161616', borderRadius: 20, border: '1px solid #222222' }}
                >
                  {/* Card image */}
                  <div className="relative" style={{ height: 180 }}>
                    <img
                      src={pkg?.thumbImage ?? 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80'}
                      alt={booking.packageName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(to top, rgba(22,22,22,1) 0%, rgba(22,22,22,0.2) 60%, transparent 100%)' }}
                    />
                    {/* Occasion badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className="font-bold text-white uppercase"
                        style={{ background: '#E8401C', borderRadius: 20, padding: '3px 10px', fontSize: 10 }}
                      >
                        {booking.status === 'UPCOMING' ? 'UPCOMING ✨' : 'MEMORY ✓'}
                      </span>
                    </div>
                    {/* Photo upload placeholder */}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-2"
                      style={{ background: 'rgba(0,0,0,0.6)', borderRadius: 20, backdropFilter: 'blur(8px)' }}
                    >
                      <Camera size={13} color="#AAAAAA" />
                      <span style={{ color: '#AAAAAA', fontSize: 11 }}>Add photo</span>
                    </motion.button>
                  </div>

                  {/* Card content */}
                  <div className="p-4 flex flex-col gap-3">
                    <div>
                      <p className="font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 17 }}>{booking.packageName}</p>
                      <p style={{ color: '#555555', fontSize: 13 }}>
                        {booking.date} · {booking.time}
                        {booking.partnerName ? ` · With ${booking.partnerName}` : ''}
                      </p>
                    </div>

                    {/* Memory note */}
                    {isEditing ? (
                      <div className="flex gap-2">
                        <input
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          maxLength={120}
                          placeholder="Write a memory note..."
                          autoFocus
                          className="flex-1 outline-none text-white"
                          style={{ background: '#1E1E1E', borderRadius: 10, height: 44, border: '1px solid #E8401C', padding: '0 12px', fontSize: 14 }}
                        />
                        <motion.button
                          whileTap={{ scale: 0.94 }}
                          onClick={() => handleEditSave(booking.id)}
                          className="flex items-center justify-center"
                          style={{ width: 44, height: 44, background: '#E8401C', borderRadius: 10, flexShrink: 0 }}
                        >
                          <Check size={18} color="#FFFFFF" />
                        </motion.button>
                      </div>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleEditStart(booking.id, memory?.note ?? '')}
                        className="flex items-center gap-2 text-left w-full px-3 py-2.5"
                        style={{ background: '#1E1E1E', borderRadius: 10, border: '1px solid #2C2C2C' }}
                      >
                        <Edit3 size={14} color={memory?.note ? '#D4A853' : '#555555'} />
                        <span style={{ fontSize: 13, color: memory?.note ? '#CCCCCC' : '#555555', fontStyle: memory?.note ? 'normal' : 'italic' }}>
                          {memory?.note || 'Tap to write a memory note...'}
                        </span>
                      </motion.button>
                    )}

                    {/* Total paid */}
                    <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid #222222' }}>
                      <span style={{ color: '#555555', fontSize: 12 }}>Total paid</span>
                      <span className="font-bold" style={{ color: '#D4A853', fontSize: 15, fontFamily: 'Poppins, sans-serif' }}>
                        ₹{booking.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* CTA to add more */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setLocation('/home')}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl"
            style={{ background: 'rgba(232,64,28,0.08)', border: '1px dashed rgba(232,64,28,0.3)' }}
          >
            <Heart size={16} color="#E8401C" />
            <span className="font-semibold" style={{ color: '#E8401C', fontSize: 14 }}>Plan your next chapter →</span>
          </motion.button>
        </div>
      )}
    </div>
  );
}
