import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, CATEGORY_EMOJIS, INDIAN_STATES } from '../../utils/api';
import UserNavbar from '../../components/UserNavbar';

export default function EligibilityCheck() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ age: '', gender: 'Male', state: '', income: 'Below 1L', occupation: 'Farmer', category: 'General', isDisabled: false });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const check = async () => {
    if (!form.age) return;
    setLoading(true);
    try {
      const data = await apiFetch('/schemes/check-eligibility', { method: 'POST', body: JSON.stringify({ ...form, age: parseInt(form.age) }) });
      setResults(data);
    } catch (e) { }
    finally { setLoading(false); }
  };

  return (
    <>
      <div className="ashoka-stripe" />
      <UserNavbar />
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="page-header">
            <h1>🎯 Eligibility Check</h1>
            <p>Find government schemes perfectly matched to your profile</p>
          </div>

          <div className="card" style={{ marginBottom: 28 }}>
            <h3 style={{ marginBottom: 20 }}>Your Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Age *</label>
                <input type="number" placeholder="Your age" value={form.age} onChange={set('age')} min={1} max={120} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select value={form.gender} onChange={set('gender')}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>State</label>
                <select value={form.state} onChange={set('state')}>
                  <option value="">Any State</option>
                  {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Annual Income</label>
                <select value={form.income} onChange={set('income')}>
                  <option>Below 1L</option><option>1-3L</option><option>3-5L</option><option>Above 5L</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Occupation</label>
                <select value={form.occupation} onChange={set('occupation')}>
                  <option>Farmer</option><option>Student</option><option>Unemployed</option>
                  <option>Salaried</option><option>Self-Employed</option><option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={set('category')}>
                  <option>General</option><option>OBC</option><option>SC</option><option>ST</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isDisabled} onChange={set('isDisabled')} style={{ width: 'auto' }} />
                I am differently abled
              </label>
            </div>
            <button className="btn btn-primary btn-lg btn-full" onClick={check} disabled={loading}>
              {loading ? 'Checking…' : '✨ Check Eligibility'}
            </button>
          </div>

          {results !== null && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 20 }}>
                {results.length > 0 ? `${results.length} eligible scheme${results.length !== 1 ? 's' : ''} found` : 'No fully eligible schemes found'}
              </div>
              {results.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <h3>No exact matches</h3>
                  <p>Try adjusting your profile details to find more schemes.</p>
                </div>
              ) : results.map((r, i) => (
                <div key={r.scheme._id} className="match-card" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                    <div style={{ width: 44, height: 44, background: 'var(--saffron-dim)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                      {CATEGORY_EMOJIS[r.scheme.category] || '📋'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16 }}>{r.scheme.title}</div>
                      <span className="scheme-cat-badge" style={{ marginTop: 4 }}>{r.scheme.category}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, color: 'var(--green-light)' }}>{r.matchScore}%</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>match</div>
                    </div>
                  </div>
                  <div className="match-bar-track"><div className="match-bar-fill" style={{ width: r.matchScore + '%' }} /></div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>{r.scheme.shortDesc}</div>
                  {r.matchedPoints.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                      {r.matchedPoints.map(p => (
                        <span key={p} style={{ fontSize: 11, fontWeight: 600, background: 'var(--green-dim)', color: 'var(--green-light)', padding: '3px 10px', borderRadius: 20, border: '1px solid rgba(16,185,129,0.2)' }}>✓ {p}</span>
                      ))}
                    </div>
                  )}
                  <button className="btn btn-primary btn-sm" onClick={() => navigate(`/schemes/${r.scheme._id}`)}>Apply Now →</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
