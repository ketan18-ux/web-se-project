import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import UserNavbar from '../../components/UserNavbar';

export default function Feedback() {
  const toast = useToast();
  const [form, setForm] = useState({ subject: '', message: '', rating: 5, category: 'General' });
  const [myFeedback, setMyFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    apiFetch('/my-feedback').then(setMyFeedback).catch(() => {});
  }, [submitted]);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    if (!form.subject || !form.message) { toast('error', 'Required', 'Please fill subject and message.'); return; }
    setLoading(true);
    try {
      await apiFetch('/feedback', { method: 'POST', body: JSON.stringify(form) });
      toast('success', 'Thank you!', 'Your feedback has been submitted.');
      setForm({ subject: '', message: '', rating: 5, category: 'General' });
      setSubmitted(s => !s);
    } catch (err) { toast('error', 'Failed', err.message); }
    finally { setLoading(false); }
  };

  const stars = [1, 2, 3, 4, 5];

  return (
    <>
      <div className="ashoka-stripe" />
      <UserNavbar />
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="page-header">
            <h1>💬 Feedback</h1>
            <p>Share your experience with the Gov Portal</p>
          </div>

          {/* Submit Form */}
          <div className="card" style={{ marginBottom: 32 }}>
            <h3 style={{ marginBottom: 20 }}>Submit Feedback</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={set('category')}>
                  <option>General</option><option>Technical</option><option>Scheme</option><option>Application</option>
                </select>
              </div>
              <div className="form-group">
                <label>Rating</label>
                <div className="stars" style={{ paddingTop: 8 }}>
                  {stars.map(s => (
                    <span key={s} className="star" style={{ opacity: s <= form.rating ? 1 : 0.3 }}
                      onClick={() => setForm(p => ({ ...p, rating: s }))}>⭐</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Subject *</label>
              <input placeholder="Brief subject" value={form.subject} onChange={set('subject')} />
            </div>
            <div className="form-group">
              <label>Message *</label>
              <textarea placeholder="Tell us about your experience…" style={{ minHeight: 120 }} value={form.message} onChange={set('message')} />
            </div>
            <button className="btn btn-primary" onClick={submit} disabled={loading}>
              {loading ? 'Submitting…' : '💬 Submit Feedback'}
            </button>
          </div>

          {/* My Previous Feedback */}
          {myFeedback.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 16 }}>My Previous Feedback</div>
              {myFeedback.map(f => (
                <div key={f._id} className="card" style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>{f.subject}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(f.createdAt)} · {f.category}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[1,2,3,4,5].map(s => <span key={s} style={{ opacity: s <= f.rating ? 1 : 0.2, fontSize: 14 }}>⭐</span>)}
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{f.message}</p>
                  {f.adminReply && (
                    <div style={{ marginTop: 12, padding: '12px 16px', background: 'var(--green-dim)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green-light)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Admin Reply</div>
                      <div style={{ fontSize: 14 }}>{f.adminReply}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
