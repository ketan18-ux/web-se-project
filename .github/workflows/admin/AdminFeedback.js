import { useEffect, useState, useCallback } from 'react';
import { apiFetch, formatDate } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminFeedback() {
  const toast = useToast();
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [replying, setReplying] = useState(false);
  const [filter, setFilter] = useState('');

  const load = useCallback(() => {
    Promise.all([
      apiFetch('/admin/feedback'),
      apiFetch('/admin/feedback-stats'),
    ]).then(([fb, st]) => { setFeedbacks(fb); setStats(st); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openModal = (f) => { setSelected(f); setReply(f.adminReply || ''); };
  const closeModal = () => { setSelected(null); setReply(''); };

  const sendReply = async () => {
    if (!reply.trim()) return;
    setReplying(true);
    try {
      await apiFetch(`/admin/feedback/${selected._id}`, { method: 'PATCH', body: JSON.stringify({ adminReply: reply }) });
      toast('success', 'Reply sent!', '');
      closeModal();
      load();
    } catch (err) { toast('error', 'Failed', err.message); }
    finally { setReplying(false); }
  };

  const filtered = filter ? feedbacks.filter(f => f.status === filter) : feedbacks;

  return (
    <>
      <div className="ashoka-stripe" />
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-main">
          <div style={{ marginBottom: 28 }}>
            <h1>Feedback</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Manage citizen feedback and replies</p>
          </div>

          {/* Stats */}
          {stats && (
            <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
              <div className="stat-card blue" style={{ flex: 1, minWidth: 130, padding: '16px 20px' }}>
                <div className="stat-num" style={{ fontSize: 28 }}>{stats.total}</div>
                <div className="stat-label">Total Feedback</div>
              </div>
              <div className="stat-card saffron" style={{ flex: 1, minWidth: 130, padding: '16px 20px' }}>
                <div className="stat-num" style={{ fontSize: 28 }}>{stats.unread}</div>
                <div className="stat-label">Unread</div>
              </div>
              <div className="stat-card green" style={{ flex: 1, minWidth: 130, padding: '16px 20px' }}>
                <div className="stat-num" style={{ fontSize: 28 }}>{stats.avgRating}⭐</div>
                <div className="stat-label">Avg Rating</div>
              </div>
            </div>
          )}

          <div className="filter-tabs" style={{ marginBottom: 20 }}>
            {[['', 'All'], ['unread', '🔴 Unread'], ['read', '✅ Read']].map(([val, label]) => (
              <button key={val} className={`filter-tab ${filter === val ? 'active' : ''}`} onClick={() => setFilter(val)}>{label}</button>
            ))}
          </div>

          {loading ? (
            <div>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, marginBottom: 10 }} />)}</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">💬</div><h3>No feedback found</h3></div>
          ) : (
            filtered.map((f, i) => (
              <div key={f._id} className="admin-app-row" style={{ animationDelay: `${i * 0.03}s`, borderLeft: f.status === 'unread' ? '3px solid var(--saffron)' : undefined }} onClick={() => openModal(f)}>
                <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#FF9933,#e8841e)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#000', fontFamily: 'Syne', flexShrink: 0 }}>
                  {(f.userName || 'U')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.subject}</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 3 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>👤 {f.userName}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📅 {formatDate(f.createdAt)}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.category}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 12, opacity: s <= f.rating ? 1 : 0.2 }}>⭐</span>)}
                  </div>
                  <span className={`badge ${f.status === 'unread' ? 'badge-pending' : 'badge-approved'}`}>
                    {f.status === 'unread' ? 'Unread' : 'Read'}
                  </span>
                  {f.adminReply && <span style={{ fontSize: 11, color: 'var(--green-light)' }}>✓ Replied</span>}
                </div>
              </div>
            ))
          )}
        </main>
      </div>

      {/* Reply Modal */}
      {selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            <h2 style={{ marginBottom: 6 }}>{selected.subject}</h2>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              From {selected.userName} · {formatDate(selected.createdAt)} · {selected.category}
            </div>

            <div style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 20, fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
              {selected.message}
            </div>

            <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
              {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 18, opacity: s <= selected.rating ? 1 : 0.2 }}>⭐</span>)}
            </div>

            {selected.adminReply && (
              <div style={{ padding: '12px 16px', background: 'var(--green-dim)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green-light)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Previous Reply</div>
                <div style={{ fontSize: 14 }}>{selected.adminReply}</div>
              </div>
            )}

            <div className="form-group">
              <label>{selected.adminReply ? 'Update Reply' : 'Reply to Feedback'}</label>
              <textarea style={{ minHeight: 100 }} placeholder="Write your reply…" value={reply} onChange={e => setReply(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={sendReply} disabled={replying || !reply.trim()}>
              {replying ? 'Sending…' : '💬 Send Reply'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
