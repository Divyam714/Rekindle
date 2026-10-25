import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "wouter";
import { AppProvider } from "@/context/AppContext";
import { BookingProvider } from "@/context/BookingContext";
import BottomNav from "@/components/BottomNav";
import OfflineBanner from "@/components/OfflineBanner";
import { RootErrorBoundary, ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "sonner";

import SplashScreen from "@/pages/SplashScreen";
import OnboardingScreen from "@/pages/OnboardingScreen";
import LoginScreen from "@/pages/LoginScreen";
import HomeScreen from "@/pages/HomeScreen";
import PackageDetailScreen from "@/pages/PackageDetailScreen";
import BookingFlow from "@/pages/BookingFlow";
import BookingConfirmation from "@/pages/BookingConfirmation";
import MyBookingsScreen from "@/pages/MyBookingsScreen";
import WishlistScreen from "@/pages/WishlistScreen";
import ReferralScreen from "@/pages/ReferralScreen";
import ProfileScreen from "@/pages/ProfileScreen";
import SettingsScreen from "@/pages/SettingsScreen";

const StyleSelectScreen = lazy(() => import("@/pages/StyleSelectScreen"));
const CustomizationScreen = lazy(() => import("@/pages/CustomizationScreen"));
const AIConciergeScreen = lazy(() => import("@/pages/AIConciergeScreen"));
const AddonMarketplaceScreen = lazy(() => import("@/pages/AddonMarketplaceScreen"));
const TierSelectScreen = lazy(() => import("@/pages/TierSelectScreen"));
const OccasionRemindersScreen = lazy(() => import("@/pages/OccasionRemindersScreen"));
const ShareableCardScreen = lazy(() => import("@/pages/ShareableCardScreen"));
const OurStoryScreen = lazy(() => import("@/pages/OurStoryScreen"));
const CountdownScreen = lazy(() => import("@/pages/CountdownScreen"));
const MembershipScreen = lazy(() => import("@/pages/MembershipScreen"));
const DiscoverScreen = lazy(() => import("@/pages/DiscoverScreen"));
const CoordinatorChatScreen = lazy(() => import("@/pages/CoordinatorChatScreen"));

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.22, ease: "easeOut" }}
    className="w-full"
  >
    {children}
  </motion.div>
);

const ScreenFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#0A0A0A" }}>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #1E1E1E", borderTopColor: "#E8401C" }}
    />
  </div>
);

