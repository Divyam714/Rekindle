import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';

function AnimatedCounter({ target, duration = 800 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setVal(Math.round(ease(t) * target));
      if (t < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration]);

  return <span>{val}</span>;
}

export default function ReferralScreen() {
  const { user } = useApp();
  const [copied, setCopied] = useState(false);
  const firstName = user?.name?.split(' ')[0]?.toUpperCase() || 'USER';
  const code = `REKINDLE-${firstName}`;
  const whatsappMsg = encodeURIComponent(`Hey! I've been using REKINDLE for planning dates and occasions in Patna. Use my code ${code} to get ₹300 off your first booking! Book at rekindle.in 💑`);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const stats = [
    { label: 'REFERRALS SENT', value: 0 },
    { label: 'REFERRALS BOOKED', value: 0 },
    { label: 'CREDITS EARNED', value: 0 },
  ];

  return (
    <div data-testid="referral-screen" className="flex flex-col min-h-screen pb-20 px-4" style={{ background: '#0A0A0A' }}>
      <div className="pt-12 pb-6">
        <h1 className="font-bold text-white" style={{ fontSize: 22 }}>Refer a Couple</h1>
        <p style={{ color: '#AAAAAA', fontSize: 15 }}>You get ₹300. They get ₹300. Everyone wins.</p>
      </div>

      {/* Referral Code */}
      <div className="p-5 flex flex-col gap-3 mb-6" style={{ background: '#161616', borderRadius: 16 }}>
        <span className="uppercase font-semibold" style={{ color: '#555555', fontSize: 10, letterSpacing: 2 }}>YOUR REFERRAL CODE</span>
        <p className="font-bold text-white" style={{ fontSize: 24, fontFamily: 'monospace', letterSpacing: 3 }}>{code}</p>
        <motion.button
          data-testid="button-copy-code"
          whileTap={{ scale: 0.96 }}
          onClick={handleCopy}
          className="self-start font-semibold px-5 py-2.5 rounded-xl"
          style={{ border: '1px solid #E8401C', color: copied ? '#2ECC71' : '#E8401C', background: 'transparent', fontSize: 14 }}
        >
          {copied ? 'Copied! ✓' : 'Copy code'}
        </motion.button>
      </div>

      <a
        data-testid="button-whatsapp-referral"
        href={`https://wa.me/?text=${whatsappMsg}`}
        target="_blank"
        rel="noreferrer"
        className="w-full font-bold flex items-center justify-center py-4 rounded-2xl mb-6"
        style={{ background: '#25D366', color: '#FFFFFF', fontSize: 16 }}
      >
        💚 Share on WhatsApp
      </a>

      {/* Stats */}
      <div className="flex mb-6" style={{ background: '#161616', borderRadius: 16, overflow: 'hidden' }}>
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="flex-1 flex flex-col items-center py-5 gap-2"
            style={{ borderRight: i < 2 ? '1px solid #2C2C2C' : 'none' }}
          >
            <span className="font-bold text-white" style={{ fontSize: 28 }}>
              <AnimatedCounter target={s.value} />
            </span>
            <div style={{ width: 20, height: 2, background: '#E8401C', borderRadius: 1 }} />
            <span className="uppercase text-center" style={{ color: '#555555', fontSize: 9, letterSpacing: 1 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="flex flex-col gap-4">
        <p className="uppercase font-semibold" style={{ color: '#555555', fontSize: 11, letterSpacing: 2 }}>HOW IT WORKS</p>
        {[
          { step: 1, text: 'Share your code with a friend.' },
          { step: 2, text: 'They book their first REKINDLE experience.' },
          { step: 3, text: 'You both get ₹300 credit instantly.' },
        ].map(item => (
          <div key={item.step} className="flex items-start gap-4">
            <div
              className="flex items-center justify-center shrink-0 font-bold text-white"
              style={{ width: 36, height: 36, borderRadius: '50%', background: '#E8401C', fontSize: 16 }}
            >
              {item.step}
            </div>
            <p className="text-white" style={{ fontSize: 15, paddingTop: 8 }}>{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
