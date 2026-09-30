'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import EnrollmentModal from '@/components/public/EnrollmentModal';

interface Trainer {
  _id: string;
  name: string;
  photo: string;
  designation: string;
  bio: string;
  experience: number;
  skills: string[];
  linkedin?: string;
  github?: string;
}

interface Module {
  _id: string;
  title: string;
  description: string;
  duration: string;
  topics: { _id: string; title: string; description: string; isOptional: boolean; duration: string }[];
}

interface Course {
  _id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  level: string;
  duration: string;
  price: number;
  discountPrice: number;
  currency: string;
  thumbnail: string;
  heroImage: string;
  technologies: string[];
  skillsCovered: string[];
  learningOutcomes: string[];
  requirements: string[];
  whoIsThisFor: string[];
  features: { icon: string; title: string; description: string }[];
  classMode: string;
  classTimings: string;
  numberOfSessions: number;
  trainers: Trainer[];
  enrollmentStatus: string;
  enrollmentCount: number;
  availableSeats: number;
  batchStartDate?: string;
  weekdays: string[];
}

function formatPrice(currency: string, amount: number) {
  if (currency === 'INR') return `₹${amount.toLocaleString('en-IN')}`;
  return `${currency} ${amount.toLocaleString()}`;
}

function getDiscount(price: number, dp: number) {
  if (!dp || dp >= price) return 0;
  return Math.round(((price - dp) / price) * 100);
}

