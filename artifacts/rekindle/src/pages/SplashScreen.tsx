import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useApp } from '@/context/AppContext';

export default function SplashScreen() {
  const [, setLocation] = useLocation();
  const { isFirstTime, user } = useApp();

  useEffect(() => {
    const t = setTimeout(() => {
      if (!isFirstTime && user) {
        setLocation('/home');
      } else if (!isFirstTime) {
        setLocation('/login');
      } else {
        setLocation('/onboarding');
      }
    }, 2200);
    return () => clearTimeout(t);
  }, [isFirstTime, user, setLocation]);

  return (
    <div
      data-testid="splash-screen"
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: '#E8401C' }}
    >
      <div className="flex flex-col items-center gap-4">
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{
            color: '#FFFFFF',
            fontWeight: 900,
            fontSize: 52,
            letterSpacing: '-2px',
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          REKINDLE
        </motion.h1>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 64 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          style={{ height: 2, background: '#FFFFFF', borderRadius: 1 }}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          style={{
            color: '#FFFFFF',
            fontStyle: 'italic',
            fontSize: 14,
          }}
        >
          Show up. We handle everything.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-12"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTopColor: '#FFFFFF',
          }}
        />
      </motion.div>
    </div>
  );
}
