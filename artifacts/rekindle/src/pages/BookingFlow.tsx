
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useParams } from 'wouter';
import { ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import { PACKAGES } from '@/data/packages';
import { useApp } from '@/context/AppContext';
import { useBooking } from '@/context/BookingContext';
import { syncUserOrder, syncUserLogin } from '@/services/userService';

type Step = 1 | 2 | 3;

const STEP_FEE = 99;

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '').replace(/[<>]/g, '');
}

function getTodayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function BookingFlow() {
  const params = useParams<{ packageId: string }>();
  const [, setLocation] = useLocation();
  const { addBooking, user } = useApp();
  const { selectedTier, addonCart, resetBookingFlow } = useBooking();

  const rawId = params.packageId ?? '';
  const pkg = PACKAGES.find(p => p.id === rawId)
    ?? PACKAGES.find(p => (p as typeof p & { occasionType?: string }).occasionType === rawId)
    ?? PACKAGES.find(p => p.id === rawId.replace(/_/g, '-'));

  const [step, setStep] = useState<Step>(1);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [name, setName] = useState(user?.name || '');
  
  // Extract just the 10 digits for the input field
  const [whatsapp, setWhatsapp] = useState(
    user?.phone ? user.phone.replace(/\D/g, '').slice(-10) : ''
  );
  
  const [date, setDate] = useState('');
  const [time, setTime] = useState('7 PM');
  const [partnerName, setPartnerName] = useState('');
  const [surpriseType, setSurpriseType] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [nameError, setNameError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [dateIsPast, setDateIsPast] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [paying, setPaying] = useState(false);

  if (!pkg) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0A0A0A' }}>
        <p className="text-white">Package not found</p>
      </div>
    );
  }

  const useTier = selectedTier && selectedTier.occasionType === ((pkg as typeof pkg & { occasionType?: string }).occasionType ?? pkg.id.replace(/-/g, '_'));
  type NormalizedAddon = { id: string; name: string; price: number };
  const addOnItems: NormalizedAddon[] = useTier
    ? selectedTier!.addOns.map(a => ({ id: a.id, name: a.label, price: a.price }))
    : pkg.addOns.filter(a => selectedAddOns.includes(a.id));
  const addOnTotal = addOnItems.reduce((s, a) => s + a.price, 0);
  const basePrice = useTier ? selectedTier!.basePrice : pkg.price;
  const total = useTier ? selectedTier!.totalPrice : pkg.price + addOnTotal + STEP_FEE;

  const handleBack = () => {
    if (step === 1) setLocation(`/package/${pkg.id}`);
    else setStep((s) => (s - 1) as Step);
  };

  const handleStep1Continue = () => setStep(2);

  const handleDateChange = (val: string) => {
    setDate(val);
    setDateError(false);
    setDateIsPast(false);
  };

  const handleStep2Continue = () => {
    let err = false;
    if (!name.trim()) { setNameError(true); err = true; }
    if (!whatsapp.trim() || whatsapp.length < 10) { setPhoneError(true); err = true; }
    if (!date) { setDateError(true); err = true; }
    else if (date < getTodayString()) { setDateIsPast(true); setDateError(true); err = true; }
    if (err) { setShakeKey(k => k + 1); return; }
    setStep(3);
  };

  const handlePay = async () => {
    if (paying) return;
    setPaying(true);
    try {
      // 1. Ensure exact phone string match with DB to prevent UPDATE failures
      const currentDigits = user?.phone ? user.phone.replace(/\D/g, '').slice(-10) : '';
      const cleanPhone = (user?.phone && whatsapp === currentDigits) 
        ? user.phone 
        : `+91 ${whatsapp}`; // Standardized fallback formatting

      const chosenTier = selectedTier?.tier ? selectedTier.tier.charAt(0).toUpperCase() + selectedTier.tier.slice(1) : (pkg.name || 'Standard');
      const chosenOccasion = pkg.occasion || surpriseType || 'General';

      // 2. Automate pushing order and plan details directly to Neon DB
      try {
        // Safety net: Upsert the user first in case they bypassed login or changed their number
        await syncUserLogin(cleanPhone, name);
        // Safely update tier and occasion now that we guarantee the user exists
        await syncUserOrder(cleanPhone, chosenTier, chosenOccasion);
      } catch (dbErr) {
        console.warn('Could not sync user order to Neon DB:', dbErr);
      }

      // Simulate payment delay
      await new Promise(r => setTimeout(r, 1800));

      const bookingId = 'RKL-' + Math.floor(100000 + Math.random() * 900000);
      const cleanName = stripHtml(name.trim()).slice(0, 80);
      const cleanPartnerName = stripHtml(partnerName.trim()).slice(0, 80);
      const cleanRequests = stripHtml(specialRequests.trim()).slice(0, 500);

      addBooking({
        id: bookingId,
        packageId: pkg.id,
        packageName: pkg.name,
        date,
        time,
        partnerName: cleanPartnerName,
        surpriseType,
        specialRequests: cleanRequests,
        addOns: addOnItems.map(a => ({ id: a.id, name: a.name, price: a.price })),
        total,
        status: 'UPCOMING',
        createdAt: Date.now(),
        imageUrl: pkg.thumbImage,
        ...(useTier ? { tier: selectedTier!.tier } : {}),
      });

      localStorage.setItem('rekindle_last_booking', JSON.stringify({
        id: bookingId,
        packageId: pkg.id,
        packageName: pkg.name,
        name: cleanName,
        phone: cleanPhone,
        date,
        total,
        tier: chosenTier,
        occasion: chosenOccasion,
      }));

      resetBookingFlow();
      setLocation('/confirmation');
    } catch {
      setPaying(false);
    }
  };

  const progressColor = (s: number) => {
    if (s < step) return '#2ECC71';
    if (s === step) return '#E8401C';
    return '#1E1E1E';
  };

  const todayStr = getTodayString();

  return (
    <div data-testid="booking-flow" className="fixed inset-0 flex flex-col overflow-hidden" style={{ background: '#0A0A0A' }}>
      {/* Progress Header */}
      <div className="px-4 pt-12 pb-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <motion.button
            data-testid="button-booking-back"
            whileTap={{ scale: 0.96 }}
            onClick={handleBack}
          >
            <ArrowLeft size={22} color="#FFFFFF" />
          </motion.button>
          <div className="flex-1 flex items-center gap-1">
            {[1, 2, 3].map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className="flex items-center justify-center rounded-full shrink-0"
                  style={{ width: 28, height: 28, background: progressColor(s), border: `2px solid ${progressColor(s)}` }}
                >
                  {s < step ? (
                    <CheckCircle size={16} color="#0A0A0A" />
                  ) : (
                    <span className="font-bold" style={{ fontSize: 12, color: s === step ? '#FFFFFF' : '#555555' }}>{s}</span>
                  )}
                </div>
                {i < 2 && (
                  <div
                    className="flex-1 h-0.5 mx-1"
                    style={{ background: s < step ? '#2ECC71' : '#1E1E1E', transition: 'background 0.3s' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <AnimatePresence mode="wait">
          {/* STEP 1 */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }} className="flex flex-col gap-5">
              <h2 className="font-bold text-white" style={{ fontSize: 22 }}>Review your booking</h2>

              <div className="flex gap-3 items-center p-4 rounded-2xl" style={{ background: '#161616', border: '1px solid #222222' }}>
                <img src={pkg.thumbImage} alt={pkg.name} className="object-cover rounded-xl shrink-0" style={{ width: 72, height: 72, background: '#1E1E1E' }} loading="lazy" />
                <div>
                  <p className="font-bold text-white" style={{ fontSize: 15 }}>{pkg.name}</p>
                  <span className="text-white font-semibold uppercase" style={{ background: '#E8401C', borderRadius: 20, padding: '2px 8px', fontSize: 9 }}>{pkg.occasion}</span>
                  <p className="mt-1 font-semibold" style={{ color: '#2ECC71', fontSize: 12 }}>✓ All inclusive</p>
                </div>
              </div>

              <div>
                <p className="font-semibold mb-2" style={{ color: '#AAAAAA', fontSize: 12 }}>WHAT'S INCLUDED</p>
                {pkg.inclusions.map(inc => (
                  <div key={inc} className="flex items-start gap-2 mb-1.5">
                    <CheckCircle size={13} color="#2ECC71" className="mt-0.5 shrink-0" />
                    <span className="text-white" style={{ fontSize: 13 }}>{inc}</span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="p-4 flex flex-col gap-2" style={{ background: '#161616', borderRadius: 14, borderLeft: '3px solid #E8401C' }}>
                {useTier && <p className="font-semibold text-white mb-1" style={{ fontSize: 13 }}>Tier: {selectedTier!.tier.charAt(0).toUpperCase() + selectedTier!.tier.slice(1)}</p>}
                <div className="flex justify-between"><span style={{ color: '#AAAAAA', fontSize: 14 }}>Base package</span><span className="text-white" style={{ fontSize: 14 }}>₹{basePrice.toLocaleString('en-IN')}</span></div>
                {addOnItems.map(a => (
                  <div key={a.id} className="flex justify-between items-center">
                    <span style={{ color: '#AAAAAA', fontSize: 14 }}>{a.name}</span>
                    <span className="text-white" style={{ fontSize: 14 }}>+₹{a.price.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="h-px my-1" style={{ background: '#222222' }} />
                <div className="flex justify-between"><span style={{ color: '#AAAAAA', fontSize: 14 }}>Platform fee</span><span className="text-white" style={{ fontSize: 14 }}>₹{STEP_FEE}</span></div>
                <div className="h-px my-1" style={{ background: '#222222' }} />
                <div className="flex justify-between items-center">
                  <span className="font-bold" style={{ color: '#AAAAAA', fontSize: 15 }}>Total</span>
                  <span className="font-bold" style={{ color: '#E8401C', fontSize: 20 }}>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2"><CheckCircle size={14} color="#2ECC71" /><span style={{ color: '#AAAAAA', fontSize: 12 }}>Free cancellation up to 48 hours before</span></div>

              <motion.button data-testid="button-step1-continue" whileTap={{ scale: 0.96 }} onClick={handleStep1Continue} className="w-full font-bold text-white flex items-center justify-center" style={{ background: '#E8401C', height: 56, borderRadius: 14, fontSize: 16 }}>
                Continue →
              </motion.button>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }} className="flex flex-col gap-5">
              <h2 className="font-bold text-white" style={{ fontSize: 22 }}>Your details</h2>

              <motion.div key={shakeKey} animate={nameError || dateError || phoneError ? { x: [-4, 4, -4, 4, 0] } : {}} transition={{ duration: 0.4 }} className="flex flex-col gap-4">
                <div>
                  <p className="uppercase font-semibold mb-2" style={{ color: '#AAAAAA', fontSize: 11, letterSpacing: 1 }}>YOUR NAME</p>
                  <input
                    data-testid="input-booking-name"
                    value={name}
                    maxLength={80}
                    onChange={e => { setName(e.target.value); setNameError(false); }}
                    placeholder="What should we call you?"
                    className="w-full outline-none text-white"
                    style={{ background: '#1E1E1E', borderRadius: 12, height: 52, border: `1px solid ${nameError ? '#E8401C' : '#2C2C2C'}`, padding: '0 16px', fontSize: 16 }}
                  />
                </div>
                <div>
                  <p className="uppercase font-semibold mb-2" style={{ color: '#AAAAAA', fontSize: 11, letterSpacing: 1 }}>WHATSAPP NUMBER</p>
                  <div className="flex items-center" style={{ background: '#1E1E1E', borderRadius: 12, height: 52, border: `1px solid ${phoneError ? '#E8401C' : '#2C2C2C'}`, overflow: 'hidden' }}>
                    <div className="flex items-center justify-center px-3" style={{ borderRight: '1px solid #2C2C2C', height: '100%' }}>
                      <span className="font-bold text-white" style={{ fontSize: 16 }}>+91</span>
                    </div>
                    <input
                      data-testid="input-booking-whatsapp"
                      type="tel"
                      inputMode="numeric"
                      value={whatsapp}
                      onChange={e => {
                        setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10));
                        setPhoneError(false);
                      }}
                      placeholder="9876543210"
                      className="flex-1 outline-none text-white px-3"
                      style={{ background: 'transparent', fontSize: 16 }}
                    />
                  </div>
                </div>
                <div>
                  <p className="uppercase font-semibold mb-2" style={{ color: '#AAAAAA', fontSize: 11, letterSpacing: 1 }}>DATE OF OCCASION</p>
                  <input
                    data-testid="input-booking-date"
                    type="date"
                    value={date}
                    min={todayStr}
                    onChange={e => handleDateChange(e.target.value)}
                    className="w-full outline-none text-white"
                    style={{ background: '#1E1E1E', borderRadius: 12, height: 52, border: `1px solid ${dateError ? '#E8401C' : '#2C2C2C'}`, padding: '0 16px', fontSize: 16, colorScheme: 'dark' }}
                  />
                  {dateIsPast && (
                    <p className="mt-1" style={{ color: '#E8401C', fontSize: 12 }}>Please select a future date</p>
                  )}
                </div>
                <div>
                  <p className="uppercase font-semibold mb-2" style={{ color: '#AAAAAA', fontSize: 11, letterSpacing: 1 }}>TIME PREFERENCE</p>
                  <div className="flex gap-2">
                    {['6 PM', '7 PM', '8 PM'].map(t => (
                      <button
                        key={t}
                        data-testid={`chip-time-${t.replace(' ', '')}`}
                        onClick={() => setTime(t)}
                        className="flex-1 font-semibold"
                        style={{ background: time === t ? '#E8401C' : '#1E1E1E', color: time === t ? '#FFFFFF' : '#AAAAAA', borderRadius: 10, height: 44, border: '1px solid #2C2C2C', fontSize: 14 }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="uppercase font-semibold mb-2" style={{ color: '#AAAAAA', fontSize: 11, letterSpacing: 1 }}>WHO IS THIS FOR?</p>
                  <input
                    data-testid="input-partner-name"
                    value={partnerName}
                    maxLength={80}
                    onChange={e => setPartnerName(e.target.value)}
                    placeholder="Your partner's name (optional but makes it personal)"
                    className="w-full outline-none text-white"
                    style={{ background: '#1E1E1E', borderRadius: 12, height: 52, border: '1px solid #2C2C2C', padding: '0 16px', fontSize: 16 }}
                  />
                </div>
                <div>
                  <p className="uppercase font-semibold mb-2" style={{ color: '#AAAAAA', fontSize: 11, letterSpacing: 1 }}>HOW WOULD YOU LIKE IT?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['🎁 Surprise them', '💑 We know together', '💍 It\'s a proposal', '🎂 It\'s a birthday'].map(s => (
                      <button
                        key={s}
                        data-testid={`chip-surprise-${s.slice(0, 8)}`}
                        onClick={() => setSurpriseType(s)}
                        className="font-semibold py-3 px-2"
                        style={{ background: surpriseType === s ? 'rgba(232,64,28,0.15)' : '#1E1E1E', color: surpriseType === s ? '#E8401C' : '#AAAAAA', borderRadius: 10, border: `1px solid ${surpriseType === s ? '#E8401C' : '#2C2C2C'}`, fontSize: 13 }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="uppercase font-semibold mb-2" style={{ color: '#AAAAAA', fontSize: 11, letterSpacing: 1 }}>ANY SPECIAL REQUESTS?</p>
                  <textarea
                    data-testid="input-special-requests"
                    value={specialRequests}
                    maxLength={500}
                    onChange={e => setSpecialRequests(e.target.value)}
                    placeholder="Vegetarian meal? Specific flowers? Any allergies? Surprise element? Write anything here..."
                    className="w-full outline-none text-white resize-none"
                    rows={4}
                    style={{ background: '#1E1E1E', borderRadius: 12, border: '1px solid #2C2C2C', padding: 14, fontSize: 16, minHeight: 100 }}
                  />
                  <p className="text-right mt-1" style={{ color: '#555555', fontSize: 11 }}>{specialRequests.length}/500</p>
                </div>
              </motion.div>

              <motion.button data-testid="button-step2-continue" whileTap={{ scale: 0.96 }} onClick={handleStep2Continue} className="w-full font-bold text-white flex items-center justify-center" style={{ background: '#E8401C', height: 56, borderRadius: 14, fontSize: 16 }}>
                Continue →
              </motion.button>
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }} className="flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-white" style={{ fontSize: 22 }}>Secure payment</h2>
                <Lock size={18} color="#2ECC71" />
              </div>

              {/* Order Summary */}
              <div className="p-4 flex flex-col gap-1" style={{ background: '#161616', borderRadius: 12, border: '1px solid #2C2C2C' }}>
                <p className="font-bold text-white" style={{ fontSize: 15 }}>{pkg.name}</p>
                <p className="font-bold" style={{ color: '#E8401C', fontSize: 18 }}>₹{total.toLocaleString('en-IN')} total</p>
              </div>

              {/* Payment Methods */}
              {[
                { id: 'upi', label: 'Pay via UPI', sub: 'GPay, PhonePe, Paytm' },
                { id: 'card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay' },
                { id: 'netbanking', label: 'Net Banking', sub: 'All major banks' },
              ].map(method => {
                const active = paymentMethod === method.id;
                return (
                  <div key={method.id}>
                    <motion.button
                      data-testid={`payment-method-${method.id}`}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPaymentMethod(method.id as typeof paymentMethod)}
                      className="w-full flex items-center gap-3 p-4 text-left"
                      style={{ background: active ? '#1A0808' : '#161616', borderRadius: 12, border: `1px solid ${active ? '#E8401C' : '#2C2C2C'}`, transition: 'all 200ms' }}
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-white" style={{ fontSize: 14 }}>{method.label}</p>
                        <p style={{ color: '#AAAAAA', fontSize: 12 }}>{method.sub}</p>
                      </div>
                      <div
                        className="rounded-full"
                        style={{ width: 20, height: 20, border: `2px solid ${active ? '#E8401C' : '#555555'}`, background: active ? '#E8401C' : 'transparent' }}
                      />
                    </motion.button>

                    {active && method.id === 'upi' && (
                      <div className="mt-2 flex gap-2 px-1">
                        <input
                          data-testid="input-upi-id"
                          value={upiId}
                          onChange={e => setUpiId(e.target.value)}
                          placeholder="yourname@upi"
                          className="flex-1 outline-none text-white"
                          style={{ background: '#1E1E1E', borderRadius: 10, height: 46, border: '1px solid #2C2C2C', padding: '0 14px', fontSize: 16 }}
                        />
                        <button
                          data-testid="button-verify-upi"
                          onClick={() => setUpiVerified(true)}
                          className="font-semibold"
                          style={{ border: '1px solid #E8401C', color: '#E8401C', borderRadius: 10, padding: '0 14px', fontSize: 14 }}
                        >
                          {upiVerified ? '✓ Verified' : 'Verify'}
                        </button>
                      </div>
                    )}

                    {active && method.id === 'card' && (
                      <div className="mt-2 flex flex-col gap-2 px-1">
                        <input
                          data-testid="input-card-number"
                          value={cardNum}
                          onChange={e => setCardNum(e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})/g, '$1 ').trim())}
                          placeholder="Card number"
                          inputMode="numeric"
                          className="w-full outline-none text-white"
                          style={{ background: '#1E1E1E', borderRadius: 10, height: 46, border: '1px solid #2C2C2C', padding: '0 14px', fontSize: 16 }}
                        />
                        <div className="flex gap-2">
                          <input
                            data-testid="input-expiry"
                            value={expiry}
                            onChange={e => setExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="flex-1 outline-none text-white"
                            style={{ background: '#1E1E1E', borderRadius: 10, height: 46, border: '1px solid #2C2C2C', padding: '0 14px', fontSize: 16 }}
                          />
                          <input
                            data-testid="input-cvv"
                            value={cvv}
                            onChange={e => setCvv(e.target.value.slice(0, 3))}
                            placeholder="CVV"
                            type="password"
                            inputMode="numeric"
                            className="flex-1 outline-none text-white"
                            style={{ background: '#1E1E1E', borderRadius: 10, height: 46, border: '1px solid #2C2C2C', padding: '0 14px', fontSize: 16 }}
                          />
                        </div>
                      </div>
                    )}

                    {active && method.id === 'netbanking' && (
                      <div className="mt-2 flex flex-col px-1" style={{ background: '#161616', borderRadius: 10, border: '1px solid #2C2C2C', overflow: 'hidden' }}>
                        {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB'].map((bank, i) => (
                          <button
                            key={bank}
                            data-testid={`bank-${bank}`}
                            onClick={() => setSelectedBank(bank)}
                            className="flex items-center justify-between px-4 py-3"
                            style={{ borderBottom: i < 5 ? '1px solid #1E1E1E' : 'none', background: selectedBank === bank ? 'rgba(232,64,28,0.08)' : 'transparent' }}
                          >
                            <span className="text-white" style={{ fontSize: 14 }}>{bank}</span>
                            {selectedBank === bank && <span style={{ color: '#E8401C' }}>✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex items-center justify-center gap-2">
                <Lock size={14} color="#2ECC71" />
                <span style={{ color: '#AAAAAA', fontSize: 12 }}>256-bit encrypted · 100% secure</span>
              </div>

              <div className="text-center">
                <p style={{ color: '#AAAAAA', fontSize: 14 }}>Total payable</p>
                <p className="font-bold text-white" style={{ fontSize: 30 }}>₹{total.toLocaleString('en-IN')}</p>
              </div>

              <motion.button
                data-testid="button-pay"
                whileTap={{ scale: 0.96 }}
                onClick={handlePay}
                disabled={paying}
                className="w-full font-bold text-white flex items-center justify-center"
                style={{ background: paying ? '#AA2A10' : '#E8401C', height: 56, borderRadius: 14, fontSize: 16, transition: 'background 200ms' }}
              >
                {paying ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 22, height: 22, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF' }} />
                ) : (
                  `Pay ₹${total.toLocaleString('en-IN')}`
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}