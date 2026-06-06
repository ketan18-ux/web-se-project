import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, formatDate, CATEGORY_EMOJIS } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import UserNavbar from '../../components/UserNavbar';

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/my-applications')
      .then(data => { setApps(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const counts = { total: apps.length, pending: 0, approved: 0, rejected: 0 };
  apps.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });

  const quickActions = [
    { label: 'Browse Schemes', sub: 'All active schemes', icon: '📜', path: '/schemes', color: 'var(--blue-dim)' },
    { label: 'Eligibility Check', sub: 'Find matching schemes', icon: '🎯', path: '/eligibility', color: 'var(--saffron-dim)' },
    { label: 'My Applications', sub: 'Track your status', icon: '📁', path: '/my-applications', color: 'var(--green-dim)' },
    { label: 'Give Feedback', sub: 'Share your experience', icon: '💬', path: '/feedback', color: 'rgba(251,191,36,0.08)' },
  ];

  return (
    <>
      <div className="ashoka-stripe" />
      <UserNavbar />
      <div className="page-wrapper">
        <div className="container">
          <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1>Welcome, {user?.name?.split(' ')[0]} 👋</h1>
              <p>Here's an overview of your activity on the portal.</p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/eligibility')}>✨ Check Eligibility</button>
          </div>

          {/* Stats */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="stat-card blue">
              <div className="stat-icon">📋</div>
              <div className="stat-num">{loading ? '—' : counts.total}</div>
              <div className="stat-label">Total Applications</div>
            </div>
            <div className="stat-card saffron">
              <div className="stat-icon">⏳</div>
              <div className="stat-num">{loading ? '—' : counts.pending}</div>
              <div className="stat-label">Pending Review</div>
            </div>
            <div className="stat-card green">
              <div className="stat-icon">✅</div>
              <div className="stat-num">{loading ? '—' : counts.approved}</div>
              <div className="stat-label">Approved</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 16 }}>Quick Actions</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {quickActions.map(a => (
                <div key={a.path} className="quick-action-card" onClick={() => navigate(a.path)}>
                  <div className="quick-action-icon" style={{ background: a.color }}>{a.icon}</div>
                  <div>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15 }}>{a.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{a.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Applications */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 16 }}>Recent Applications</div>
            {loading ? (
              <div>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, marginBottom: 10, opacity: 1 - i * 0.2 }} />)}
              </div>
            ) : apps.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No applications yet</h3>
                <p>Start by exploring available schemes.</p>
                <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/schemes')}>Browse Schemes →</button>
              </div>
            ) : (
              apps.slice(0, 5).map(a => {
                const scheme = a.schemeId || {};
                const emoji = CATEGORY_EMOJIS[scheme.category] || '📋';
                const statusColors = { pending: 'var(--gold)', approved: 'var(--green-light)', rejected: 'var(--red)' };
                return (
                  <div key={a._id} className="admin-app-row" onClick={() => navigate('/my-applications')}>
                    <div style={{ width: 42, height: 42, background: 'var(--saffron-dim)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scheme.title || 'Scheme'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Applied {formatDate(a.appliedAt)}</div>
                    </div>
                    <span className={`badge badge-${a.status}`}>
                      {a.status === 'pending' ? '⏳ ' : a.status === 'approved' ? '✅ ' : '❌ '}
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
