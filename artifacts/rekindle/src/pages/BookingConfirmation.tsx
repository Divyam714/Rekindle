import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { CheckCircle, Calendar, Share2, MessageCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface LastBooking {
  id: string;
  packageId: string;
  packageName: string;
  date: string;
  total: number;
}

function CanvasConfetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#E8401C', '#D4A853', '#FFFFFF', '#FF6B35', '#FFD700', '#FF8C5A'];
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 120,
      w: Math.random() * 10 + 4,
      h: Math.random() * 14 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 3.5,
      vy: Math.random() * 4 + 1.5,
      rot: Math.random() * 360,
      vrot: (Math.random() - 0.5) * 7,
      alpha: 1,
    }));

    let frame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.rot += p.vrot;
        if (p.y > canvas.height - 80) p.alpha = Math.max(0, p.alpha - 0.025);
        if (p.y < canvas.height) alive = true;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (alive) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 100 }}
    />
  );
}

function SlotMachineId({ bookingId }: { bookingId: string }) {
  const prefix = 'RKL-';
  const digits = bookingId.replace('RKL-', '').split('');
  const [displayed, setDisplayed] = useState(digits.map(() => '0'));

  useEffect(() => {
    digits.forEach((target, i) => {
      let count = 0;
      const interval = setInterval(() => {
        setDisplayed(prev => {
          const next = [...prev];
          next[i] = String(Math.floor(Math.random() * 10));
          return next;
        });
        count++;
        if (count > 8 + i * 3) {
          clearInterval(interval);
          setDisplayed(prev => {
            const next = [...prev];
            next[i] = target;
            return next;
          });
        }
      }, 80);
    });
  }, []);

  return (
    <div className="flex items-center justify-center">
      <span className="font-bold" style={{ color: '#AAAAAA', fontSize: 26, fontFamily: 'monospace' }}>{prefix}</span>
      {displayed.map((d, i) => (
        <span key={i} className="font-bold text-white" style={{ fontSize: 26, fontFamily: 'monospace', letterSpacing: 4 }}>{d}</span>
      ))}
    </div>
  );
}

