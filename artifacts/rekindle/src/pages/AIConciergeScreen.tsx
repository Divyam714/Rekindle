import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { ArrowLeft, Sparkles, Send, X, ChevronRight } from 'lucide-react';
import { useBooking, AIRecommendation } from '@/context/BookingContext';
import { getAIRecommendation, getMockFreeFormResponse } from '@/services/geminiService';

interface Message {
  id: string;
  role: 'ai' | 'user';
  type: 'text' | 'recommendation';
  text?: string;
  rec?: { title: string; items: string[]; surprise: string; summary: string };
  ts: string;
  showChips?: boolean;
}

function nowTime() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

const QUICK_REPLIES = [
  'Make it more luxurious ✨',
  'Add a surprise element 🎁',
  'Lower the budget 💰',
  'Add photography 📸',
  'Make it more intimate 🕯️',
  'Outdoor setting 🌿',
];

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, '') ?? '';

async function callRecommendAPI(payload: {
  occasionType: string;
  styleKey: string;
  preferences: Record<string, unknown>;
}): Promise<{ title: string; items: string[]; surprise: string; summary: string }> {
  const resp = await fetch(`${BASE_URL}/api/ai/concierge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, mode: 'recommend' }),
  });
  if (!resp.ok) throw new Error('API error');
  return resp.json() as Promise<{ title: string; items: string[]; surprise: string; summary: string }>;
}

async function streamChatAPI(
  payload: {
    occasionType: string;
    styleKey: string;
    preferences: Record<string, unknown>;
    messages: { role: 'user' | 'assistant'; content: string }[];
  },
  onChunk: (text: string) => void,
  onDone: () => void,
): Promise<void> {
  const resp = await fetch(`${BASE_URL}/api/ai/concierge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, mode: 'chat' }),
  });
  if (!resp.ok || !resp.body) throw new Error('Network error');

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
    for (const line of lines) {
      try {
        const data = JSON.parse(line.slice(6)) as { content?: string; done?: boolean; error?: string };
        if (data.content) onChunk(data.content);
        if (data.done) onDone();
      } catch {
        // ignore parse errors
      }
    }
  }
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3" style={{ background: '#161616', border: '1px solid #2C2C2C', borderRadius: '18px 18px 18px 4px', width: 68 }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          style={{ width: 8, height: 8, borderRadius: '50%', background: '#E8401C' }}
        />
      ))}
    </div>
  );
}

function RecommendationCard({ rec, onPreview, onProceed }: { rec: Message['rec']; onPreview: () => void; onProceed: () => void }) {
  if (!rec) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="p-4"
      style={{ background: '#1A0A0A', border: '1px solid #E8401C', borderRadius: 16, maxWidth: '88%' }}
    >
      <span className="inline-block px-2 py-1 rounded-full text-white font-semibold mb-3" style={{ background: '#E8401C', fontSize: 11 }}>
        ✨ AI Pick — Claude
      </span>
      <p className="font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16 }}>{rec.title}</p>
      <div className="flex flex-col gap-1 mb-3">
        {rec.items.slice(0, 4).map((item, i) => (
          <p key={i} style={{ fontSize: 13, color: '#CCCCCC' }}>• {item}</p>
        ))}
      </div>
      <p style={{ color: '#D4A853', fontSize: 12, marginBottom: 12 }}>{rec.surprise}</p>
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onPreview}
          className="flex-1 font-semibold flex items-center justify-center gap-1 py-2.5 rounded-xl"
          style={{ background: 'rgba(232,64,28,0.12)', color: '#E8401C', fontSize: 13, border: '1px solid rgba(232,64,28,0.3)' }}
        >
          Preview Evening <ChevronRight size={14} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onProceed}
          className="flex-1 font-semibold text-white py-2.5 rounded-xl"
          style={{ background: '#E8401C', fontSize: 13 }}
        >
          Book This →
        </motion.button>
      </div>
    </motion.div>
  );
}

