import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => { apiFetch('/admin/stats').then(setStats).catch(() => {}); }, []);

  const statCards = stats ? [
    { label: 'Total Schemes', value: stats.totalSchemes, sub: `${stats.approvedSchemes} approved`, icon: '📜', cls: 'saffron', path: '/admin/schemes' },
    { label: 'Total Applications', value: stats.totalApplications, sub: `${stats.pendingApplications} pending`, icon: '📋', cls: 'blue', path: '/admin/applications' },
    { label: 'Approved', value: stats.approvedApplications, sub: 'Applications', icon: '✅', cls: 'green', path: '/admin/applications' },
    { label: 'Rejected', value: stats.rejectedApplications, sub: 'Applications', icon: '❌', cls: 'red', path: '/admin/applications' },
    { label: 'Total Users', value: stats.totalUsers, sub: 'Registered citizens', icon: '👥', cls: 'blue', path: '/admin/users' },
    { label: 'Unread Feedback', value: stats.unreadFeedback, sub: 'Awaiting reply', icon: '💬', cls: 'saffron', path: '/admin/feedback' },
  ] : [];

  return (
    <>
      <div className="ashoka-stripe" />
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-main">
          <div style={{ marginBottom: 32 }}>
            <h1>Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Overview of the Government Portal</p>
          </div>

          {!stats ? (
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 110 }} />)}
            </div>
          ) : (
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {statCards.map(s => (
                <div key={s.label} className={`stat-card ${s.cls}`} style={{ cursor: 'pointer' }} onClick={() => navigate(s.path)}>
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-num">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Links */}
          <div style={{ marginTop: 40 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 16 }}>Quick Actions</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {[
                { label: 'Review Applications', icon: '📋', path: '/admin/applications', sub: 'Pending approvals' },
                { label: 'Add New Scheme', icon: '➕', path: '/admin/add-scheme', sub: 'Create scheme' },
                { label: 'Manage Schemes', icon: '📜', path: '/admin/schemes', sub: 'Edit or approve' },
                { label: 'View Feedback', icon: '💬', path: '/admin/feedback', sub: 'Citizen responses' },
              ].map(a => (
                <div key={a.path} className="quick-action-card" onClick={() => navigate(a.path)}>
                  <div className="quick-action-icon" style={{ background: 'var(--blue-dim)' }}>{a.icon}</div>
                  <div>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14 }}>{a.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{a.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
