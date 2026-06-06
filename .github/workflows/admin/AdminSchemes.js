import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, formatDate, CATEGORY_EMOJIS } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminSchemes() {
  const navigate = useNavigate();
  const toast = useToast();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    apiFetch('/admin/schemes').then(data => { setSchemes(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleApprove = async (id, current) => {
    try {
      await apiFetch(`/admin/schemes/${id}/approve`, { method: 'PATCH', body: JSON.stringify({ adminApproved: !current }) });
      toast('success', !current ? 'Scheme Approved' : 'Approval Revoked', '');
      load();
    } catch (err) { toast('error', 'Failed', err.message); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this scheme?')) return;
    await apiFetch(`/admin/schemes/${id}`, { method: 'DELETE' });
    toast('success', 'Scheme deleted', '');
    load();
  };

  const filtered = schemes.filter(s =>
    !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="ashoka-stripe" />
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-main">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <h1>Schemes</h1>
              <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Manage government welfare schemes</p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/admin/add-scheme')}>➕ Add Scheme</button>
          </div>

          <div className="search-bar" style={{ maxWidth: 400, marginBottom: 24 }}>
            <span>🔍</span>
            <input placeholder="Search schemes…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {loading ? (
            <div>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 70, marginBottom: 10 }} />)}</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📭</div><h3>No schemes found</h3></div>
          ) : (
            filtered.map((s, i) => (
              <div key={s._id} className="admin-app-row" style={{ animationDelay: `${i * 0.03}s` }}>
                <div style={{ width: 44, height: 44, background: 'var(--saffron-dim)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {CATEGORY_EMOJIS[s.category] || '📋'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--saffron)' }}>{s.category}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Added {formatDate(s.createdAt)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span className={`badge ${s.adminApproved ? 'badge-approved' : 'badge-pending'}`}>
                    {s.adminApproved ? 'Approved' : 'Draft'}
                  </span>
                  <button
                    className={`btn btn-sm ${s.adminApproved ? 'btn-secondary' : 'btn-success'}`}
                    onClick={() => toggleApprove(s._id, s.adminApproved)}
                  >
                    {s.adminApproved ? 'Unapprove' : '✅ Approve'}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => del(s._id)}>🗑</button>
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </>
  );
}
