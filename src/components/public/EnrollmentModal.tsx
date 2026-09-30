'use client';

import { useState, useRef } from 'react';
import toast from 'react-hot-toast';

interface Course {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number;
  currency: string;
  enrollmentStatus: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface Props {
  course: Course;
  onClose: () => void;
}

interface SuccessData {
  enrollmentId: string;
  courseName: string;
  amount: number;
  utr?: string;
  isRazorpay?: boolean;
  paymentId?: string;
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || 'surajkumarsahoo1997@ybl';
const UPI_PAYEE_NAME = process.env.NEXT_PUBLIC_UPI_PAYEE_NAME || 'Suraj Kumar Sahoo';

export default function EnrollmentModal({ course, onClose }: Props) {
  const [currentStep, setCurrentStep] = useState<'details' | 'payment' | 'success'>('details');
  const [paymentMode, setPaymentMode] = useState<'upi' | 'razorpay'>('upi');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    utr: '',
    notes: '',
    paymentDate: '',
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    utr: false,
  });

  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectivePrice = course.discountPrice > 0 ? course.discountPrice : course.price;
  const savings =
    course.discountPrice > 0 && course.price > course.discountPrice
      ? course.price - course.discountPrice
      : 0;

  function formatPrice(amount: number) {
    if (course.currency === 'INR') return `₹${amount.toLocaleString('en-IN')}`;
    return `${course.currency} ${amount.toLocaleString()}`;
  }

  const isNameValid = form.name.trim().length >= 2;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const cleanPhone = form.phone.replace(/\D/g, '');
  const isPhoneValid =
    cleanPhone.length === 10 || (cleanPhone.length === 12 && cleanPhone.startsWith('91'));
  const isUtrValid = form.utr.trim().replace(/\s/g, '').length >= 6;
  const isStep1Valid = isNameValid && isEmailValid && isPhoneValid;

