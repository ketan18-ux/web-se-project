import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      const data = await apiFetch('/login', { method: 'POST', body: JSON.stringify(form) });
      if (data.user.role !== 'admin') throw new Error('Access denied — admin only');
      login(data.token, data.user);
      navigate('/admin/dashboard');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="ashoka-stripe" />
      <div className="form-box">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="nav-emblem" style={{ margin: '0 auto 16px', width: 52, height: 52, fontSize: 26, background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}>⚙️</div>
          <div className="form-title">Admin Portal</div>
          <div className="form-subtitle">Sign in with administrator credentials</div>
        </div>

        {error && <div className="form-error">⚠️ {error}</div>}

        <div className="form-group">
          <label>Admin Email</label>
          <input type="email" placeholder="admin@gov.in" value={form.email} onChange={set('email')} onKeyDown={e => e.key === 'Enter' && submit()} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="••••••••" value={form.password} onChange={set('password')} onKeyDown={e => e.key === 'Enter' && submit()} />
        </div>

        <button className="btn btn-primary btn-full btn-lg" onClick={submit} disabled={loading}
          style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', color: '#fff' }}>
          {loading ? 'Signing in…' : 'Sign In as Admin →'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
          <Link to="/login" style={{ color: 'var(--saffron)', fontWeight: 600 }}>← Back to User Login</Link>
        </p>
      </div>
    </div>
  );
}
