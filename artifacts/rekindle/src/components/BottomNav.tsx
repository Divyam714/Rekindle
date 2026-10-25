import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Home, Calendar, Heart, Compass, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const tabs = [
  { path: '/home', label: 'Home', Icon: Home },
  { path: '/discover', label: 'Discover', Icon: Compass },
  { path: '/bookings', label: 'Bookings', Icon: Calendar },
  { path: '/wishlist', label: 'Saved', Icon: Heart },
  { path: '/profile', label: 'Profile', Icon: User },
];

const SHOW_ON = ['/home', '/discover', '/bookings', '/wishlist', '/profile'];

export default function BottomNav() {
  const [location, setLocation] = useLocation();
  const { wishlist, bookings } = useApp();

  if (!SHOW_ON.includes(location)) return null;

  const upcomingCount = bookings.filter(b => b.status === 'UPCOMING').length;

  return (
    <nav
      data-testid="bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-50 flex items-end justify-around"
      style={{
        background: '#0A0A0A',
        borderTop: '1px solid #1A1A1A',
        height: 68,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {tabs.map(({ path, label, Icon }) => {
        const active = location === path;
        const showBookingBadge = path === '/bookings' && upcomingCount > 0;
        const showWishlistBadge = path === '/wishlist' && wishlist.length > 0;

        return (
          <button
            key={path}
            data-testid={`nav-tab-${label.toLowerCase()}`}
            onClick={() => setLocation(path)}
            className="relative flex flex-col items-center justify-center flex-1 h-full pb-1 gap-0.5"
          >
            {active && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute top-0 rounded-full"
                style={{ width: 28, height: 3, background: '#E8401C' }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <div className="relative">
              <motion.div
                animate={active ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                <Icon
                  size={22}
                  style={{ color: active ? '#E8401C' : '#444444' }}
                  fill={active && path === '/wishlist' ? '#E8401C' : 'none'}
                />
              </motion.div>
              {(showBookingBadge || showWishlistBadge) && (
                <span
                  className="absolute -top-1 -right-1 rounded-full"
                  style={{ width: 8, height: 8, background: '#E8401C' }}
                />
              )}
            </div>
            <span
              className="text-[10px] leading-none"
              style={{
                color: active ? '#E8401C' : '#444444',
                fontWeight: active ? 600 : 400,
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
