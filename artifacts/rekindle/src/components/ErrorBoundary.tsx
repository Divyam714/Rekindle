import { Component, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  section?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function DefaultFallback({ onReload, section }: { onReload: () => void; section?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[200px] px-6 py-10 text-center"
      style={{ background: '#0A0A0A' }}
    >
      <div
        className="flex items-center justify-center mb-4"
        style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(232,64,28,0.1)' }}
      >
        <span style={{ fontSize: 28 }}>⚠️</span>
      </div>
      <p className="font-black text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 18 }}>
        REKINDLE
      </p>
      <p className="mb-1 font-semibold" style={{ color: '#AAAAAA', fontSize: 14 }}>
        Something went wrong{section ? ` in ${section}` : ''}.
      </p>
      <p className="mb-6" style={{ color: '#555555', fontSize: 13 }}>
        We're on it — try reloading this section.
      </p>
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onReload}
        className="font-bold text-white px-6 py-3 rounded-2xl"
        style={{ background: '#E8401C', fontSize: 14 }}
      >
        Reload
      </motion.button>
    </motion.div>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[REKINDLE]', error.message, info.componentStack?.slice(0, 300));
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <DefaultFallback
          onReload={this.handleReload}
          section={this.props.section}
        />
      );
    }
    return this.props.children;
  }
}

export function RootErrorFallback({ onReload }: { onReload: () => void }) {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-8"
      style={{ background: '#0A0A0A' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-5 text-center"
      >
        <div
          className="flex items-center justify-center"
          style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(232,64,28,0.1)', border: '1px solid rgba(232,64,28,0.2)' }}
        >
          <span style={{ fontSize: 36 }}>🔥</span>
        </div>
        <p className="font-black text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 32, letterSpacing: 4 }}>
          REKINDLE
        </p>
        <div>
          <p className="font-semibold mb-1" style={{ color: '#AAAAAA', fontSize: 16 }}>Something went wrong</p>
          <p style={{ color: '#555555', fontSize: 13, lineHeight: 1.6 }}>
            We're fixing it. Please reload the app.
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onReload}
          className="font-bold text-white px-8 py-4 rounded-2xl"
          style={{ fontFamily: 'Poppins, sans-serif', background: '#E8401C', fontSize: 16 }}
        >
          Reload App
        </motion.button>
      </motion.div>
    </div>
  );
}

export class RootErrorBoundary extends Component<{ children: ReactNode }, State> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('[REKINDLE Root]', error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <RootErrorFallback
          onReload={() => {
            this.setState({ hasError: false, error: null });
            window.location.href = '/';
          }}
        />
      );
    }
    return this.props.children;
  }
}
