import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-center gap-2 py-3"
          style={{ background: '#1A1A1A', borderBottom: '1px solid #2C2C2C' }}
        >
          <WifiOff size={14} color="#E8401C" />
          <span className="font-semibold" style={{ color: '#FFFFFF', fontSize: 13 }}>
            No internet connection — check your network
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
