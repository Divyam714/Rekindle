import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { MapPin, Camera, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';

function Screen1({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 gap-0 relative overflow-hidden">
      <div
        className="absolute"
        style={{
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,64,28,0.18) 0%, rgba(212,168,83,0.08) 50%, transparent 75%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -60%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col items-center gap-0 mb-10"
      >
        <motion.span
          className="font-black tracking-widest"
          style={{ fontFamily: 'Poppins, sans-serif', fontSize: 44, color: '#FFFFFF', letterSpacing: 10 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          REKINDLE
        </motion.span>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 48 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{ height: 3, background: '#E8401C', borderRadius: 2, marginTop: 8 }}
        />
      </motion.div>

      <motion.div className="flex flex-col items-center gap-3 mb-12">
        {['One Booking.', 'One Payment.', 'One Perfect Moment.'].map((line, i) => (
          <motion.p
            key={line}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.2, duration: 0.5 }}
            className="text-center font-semibold"
            style={{ fontFamily: 'Poppins, sans-serif', fontSize: 20, color: i === 2 ? '#E8401C' : '#FFFFFF', letterSpacing: 0.5 }}
          >
            {line}
          </motion.p>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="text-center mb-10"
        style={{ color: '#777777', fontSize: 13, lineHeight: 1.7, maxWidth: 280 }}
      >
        Premium curated date experiences in Patna — everything handled for you.
      </motion.p>

      <motion.button
        data-testid="onboarding-next-1"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7, duration: 0.4 }}
        whileTap={{ scale: 0.96 }}
        onClick={onNext}
        className="w-full text-white font-bold flex items-center justify-center"
        style={{ fontFamily: 'Poppins, sans-serif', background: '#E8401C', height: 58, borderRadius: 16, fontSize: 16 }}
      >
        Begin →
      </motion.button>
    </div>
  );
}

function Screen2({ onNext }: { onNext: () => void }) {
  const items = [
    { Icon: MapPin, title: 'Venue, fully arranged', desc: 'We book and set up the perfect rooftop, restaurant, or private space.' },
    { Icon: Sparkles, title: 'Decoration, done for you', desc: 'Candles, petals, fairy lights — your scene set before you arrive.' },
    { Icon: Camera, title: 'Photography always included', desc: 'Every moment captured by a pro and delivered in 24 hours.' },
  ];
  return (
    <div className="flex flex-col justify-center h-full px-8 gap-8">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="font-black text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 26 }}>We handle everything.</p>
        <p style={{ color: '#777777', fontSize: 14, marginTop: 6 }}>You just show up and enjoy.</p>
      </motion.div>
      <div className="flex flex-col gap-5">
        {items.map(({ Icon, title, desc }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.15, duration: 0.45, type: 'spring', stiffness: 280, damping: 24 }}
            className="flex items-start gap-4 p-4 rounded-2xl"
            style={{ background: '#111111', border: '1px solid #222222' }}
          >
            <div
              className="flex items-center justify-center shrink-0"
              style={{ background: 'rgba(232,64,28,0.12)', borderRadius: '50%', width: 48, height: 48 }}
            >
              <Icon size={22} color="#E8401C" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 15 }}>{title}</p>
              <p style={{ color: '#777777', fontSize: 12, marginTop: 3, lineHeight: 1.6 }}>{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <motion.button
        data-testid="onboarding-next-2"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        whileTap={{ scale: 0.96 }}
        onClick={onNext}
        className="w-full text-white font-bold flex items-center justify-center"
        style={{ fontFamily: 'Poppins, sans-serif', background: '#E8401C', height: 58, borderRadius: 16, fontSize: 16 }}
      >
        See the packages →
      </motion.button>
    </div>
  );
}

function Screen3({ onDone }: { onDone: () => void }) {
  const stats = [
    { val: '500+', label: 'Couples served' },
    { val: '4.9★', label: 'Average rating' },
    { val: '100%', label: 'Moments delivered' },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 gap-8">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        className="flex items-center justify-center"
        style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(232,64,28,0.12)', border: '2px solid rgba(232,64,28,0.3)' }}
      >
        <span style={{ fontSize: 44 }}>💑</span>
      </motion.div>
      <div className="flex flex-col items-center gap-3">
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center font-black text-white"
          style={{ fontFamily: 'Poppins, sans-serif', fontSize: 26, lineHeight: 1.25 }}
        >
          Patna's most loved experience brand.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
          style={{ color: '#777777', fontSize: 14, lineHeight: 1.7, maxWidth: 280 }}
        >
          Pick your experience. Pay once. Show up. We coordinate every vendor, every detail, every moment.
        </motion.p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex w-full"
        style={{ background: '#111111', borderRadius: 16, overflow: 'hidden', border: '1px solid #222222' }}
      >
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="flex-1 flex flex-col items-center py-4 gap-1"
            style={{ borderRight: i < 2 ? '1px solid #222222' : 'none' }}
          >
            <span className="font-black text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 20, color: '#E8401C' }}>{s.val}</span>
            <span style={{ color: '#666666', fontSize: 10, textAlign: 'center' }}>{s.label}</span>
          </div>
        ))}
      </motion.div>
      <motion.button
        data-testid="onboarding-get-started"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        whileTap={{ scale: 0.96 }}
        onClick={onDone}
        className="w-full text-white font-bold flex items-center justify-center"
        style={{ fontFamily: 'Poppins, sans-serif', background: '#E8401C', height: 58, borderRadius: 16, fontSize: 16 }}
      >
        Get Started — It's Free
      </motion.button>
    </div>
  );
}

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [, setLocation] = useLocation();
  const { setFirstTimeDone } = useApp();

  const goNext = () => {
    if (index < 2) {
      setDirection(1);
      setIndex(i => i + 1);
    }
  };

  const handleDone = () => {
    setFirstTimeDone();
    setLocation('/login');
  };

  const skip = () => {
    setFirstTimeDone();
    setLocation('/login');
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 320 : -320, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -320 : 320, opacity: 0 }),
  };

  return (
    <div
      data-testid="onboarding-screen"
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: '#0A0A0A' }}
    >
      <button
        data-testid="onboarding-skip"
        onClick={skip}
        className="absolute top-12 right-6 z-10 font-semibold"
        style={{ color: '#555555', fontSize: 14, fontFamily: 'Poppins, sans-serif' }}
      >
        Skip
      </button>

      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="absolute inset-0"
          >
            {index === 0 && <Screen1 onNext={goNext} />}
            {index === 1 && <Screen2 onNext={goNext} />}
            {index === 2 && <Screen3 onDone={handleDone} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-2 pb-10">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{
              width: i === index ? 28 : 8,
              height: 8,
              background: i === index ? '#E8401C' : '#2C2C2C',
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{ borderRadius: 4 }}
          />
        ))}
      </div>
    </div>
  );
}
