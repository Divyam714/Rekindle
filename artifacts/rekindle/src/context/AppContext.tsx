import { getActiveUser } from '@/services/userService';
import { createContext, useContext, useState, useCallback } from 'react';
import { OccasionReminder } from '@/data/occasions';

export interface User {
  name: string;
  phone: string;
  city: string;
}

export interface BookingAddOn {
  id: string;
  name: string;
  price: number;
}

export interface Booking {
  id: string;
  packageId: string;
  packageName: string;
  date: string;
  time: string;
  partnerName: string;
  surpriseType: string;
  specialRequests: string;
  addOns: BookingAddOn[];
  total: number;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  createdAt: number;
  imageUrl?: string;
  tier?: string;
}

export interface Memory {
  note: string;
  updatedAt: number;
}

export type LoyaltyTier = 'none' | 'member' | 'gold' | 'platinum';

function getLoyaltyTier(bookingCount: number): LoyaltyTier {
  if (bookingCount >= 5) return 'platinum';
  if (bookingCount >= 2) return 'gold';
  if (bookingCount >= 1) return 'member';
  return 'none';
}

function getWalletBalance(bookings: Booking[], tier: LoyaltyTier): number {
  if (tier === 'none' || tier === 'member') return 0;
  const creditRate = tier === 'platinum' ? 0.10 : 0.05;
  const lastTotal = bookings[0]?.total ?? 0;
  return Math.floor(lastTotal * creditRate);
}

interface AppContextValue {
  user: User | null;
  setUser: (u: User) => void;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  bookings: Booking[];
  addBooking: (b: Booking) => void;
  cancelBooking: (id: string) => void;
  isFirstTime: boolean;
  setFirstTimeDone: () => void;
  dismissedBanner: boolean;
  dismissBanner: () => void;
  logout: () => void;
  occasions: OccasionReminder[];
  addOccasion: (o: OccasionReminder) => void;
  removeOccasion: (id: string) => void;
  loyaltyTier: LoyaltyTier;
  walletBalance: number;
  momentsCreated: number;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;
  memories: Record<string, Memory>;
  updateMemory: (bookingId: string, note: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const LS = {
  user: 'rekindle_user',
  firstTime: 'rekindle_first_time',
  bookings: 'rekindle_bookings',
  wishlist: 'rekindle_wishlist',
  banner: 'rekindle_dismissed_banner',
  occasions: 'rekindle_occasions',
  notifications: 'rekindle_notifications',
  memories: 'rekindle_memories',
};

const readLS = <T,>(key: string, fallback: T): T => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => readLS<User | null>(LS.user, null));
  const [isFirstTime, setIsFirstTime] = useState<boolean>(() => localStorage.getItem(LS.firstTime) !== 'false');
  const [wishlist, setWishlist] = useState<string[]>(() => readLS<string[]>(LS.wishlist, []));
  const [bookings, setBookings] = useState<Booking[]>(() => readLS<Booking[]>(LS.bookings, []));
  const [dismissedBanner, setDismissedBanner] = useState<boolean>(() => localStorage.getItem(LS.banner) === 'true');
  const [occasions, setOccasions] = useState<OccasionReminder[]>(() => readLS<OccasionReminder[]>(LS.occasions, []));
  const [notificationsEnabled, setNotificationsEnabledState] = useState<boolean>(() => localStorage.getItem(LS.notifications) === 'true');
  const [memories, setMemories] = useState<Record<string, Memory>>(() => readLS<Record<string, Memory>>(LS.memories, {}));

  const loyaltyTier = getLoyaltyTier(bookings.length);
  const walletBalance = getWalletBalance(bookings, loyaltyTier);
  const momentsCreated = bookings.filter(b => b.status !== 'CANCELLED').length;

  const setUser = useCallback((u: User) => {
    setUserState(u);
    localStorage.setItem(LS.user, JSON.stringify(u));
  }, []);

  const setFirstTimeDone = useCallback(() => {
    setIsFirstTime(false);
    localStorage.setItem(LS.firstTime, 'false');
  }, []);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem(LS.wishlist, JSON.stringify(next));
      return next;
    });
  }, []);

  const addBooking = useCallback((b: Booking) => {
    setBookings(prev => {
      const next = [b, ...prev];
      localStorage.setItem(LS.bookings, JSON.stringify(next));
      return next;
    });
  }, []);

  const cancelBooking = useCallback((id: string) => {
    setBookings(prev => {
      const next = prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' as const } : b);
      localStorage.setItem(LS.bookings, JSON.stringify(next));
      return next;
    });
  }, []);

  const dismissBanner = useCallback(() => {
    setDismissedBanner(true);
    localStorage.setItem(LS.banner, 'true');
  }, []);

  const logout = useCallback(() => {
    Object.values(LS).forEach(k => localStorage.removeItem(k));
    setUserState(null);
    setIsFirstTime(true);
    setWishlist([]);
    setBookings([]);
    setDismissedBanner(false);
    setOccasions([]);
    setMemories({});
  }, []);

  const addOccasion = useCallback((o: OccasionReminder) => {
    setOccasions(prev => {
      const next = [...prev, o];
      localStorage.setItem(LS.occasions, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeOccasion = useCallback((id: string) => {
    setOccasions(prev => {
      const next = prev.filter(o => o.id !== id);
      localStorage.setItem(LS.occasions, JSON.stringify(next));
      return next;
    });
  }, []);

  const setNotificationsEnabled = useCallback((v: boolean) => {
    setNotificationsEnabledState(v);
    localStorage.setItem(LS.notifications, String(v));
  }, []);

  const updateMemory = useCallback((bookingId: string, note: string) => {
    setMemories(prev => {
      const next = { ...prev, [bookingId]: { note, updatedAt: Date.now() } };
      localStorage.setItem(LS.memories, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AppContext.Provider value={{
      user, setUser,
      wishlist, toggleWishlist,
      bookings, addBooking, cancelBooking,
      isFirstTime, setFirstTimeDone,
      dismissedBanner, dismissBanner,
      logout,
      occasions, addOccasion, removeOccasion,
      loyaltyTier, walletBalance, momentsCreated,
      notificationsEnabled, setNotificationsEnabled,
      memories, updateMemory,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