function EveningPreviewModal({ rec, onClose, onProceed }: { rec: NonNullable<Message['rec']>; onClose: () => void; onProceed: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'linear-gradient(180deg, #0A0A0A 0%, #140404 50%, #0A0A0A 100%)' }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 180 + i * 40,
              height: 180 + i * 40,
              background: `radial-gradient(circle, rgba(232,64,28,${0.04 - i * 0.005}) 0%, transparent 70%)`,
              top: `${20 + i * 15}%`,
              left: `${10 + i * 10}%`,
              filter: 'blur(60px)',
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between px-5 pt-14 pb-6 relative z-10">
        <span className="font-semibold uppercase" style={{ color: '#555555', fontSize: 11, letterSpacing: 3 }}>YOUR EVENING PREVIEW</span>
        <button onClick={onClose}><X size={22} color="#AAAAAA" /></button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 22 }}
          className="flex flex-col items-center gap-8 w-full"
        >
          <span style={{ fontSize: 52 }}>🕯️</span>
          <div className="flex flex-col items-center gap-3">
            <p className="text-center font-black text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 28, lineHeight: 1.2 }}>
              {rec.title}
            </p>
            <div style={{ width: 48, height: 3, background: '#E8401C', borderRadius: 2 }} />
          </div>
          <div className="w-full flex flex-col gap-3">
            {rec.items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.1 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8401C', flexShrink: 0 }} />
                <span className="text-white" style={{ fontSize: 14 }}>{item}</span>
              </motion.div>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center italic"
            style={{ color: '#D4A853', fontSize: 14, lineHeight: 1.7, maxWidth: 280 }}
          >
            "{rec.surprise}"
          </motion.p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="px-6 pb-12 flex flex-col gap-3 relative z-10"
      >
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onProceed}
          className="w-full font-bold text-white flex items-center justify-center"
          style={{ fontFamily: 'Poppins, sans-serif', background: '#E8401C', height: 58, borderRadius: 16, fontSize: 16 }}
        >
          Book This Experience →
        </motion.button>
        <button onClick={onClose} style={{ color: '#555555', fontSize: 14, textAlign: 'center' }}>
          Adjust the plan
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function AIConciergeScreen() {
  const [, setLocation] = useLocation();
  const { customizations, selectedStyle, addAIRecommendation } = useBooking();
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const [flowDone, setFlowDone] = useState(false);
  const [latestRec, setLatestRec] = useState<Message['rec'] | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [proceeded, setProceeded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const flowStarted = useRef(false);

  const addMsg = useCallback((msg: Omit<Message, 'id' | 'ts'>) => {
    const full: Message = { ...msg, id: Math.random().toString(36).slice(2), ts: nowTime() };
    setMessages(prev => [...prev, full]);
    return full;
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (flowStarted.current) return;
    flowStarted.current = true;

    const occasionType = selectedStyle?.occasionType ?? 'date_night';
    const styleKey = selectedStyle?.styleKey ?? 'standard';

    const runFlow = async () => {
      await new Promise(r => setTimeout(r, 500));
      addMsg({ role: 'ai', type: 'text', text: "Hi! I'm your REKINDLE Romance Concierge ✨ I've looked at your preferences and I'm crafting something special just for you..." });

      await new Promise(r => setTimeout(r, 2000));
      setTyping(true);

      let result: { title: string; items: string[]; surprise: string; summary: string };
      try {
        result = await callRecommendAPI({ occasionType, styleKey, preferences: customizations as unknown as Record<string, unknown> });
      } catch {
        result = await getAIRecommendation(customizations, styleKey, occasionType);
      }

      setTyping(false);
      setLatestRec(result);

      addMsg({ role: 'ai', type: 'text', text: `Based on what you told me — ${result.summary} — here's what I'd suggest:` });
      await new Promise(r => setTimeout(r, 600));
      addMsg({ role: 'ai', type: 'recommendation', rec: result });
      await new Promise(r => setTimeout(r, 600));
      addMsg({ role: 'ai', type: 'text', text: "Want me to refine anything? Tap a quick option below or type your own request.", showChips: true });

      setFlowDone(true);

      const rec: AIRecommendation = {
        id: Math.random().toString(36).slice(2),
        occasion: occasionType,
        style: styleKey,
        summary: result.summary,
        items: result.items,
        generatedAt: new Date().toISOString(),
      };
      addAIRecommendation(rec);
    };

    runFlow();
  }, [addMsg, customizations, selectedStyle, addAIRecommendation]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !flowDone) return;
    setInput('');
    addMsg({ role: 'user', type: 'text', text: text.trim() });

    const occasionType = selectedStyle?.occasionType ?? 'date_night';
    const styleKey = selectedStyle?.styleKey ?? 'standard';

    const history = messages
      .filter(m => m.type === 'text' && m.text)
      .map(m => ({ role: (m.role === 'ai' ? 'assistant' : 'user') as 'user' | 'assistant', content: m.text! }));
    history.push({ role: 'user', content: text.trim() });

    setTyping(true);

    try {
      const msgId = Math.random().toString(36).slice(2);
      let fullText = '';
      let started = false;

      await streamChatAPI(
        { occasionType, styleKey, preferences: customizations as unknown as Record<string, unknown>, messages: history },
        chunk => {
          fullText += chunk;
          if (!started) {
            started = true;
            setTyping(false);
            setMessages(prev => [...prev, { id: msgId, role: 'ai', type: 'text', text: fullText, ts: nowTime(), showChips: false }]);
          } else {
            setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: fullText } : m));
          }
        },
        () => {
          setMessages(prev => prev.map(m => m.id === msgId ? { ...m, showChips: true } : m));
        },
      );
      if (!started) {
        setTyping(false);
        addMsg({ role: 'ai', type: 'text', text: getMockFreeFormResponse(), showChips: true });
      }
    } catch {
      setTyping(false);
      addMsg({ role: 'ai', type: 'text', text: getMockFreeFormResponse(), showChips: true });
    }
  };

  const handleSend = () => sendMessage(input);
  const handleChip = (chip: string) => sendMessage(chip);

  const handleProceed = () => {
    if (proceeded) return;
    setProceeded(true);
    setLocation('/addon-marketplace');
  };

  return (
    <>
      <div className="fixed inset-0 flex flex-col" style={{ background: '#0A0A0A' }}>
        <div className="flex items-center gap-3 px-4 pt-12 pb-4" style={{ borderBottom: '1px solid #1A1A1A' }}>
          <motion.button whileTap={{ scale: 0.93 }} onClick={() => setLocation(-1 as unknown as string)}>
            <ArrowLeft size={22} color="#FFFFFF" />
          </motion.button>
          <div className="flex items-center gap-3 flex-1 justify-center">
            <motion.div
              animate={{ boxShadow: ['0 0 0px rgba(232,64,28,0)', '0 0 16px rgba(232,64,28,0.5)', '0 0 0px rgba(232,64,28,0)'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center justify-center"
              style={{ width: 40, height: 40, borderRadius: '50%', background: '#E8401C' }}
            >
              <Sparkles size={20} color="#FFFFFF" />
            </motion.div>
            <div>
              <p className="font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14 }}>REKINDLE AI</p>
              <div className="flex items-center gap-1.5">
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2ECC71' }} />
                <p style={{ color: '#2ECC71', fontSize: 11 }}>Claude · Romance Concierge</p>
              </div>
            </div>
          </div>
          <div style={{ width: 22 }} />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {msg.type === 'recommendation' && msg.rec ? (
                  <RecommendationCard
                    rec={msg.rec}
                    onPreview={() => setShowPreview(true)}
                    onProceed={handleProceed}
                  />
                ) : (
                  <div
                    className="px-4 py-3 text-white"
                    style={{
                      maxWidth: '85%',
                      fontSize: 14,
                      lineHeight: 1.6,
                      background: msg.role === 'ai' ? '#161616' : '#E8401C',
                      border: msg.role === 'ai' ? '1px solid #2C2C2C' : 'none',
                      borderRadius: msg.role === 'ai' ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                    }}
                  >
                    {msg.text}
                  </div>
                )}
                <span className="mt-1 px-1" style={{ color: '#555555', fontSize: 10 }}>{msg.ts}</span>

                {msg.showChips && msg.role === 'ai' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap gap-2 mt-2"
                    style={{ maxWidth: '90%' }}
                  >
                    {QUICK_REPLIES.map(chip => (
                      <motion.button
                        key={chip}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleChip(chip)}
                        className="font-medium"
                        style={{
                          background: 'rgba(232,64,28,0.1)',
                          border: '1px solid rgba(232,64,28,0.3)',
                          color: '#E8401C',
                          borderRadius: 20,
                          padding: '6px 12px',
                          fontSize: 12,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {chip}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {typing && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start">
              <TypingIndicator />
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={{ borderTop: '1px solid #1E1E1E' }}>
          {flowDone && (
            <div className="px-4 pt-3">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleProceed}
                className="w-full font-semibold text-white flex items-center justify-center"
                style={{ fontFamily: 'Poppins, sans-serif', background: '#E8401C', height: 48, borderRadius: 14, fontSize: 15 }}
              >
                Proceed to Add-Ons →
              </motion.button>
            </div>
          )}
          <div className="flex items-center gap-3 px-4 py-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about your date..."
              style={{
                flex: 1,
                background: '#1E1E1E',
                border: '1px solid #2C2C2C',
                borderRadius: 24,
                padding: '10px 16px',
                fontSize: 14,
                color: '#FFFFFF',
                outline: 'none',
              }}
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              disabled={!input.trim() || !flowDone}
              className="flex items-center justify-center shrink-0"
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: input.trim() && flowDone ? '#E8401C' : '#222222',
                transition: 'background 0.15s',
                flexShrink: 0,
              }}
            >
              <Send size={18} color="#FFFFFF" />
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPreview && latestRec && (
          <EveningPreviewModal
            rec={latestRec}
            onClose={() => setShowPreview(false)}
            onProceed={handleProceed}
          />
        )}
      </AnimatePresence>
    </>
  );
}
