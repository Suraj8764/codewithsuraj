'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useAdmin } from '@/app/admin/AdminLayoutClient';
import toast from 'react-hot-toast';

interface Topic {
  _id: string;
  title: string;
  description: string;
  duration: string;
  isOptional: boolean;
  order: number;
}

interface Module {
  _id: string;
  title: string;
  description: string;
  duration: string;
  order: number;
  topics: Topic[];
}

export default function CurriculumBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { token } = useAdmin();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  // Add module state
  const [addingModule, setAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');

  // Add topic state
  const [addingTopicTo, setAddingTopicTo] = useState<string | null>(null);
  const [newTopic, setNewTopic] = useState({ title: '', duration: '', isOptional: false });

  // Edit module
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [editModuleTitle, setEditModuleTitle] = useState('');

  function fetchCurriculum() {
    fetch(`/api/courses/${id}/curriculum`)
      .then((r) => r.json())
      .then((data) => { if (data.success) setModules(data.curriculum); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchCurriculum(); }, [id]);

  async function sendAction(action: string, data: Record<string, unknown>) {
    const res = await fetch(`/api/courses/${id}/curriculum`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, data }),
    });
    return res.json();
  }

  async function addModule() {
    if (!newModuleTitle.trim()) return;
    const result = await sendAction('add_module', { title: newModuleTitle });
    if (result.success) {
      toast.success('Module added');
      setNewModuleTitle('');
      setAddingModule(false);
      fetchCurriculum();
    }
  }

  async function deleteModule(moduleId: string) {
    if (!confirm('Delete this module and all its topics?')) return;
    const result = await sendAction('delete_module', { moduleId });
    if (result.success) { toast.success('Module deleted'); fetchCurriculum(); }
  }

  async function updateModule(moduleId: string, title: string) {
    const result = await sendAction('update_module', { _id: moduleId, title });
    if (result.success) { toast.success('Updated'); setEditingModule(null); fetchCurriculum(); }
  }

  async function addTopic(moduleId: string) {
    if (!newTopic.title.trim()) return;
    const result = await sendAction('add_topic', { moduleId, ...newTopic });
    if (result.success) {
      toast.success('Topic added');
      setNewTopic({ title: '', duration: '', isOptional: false });
      setAddingTopicTo(null);
      fetchCurriculum();
    }
  }

  async function deleteTopic(topicId: string) {
    const result = await sendAction('delete_topic', { topicId });
    if (result.success) { toast.success('Topic deleted'); fetchCurriculum(); }
  }

  async function moveModule(idx: number, dir: 'up' | 'down') {
    const newMods = [...modules];
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newMods.length) return;
    [newMods[idx], newMods[swapIdx]] = [newMods[swapIdx], newMods[idx]];
    const updated = newMods.map((m, i) => ({ ...m, order: i }));
    setModules(updated);
    await sendAction('reorder_modules', {
      modules: updated.map((m) => ({ _id: m._id, order: m.order })),
    });
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: '700', color: '#e8e8f0', marginBottom: '0.25rem' }}>
            Curriculum Builder
          </h1>
          <p style={{ color: '#6b6b8a', fontSize: '0.875rem' }}>{modules.length} modules · Drag to reorder</p>
        </div>
        <button
          onClick={() => setAddingModule(true)}
          className="btn btn-primary"
          style={{ background: 'linear-gradient(135deg, #7c6df8, #00d4ff)' }}
        >
          ➕ Add Module
        </button>
      </div>

      {/* Add Module Input */}
      {addingModule && (
        <div style={{
          background: 'var(--admin-card)',
          border: '1px solid rgba(124,109,248,0.3)',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
        }}>
          <input
            type="text"
            placeholder="Module title (e.g. Module 1: JavaScript Fundamentals)"
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            className="form-input"
            style={{ background: 'rgba(13,13,20,0.8)', flex: 1 }}
            onKeyDown={(e) => e.key === 'Enter' && addModule()}
            autoFocus
            id="new-module-title"
          />
          <button onClick={addModule} className="btn btn-primary btn-sm"
            style={{ background: 'linear-gradient(135deg, #7c6df8, #00d4ff)', whiteSpace: 'nowrap' }}>
            Add Module
          </button>
          <button onClick={() => setAddingModule(false)} className="btn btn-ghost btn-sm"
            style={{ border: '1px solid var(--admin-border)', color: '#e8e8f0' }}>
            Cancel
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b6b8a' }}>Loading curriculum...</div>
      ) : modules.length === 0 ? (
        <div style={{
          background: 'var(--admin-card)', border: '1px solid var(--admin-border)',
          borderRadius: '16px', padding: '4rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
          <h3 style={{ color: '#e8e8f0', marginBottom: '0.5rem' }}>No modules yet</h3>
          <p style={{ color: '#6b6b8a', marginBottom: '1.5rem' }}>Start building your curriculum by adding the first module.</p>
          <button onClick={() => setAddingModule(true)} className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg, #7c6df8, #00d4ff)' }}>
            Add First Module
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {modules.map((mod, idx) => (
            <div key={mod._id} style={{
              background: 'var(--admin-card)',
              border: '1px solid var(--admin-border)',
              borderRadius: '14px',
              overflow: 'hidden',
              transition: 'border-color 0.2s ease',
            }}>
              {/* Module Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 1.25rem',
                background: expandedModule === mod._id ? 'rgba(124,109,248,0.05)' : 'transparent',
              }}>
                {/* Reorder */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <button onClick={() => moveModule(idx, 'up')} disabled={idx === 0}
                    style={{ background: 'none', border: 'none', color: idx === 0 ? '#3a3a4a' : '#6b6b8a', cursor: idx === 0 ? 'default' : 'pointer', fontSize: '0.7rem' }}>▲</button>
                  <button onClick={() => moveModule(idx, 'down')} disabled={idx === modules.length - 1}
                    style={{ background: 'none', border: 'none', color: idx === modules.length - 1 ? '#3a3a4a' : '#6b6b8a', cursor: idx === modules.length - 1 ? 'default' : 'pointer', fontSize: '0.7rem' }}>▼</button>
                </div>

                <span style={{
                  width: '28px', height: '28px',
                  background: 'rgba(124,109,248,0.12)',
                  border: '1px solid rgba(124,109,248,0.25)',
                  borderRadius: '7px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: '700', color: '#9b8dfb', flexShrink: 0,
                }}>{idx + 1}</span>

                {editingModule === mod._id ? (
                  <input
                    type="text"
                    value={editModuleTitle}
                    onChange={(e) => setEditModuleTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') updateModule(mod._id, editModuleTitle); if (e.key === 'Escape') setEditingModule(null); }}
                    className="form-input"
                    style={{ background: 'rgba(13,13,20,0.8)', flex: 1, padding: '0.4rem 0.75rem' }}
                    autoFocus
                  />
                ) : (
                  <span style={{ flex: 1, fontWeight: '600', color: '#e8e8f0', fontSize: '0.9rem' }}>
                    {mod.title}
                  </span>
                )}

                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6b6b8a', marginRight: '0.5rem' }}>
                    {mod.topics?.length || 0} topics
                  </span>

                  <button
                    onClick={() => {
                      setEditingModule(mod._id);
                      setEditModuleTitle(mod.title);
                    }}
                    style={{ padding: '0.3rem 0.5rem', background: 'rgba(124,109,248,0.1)', border: '1px solid rgba(124,109,248,0.2)', borderRadius: '6px', color: '#9b8dfb', fontSize: '0.75rem', cursor: 'pointer' }}
                  >✏️</button>

                  <button
                    onClick={() => setAddingTopicTo(addingTopicTo === mod._id ? null : mod._id)}
                    style={{ padding: '0.3rem 0.5rem', background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.2)', borderRadius: '6px', color: '#00c896', fontSize: '0.75rem', cursor: 'pointer' }}
                  >➕ Topic</button>

                  <button
                    onClick={() => setExpandedModule(expandedModule === mod._id ? null : mod._id)}
                    style={{ padding: '0.3rem 0.6rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--admin-border)', borderRadius: '6px', color: '#a8a8c0', fontSize: '0.75rem', cursor: 'pointer' }}
                  >{expandedModule === mod._id ? '▲ Hide' : '▼ Topics'}</button>

                  <button
                    onClick={() => deleteModule(mod._id)}
                    style={{ padding: '0.3rem 0.5rem', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: '6px', color: '#ff4444', fontSize: '0.75rem', cursor: 'pointer' }}
                  >🗑️</button>
                </div>
              </div>

              {/* Add Topic Form */}
              {addingTopicTo === mod._id && (
                <div style={{
                  padding: '1rem 1.25rem',
                  background: 'rgba(0,200,150,0.04)',
                  borderTop: '1px solid rgba(0,200,150,0.1)',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}>
                  <input
                    type="text"
                    placeholder="Topic title"
                    value={newTopic.title}
                    onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                    className="form-input"
                    style={{ background: 'rgba(13,13,20,0.8)', flex: 2, minWidth: '180px' }}
                    onKeyDown={(e) => e.key === 'Enter' && addTopic(mod._id)}
                    autoFocus
                    id={`new-topic-${mod._id}`}
                  />
                  <input
                    type="text"
                    placeholder="Duration (e.g. 2h)"
                    value={newTopic.duration}
                    onChange={(e) => setNewTopic({ ...newTopic, duration: e.target.value })}
                    className="form-input"
                    style={{ background: 'rgba(13,13,20,0.8)', flex: 1, minWidth: '100px' }}
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#a8a8c0', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <input type="checkbox" checked={newTopic.isOptional}
                      onChange={(e) => setNewTopic({ ...newTopic, isOptional: e.target.checked })}
                      style={{ accentColor: '#7c6df8' }} />
                    Optional
                  </label>
                  <button onClick={() => addTopic(mod._id)} className="btn btn-sm"
                    style={{ background: 'rgba(0,200,150,0.15)', border: '1px solid rgba(0,200,150,0.3)', color: '#00c896', whiteSpace: 'nowrap' }}>
                    Add
                  </button>
                  <button onClick={() => setAddingTopicTo(null)} className="btn btn-sm"
                    style={{ background: 'transparent', border: '1px solid var(--admin-border)', color: '#6b6b8a' }}>
                    Cancel
                  </button>
                </div>
              )}

              {/* Topics List */}
              {expandedModule === mod._id && mod.topics?.length > 0 && (
                <div style={{ borderTop: '1px solid var(--admin-border)' }}>
                  {mod.topics.map((topic, ti) => (
                    <div key={topic._id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.7rem 1.25rem 0.7rem 3.5rem',
                      borderBottom: ti < mod.topics.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                    }}>
                      <span style={{ color: '#6b6b8a', fontSize: '0.75rem' }}>▸</span>
                      <span style={{ flex: 1, fontSize: '0.875rem', color: '#a8a8c0' }}>{topic.title}</span>
                      {topic.isOptional && (
                        <span style={{
                          background: 'rgba(255,184,0,0.1)', color: '#ffb800',
                          border: '1px solid rgba(255,184,0,0.2)',
                          padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '600',
                        }}>Optional</span>
                      )}
                      {topic.duration && (
                        <span style={{ fontSize: '0.75rem', color: '#6b6b8a' }}>{topic.duration}</span>
                      )}
                      <button onClick={() => deleteTopic(topic._id)}
                        style={{ background: 'none', border: 'none', color: '#6b6b8a', cursor: 'pointer', fontSize: '0.9rem' }}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
