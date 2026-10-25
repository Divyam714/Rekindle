import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AddonItem } from '@/data/addons';
import { TierKey } from '@/data/tiers';

export interface UserPreferences {
  budget: string;
  indoorOutdoor: string;
  foodPreference: string;
  musicPreference: string;
  venueType: string;
  romanticIntensity: number;
}

export interface SelectedStyle {
  occasionType: string;
  styleKey: string;
  styleLabel: string;
}

export interface SelectedTierData {
  occasionType: string;
  tier: TierKey;
  basePrice: number;
  addOns: AddonItem[];
  totalPrice: number;
}

export interface AIRecommendation {
  id: string;
  occasion: string;
  style: string;
  summary: string;
  items: string[];
  generatedAt: string;
}

interface BookingContextValue {
  preferences: UserPreferences;
  setPreferences: (p: UserPreferences) => void;
  selectedStyle: SelectedStyle | null;
  setSelectedStyle: (s: SelectedStyle) => void;
  selectedTier: SelectedTierData | null;
  setSelectedTier: (t: SelectedTierData) => void;
  addonCart: AddonItem[];
  setAddonCart: (a: AddonItem[]) => void;
  aiRecommendations: AIRecommendation[];
  addAIRecommendation: (r: AIRecommendation) => void;
  customizations: UserPreferences;
  setCustomizations: (c: UserPreferences) => void;
  resetBookingFlow: () => void;
}

function readLS<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

function removeLS(key: string) {
  try { localStorage.removeItem(key); } catch {}
}

const DEFAULT_PREFS: UserPreferences = {
  budget: '',
  indoorOutdoor: '',
  foodPreference: '',
  musicPreference: '',
  venueType: '',
  romanticIntensity: 3,
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [preferences, setPrefsState] = useState<UserPreferences>(() =>
    readLS('rekindle_user_preferences', DEFAULT_PREFS),
  );
  const [customizations, setCustomState] = useState<UserPreferences>(() =>
    readLS('rekindle_customizations', DEFAULT_PREFS),
  );
  const [selectedStyle, setStyleState] = useState<SelectedStyle | null>(() =>
    readLS<SelectedStyle | null>('rekindle_selected_style', null),
  );
  const [selectedTier, setTierState] = useState<SelectedTierData | null>(() =>
    readLS<SelectedTierData | null>('rekindle_selected_tier', null),
  );
  const [addonCart, setAddonCartState] = useState<AddonItem[]>(() =>
    readLS<AddonItem[]>('rekindle_addon_cart', []),
  );
  const [aiRecommendations, setAIRecs] = useState<AIRecommendation[]>(() =>
    readLS<AIRecommendation[]>('rekindle_ai_recommendations', []),
  );

  const setPreferences = useCallback((p: UserPreferences) => {
    setPrefsState(p);
    writeLS('rekindle_user_preferences', p);
  }, []);

  const setCustomizations = useCallback((c: UserPreferences) => {
    setCustomState(c);
    writeLS('rekindle_customizations', c);
  }, []);

  const setSelectedStyle = useCallback((s: SelectedStyle) => {
    setStyleState(s);
    writeLS('rekindle_selected_style', s);
  }, []);

  const setSelectedTier = useCallback((t: SelectedTierData) => {
    setTierState(t);
    writeLS('rekindle_selected_tier', t);
  }, []);

  const setAddonCart = useCallback((a: AddonItem[]) => {
    setAddonCartState(a);
    writeLS('rekindle_addon_cart', a);
  }, []);

  const addAIRecommendation = useCallback((r: AIRecommendation) => {
    setAIRecs(prev => {
      const next = [r, ...prev.filter(x => x.id !== r.id)].slice(0, 10);
      writeLS('rekindle_ai_recommendations', next);
      return next;
    });
  }, []);

  const resetBookingFlow = useCallback(() => {
    setStyleState(null);
    setTierState(null);
    setAddonCartState([]);
    setPrefsState(DEFAULT_PREFS);
    setCustomState(DEFAULT_PREFS);
    removeLS('rekindle_selected_style');
    removeLS('rekindle_selected_tier');
    removeLS('rekindle_addon_cart');
    removeLS('rekindle_user_preferences');
    removeLS('rekindle_customizations');
  }, []);

  return (
    <BookingContext.Provider value={{
      preferences, setPreferences,
      selectedStyle, setSelectedStyle,
      selectedTier, setSelectedTier,
      addonCart, setAddonCart,
      aiRecommendations, addAIRecommendation,
      customizations, setCustomizations,
      resetBookingFlow,
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider');
  return ctx;
}
