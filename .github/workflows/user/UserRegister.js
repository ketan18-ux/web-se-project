import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch, INDIAN_STATES } from '../../utils/api';

export default function UserRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', dob: '', gender: 'Male',
    state: '', district: '', income: 'Below 1L', occupation: 'Farmer', category: 'General', isDisabled: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      await apiFetch('/register', { method: 'POST', body: JSON.stringify(form) });
      navigate('/login');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="ashoka-stripe" />
      <div className="form-box" style={{ maxWidth: 560 }}>
        <div className="form-title" style={{ marginBottom: 4 }}>Create Account</div>
        <div className="form-subtitle">Join the Government Welfare Portal</div>

        {error && <div className="form-error">⚠️ {error}</div>}

        <div className="form-row">
          <div className="form-group">
            <label>Full Name</label>
            <input placeholder="Your full name" value={form.name} onChange={set('name')} />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input placeholder="10-digit number" value={form.phone} onChange={set('phone')} />
          </div>
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} />
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

        <div className="form-row">
          <div className="form-group">
            <label>State</label>
            <select value={form.state} onChange={set('state')}>
              <option value="">Select State</option>
              {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>District</label>
            <input placeholder="District" value={form.district} onChange={set('district')} />
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

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={set('category')}>
              <option>General</option><option>OBC</option><option>SC</option><option>ST</option>
            </select>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 0 }}>
              <input type="checkbox" checked={form.isDisabled} onChange={set('isDisabled')} style={{ width: 'auto' }} />
              Differently Abled
            </label>
          </div>
        </div>

        <button className="btn btn-primary btn-full btn-lg" onClick={submit} disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Creating Account…' : 'Create Account →'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--saffron)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