function CountdownTimer({ dateStr }: { dateStr: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0 });

  useEffect(() => {
    const calculate = () => {
      try {
        const parts = dateStr.split('/');
        let target: Date;
        if (parts.length === 3) {
          const [day, month, year] = parts;
          target = new Date(Number(year), Number(month) - 1, Number(day), 19, 0, 0);
        } else {
          target = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T19:00:00`);
        }
        const diff = target.getTime() - Date.now();
        if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, mins: 0 }); return; }
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        });
      } catch {
        setTimeLeft({ days: 0, hours: 0, mins: 0 });
      }
    };
    calculate();
    const id = setInterval(calculate, 60_000);
    return () => clearInterval(id);
  }, [dateStr]);

  const units = [
    { val: timeLeft.days, label: 'DAYS' },
    { val: timeLeft.hours, label: 'HRS' },
    { val: timeLeft.mins, label: 'MINS' },
  ];

  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.mins === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.9 }}
      className="w-full"
    >
      <p className="uppercase text-center mb-3" style={{ color: '#555555', fontSize: 10, letterSpacing: 3 }}>COUNTDOWN TO YOUR MOMENT</p>
      <div className="flex gap-3 w-full">
        {units.map(({ val, label }) => (
          <div key={label} className="flex-1 flex flex-col items-center py-4 rounded-xl" style={{ background: '#161616', border: '1px solid #222222' }}>
            <span className="font-black text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 32 }}>{String(val).padStart(2, '0')}</span>
            <span style={{ color: '#555555', fontSize: 10, letterSpacing: 2 }}>{label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function downloadICS(booking: LastBooking) {
  try {
    const parts = booking.date.split('/');
    let dateFormatted: string;
    if (parts.length === 3) {
      const [day, month, year] = parts;
      dateFormatted = `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}`;
    } else {
      dateFormatted = booking.date.replace(/-/g, '').slice(0, 8);
    }
    const content = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//REKINDLE//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${booking.id}@rekindle.in`,
      `DTSTART:${dateFormatted}T190000`,
      `DTEND:${dateFormatted}T230000`,
      `SUMMARY:${booking.packageName} — REKINDLE`,
      `DESCRIPTION:Your REKINDLE experience is confirmed! Booking ID: ${booking.id}. Your coordinator will contact you on WhatsApp 48 hours before.`,
      'LOCATION:Patna\\, Bihar\\, India',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekindle-${booking.id}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('ICS download error', e);
  }
}

export default function BookingConfirmation() {
  const [, setLocation] = useLocation();
  const { loyaltyTier, bookings } = useApp();
  const [calAdded, setCalAdded] = useState(false);

  const lastBooking = ((): LastBooking | null => {
    try {
      return JSON.parse(localStorage.getItem('rekindle_last_booking') || 'null') as LastBooking | null;
    } catch { return null; }
  })();

  const bookingId = lastBooking?.id || 'RKL-000001';
  const whatsappMsg = encodeURIComponent(
    `🎉 Just booked REKINDLE!\n\n*${lastBooking?.packageName}* on ${lastBooking?.date}\nBooking ID: ${bookingId}\n\nJoin me at rekindle.in 💑`
  );

  const isFirstBooking = bookings.length === 1;
  const justUnlockedGold = loyaltyTier === 'gold' && bookings.length === 2;

  const handleCalendar = () => {
    if (!lastBooking) return;
    downloadICS(lastBooking);
    setCalAdded(true);
  };

  return (
    <div
      data-testid="booking-confirmation"
      className="fixed inset-0 flex flex-col items-center overflow-y-auto"
      style={{ background: '#0A0A0A' }}
    >
      <CanvasConfetti />

      <div className="flex flex-col items-center gap-5 px-5 pt-20 pb-12 w-full max-w-md relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.5 }}
        >
          <CheckCircle size={88} color="#2ECC71" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="font-black text-white text-center"
          style={{ fontFamily: 'Poppins, sans-serif', fontSize: 28 }}
        >
          Booking Confirmed!
        </motion.h1>

        {(isFirstBooking || justUnlockedGold) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0 }}
            className="w-full px-4 py-3 rounded-2xl flex items-center gap-3"
            style={{
              background: justUnlockedGold
                ? 'linear-gradient(135deg, rgba(212,168,83,0.12), rgba(212,168,83,0.05))'
                : 'rgba(232,64,28,0.08)',
              border: `1px solid ${justUnlockedGold ? '#D4A853' : '#E8401C'}`,
            }}
          >
            <span style={{ fontSize: 28 }}>{justUnlockedGold ? '🥇' : '🌟'}</span>
            <div>
              <p className="font-bold" style={{ color: justUnlockedGold ? '#D4A853' : '#E8401C', fontSize: 14 }}>
                {justUnlockedGold ? 'REKINDLE Gold Unlocked!' : 'Welcome, REKINDLE Member!'}
              </p>
              <p style={{ color: '#AAAAAA', fontSize: 12 }}>
                {justUnlockedGold ? 'You now get 5% credit on every booking' : "You've created your first perfect moment"}
              </p>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="uppercase font-semibold" style={{ color: '#555555', fontSize: 10, letterSpacing: 3 }}>BOOKING ID</span>
          <SlotMachineId bookingId={bookingId} />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 48 }}
            transition={{ delay: 1.3, duration: 0.4 }}
            style={{ height: 2, background: '#E8401C', borderRadius: 1 }}
          />
        </motion.div>

        {lastBooking && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="w-full p-5 flex flex-col gap-3"
            style={{ background: '#161616', borderRadius: 20, border: '1px solid #222222' }}
          >
            <p className="font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 17 }}>{lastBooking.packageName}</p>
            <div className="flex items-center gap-2">
              <Calendar size={14} color="#AAAAAA" />
              <p style={{ color: '#AAAAAA', fontSize: 14 }}>{lastBooking.date}</p>
            </div>
            <p className="font-bold" style={{ color: '#2ECC71', fontSize: 15 }}>₹{lastBooking.total.toLocaleString('en-IN')} paid</p>
          </motion.div>
        )}

        {lastBooking && <CountdownTimer dateStr={lastBooking.date} />}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.1 }}
          className="grid grid-cols-3 gap-2 w-full"
        >
          <motion.button
            data-testid="button-add-calendar"
            whileTap={{ scale: 0.96 }}
            onClick={handleCalendar}
            className="flex flex-col items-center gap-1.5 py-4 rounded-xl font-semibold"
            style={{ background: '#161616', color: calAdded ? '#2ECC71' : '#FFFFFF', fontSize: 12, border: '1px solid #222222' }}
          >
            <Calendar size={20} color={calAdded ? '#2ECC71' : '#FFFFFF'} />
            {calAdded ? 'Added ✓' : 'Add to Cal'}
          </motion.button>
          <a
            data-testid="button-whatsapp-share"
            href={`https://wa.me/?text=${whatsappMsg}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-1.5 py-4 rounded-xl font-semibold"
            style={{ background: '#161616', color: '#25D366', fontSize: 12, border: '1px solid #222222', textDecoration: 'none' }}
          >
            <MessageCircle size={20} color="#25D366" />
            Share
          </a>
          <motion.button
            data-testid="button-share-card"
            whileTap={{ scale: 0.96 }}
            onClick={() => setLocation(`/share-card?id=${bookingId}&name=${encodeURIComponent(lastBooking?.packageName || '')}&date=${encodeURIComponent(lastBooking?.date || '')}`)}
            className="flex flex-col items-center gap-1.5 py-4 rounded-xl font-semibold"
            style={{ background: '#161616', color: '#D4A853', fontSize: 12, border: '1px solid #222222' }}
          >
            <Share2 size={20} color="#D4A853" />
            Card
          </motion.button>
        </motion.div>

        <motion.button
          data-testid="button-view-booking"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.3 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setLocation('/bookings')}
          className="w-full font-bold text-white flex items-center justify-center"
          style={{ fontFamily: 'Poppins, sans-serif', background: '#E8401C', height: 58, borderRadius: 16, fontSize: 16 }}
        >
          View My Booking →
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5 }}
          className="w-full p-4 flex items-start gap-3"
          style={{ background: 'rgba(37,211,102,0.06)', borderLeft: '3px solid #25D366', borderRadius: 14 }}
        >
          <span style={{ fontSize: 22 }}>💬</span>
          <div className="flex-1">
            <p className="text-white" style={{ fontSize: 13, lineHeight: 1.6 }}>Your REKINDLE coordinator will contact you on WhatsApp 48 hours before your experience.</p>
            <a
              data-testid="button-open-whatsapp"
              href="https://wa.me/917870000000"
              target="_blank"
              rel="noreferrer"
              className="font-semibold mt-2 block"
              style={{ color: '#25D366', fontSize: 13 }}
            >
              Open WhatsApp →
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
