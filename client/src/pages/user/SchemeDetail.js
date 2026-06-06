import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch, CATEGORY_EMOJIS, INDIAN_STATES } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import UserNavbar from '../../components/UserNavbar';

export default function SchemeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    fullName: '', phone: '', aadhar: '', dob: '', gender: 'Male',
    address: '', state: '', pincode: '', income: 'Below 1L',
    occupation: 'Farmer', purpose: '',
  });

  useEffect(() => {
    apiFetch('/schemes/' + id).then(s => { setScheme(s); setLoading(false); }).catch(() => setLoading(false));
    // Pre-fill from user
    if (user) {
      setForm(p => ({
        ...p,
        fullName: user.name || '',
        phone: user.phone || '',
        gender: user.gender || 'Male',
        income: user.income || 'Below 1L',
        occupation: user.occupation || 'Farmer',
        state: user.state || '',
      }));
    }
  }, [id, user]);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    if (!form.fullName || !form.phone || !form.aadhar || !form.purpose) {
      toast('error', 'Missing fields', 'Please fill all required fields.');
      return;
    }
    setApplying(true);
    try {
      await apiFetch('/apply/' + id, { method: 'POST', body: JSON.stringify(form) });
      setSubmitted(true);
      toast('success', 'Application Submitted!', 'Your application is under review.');
    } catch (err) {
      toast('error', 'Failed', err.message);
    } finally { setApplying(false); }
  };

  if (loading) return (
    <>
      <div className="ashoka-stripe" /><UserNavbar />
      <div className="page-wrapper"><div className="container">
        <div className="skeleton" style={{ height: 400, borderRadius: 14 }} />
      </div></div>
    </>
  );

  if (!scheme) return (
    <>
      <div className="ashoka-stripe" /><UserNavbar />
      <div className="page-wrapper"><div className="container">
        <div className="empty-state"><h3>Scheme not found</h3><button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/schemes')}>← Back to Schemes</button></div>
      </div></div>
    </>
  );

  const emoji = CATEGORY_EMOJIS[scheme.category] || '📋';

  return (
    <>
      <div className="ashoka-stripe" />
      <UserNavbar />
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: 760 }}>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 8, marginBottom: 24 }} onClick={() => navigate('/schemes')}>← Back to Schemes</button>

          {submitted ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
              <h2 style={{ marginBottom: 8 }}>Application Submitted!</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
                Your application for <strong>{scheme.title}</strong> is now under review.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => navigate('/my-applications')}>View My Applications</button>
                <button className="btn btn-secondary" onClick={() => navigate('/schemes')}>Browse More Schemes</button>
              </div>
            </div>
          ) : (
            <>
              {/* Scheme Info Card */}
              <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
                  <div style={{ width: 56, height: 56, background: 'var(--saffron-dim)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>{emoji}</div>
                  <div style={{ flex: 1 }}>
                    <span className="scheme-cat-badge" style={{ marginBottom: 8, display: 'inline-flex' }}>{emoji} {scheme.category}</span>
                    <h1 style={{ fontSize: 26, marginBottom: 4 }}>{scheme.title}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>{scheme.shortDesc}</p>
                  </div>
                </div>
                {[
                  { label: 'Description', value: scheme.description },
                  { label: 'Eligibility', value: scheme.eligibility },
                  { label: 'Benefits', value: scheme.benefits },
                  { label: 'Required Documents', value: scheme.documents },
                  { label: 'Application Process', value: scheme.applicationProcess },
                ].map(({ label, value }) => value && (
                  <div key={label} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{value}</div>
                  </div>
                ))}
                {!showForm && (
                  <button className="btn btn-primary btn-lg" style={{ marginTop: 8, width: '100%' }} onClick={() => setShowForm(true)}>
                    Apply for this Scheme →
                  </button>
                )}
              </div>

              {/* Application Form */}
              {showForm && (
                <div className="card">
                  <div style={{ background: 'var(--saffron-dim)', border: '1px solid var(--border-bright)', borderRadius: 10, padding: '14px 18px', marginBottom: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--saffron)', marginBottom: 2 }}>Applying For</div>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16 }}>{scheme.title}</div>
                  </div>

                  <h2 style={{ marginBottom: 4 }}>Submit Application</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Please verify your details before submitting.</p>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input value={form.fullName} onChange={set('fullName')} />
                    </div>
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input value={form.phone} onChange={set('phone')} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Aadhar Number *</label>
                    <input placeholder="12-digit Aadhar" maxLength={12} value={form.aadhar} onChange={set('aadhar')} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date of Birth</label>
                      <input type="date" value={form.dob} onChange={set('dob')} />
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select value={form.gender} onChange={set('gender')}>
                        <option>Male</option><option>Female</option><option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <textarea placeholder="Full address" style={{ minHeight: 70 }} value={form.address} onChange={set('address')} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>State</label>
                      <select value={form.state} onChange={set('state')}>
                        <option value="">Select State</option>
                        {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Pincode</label>
                      <input placeholder="6-digit pincode" maxLength={6} value={form.pincode} onChange={set('pincode')} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Annual Income</label>
                      <select value={form.income} onChange={set('income')}>
                        <option>Below 1L</option><option>1-3L</option><option>3-5L</option><option>Above 5L</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Occupation</label>
                      <select value={form.occupation} onChange={set('occupation')}>
                        <option>Farmer</option><option>Student</option><option>Unemployed</option>
                        <option>Salaried</option><option>Self-Employed</option><option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Purpose / Reason for Applying *</label>
                    <textarea placeholder="Briefly explain why you're applying..." value={form.purpose} onChange={set('purpose')} />
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={submit} disabled={applying}>
                      {applying ? 'Submitting…' : 'Submit Application →'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