export default function CourseDetailClient({ course }: { course: Course }) {
  const [curriculum, setCurriculum] = useState<Module[]>([]);
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const discount = getDiscount(course.price, course.discountPrice);
  const effectivePrice = course.discountPrice > 0 ? course.discountPrice : course.price;

  useEffect(() => {
    fetch(`/api/courses/${course._id}/curriculum`)
      .then((r) => r.json())
      .then((data) => { if (data.success) setCurriculum(data.curriculum); })
      .catch(() => {});
  }, [course._id]);

  const tabs = ['overview', 'curriculum', 'projects', 'trainer', 'faqs'];

  return (
    <>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #0a1628 100%)',
        paddingTop: '100px',
        paddingBottom: '0',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'linear-gradient(rgba(108,99,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="container" style={{ position: 'relative', paddingBottom: '0' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 380px',
            gap: '3rem',
            alignItems: 'start',
          }}>
            {/* Left */}
            <div style={{ paddingBottom: '3rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span className="badge badge-primary">{course.category}</span>
                <span className="badge badge-secondary">{course.level}</span>
                <span className="badge badge-success">{course.classMode}</span>
              </div>

              <h1 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                fontWeight: '800',
                marginBottom: '1rem',
                lineHeight: 1.2,
              }}>
                {course.name}
              </h1>

              <p style={{
                fontSize: '1.1rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                marginBottom: '1.5rem',
                maxWidth: '580px',
              }}>
                {course.shortDescription}
              </p>

              {/* Meta */}
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {[
                  { icon: '⏱', label: course.duration || 'Flexible' },
                  { icon: '📅', label: course.classTimings || 'Flexible Timing' },
                  { icon: '💻', label: `${course.numberOfSessions || 0} Sessions` },
                  { icon: '👥', label: `${course.enrollmentCount} Enrolled` },
                ].map((m) => (
                  <div key={m.label} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                  }}>
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </div>
                ))}
              </div>

              {/* Technologies */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {course.technologies?.map((tech) => (
                  <span key={tech} style={{
                    background: 'rgba(108,99,255,0.1)',
                    color: 'var(--color-primary-light)',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    border: '1px solid rgba(108,99,255,0.2)',
                  }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Sticky Pricing Card */}
            <div style={{
              background: 'rgba(26,26,38,0.95)',
              border: '1px solid rgba(108,99,255,0.2)',
              borderRadius: '20px',
              padding: '2rem',
              backdropFilter: 'blur(20px)',
              position: 'sticky',
              top: '90px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              marginTop: '1.5rem',
            }}>
              {/* Thumbnail */}
              {(course.thumbnail || course.heroImage) && (
                <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem', height: '160px' }}>
                  <img
                    src={course.thumbnail || course.heroImage}
                    alt={course.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}

              {/* Price */}
              <div className="price-display" style={{ marginBottom: '1rem' }}>
                <span className="price-current">{formatPrice(course.currency, effectivePrice)}</span>
                {discount > 0 && (
                  <>
                    <span className="price-original">{formatPrice(course.currency, course.price)}</span>
                    <span className="price-discount">{discount}% OFF</span>
                  </>
                )}
              </div>

              {/* Status */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
              }}>
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: course.enrollmentStatus === 'open' ? '#00c896' : '#ff6b6b',
                }} />
                <span style={{ color: course.enrollmentStatus === 'open' ? '#00c896' : '#ff6b6b', fontWeight: '600' }}>
                  {course.enrollmentStatus === 'open' ? 'Enrollment Open' :
                    course.enrollmentStatus === 'coming_soon' ? 'Coming Soon' : 'Seats Full'}
                </span>
                {course.availableSeats > 0 && (
                  <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {course.availableSeats} seats left
                  </span>
                )}
              </div>

              {course.enrollmentStatus === 'open' ? (
                <button
                  onClick={() => setEnrollModalOpen(true)}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '0.875rem' }}
                  id={`enroll-btn-${course.slug}`}
                >
                  🚀 Enroll Now
                </button>
              ) : (
                <Link
                  href="/contact"
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  📞 Get Notified
                </Link>
              )}

              {/* Features */}
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  '✓ Lifetime access to recordings',
                  '✓ Certificate upon completion',
                  '✓ Placement assistance',
                  '✓ Live project mentorship',
                  '✓ 7-day money back guarantee',
                ].map((f) => (
                  <div key={f} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{f}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: '72px',
        zIndex: 100,
      }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '0', overflowX: 'auto' }}>
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '1rem 1.5rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${activeTab === tab ? 'var(--color-primary)' : 'transparent'}`,
                  color: activeTab === tab ? 'var(--color-primary-light)' : 'var(--text-muted)',
                  fontWeight: activeTab === tab ? '600' : '400',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  textTransform: 'capitalize',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <section style={{ padding: '3rem 0', background: 'var(--bg-primary)' }}>
        <div className="container" style={{ maxWidth: '860px' }}>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              {/* What you'll learn */}
              {course.learningOutcomes?.length > 0 && (
                <div>
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                    What You'll Learn
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {course.learningOutcomes.map((item, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        padding: '0.875rem 1rem',
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)',
                      }}>
                        <span style={{ color: 'var(--color-success)', flexShrink: 0 }}>✓</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {course.fullDescription && (
                <div>
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
                    About This Course
                  </h2>
                  <div style={{
                    color: 'var(--text-secondary)',
                    lineHeight: 1.8,
                    fontSize: '0.95rem',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {course.fullDescription}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {course.requirements?.length > 0 && (
                <div>
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
                    Requirements
                  </h2>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingLeft: '1.5rem' }}>
                    {course.requirements.map((r, i) => (
                      <li key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Who is this for */}
              {course.whoIsThisFor?.length > 0 && (
                <div>
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
                    Who Is This For?
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {course.whoIsThisFor.map((item, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: '0.75rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.95rem',
                      }}>
                        <span style={{ color: 'var(--color-primary-light)', flexShrink: 0 }}>→</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {course.skillsCovered?.length > 0 && (
                <div>
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
                    Skills You'll Gain
                  </h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                    {course.skillsCovered.map((skill) => (
                      <span key={skill} style={{
                        background: 'rgba(0,212,255,0.08)',
                        color: 'var(--color-secondary)',
                        border: '1px solid rgba(0,212,255,0.2)',
                        padding: '0.35rem 0.875rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CURRICULUM TAB */}
          {activeTab === 'curriculum' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: '700' }}>
                  Course Curriculum
                </h2>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {curriculum.length} Modules
                </span>
              </div>

              {curriculum.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Curriculum details coming soon.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {curriculum.map((mod, i) => (
                    <div key={mod._id} style={{
                      background: 'var(--bg-card)',
                      border: '1px solid',
                      borderColor: openModule === mod._id ? 'rgba(108,99,255,0.3)' : 'var(--border-subtle)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                    }}>
                      <button
                        onClick={() => setOpenModule(openModule === mod._id ? null : mod._id)}
                        style={{
                          width: '100%',
                          padding: '1.25rem 1.5rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontFamily: 'Inter, sans-serif',
                          color: 'var(--text-primary)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{
                            width: '32px', height: '32px',
                            background: 'rgba(108,99,255,0.1)',
                            border: '1px solid rgba(108,99,255,0.2)',
                            borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.8rem', fontWeight: '700',
                            color: 'var(--color-primary-light)',
                            flexShrink: 0,
                          }}>
                            {i + 1}
                          </span>
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: '600' }}>{mod.title}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                              {mod.topics?.length || 0} topics{mod.duration ? ` · ${mod.duration}` : ''}
                            </div>
                          </div>
                        </div>
                        <span style={{
                          color: 'var(--color-primary-light)',
                          transition: 'transform 0.2s',
                          transform: openModule === mod._id ? 'rotate(180deg)' : 'none',
                        }}>▾</span>
                      </button>

                      {openModule === mod._id && mod.topics?.length > 0 && (
                        <div style={{
                          borderTop: '1px solid var(--border-subtle)',
                          padding: '0.5rem 0',
                        }}>
                          {mod.topics.map((topic) => (
                            <div key={topic._id} style={{
                              padding: '0.75rem 1.5rem 0.75rem 4rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '0.875rem',
                              color: 'var(--text-secondary)',
                              borderBottom: '1px solid rgba(255,255,255,0.03)',
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>▸</span>
                                {topic.title}
                                {topic.isOptional && (
                                  <span style={{
                                    background: 'rgba(255,184,0,0.1)',
                                    color: '#ffb800',
                                    border: '1px solid rgba(255,184,0,0.2)',
                                    padding: '0.1rem 0.4rem',
                                    borderRadius: '4px',
                                    fontSize: '0.65rem',
                                    fontWeight: '600',
                                  }}>Optional</span>
                                )}
                              </div>
                              {topic.duration && (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{topic.duration}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TRAINER TAB */}
          {activeTab === 'trainer' && (
            <div>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>
                Your Trainer{course.trainers?.length > 1 ? 's' : ''}
              </h2>
              {course.trainers?.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>
                  Trainer information coming soon.
                </div>
              ) : (
                course.trainers?.map((trainer) => (
                  <div key={trainer._id} style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '16px',
                    padding: '2rem',
                    marginBottom: '1.5rem',
                  }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', fontWeight: '700', color: '#fff',
                        flexShrink: 0, overflow: 'hidden',
                      }}>
                        {trainer.photo ? (
                          <img src={trainer.photo} alt={trainer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : trainer.name.charAt(0)}
                      </div>
                      <div>
                        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: '700' }}>{trainer.name}</h3>
                        <p style={{ color: 'var(--color-primary-light)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{trainer.designation}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>{trainer.experience}+ years experience</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{trainer.bio}</p>
                        {trainer.skills?.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '1rem' }}>
                            {trainer.skills.map((s) => (
                              <span key={s} style={{
                                background: 'rgba(108,99,255,0.08)',
                                color: 'var(--text-secondary)',
                                padding: '0.25rem 0.6rem',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                              }}>{s}</span>
                            ))}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                          {trainer.linkedin && <a href={trainer.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-light)', fontSize: '0.875rem' }}>💼 LinkedIn</a>}
                          {trainer.github && <a href={trainer.github} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-light)', fontSize: '0.875rem' }}>🐙 GitHub</a>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* PROJECTS / FAQs tabs placeholder */}
          {(activeTab === 'projects' || activeTab === 'faqs') && (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {activeTab === 'projects' ? '🚀' : '❓'}
              </div>
              <p>{activeTab === 'projects' ? 'Projects for this course coming soon.' : 'FAQs coming soon.'}</p>
            </div>
          )}
        </div>
      </section>

      {/* Enrollment Modal */}
      {enrollModalOpen && (
        <EnrollmentModal
          course={course}
          onClose={() => setEnrollModalOpen(false)}
        />
      )}

      <style>{`
        @media (max-width: 900px) {
          .course-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
