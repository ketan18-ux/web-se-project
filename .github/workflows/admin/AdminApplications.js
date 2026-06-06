import { useEffect, useState, useCallback } from 'react';
import { apiFetch, formatDate, CATEGORY_EMOJIS } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminApplications() {
  const toast = useToast();
  const [allApps, setAllApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch('/admin/applications')
      .then(data => { setAllApps(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = allApps.filter(a => {
    const matchStatus = !filter || a.status === filter;
    const s = search.toLowerCase();
    const matchSearch = !s || (a.fullName||'').toLowerCase().includes(s) || (a.applicationNo||'').toLowerCase().includes(s) || (a.email||'').toLowerCase().includes(s) || (a.schemeId?.title||'').toLowerCase().includes(s);
    return matchStatus && matchSearch;
  });

  const counts = { total: allApps.length, pending: 0, approved: 0, rejected: 0 };
  allApps.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });

  const openModal = (app) => { setSelected(app); setNote(app.adminNote || app.adminRemarks || ''); };
  const closeModal = () => { setSelected(null); setNote(''); };

  const review = async (status) => {
    setReviewing(true);
    try {
      await apiFetch(`/admin/applications/${selected._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, adminNote: note, adminRemarks: note }),
      });
      toast('success', status === 'approved' ? 'Application Approved ✅' : 'Application Rejected', '');
      closeModal();
      load();
    } catch (err) { toast('error', 'Failed', err.message); }
    finally { setReviewing(false); }
  };

  return (
    <>
      <div className="ashoka-stripe" />
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-main">
          <div style={{ marginBottom: 28 }}>
            <h1>Applications</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Review and manage citizen scheme applications</p>
          </div>

          {/* Stats */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 28 }}>
            {[
              { label: 'Total', value: counts.total, icon: '📋', cls: 'blue' },
              { label: 'Pending', value: counts.pending, icon: '⏳', cls: 'saffron' },
              { label: 'Approved', value: counts.approved, icon: '✅', cls: 'green' },
              { label: 'Rejected', value: counts.rejected, icon: '❌', cls: 'red' },
            ].map(s => (
              <div key={s.label} className={`stat-card ${s.cls}`} style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 24 }}>{s.icon}</div>
                <div className="stat-num" style={{ fontSize: 28 }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="admin-toolbar">
            <div className="search-bar" style={{ flex: 1, maxWidth: 400, margin: 0 }}>
              <span>🔍</span>
              <input placeholder="Search name, app no, email…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="filter-tabs" style={{ margin: 0 }}>
              {[['', 'All'], ['pending', '⏳ Pending'], ['approved', '✅ Approved'], ['rejected', '❌ Rejected']].map(([val, label]) => (
                <button key={val} className={`filter-tab ${filter === val ? 'active' : ''}`} onClick={() => setFilter(val)}>{label}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, marginBottom: 10, opacity: 1 - i * 0.2 }} />)}</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No applications found</h3>
              <p>Try adjusting search or filter.</p>
            </div>
          ) : (
            filtered.map((a, i) => (
              <div key={a._id} className={`admin-app-row ${a.status}-row`} style={{ animationDelay: `${i * 0.03}s` }} onClick={() => openModal(a)}>
                <div style={{ width: 44, height: 44, background: 'var(--saffron-dim)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {CATEGORY_EMOJIS[a.schemeId?.category] || '📄'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.schemeId?.title || 'Unknown Scheme'}</div>
                  <div style={{ fontSize: 12, color: 'var(--saffron)', fontWeight: 600, marginBottom: 4 }}>{a.applicationNo}</div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>👤 {a.fullName}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📅 {formatDate(a.appliedAt)}</span>
                    {a.state && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📍 {a.state}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`badge badge-${a.status}`}>{a.status}</span>
                  <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); openModal(a); }}>Review →</button>
                </div>
              </div>
            ))
          )}
        </main>
      </div>

      {/* Review Modal */}
      {selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            <h2 style={{ marginBottom: 20 }}>Review: {selected.schemeId?.title || 'Application'}</h2>

            {/* User block */}
            <div className="user-profile-block">
              <div className="user-avatar">{(selected.fullName || 'U')[0].toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16 }}>{selected.fullName || '—'}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selected.email || selected.userId?.email || '—'}</div>
              </div>
              <span className={`badge badge-${selected.status}`}>{selected.status}</span>
            </div>

            {/* Details Grid */}
            <div className="detail-grid">
              {[
                { label: 'Application No', value: selected.applicationNo },
                { label: 'Applied', value: formatDate(selected.appliedAt) },
                { label: 'Phone', value: selected.phone },
                { label: 'Aadhar', value: selected.aadhar },
                { label: 'DOB', value: selected.dob ? formatDate(selected.dob) : '—' },
                { label: 'Gender', value: selected.gender },
                { label: 'State', value: selected.state },
                { label: 'Income', value: selected.income },
                { label: 'Occupation', value: selected.occupation },
                { label: 'Category', value: selected.category },
              ].map(d => d.value && (
                <div key={d.label} className="detail-item">
                  <div className="detail-label">{d.label}</div>
                  <div className="detail-value">{d.value}</div>
                </div>
              ))}
            </div>

            {selected.purpose && (
              <div className="form-group">
                <label>Purpose</label>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border)' }}>{selected.purpose}</div>
              </div>
            )}

            <div className="form-group" style={{ marginTop: 20 }}>
              <label>Admin Remarks (optional)</label>
              <textarea placeholder="Add remarks or comments for the applicant…" style={{ minHeight: 80 }} value={note} onChange={e => setNote(e.target.value)} />
            </div>

            {selected.status === 'pending' && (
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button className="btn btn-success" style={{ flex: 1 }} onClick={() => review('approved')} disabled={reviewing}>
                  ✅ Approve Application
                </button>
                <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => review('rejected')} disabled={reviewing}>
                  ❌ Reject Application
                </button>
              </div>
            )}
            {selected.status !== 'pending' && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                This application has already been reviewed ({selected.status}).
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
