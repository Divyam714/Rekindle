import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { ArrowLeft, Share2, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const PREP_TIPS = [
  {
    title: 'What to wear',
    emoji: '👔',
    tips: ['Smart casual — elegant but not overdressed', 'Your partner will see you, dress to impress', 'Comfortable shoes — you may be standing for photos'],
  },
  {
    title: 'What to expect',
    emoji: '✨',
    tips: ['Your coordinator will be there 30 min early', 'Everything is set up before you arrive', 'Just arrive and let the magic unfold'],
  },
  {
    title: 'Surprise hint',
    emoji: '🎁',
    tips: ['There is a special moment we have arranged', 'Pay attention to the little details around you', 'Your coordinator will signal when it is time'],
  },
];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function getCountdown(dateStr: string) {
  const now = new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d, 19, 0, 0);
  const diff = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, diff };
}

export default function CountdownScreen() {
  const [, setLocation] = useLocation();
  const { bookings } = useApp();

  const upcoming = bookings.filter(b => b.status === 'UPCOMING').sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  const next = upcoming[0];

  const [countdown, setCountdown] = useState(next ? getCountdown(next.date) : null);

  useEffect(() => {
    if (!next) return;
    const t = setInterval(() => {
      setCountdown(getCountdown(next.date));
    }, 1000);
    return () => clearInterval(t);
  }, [next]);

  const handleShare = () => {
    if (!next) return;
    const msg = `✨ Something magical is happening in ${countdown?.days ?? 0} days. I can't wait — booked through @REKINDLE Patna 🔥 #RekindeTheLove`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (!next || !countdown) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ background: '#0A0A0A' }}>
        <motion.button whileTap={{ scale: 0.93 }} onClick={() => setLocation('/home')} className="absolute top-12 left-4">
          <ArrowLeft size={22} color="#FFFFFF" />
        </motion.button>
        <Sparkles size={48} color="#333333" className="mb-4" />
        <p className="font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 20 }}>No upcoming bookings</p>
        <p style={{ color: '#555555', fontSize: 14 }}>Book an experience to see your countdown</p>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setLocation('/home')}
          className="mt-6 font-bold text-white px-8 py-3 rounded-2xl"
          style={{ background: '#E8401C', fontSize: 15 }}
        >
          Browse Experiences →
        </motion.button>
      </div>
    );
  }

  const isToday = countdown.days === 0;

  return (
    <div className="fixed inset-0 flex flex-col overflow-y-auto" style={{ background: '#0A0A0A' }}>
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{ width: 400, height: 400, top: '10%', left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle, rgba(232,64,28,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 relative z-10">
        <motion.button whileTap={{ scale: 0.93 }} onClick={() => setLocation('/home')}>
          <ArrowLeft size={22} color="#FFFFFF" />
        </motion.button>
        <span className="uppercase font-semibold" style={{ color: '#555555', fontSize: 11, letterSpacing: 3 }}>COUNTDOWN</span>
      </div>

      {/* Main countdown */}
      <div className="flex flex-col items-center px-6 py-6 relative z-10">
        {isToday ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-4"
          >
            <p className="font-black text-center" style={{ fontFamily: 'Poppins, sans-serif', color: '#E8401C', fontSize: 28 }}>
              Tonight is the night! 🔥
            </p>
          </motion.div>
        ) : (
          <p className="mb-6 text-center" style={{ color: '#555555', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' }}>
            Your experience is in
          </p>
        )}

        {/* Experience name */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-black text-white text-center mb-8"
          style={{ fontFamily: 'Poppins, sans-serif', fontSize: 26, lineHeight: 1.2, maxWidth: 320 }}
        >
          {next.packageName}
        </motion.p>

        {/* Countdown tiles */}
        <div className="flex items-center gap-3 mb-2">
          {[
            { val: pad(countdown.days), label: 'Days' },
            { val: pad(countdown.hours), label: 'Hours' },
            { val: pad(countdown.minutes), label: 'Min' },
            { val: pad(countdown.seconds), label: 'Sec' },
          ].map(({ val, label }, i) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <motion.div
                  key={val}
                  initial={{ y: -6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex items-center justify-center"
                  style={{
                    width: 72,
                    height: 72,
                    background: 'linear-gradient(135deg, #161616, #1A1A1A)',
                    borderRadius: 16,
                    border: '1px solid #2C2C2C',
                  }}
                >
                  <span className="font-black text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 30 }}>{val}</span>
                </motion.div>
                <span className="mt-1.5" style={{ color: '#555555', fontSize: 11, fontWeight: 600, letterSpacing: 1 }}>{label.toUpperCase()}</span>
              </div>
              {i < 3 && <span className="font-black text-white mb-5" style={{ fontSize: 22, color: '#333333' }}>:</span>}
            </div>
          ))}
        </div>

        {/* Date line */}
        <p className="mb-8" style={{ color: '#AAAAAA', fontSize: 14 }}>
          {next.date} · {next.time} · Patna, Bihar
        </p>

        {/* Share button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleShare}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl mb-8"
          style={{ background: '#25D366', color: '#FFFFFF', fontSize: 14, fontWeight: 700 }}
        >
          <Share2 size={16} />
          Share the excitement
        </motion.button>

        {/* Preparation tips */}
        <div className="w-full flex flex-col gap-3">
          <p className="uppercase font-semibold" style={{ color: '#555555', fontSize: 11, letterSpacing: 2, marginBottom: 4 }}>PREPARE FOR YOUR EVENING</p>
          {PREP_TIPS.map((tip, i) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 280, damping: 24 }}
              className="p-4"
              style={{ background: '#161616', borderRadius: 16, border: '1px solid #222222' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span style={{ fontSize: 20 }}>{tip.emoji}</span>
                <p className="font-bold text-white" style={{ fontSize: 15 }}>{tip.title}</p>
              </div>
              {tip.tips.map(t => (
                <div key={t} className="flex items-start gap-2 mb-1.5">
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#E8401C', marginTop: 6, flexShrink: 0 }} />
                  <span style={{ color: '#AAAAAA', fontSize: 13, lineHeight: 1.6 }}>{t}</span>
                </div>
              ))}
            </motion.div>
          ))}
        </div>

        {/* Contact coordinator */}
        <a
          href="https://wa.me/917870000000"
          target="_blank"
          rel="noreferrer"
          className="w-full mt-4 flex items-center justify-center gap-2 py-4 rounded-2xl"
          style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)', color: '#25D366', fontSize: 14, fontWeight: 700 }}
        >
          💬 Contact your coordinator
        </a>
      </div>
    </div>
  );
}