function AppRoutes() {
  const [location] = useLocation();

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100svh" }}>
      <OfflineBanner />
      <AnimatePresence mode="wait">
        <Switch key={location} location={location}>
          <Route path="/">
            <PageTransition><SplashScreen /></PageTransition>
          </Route>
          <Route path="/onboarding">
            <PageTransition><OnboardingScreen /></PageTransition>
          </Route>
          <Route path="/login">
            <PageTransition><LoginScreen /></PageTransition>
          </Route>
          <Route path="/home">
            <ErrorBoundary section="Home">
              <PageTransition><HomeScreen /></PageTransition>
            </ErrorBoundary>
          </Route>
          <Route path="/package/:id">
            {() => (
              <ErrorBoundary section="Package">
                <PageTransition><PackageDetailScreen /></PageTransition>
              </ErrorBoundary>
            )}
          </Route>
          <Route path="/style-select/:occasionType">
            {() => (
              <ErrorBoundary section="Style Select">
                <Suspense fallback={<ScreenFallback />}>
                  <StyleSelectScreen />
                </Suspense>
              </ErrorBoundary>
            )}
          </Route>
          <Route path="/customize/:occasionType/:style">
            {() => (
              <ErrorBoundary section="Customize">
                <Suspense fallback={<ScreenFallback />}>
                  <CustomizationScreen />
                </Suspense>
              </ErrorBoundary>
            )}
          </Route>
          <Route path="/ai-concierge">
            <ErrorBoundary section="AI Concierge">
              <Suspense fallback={<ScreenFallback />}>
                <AIConciergeScreen />
              </Suspense>
            </ErrorBoundary>
          </Route>
          <Route path="/addon-marketplace">
            <ErrorBoundary section="Add-ons">
              <Suspense fallback={<ScreenFallback />}>
                <AddonMarketplaceScreen />
              </Suspense>
            </ErrorBoundary>
          </Route>
          <Route path="/tier-select/:occasionType">
            {() => (
              <ErrorBoundary section="Tier Select">
                <Suspense fallback={<ScreenFallback />}>
                  <TierSelectScreen />
                </Suspense>
              </ErrorBoundary>
            )}
          </Route>
          <Route path="/occasion-reminders">
            <ErrorBoundary section="Occasion Reminders">
              <Suspense fallback={<ScreenFallback />}>
                <OccasionRemindersScreen />
              </Suspense>
            </ErrorBoundary>
          </Route>
          <Route path="/share-card">
            <ErrorBoundary section="Share Card">
              <Suspense fallback={<ScreenFallback />}>
                <ShareableCardScreen />
              </Suspense>
            </ErrorBoundary>
          </Route>
          <Route path="/our-story">
            <ErrorBoundary section="Our Story">
              <Suspense fallback={<ScreenFallback />}>
                <OurStoryScreen />
              </Suspense>
            </ErrorBoundary>
          </Route>
          <Route path="/countdown">
            <ErrorBoundary section="Countdown">
              <Suspense fallback={<ScreenFallback />}>
                <CountdownScreen />
              </Suspense>
            </ErrorBoundary>
          </Route>
          <Route path="/membership">
            <ErrorBoundary section="Membership">
              <Suspense fallback={<ScreenFallback />}>
                <MembershipScreen />
              </Suspense>
            </ErrorBoundary>
          </Route>
          <Route path="/discover">
            <ErrorBoundary section="Discover">
              <Suspense fallback={<ScreenFallback />}>
                <DiscoverScreen />
              </Suspense>
            </ErrorBoundary>
          </Route>
          <Route path="/coordinator-chat/:bookingId">
            {() => (
              <ErrorBoundary section="Coordinator Chat">
                <Suspense fallback={<ScreenFallback />}>
                  <CoordinatorChatScreen />
                </Suspense>
              </ErrorBoundary>
            )}
          </Route>
          <Route path="/book/:packageId">
            {() => (
              <ErrorBoundary section="Booking">
                <PageTransition><BookingFlow /></PageTransition>
              </ErrorBoundary>
            )}
          </Route>
          <Route path="/confirmation">
            <PageTransition><BookingConfirmation /></PageTransition>
          </Route>
          <Route path="/bookings">
            <ErrorBoundary section="My Bookings">
              <PageTransition><MyBookingsScreen /></PageTransition>
            </ErrorBoundary>
          </Route>
          <Route path="/wishlist">
            <ErrorBoundary section="Wishlist">
              <PageTransition><WishlistScreen /></PageTransition>
            </ErrorBoundary>
          </Route>
          <Route path="/referral">
            <PageTransition><ReferralScreen /></PageTransition>
          </Route>
          <Route path="/profile">
            <ErrorBoundary section="Profile">
              <PageTransition><ProfileScreen /></PageTransition>
            </ErrorBoundary>
          </Route>
          <Route path="/settings">
            <PageTransition><SettingsScreen /></PageTransition>
          </Route>
          <Route>
            <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#0A0A0A" }}>
              <p className="text-white text-xl font-bold">404 — Page not found</p>
            </div>
          </Route>
        </Switch>
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <RootErrorBoundary>
      <AppProvider>
        <Toaster theme="dark" position="top-center" />
        <BookingProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRoutes />
          </WouterRouter>
        </BookingProvider>
      </AppProvider>
    </RootErrorBoundary>
  );
}

export default App;
