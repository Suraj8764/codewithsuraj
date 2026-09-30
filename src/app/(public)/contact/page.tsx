'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface CourseOption {
  _id: string;
  name: string;
}

export default function ContactPage() {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [contactInfo, setContactInfo] = useState({
    email: 'contact@codewithsuraj.com',
    phone: '+91 98765 43210',
    whatsapp: '+91 98765 43210',
    address: 'Tech Innovation Hub, Cyber City, Bangalore, Karnataka 560100',
    operatingHours: 'Mon - Sat: 9:00 AM - 8:00 PM IST',
  });

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    courseInterest: '',
    subject: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // 1. Fetch contact settings
    fetch('/api/settings?section=contact')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.settings && Object.keys(data.settings).length > 0) {
          setContactInfo((prev) => ({ ...prev, ...data.settings }));
        }
      })
      .catch(() => {});

    // 2. Fetch courses for dropdown
    fetch('/api/courses?limit=50')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.courses) {
          setCourses(data.courses);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in all required fields (Name, Email, and Message).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Inquiry submitted successfully!');
        setSubmitted(true);
        setForm({
          name: '',
          email: '',
          phone: '',
          courseInterest: '',
          subject: '',
          message: '',
        });
      } else {
        toast.error(data.error || 'Failed to submit inquiry. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden', paddingTop: '5rem', paddingBottom: '6rem' }}>
      {/* Glow Orbs */}
      <div
        className="vengeance-glow-orb"
        style={{ width: '500px', height: '500px', background: '#6c63ff', top: '-100px', right: '-100px' }}
      />
      <div
        className="vengeance-glow-orb"
        style={{ width: '400px', height: '400px', background: '#00d4ff', bottom: '10%', left: '-100px' }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="vengeance-badge vengeance-badge-glow" style={{ marginBottom: '1.25rem' }}>
            ✦ GET IN TOUCH
          </span>
          <h1
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
              fontWeight: '900',
              lineHeight: 1.15,
              marginBottom: '1rem',
            }}
          >
            Let&apos;s Build Your <span className="text-gradient">Tech Future</span>
          </h1>
          <p style={{ maxWidth: '650px', margin: '0 auto', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            Have questions about batches, career transitions, or custom corporate training?
            Our academic counseling team is ready to guide you.
          </p>
        </div>

        {/* Main Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1.8fr',
            gap: '3rem',
            alignItems: 'flex-start',
            marginBottom: '5rem',
          }}
          className="contact-layout-grid"
        >
          {/* Left Column: Direct Info Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Speed badge */}
            <div
              className="vengeance-card"
              style={{
                padding: '1.5rem',
                borderLeft: '4px solid var(--color-success)',
                background: 'rgba(0, 200, 150, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>⚡</span>
                <span style={{ fontWeight: '700', color: '#00c896', fontSize: '0.95rem' }}>
                  Ultra-Fast Academic Support
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                We respond to all student inquiries within <strong>2 business hours</strong>.
              </p>
            </div>

            {/* Email Card */}
            <div className="vengeance-card" style={{ padding: '1.75rem', display: 'flex', gap: '1.25rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(108, 99, 255, 0.15)',
                  border: '1px solid rgba(108, 99, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  flexShrink: 0,
                }}
              >
                📧
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  Email Counseling
                </div>
                <a
                  href={`mailto:${contactInfo.email}`}
                  style={{ color: '#fff', fontWeight: '600', fontSize: '1.05rem', wordBreak: 'break-all' }}
                >
                  {contactInfo.email}
                </a>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  Drop an email for syllabus and admission brochures
                </div>
              </div>
            </div>

            {/* Phone & WhatsApp */}
            <div className="vengeance-card" style={{ padding: '1.75rem', display: 'flex', gap: '1.25rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(0, 212, 255, 0.15)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  flexShrink: 0,
                }}
              >
                📱
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  Direct Phone & WhatsApp
                </div>
                <a
                  href={`tel:${contactInfo.phone}`}
                  style={{ color: '#fff', fontWeight: '600', fontSize: '1.05rem', display: 'block' }}
                >
                  {contactInfo.phone}
                </a>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  {contactInfo.operatingHours}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="vengeance-card" style={{ padding: '1.75rem', display: 'flex', gap: '1.25rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(255, 184, 0, 0.15)',
                  border: '1px solid rgba(255, 184, 0, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  flexShrink: 0,
                }}
              >
                📍
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  Campus & Innovation Lab
                </div>
                <div style={{ color: '#fff', fontWeight: '500', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  {contactInfo.address}
                </div>
              </div>
            </div>

            {/* Quick WhatsApp CTA Button */}
            {contactInfo.whatsapp && (
              <a
                href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}?text=Hi%2C%20I%20am%20interested%20in%20CodeWithSuraj%20courses!`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '1rem',
                  background: 'rgba(0, 200, 150, 0.12)',
                  borderColor: 'rgba(0, 200, 150, 0.4)',
                  color: '#00c896',
                }}
              >
                💬 Chat on WhatsApp Directly
              </a>
            )}
          </div>

          {/* Right Column: Interactive Form */}
          <div
            className="vengeance-card"
            style={{
              padding: '2.5rem',
              background: 'rgba(18, 18, 26, 0.85)',
            }}
          >
            <h2
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.6rem',
                fontWeight: '700',
                color: '#fff',
                marginBottom: '0.5rem',
              }}
            >
              Send an Academic Inquiry
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Fill in your details below and our senior mentors will get back to you with custom roadmap guidance.
            </p>

            {submitted ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem 1.5rem',
                  background: 'rgba(0, 200, 150, 0.08)',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 200, 150, 0.25)',
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>
                  Thank You for Reaching Out!
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '450px', margin: '0 auto 1.5rem' }}>
                  We have received your message. Our counselor will review your inquiry and reach out via email/phone shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">
                      Your Name <span style={{ color: 'var(--color-error)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Rahul Sharma"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      style={{ background: 'rgba(10, 10, 15, 0.6)' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Email Address <span style={{ color: 'var(--color-error)' }}>*</span>
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. rahul@example.com"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      style={{ background: 'rgba(10, 10, 15, 0.6)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Phone / WhatsApp Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="e.g. +91 98765 43210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      style={{ background: 'rgba(10, 10, 15, 0.6)' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Course of Interest</label>
                    <select
                      className="form-select"
                      value={form.courseInterest}
                      onChange={(e) => setForm({ ...form, courseInterest: e.target.value })}
                      style={{ background: 'rgba(10, 10, 15, 0.6)' }}
                    >
                      <option value="">-- Select Course (Optional) --</option>
                      {courses.map((c) => (
                        <option key={c._id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                      <option value="Custom / Corporate Training">Custom / Corporate Training</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Batch Timings, Curriculum doubt, EMI options"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    style={{ background: 'rgba(10, 10, 15, 0.6)' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Your Message <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <textarea
                    className="form-input form-textarea"
                    rows={4}
                    placeholder="Tell us about your background, career goals, or any specific questions..."
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    style={{ background: 'rgba(10, 10, 15, 0.6)', minHeight: '120px' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                >
                  {submitting ? '✦ Submitting Inquiry...' : '✦ Send Inquiry Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .contact-layout-grid { grid-template-columns: 1fr !important; }
          .form-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
