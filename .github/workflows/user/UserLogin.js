import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function UserLogin() {
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
      login(data.token, data.user);
      if (data.user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="ashoka-stripe" />
      <div className="form-box">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="nav-emblem" style={{ margin: '0 auto 16px', width: 52, height: 52, fontSize: 26 }}>🏛</div>
          <div className="form-title">Welcome Back</div>
          <div className="form-subtitle">Sign in to your Gov Portal account</div>
        </div>

        {error && <div className="form-error">⚠️ {error}</div>}

        <div className="form-group">
          <label>Email Address</label>
          <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} onKeyDown={e => e.key === 'Enter' && submit()} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="••••••••" value={form.password} onChange={set('password')} onKeyDown={e => e.key === 'Enter' && submit()} />
        </div>

        <button className="btn btn-primary btn-full btn-lg" onClick={submit} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In →'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--saffron)', fontWeight: 600 }}>Register here</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
          Admin?{' '}
          <Link to="/admin/login" style={{ color: 'var(--blue)', fontWeight: 600 }}>Admin Login</Link>
        </p>
      </div>
    </div>
  );
}