  function handleBlur(field: 'name' | 'email' | 'phone' | 'utr') {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function handleContinueToPayment(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, utr: false });
    if (!isStep1Valid) return;
    setErrorMessage('');
    setCurrentStep('payment');
  }

  function handleCopyUpi() {
    navigator.clipboard.writeText(UPI_ID);
    setCopiedUpi(true);
    toast.success('UPI ID copied!');
    setTimeout(() => setCopiedUpi(false), 2500);
  }

  function handleScreenshotChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPG, PNG, or WebP files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Screenshot must be under 5MB.');
      return;
    }
    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshotPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleUpiPayment(e: React.FormEvent) {
    e.preventDefault();
    setTouched((prev) => ({ ...prev, utr: true }));

    if (!isUtrValid) {
      setErrorMessage('Please enter a valid UTR / Transaction ID (min 6 characters).');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('candidateName', form.name.trim());
      formData.append('email', form.email.trim());
      formData.append('phone', form.phone.trim());
      formData.append('courseId', course._id);
      formData.append('utr', form.utr.trim());
      if (form.notes.trim()) formData.append('notes', form.notes.trim());
      if (form.paymentDate) formData.append('paymentDate', form.paymentDate);
      if (screenshotFile) formData.append('screenshot', screenshotFile);

      const res = await fetch('/api/upi-payment', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to submit. Please try again.');
        return;
      }

      setSuccessData({
        enrollmentId: data.enrollmentId,
        courseName: data.courseName,
        amount: data.amount,
        utr: data.utr,
      });
      setCurrentStep('success');
      toast.success('Payment submitted for verification!');
    } catch {
      setErrorMessage('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRazorpayPayment() {
    setLoading(true);
    setErrorMessage('');

    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        setErrorMessage('Failed to load Razorpay. Please use UPI option.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          courseId: course._id,
          paymentMethod: 'razorpay',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to initialize payment.');
        setLoading(false);
        return;
      }

      const { orderId, enrollmentId, amount, currency, courseName, keyId } = data;

      const rzp = new window.Razorpay({
        key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: Math.round(amount * 100),
        currency: currency || 'INR',
        name: 'CodeWithSuraj',
        description: `Enrollment: ${courseName}`,
        order_id: orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            setLoading(true);
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                enrollmentId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setSuccessData({
                enrollmentId,
                courseName,
                amount,
                isRazorpay: true,
                paymentId: verifyData.paymentId || response.razorpay_payment_id,
              });
              setCurrentStep('success');
              toast.success('Payment verified!');
            } else {
              setErrorMessage('Payment verification failed. Contact support.');
              toast.error('Verification failed.');
            }
          } catch {
            setErrorMessage('Network issue verifying payment. Contact support.');
          } finally {
            setLoading(false);
          }
        },
        prefill: { name: form.name.trim(), email: form.email.trim(), contact: form.phone.trim() },
        theme: { color: '#6c63ff' },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setErrorMessage('Payment cancelled. You can retry anytime.');
          },
        },
      });

      rzp.open();
    } catch {
      setErrorMessage('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  const upiIntentUri = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_PAYEE_NAME)}&am=${effectivePrice}&cu=INR&tn=${encodeURIComponent(`Enrollment: ${course.name.slice(0, 20)}`)}`;

  /* ─── Shared Style Tokens ─── */
  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '0.7rem 0.9rem',
    color: '#e8e8f0',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'Inter, sans-serif',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.82rem',
    fontWeight: '600',
    color: '#a8a8c0',
    display: 'block',
    marginBottom: '0.4rem',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.87)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        style={{
          background: 'linear-gradient(160deg, #14141e 0%, #0f0f1a 100%)',
          border: '1px solid rgba(108,99,255,0.25)',
          borderRadius: '24px',
          padding: 'clamp(1.25rem, 4vw, 2rem) clamp(1rem, 3.5vw, 1.75rem)',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '92vh',
          overflowY: 'auto',
          position: 'relative',
          animation: 'fadeInUp 0.3s ease',
          boxShadow: '0 40px 100px rgba(0,0,0,0.75), 0 0 60px rgba(108,99,255,0.08)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
          style={{
            position: 'absolute', top: '1.25rem', right: '1.25rem',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%', width: '32px', height: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#9494a8', cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1.2rem', transition: 'all 0.2s', zIndex: 10,
          }}
          onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; } }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#9494a8'; }}
        >×</button>

        {/* Step Indicator */}
        {currentStep !== 'success' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['Details', 'Payment'].map((label, idx) => {
              const stepNum = idx + 1;
              const isActive = (currentStep === 'details' && idx === 0) || (currentStep === 'payment' && idx === 1);
              const isDone = currentStep === 'payment' && idx === 0;
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  {idx > 0 && <span style={{ color: '#3d3d58', fontSize: '0.85rem' }}>→</span>}
                  <div
                    onClick={() => { if (isDone && !loading) setCurrentStep('details'); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      cursor: isDone && !loading ? 'pointer' : 'default',
                      color: isDone ? '#00c896' : isActive ? '#9b8dfb' : '#6b6b8a',
                      fontWeight: '600', fontSize: '0.82rem',
                    }}
                  >
                    <span style={{
                      width: '22px', height: '22px', borderRadius: '50%',
                      background: isDone ? 'rgba(0,200,150,0.15)' : isActive ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.04)',
                      border: `1.5px solid ${isDone ? '#00c896' : isActive ? '#9b8dfb' : 'rgba(255,255,255,0.1)'}`,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.72rem', fontWeight: '700',
                    }}>{isDone ? '✓' : `0${stepNum}`}</span>
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.25)', borderRadius: '10px', padding: '0.7rem 0.9rem', marginBottom: '1.25rem', color: '#ff6b6b', fontSize: '0.82rem', lineHeight: '1.4' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* ════════════════════════════════════ */}
        {/* STEP 1: STUDENT DETAILS             */}
        {/* ════════════════════════════════════ */}
        {currentStep === 'details' && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: '700', color: '#fff', marginBottom: '0.3rem' }}>
                Enroll Now
              </h2>
              <p style={{ color: '#a8a8c0', fontSize: '0.88rem', lineHeight: '1.4' }}>{course.name}</p>
            </div>

            {/* Price Summary */}
            <div style={{ background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#a8a8c0', fontSize: '0.82rem', display: 'block' }}>Course Fee</span>
                {savings > 0 && (
                  <span style={{ background: 'rgba(0,200,150,0.12)', color: '#00c896', fontSize: '0.72rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'inline-block', marginTop: '0.25rem' }}>
                    Save {formatPrice(savings)}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {course.discountPrice > 0 && (
                  <span style={{ color: '#6b6b8a', textDecoration: 'line-through', fontSize: '0.88rem' }}>
                    {formatPrice(course.price)}
                  </span>
                )}
                <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.45rem', fontWeight: '800', color: '#00c896' }}>
                  {formatPrice(effectivePrice)}
                </span>
              </div>
            </div>

            <form onSubmit={handleContinueToPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {[
                { id: 'enroll-name', field: 'name' as const, label: 'Full Name *', type: 'text', placeholder: 'Your full name', valid: isNameValid, msg: 'Full name required (min 2 chars).' },
                { id: 'enroll-email', field: 'email' as const, label: 'Email Address *', type: 'email', placeholder: 'your@email.com', valid: isEmailValid, msg: 'Enter a valid email address.' },
                { id: 'enroll-phone', field: 'phone' as const, label: 'Phone Number *', type: 'tel', placeholder: '+91 98765 43210', valid: isPhoneValid, msg: 'Enter a valid 10-digit mobile number.' },
              ].map(({ id, field, label, type, placeholder, valid, msg }) => (
                <div key={field}>
                  <label htmlFor={id} style={labelStyle}>{label}</label>
                  <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    onBlur={() => handleBlur(field)}
                    style={{
                      ...inputStyle,
                      borderColor: touched[field] && !valid ? '#ff4444' : 'rgba(255,255,255,0.1)',
                    }}
                    autoFocus={field === 'name'}
                  />
                  {touched[field] && !valid && (
                    <span style={{ color: '#ff6b6b', fontSize: '0.77rem', marginTop: '0.25rem', display: 'block' }}>{msg}</span>
                  )}
                </div>
              ))}

              <button
                type="submit"
                disabled={!isStep1Valid}
                id="enroll-continue-btn"
                style={{
                  width: '100%', padding: '0.9rem', borderRadius: '12px', border: 'none',
                  background: isStep1Valid ? 'linear-gradient(135deg, #6c63ff 0%, #4b42db 100%)' : 'rgba(108,99,255,0.25)',
                  color: '#fff', fontWeight: '700', fontSize: '1rem', cursor: isStep1Valid ? 'pointer' : 'not-allowed',
                  boxShadow: isStep1Valid ? '0 8px 24px rgba(108,99,255,0.35)' : 'none',
                  transition: 'all 0.2s', marginTop: '0.25rem', fontFamily: 'Outfit, sans-serif',
                }}
              >
                Continue to Payment →
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#6b6b8a', margin: 0 }}>
                🔒 Your information is encrypted and secure
              </p>
            </form>
          </div>
        )}

        {/* ════════════════════════════════════ */}
        {/* STEP 2: PAYMENT                     */}
        {/* ════════════════════════════════════ */}
        {currentStep === 'payment' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <button type="button" onClick={() => { setErrorMessage(''); setCurrentStep('details'); }} disabled={loading}
                  style={{ background: 'none', border: 'none', color: '#9b8dfb', fontSize: '0.8rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: 0, marginBottom: '0.3rem', fontWeight: '600' }}>
                  ← Edit Details
                </button>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: '700', color: '#fff' }}>
                  Complete Payment
                </h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', color: '#7c7c9c', display: 'block' }}>Amount Payable</span>
                <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', fontWeight: '800', color: '#00c896' }}>{formatPrice(effectivePrice)}</span>
              </div>
            </div>

            {/* Course pill */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '0.6rem 0.85rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: '#d0d0e0', fontWeight: '500' }}>{course.name}</span>
              <span style={{ color: '#7c7c9c' }}>for {form.name}</span>
            </div>

            {/* Payment Mode Switcher */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.3rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '1.25rem' }}>
              {(['upi', 'razorpay'] as const).map((mode) => (
                <button key={mode} type="button" onClick={() => setPaymentMode(mode)} disabled={loading}
                  style={{
                    padding: '0.65rem 0.5rem', borderRadius: '9px', border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: '600',
                    transition: 'all 0.2s',
                    background: paymentMode === mode ? '#6c63ff' : 'transparent',
                    color: paymentMode === mode ? '#fff' : '#8888a0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                  }}>
                  {mode === 'upi' ? '📱 UPI / QR' : '💳 Card / Net Banking'}
                </button>
              ))}
            </div>

            {/* ─── UPI PAYMENT ─── */}
            {paymentMode === 'upi' && (
              <form onSubmit={handleUpiPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* QR + UPI section */}
                <div style={{ background: 'radial-gradient(ellipse at top, rgba(108,99,255,0.12) 0%, rgba(13,13,20,0.95) 100%)', border: '1px solid rgba(108,99,255,0.28)', borderRadius: '16px', padding: '1.25rem 1rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.85rem', color: '#c299ff', fontWeight: '600', marginBottom: '0.75rem' }}>
                    Scan & Pay Using Any UPI App
                  </p>

                  <div style={{ margin: '0 auto 0.75rem', width: '180px', height: '210px', background: '#000', borderRadius: '14px', padding: '8px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 24px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img src="/images/phonepe-qr.png" alt="UPI QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
                  </div>

                  <p style={{ fontSize: '0.82rem', color: '#e0e0f0', fontWeight: '600', marginBottom: '0.4rem' }}>
                    Payee: <span style={{ color: '#fff' }}>{UPI_PAYEE_NAME}</span>
                  </p>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(108,99,255,0.35)', borderRadius: '10px', padding: '0.35rem 0.7rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#a0e4ff' }}>{UPI_ID}</span>
                    <button type="button" onClick={handleCopyUpi}
                      style={{ background: copiedUpi ? '#00c896' : 'rgba(108,99,255,0.3)', border: 'none', borderRadius: '6px', padding: '0.2rem 0.5rem', color: '#fff', fontSize: '0.72rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>
                      {copiedUpi ? '✓ Copied' : '📋 Copy'}
                    </button>
                  </div>

                  <div>
                    <a href={upiIntentUri} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#9b8dfb', textDecoration: 'none', fontWeight: '600', padding: '0.3rem 0.65rem', borderRadius: '8px', background: 'rgba(108,99,255,0.1)', border: '1px dashed rgba(108,99,255,0.3)' }}>
                      📱 Tap to Pay on Mobile App
                    </a>
                  </div>
                </div>

                {/* Instructions */}
                <div style={{ background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.15)', borderRadius: '12px', padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#e0c070', lineHeight: '1.6' }}>
                  <p style={{ fontWeight: '700', marginBottom: '0.4rem' }}>📋 After Making Payment:</p>
                  <ol style={{ paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <li>Enter your UTR / Transaction ID below</li>
                    <li>Upload a screenshot of the payment</li>
                    <li>Click &quot;Submit for Verification&quot;</li>
                    <li>Admin will verify and grant access</li>
                  </ol>
                </div>

                {/* UTR Input */}
                <div>
                  <label htmlFor="enroll-utr-input" style={{ ...labelStyle, display: 'flex', justifyContent: 'space-between' }}>
                    <span>UTR / Transaction ID *</span>
                    <span style={{ fontWeight: '400', color: '#6b6b8a' }}>12-digit Ref No.</span>
                  </label>
                  <input
                    id="enroll-utr-input"
                    type="text"
                    placeholder="e.g. 427189012345"
                    value={form.utr}
                    onChange={(e) => setForm({ ...form, utr: e.target.value })}
                    onBlur={() => handleBlur('utr')}
                    style={{ ...inputStyle, borderColor: touched.utr && !isUtrValid ? '#ff4444' : 'rgba(255,255,255,0.1)' }}
                  />
                  {touched.utr && !isUtrValid && (
                    <span style={{ color: '#ff6b6b', fontSize: '0.77rem', marginTop: '0.25rem', display: 'block' }}>
                      Please enter your UTR reference number (min 6 characters).
                    </span>
                  )}
                </div>

                {/* Screenshot Upload */}
                <div>
                  <label style={labelStyle}>
                    Payment Screenshot *
                    <span style={{ fontWeight: '400', color: '#6b6b8a', marginLeft: '0.5rem' }}>JPG/PNG, max 5MB</span>
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${screenshotFile ? '#00c896' : 'rgba(255,255,255,0.12)'}`,
                      borderRadius: '12px', padding: '1.25rem', textAlign: 'center',
                      cursor: 'pointer', transition: 'all 0.2s',
                      background: screenshotFile ? 'rgba(0,200,150,0.05)' : 'rgba(255,255,255,0.02)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(108,99,255,0.5)'; e.currentTarget.style.background = 'rgba(108,99,255,0.05)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = screenshotFile ? '#00c896' : 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = screenshotFile ? 'rgba(0,200,150,0.05)' : 'rgba(255,255,255,0.02)'; }}
                  >
                    {screenshotPreview ? (
                      <div>
                        <img src={screenshotPreview} alt="Screenshot preview" style={{ maxHeight: '140px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }} />
                        <p style={{ color: '#00c896', fontSize: '0.78rem', marginTop: '0.5rem', fontWeight: '600' }}>
                          ✓ {screenshotFile?.name} — Click to change
                        </p>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                        <p style={{ color: '#a8a8c0', fontSize: '0.85rem', fontWeight: '500' }}>Click to upload payment screenshot</p>
                        <p style={{ color: '#6b6b8a', fontSize: '0.75rem', marginTop: '0.25rem' }}>JPG, PNG, or WebP — max 5MB</p>
                      </>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleScreenshotChange} style={{ display: 'none' }} />
                </div>

                {/* Optional fields */}
                <div>
                  <label htmlFor="enroll-payment-date" style={labelStyle}>Payment Date <span style={{ fontWeight: '400', color: '#6b6b8a' }}>(Optional)</span></label>
                  <input id="enroll-payment-date" type="date" value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                    style={{ ...inputStyle, colorScheme: 'dark' }} max={new Date().toISOString().split('T')[0]} />
                </div>

                <div>
                  <label htmlFor="enroll-notes" style={labelStyle}>Additional Notes <span style={{ fontWeight: '400', color: '#6b6b8a' }}>(Optional)</span></label>
                  <textarea id="enroll-notes" placeholder="Any additional info for the admin..." value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                    style={{ ...inputStyle, resize: 'none', lineHeight: '1.5' }} />
                </div>

                <button
                  type="submit"
                  disabled={loading || !isUtrValid}
                  id="enroll-upi-submit"
                  style={{
                    width: '100%', padding: '0.9rem', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg, #6c63ff 0%, #4b42db 100%)',
                    color: '#fff', fontWeight: '700', fontSize: '0.95rem',
                    cursor: loading || !isUtrValid ? 'not-allowed' : 'pointer',
                    opacity: loading || !isUtrValid ? 0.6 : 1,
                    boxShadow: '0 8px 24px rgba(108,99,255,0.3)',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  {loading ? '⏳ Submitting...' : '🔒 Submit Payment for Verification'}
                </button>

                <p style={{ textAlign: 'center', fontSize: '0.74rem', color: '#6b6b8a', margin: 0 }}>
                  🛡️ Admin will manually verify your payment before granting access
                </p>
              </form>
            )}

            {/* ─── RAZORPAY ─── */}
            {paymentMode === 'razorpay' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💳</div>
                  <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.35rem', fontWeight: '600' }}>Razorpay Secure Checkout</h4>
                  <p style={{ color: '#8888a8', fontSize: '0.82rem', lineHeight: '1.5', margin: 0 }}>
                    Pay via Credit Card, Debit Card, Net Banking, EMI, or Wallets. Access granted instantly after payment.
                  </p>
                </div>
                <button type="button" onClick={handleRazorpayPayment} disabled={loading}
                  id="enroll-razorpay-submit"
                  style={{
                    width: '100%', padding: '0.9rem', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg, #6c63ff 0%, #4b42db 100%)',
                    color: '#fff', fontWeight: '700', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 8px 24px rgba(108,99,255,0.3)', fontFamily: 'Outfit, sans-serif',
                  }}>
                  {loading ? '⏳ Processing...' : `🔒 Pay ${formatPrice(effectivePrice)} via Razorpay`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════ */}
        {/* STEP 3: SUCCESS (PENDING STATE)     */}
        {/* ════════════════════════════════════ */}
        {currentStep === 'success' && successData && (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            {/* Icon */}
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: successData.isRazorpay ? 'rgba(0,200,150,0.15)' : 'rgba(255,184,0,0.12)', border: `2px solid ${successData.isRazorpay ? '#00c896' : '#ffb800'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.25rem' }}>
              {successData.isRazorpay ? '🎉' : '🕐'}
            </div>

            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: '700', color: '#fff', marginBottom: '0.4rem' }}>
              {successData.isRazorpay ? 'Enrollment Confirmed!' : 'Payment Submitted!'}
            </h2>

            <p style={{ color: '#a8a8c0', fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              {successData.isRazorpay
                ? <>You&apos;re successfully enrolled in:<br /><strong style={{ color: '#9b8dfb' }}>&ldquo;{successData.courseName}&rdquo;</strong></>
                : <>Your payment is under verification for:<br /><strong style={{ color: '#9b8dfb' }}>&ldquo;{successData.courseName}&rdquo;</strong></>
              }
            </p>

            {/* Summary Box */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem', textAlign: 'left', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
              {[
                { label: 'Course', value: successData.courseName, color: '#e8e8f0' },
                { label: 'Amount', value: formatPrice(successData.amount), color: '#00c896' },
                successData.utr ? { label: 'UTR', value: successData.utr, color: '#a0e4ff', mono: true } : null,
                successData.paymentId ? { label: 'Payment ID', value: successData.paymentId, color: '#a0e4ff', mono: true } : null,
                { label: 'Student', value: form.name, color: '#fff' },
              ].filter(Boolean).map((row) => row && (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#7c7c9c' }}>{row.label}:</span>
                  <span style={{ color: row.color, fontFamily: row.mono ? 'monospace' : 'inherit', fontWeight: '600', fontSize: row.mono ? '0.85rem' : 'inherit' }}>{row.value}</span>
                </div>
              ))}

              {/* Status Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#7c7c9c' }}>Status:</span>
                <span style={{
                  background: successData.isRazorpay ? 'rgba(0,200,150,0.15)' : 'rgba(255,184,0,0.12)',
                  color: successData.isRazorpay ? '#00c896' : '#ffb800',
                  padding: '0.2rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700',
                }}>
                  {successData.isRazorpay ? '🟢 ENROLLED' : '🟡 VERIFICATION PENDING'}
                </span>
              </div>
            </div>

            {!successData.isRazorpay && (
              <div style={{ background: 'rgba(255,184,0,0.07)', border: '1px solid rgba(255,184,0,0.18)', borderRadius: '12px', padding: '0.9rem 1rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#d4aa60', lineHeight: '1.5', textAlign: 'left' }}>
                <strong>ℹ️ What happens next?</strong>
                <br />Our admin team will verify your payment within a few hours. You&apos;ll receive access to the course once verified. Check your enrollment status using the button below.
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
              {!successData.isRazorpay && (
                <a
                  href={`/enrollment-status?email=${encodeURIComponent(form.email)}`}
                  style={{
                    display: 'block', width: '100%', padding: '0.85rem', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #6c63ff 0%, #4b42db 100%)',
                    color: '#fff', fontWeight: '700', fontSize: '1rem', textDecoration: 'none',
                    textAlign: 'center', fontFamily: 'Outfit, sans-serif',
                    boxShadow: '0 8px 24px rgba(108,99,255,0.3)',
                  }}
                >
                  📊 View Enrollment Status
                </a>
              )}
              <button onClick={onClose}
                style={{
                  width: '100%', padding: '0.75rem', borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                  color: '#8888a0', cursor: 'pointer', fontSize: '0.9rem',
                }}>
                Back to Courses
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
