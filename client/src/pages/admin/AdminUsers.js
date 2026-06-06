import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../../utils/api';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiFetch('/admin/users').then(data => { setUsers(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    !search ||
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.state || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="ashoka-stripe" />
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-main">
          <div style={{ marginBottom: 28 }}>
            <h1>Users</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>All registered citizens on the portal</p>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
            <div className="stat-card blue" style={{ flex: 1, padding: '16px 20px' }}>
              <div className="stat-num" style={{ fontSize: 28 }}>{users.filter(u => u.role !== 'admin').length}</div>
              <div className="stat-label">Total Citizens</div>
            </div>
            <div className="stat-card green" style={{ flex: 1, padding: '16px 20px' }}>
              <div className="stat-num" style={{ fontSize: 28 }}>{users.filter(u => u.role === 'admin').length}</div>
              <div className="stat-label">Admins</div>
            </div>
          </div>

          <div className="search-bar" style={{ maxWidth: 400, marginBottom: 20 }}>
            <span>🔍</span>
            <input placeholder="Search by name, email, state…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {loading ? (
            <div>{[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 64, marginBottom: 10, opacity: 1 - i * 0.15 }} />)}</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">👥</div><h3>No users found</h3></div>
          ) : (
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              {/* Table Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                {['Name', 'Email', 'State', 'Joined', 'Role'].map(h => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>{h}</div>
                ))}
              </div>
              {filtered.map((u, i) => (
                <div key={u._id} style={{
                  display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
                  padding: '14px 20px', alignItems: 'center',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'var(--transition)',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#FF9933,#e8841e)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#000', fontFamily: 'Syne', flexShrink: 0 }}>
                      {(u.name || 'U')[0].toUpperCase()}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{u.state || '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(u.createdAt)}</div>
                  <div>
                    <span className={`badge ${u.role === 'admin' ? 'badge-approved' : 'badge-pending'}`}>
                      {u.role === 'admin' ? '⚙️ Admin' : '👤 User'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
