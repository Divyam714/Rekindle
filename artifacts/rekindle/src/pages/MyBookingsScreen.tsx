import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { Calendar, MapPin, X, MessageCircle, Timer } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PACKAGES } from '@/data/packages';

type Tab = 'upcoming' | 'completed' | 'cancelled';

export default function MyBookingsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const { bookings, cancelBooking } = useApp();
  const [, setLocation] = useLocation();

  const filtered = bookings.filter(b => b.status.toLowerCase() === activeTab);
  const selected = bookings.find(b => b.id === selectedBooking);

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      UPCOMING: '#2ECC71',
      COMPLETED: '#555555',
      CANCELLED: '#E8401C',
    };
    return (
      <span
        className="font-semibold uppercase"
        style={{ background: `${colors[status]}22`, color: colors[status], borderRadius: 20, padding: '3px 10px', fontSize: 11 }}
      >
        {status === 'UPCOMING' ? 'CONFIRMED ✓' : status}
      </span>
    );
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div data-testid="bookings-screen" className="flex flex-col min-h-screen pb-20" style={{ background: '#0A0A0A' }}>
      <div className="px-4 pt-12 pb-4">
        <h1 className="font-bold text-white" style={{ fontSize: 22 }}>My Experiences</h1>
      </div>

      {/* Tabs */}
      <div className="flex px-4 mb-4 relative">
        {tabs.map(tab => (
          <button
            key={tab.id}
            data-testid={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 pb-3 relative font-semibold"
            style={{ color: activeTab === tab.id ? '#FFFFFF' : '#AAAAAA', fontSize: 14 }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-2 right-2 rounded-full"
                style={{ height: 2, background: '#E8401C' }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 px-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 pt-20">
            <Calendar size={80} color="#333333" />
            <p className="font-bold text-white" style={{ fontSize: 20 }}>Nothing planned yet. Let's fix that.</p>
            <p style={{ color: '#AAAAAA', fontSize: 14 }}>Your booked experiences appear here.</p>
            <motion.button
              data-testid="button-browse-packages"
              whileTap={{ scale: 0.96 }}
              onClick={() => setLocation('/home')}
              className="font-bold text-white px-8 py-3 rounded-2xl"
              style={{ background: '#E8401C' }}
            >
              Browse Packages →
            </motion.button>
          </div>
        ) : (
          filtered.map(booking => {
            const pkg = PACKAGES.find(p => p.id === booking.packageId);
            return (
              <motion.button
                key={booking.id}
                data-testid={`card-booking-${booking.id}`}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedBooking(booking.id)}
                className="flex items-center gap-3 p-4 text-left w-full"
                style={{ background: '#161616', borderRadius: 16, border: '1px solid #222222' }}
              >
                <img
                  src={pkg?.thumbImage}
                  alt={booking.packageName}
                  className="object-cover rounded-xl shrink-0"
                  style={{ width: 80, height: 80, background: '#1E1E1E' }}
                  loading="lazy"
                />
                <div className="flex-1">
                  <p className="font-bold text-white" style={{ fontSize: 15 }}>{booking.packageName}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar size={12} color="#AAAAAA" />
                    <span style={{ color: '#AAAAAA', fontSize: 13 }}>{booking.date} · {booking.time}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={12} color="#AAAAAA" />
                    <span style={{ color: '#AAAAAA', fontSize: 13 }}>Patna, Bihar</span>
                  </div>
                  <div className="mt-2">{statusBadge(booking.status)}</div>
                </div>
                <span style={{ color: '#555555', fontSize: 20 }}>›</span>
              </motion.button>
            );
          })
        )}
      </div>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.7)' }}
              onClick={() => setSelectedBooking(null)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 flex flex-col"
              style={{ background: '#161616', borderRadius: '20px 20px 0 0', maxHeight: '80vh', overflow: 'hidden' }}
            >
              <div className="flex justify-center pt-3 pb-2">
                <div style={{ width: 40, height: 4, background: '#333333', borderRadius: 2 }} />
              </div>
              <div className="overflow-y-auto px-5 pb-8 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white" style={{ fontSize: 18 }}>{selected.packageName}</p>
                  <button data-testid="button-close-sheet" onClick={() => setSelectedBooking(null)}>
                    <X size={22} color="#AAAAAA" />
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  <p style={{ color: '#AAAAAA', fontSize: 14 }}>📅 {selected.date} · {selected.time}</p>
                  <p style={{ color: '#AAAAAA', fontSize: 14 }}>📍 Patna, Bihar</p>
                  <p style={{ color: '#AAAAAA', fontSize: 14 }}>🪪 Booking ID: {selected.id}</p>
                  <p className="font-bold text-white" style={{ fontSize: 16 }}>₹{selected.total.toLocaleString('en-IN')} paid</p>
                </div>

                {selected.status === 'UPCOMING' && (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setSelectedBooking(null); setLocation('/countdown'); }}
                      className="w-full font-bold flex items-center justify-center gap-2 py-4 rounded-xl"
                      style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.25)', color: '#D4A853', fontSize: 15 }}
                    >
                      <Timer size={18} />
                      View Countdown
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setSelectedBooking(null); setLocation(`/coordinator-chat/${selected.id}`); }}
                      className="w-full font-bold flex items-center justify-center gap-2 py-4 rounded-xl"
                      style={{ background: 'rgba(232,64,28,0.08)', border: '1px solid rgba(232,64,28,0.2)', color: '#E8401C', fontSize: 15 }}
                    >
                      <MessageCircle size={18} />
                      Chat with Coordinator
                    </motion.button>
                  </>
                )}

                <a
                  data-testid="button-contact-whatsapp"
                  href="https://wa.me/917870000000"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full font-bold flex items-center justify-center py-4 rounded-xl"
                  style={{ background: '#25D366', color: '#FFFFFF', fontSize: 15 }}
                >
                  💬 Contact on WhatsApp
                </a>

                {selected.status === 'UPCOMING' && (
                  <button
                    data-testid="button-cancel-booking"
                    onClick={() => { cancelBooking(selected.id); setSelectedBooking(null); }}
                    style={{ color: '#E8401C', fontSize: 14 }}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
