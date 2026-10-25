import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useParams } from 'wouter';
import { ArrowLeft, Send, CheckCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface ChatMessage {
  id: string;
  role: 'coordinator' | 'user';
  text: string;
  ts: string;
  read: boolean;
}

function now() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

const COORDINATOR_RESPONSES = [
  "Absolutely! I've noted that down. Your evening is going to be perfect. 🌹",
  "Of course! That's completely taken care of. Don't worry about a thing.",
  "Great choice! I'll make sure that's ready for you when you arrive. ✨",
  "Noted! I'm personally handling your setup and will ensure everything is exactly as you imagined.",
  "Beautiful. That personal touch is exactly what makes REKINDLE special. I'm on it! 💫",
  "Consider it done. We'll have everything ready at least 30 minutes before you arrive.",
];

const INITIAL_MESSAGES: Omit<ChatMessage, 'id'>[] = [
  {
    role: 'coordinator',
    text: "Hi! I'm Priya, your dedicated REKINDLE coordinator for this experience. I'm here to ensure everything is absolutely perfect for you. 🌹",
    ts: '—',
    read: true,
  },
  {
    role: 'coordinator',
    text: "I've already started the setup preparation. Is there anything specific you'd like me to focus on or any special touches you want added?",
    ts: '—',
    read: true,
  },
];

export default function CoordinatorChatScreen() {
  const params = useParams<{ bookingId: string }>();
  const [, setLocation] = useLocation();
  const { bookings } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>(
    INITIAL_MESSAGES.map((m, i) => ({ ...m, id: `init-${i}`, ts: now() }))
  );
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const booking = bookings.find(b => b.id === params.bookingId) ?? bookings[0];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
      ts: now(),
      read: false,
    };
    setInput('');
    setMessages(prev => [...prev, userMsg]);

    setIsTyping(true);
    await new Promise(r => setTimeout(r, 1400 + Math.random() * 1000));
    setIsTyping(false);

    const response = COORDINATOR_RESPONSES[Math.floor(Math.random() * COORDINATOR_RESPONSES.length)];
    setMessages(prev => [
      ...prev.map(m => ({ ...m, read: true })),
      {
        id: (Date.now() + 1).toString(),
        role: 'coordinator',
        text: response,
        ts: now(),
        read: true,
      },
    ]);
  };

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#0A0A0A' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pt-12 pb-4"
        style={{ borderBottom: '1px solid #1A1A1A' }}
      >
        <motion.button whileTap={{ scale: 0.93 }} onClick={() => setLocation('/bookings')}>
          <ArrowLeft size={22} color="#FFFFFF" />
        </motion.button>

        <div className="flex items-center gap-3 flex-1">
          {/* Coordinator avatar */}
          <div
            className="flex items-center justify-center font-black text-white"
            style={{ width: 40, height: 40, borderRadius: '50%', background: '#E8401C', fontSize: 16, fontFamily: 'Poppins, sans-serif', flexShrink: 0 }}
          >
            P
          </div>
          <div>
            <p className="font-bold text-white" style={{ fontSize: 15 }}>Priya — Your Coordinator</p>
            <div className="flex items-center gap-1.5">
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#2ECC71' }} />
              <p style={{ color: '#2ECC71', fontSize: 11, fontWeight: 600 }}>Online · Usually replies in 2 min</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking context banner */}
      {booking && (
        <div className="px-4 py-3" style={{ background: 'rgba(232,64,28,0.05)', borderBottom: '1px solid #1A1A1A' }}>
          <p style={{ color: '#AAAAAA', fontSize: 12 }}>
            📅 {booking.packageName} · {booking.date} · {booking.time}
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 no-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
            >
              {msg.role === 'coordinator' && (
                <div
                  className="flex items-center justify-center font-black text-white shrink-0"
                  style={{ width: 30, height: 30, borderRadius: '50%', background: '#E8401C', fontSize: 12, alignSelf: 'flex-end' }}
                >
                  P
                </div>
              )}
              <div className="flex flex-col" style={{ maxWidth: '78%', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div
                  className="px-4 py-3"
                  style={{
                    background: msg.role === 'user' ? '#E8401C' : '#161616',
                    border: msg.role === 'coordinator' ? '1px solid #2C2C2C' : 'none',
                    borderRadius: msg.role === 'coordinator' ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
                    color: '#FFFFFF',
                    fontSize: 14,
                    lineHeight: 1.6,
                  }}
                >
                  {msg.text}
                </div>
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span style={{ color: '#555555', fontSize: 10 }}>{msg.ts}</span>
                  {msg.role === 'user' && <CheckCheck size={12} color={msg.read ? '#2ECC71' : '#555555'} />}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <div
              className="flex items-center justify-center font-black text-white"
              style={{ width: 30, height: 30, borderRadius: '50%', background: '#E8401C', fontSize: 12, flexShrink: 0 }}
            >
              P
            </div>
            <div className="flex items-center gap-1.5 px-4 py-3" style={{ background: '#161616', border: '1px solid #2C2C2C', borderRadius: '4px 18px 18px 18px' }}>
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  style={{ width: 7, height: 7, borderRadius: '50%', background: '#E8401C' }}
                />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ borderTop: '1px solid #1A1A1A' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Message your coordinator..."
          maxLength={500}
          style={{
            flex: 1,
            background: '#1E1E1E',
            border: '1px solid #2C2C2C',
            borderRadius: 24,
            padding: '12px 18px',
            fontSize: 14,
            color: '#FFFFFF',
            outline: 'none',
          }}
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
          disabled={!input.trim()}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: input.trim() ? '#E8401C' : '#222222',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
        >
          <Send size={18} color="#FFFFFF" />
        </motion.button>
      </div>
    </div>
  );
}
