import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { ArrowLeft, Download, MessageCircle } from 'lucide-react';

function getParam(search: string, key: string) {
  try {
    const params = new URLSearchParams(search);
    return params.get(key) || '';
  } catch { return ''; }
}

function generateCard(name: string, date: string): Promise<string> {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas');
    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0A0A0A');
    bg.addColorStop(0.45, '#140505');
    bg.addColorStop(1, '#0A0A0A');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 18; i++) {
      const bx = Math.random() * W;
      const by = Math.random() * H;
      const br = Math.random() * 180 + 60;
      const bokeh = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      const alpha = 0.04 + Math.random() * 0.04;
      bokeh.addColorStop(0, `rgba(232,64,28,${alpha})`);
      bokeh.addColorStop(0.5, `rgba(212,168,83,${alpha * 0.4})`);
      bokeh.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bokeh;
      ctx.fillRect(0, 0, W, H);
    }

    ctx.font = 'bold 72px Georgia, serif';
    ctx.fillStyle = '#E8401C';
    ctx.textAlign = 'left';
    ctx.fillText('REKINDLE', 80, 200);

    ctx.fillStyle = '#E8401C';
    ctx.fillRect(80, 224, 180, 4);

    ctx.font = '36px Georgia, serif';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillText('CURATED DATE EXPERIENCES', 80, 280);

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(60, H * 0.38, W - 120, H * 0.38, 40);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'italic 52px Georgia, serif';
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.textAlign = 'center';
    ctx.fillText('Something special', W / 2, H * 0.44);
    ctx.fillText('is happening', W / 2, H * 0.44 + 68);

    ctx.font = 'bold 84px Georgia, serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';

    const words = name.split(' ');
    let line = '';
    let y = H * 0.52;
    const maxWidth = W - 200;
    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line.trim(), W / 2, y);
        line = word + ' ';
        y += 100;
      } else { line = test; }
    }
    ctx.fillText(line.trim(), W / 2, y);

    ctx.fillStyle = '#D4A853';
    ctx.fillRect(W / 2 - 60, y + 40, 120, 4);

    if (date) {
      ctx.font = '52px Georgia, serif';
      ctx.fillStyle = '#D4A853';
      ctx.fillText(date, W / 2, y + 110);
    }

    ctx.font = '40px Georgia, serif';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('Something special is happening', W / 2, H - 120);

    ctx.font = 'bold 32px Georgia, serif';
    ctx.fillStyle = '#E8401C';
    ctx.fillText('rekindle.in', W / 2, H - 60);

    resolve(canvas.toDataURL('image/jpeg', 0.92));
  });
}

export default function ShareableCardScreen() {
  const [location, setLocation] = useLocation();
  const [cardDataUrl, setCardDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloaded, setDownloaded] = useState(false);

  const search = location.includes('?') ? location.split('?')[1] : '';
  const name = getParam('?' + search, 'name') || 'REKINDLE Experience';
  const date = getParam('?' + search, 'date') || '';
  const id = getParam('?' + search, 'id') || '';

  useEffect(() => {
    setLoading(true);
    generateCard(name, date).then(url => {
      setCardDataUrl(url);
      setLoading(false);
    });
  }, [name, date]);

  const handleDownload = () => {
    if (!cardDataUrl) return;
    const a = document.createElement('a');
    a.href = cardDataUrl;
    a.download = `rekindle-${id || 'experience'}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`🌹 Something special is happening!\n\n*${name}*${date ? `\n📅 ${date}` : ''}\n\nBooked with REKINDLE — rekindle.in 💑`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#0A0A0A' }}>
      <div className="flex items-center gap-3 px-4 pt-12 pb-4">
        <motion.button whileTap={{ scale: 0.93 }} onClick={() => setLocation('/confirmation')}>
          <ArrowLeft size={22} color="#FFFFFF" />
        </motion.button>
        <div className="flex-1">
          <p className="font-black text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 18 }}>Your Experience Card</p>
          <p style={{ color: '#555555', fontSize: 12 }}>Share your special moment</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #2C2C2C', borderTopColor: '#E8401C' }}
            />
            <p style={{ color: '#AAAAAA', fontSize: 14 }}>Crafting your card...</p>
          </div>
        ) : cardDataUrl ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            className="w-full flex flex-col items-center gap-5"
          >
            <img
              src={cardDataUrl}
              alt="Shareable card"
              className="rounded-3xl shadow-2xl"
              style={{ width: '100%', maxWidth: 320, aspectRatio: '9/16', objectFit: 'cover' }}
            />
            <p className="text-center" style={{ color: '#555555', fontSize: 13 }}>Your 1080×1920 card is ready to share</p>
          </motion.div>
        ) : null}
      </div>

      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="px-5 pb-10 flex flex-col gap-3"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleDownload}
            className="w-full font-bold text-white flex items-center justify-center gap-2"
            style={{
              fontFamily: 'Poppins, sans-serif',
              background: downloaded ? '#2ECC71' : '#E8401C',
              height: 56,
              borderRadius: 16,
              fontSize: 15,
              transition: 'background 0.3s',
            }}
          >
            <Download size={18} color="#FFFFFF" />
            {downloaded ? 'Downloaded! ✓' : 'Download Card'}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleWhatsApp}
            className="w-full font-bold flex items-center justify-center gap-2"
            style={{
              fontFamily: 'Poppins, sans-serif',
              background: '#25D366',
              color: '#FFFFFF',
              height: 56,
              borderRadius: 16,
              fontSize: 15,
            }}
          >
            <MessageCircle size={18} color="#FFFFFF" />
            Share on WhatsApp
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
