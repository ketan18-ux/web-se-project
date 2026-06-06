import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, formatDate, CATEGORY_EMOJIS } from '../../utils/api';
import { launchConfetti } from '../../utils/confetti';
import UserNavbar from '../../components/UserNavbar';
import Stepper from '../../components/Stepper';

export default function MyApplications() {
  const navigate = useNavigate();
  const [allApps, setAllApps] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/my-applications')
      .then(data => {
        // THE FIX: Each application from the API already carries its own officialLink
        // (set by server for approved+officialLinkVisible apps). We store all apps
        // in state preserving each app's individual officialLink independently —
        // no global state, no overwriting of previous links.
        setAllApps(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const counts = { total: allApps.length, pending: 0, approved: 0, rejected: 0 };
  allApps.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });

  const filtered = filter ? allApps.filter(a => a.status === filter) : allApps;
  const hasApproved = allApps.some(a => a.status === 'approved');

  return (
    <>
      <div className="ashoka-stripe" />
      <UserNavbar />
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="page-header">
            <h1>My Applications</h1>
            <p>Track the real-time status of all your scheme applications</p>
          </div>

          {/* Approval Banner — shown if ANY application is approved */}
          {hasApproved && (
            <div className="success-banner">
              <div style={{ fontSize: 28 }}>🎉</div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--green-light)', marginBottom: 4 }}>
                  Congratulations! You have approved applications.
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Scroll down to access the official government portals for your approved schemes.
                </div>
              </div>
            </div>
          )}

          {/* Stats Bar */}
          {!loading && allApps.length > 0 && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
              {[
                { label: 'Total', value: counts.total, cls: 'blue' },
                { label: 'Pending', value: counts.pending, cls: 'saffron' },
                { label: 'Approved', value: counts.approved, cls: 'green' },
                { label: 'Rejected', value: counts.rejected, cls: 'red' },
              ].map(s => (
                <div key={s.label} className={`stat-card ${s.cls}`} style={{ flex: 1, minWidth: 110, padding: '16px 20px' }}>
                  <div className="stat-num" style={{ fontSize: 28 }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Filter Tabs */}
          <div className="filter-tabs">
            {[['', 'All'], ['pending', '⏳ Pending'], ['approved', '✅ Approved'], ['rejected', '❌ Rejected']].map(([val, label]) => (
              <button key={val} className={`filter-tab ${filter === val ? 'active' : ''}`} onClick={() => setFilter(val)}>{label}</button>
            ))}
          </div>

          {/* Applications */}
          {loading ? (
            <div>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 130, marginBottom: 12, opacity: 1 - i * 0.25 }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>{filter ? `No ${filter} applications` : 'No applications yet'}</h3>
              <p>{filter ? 'Try a different filter.' : "You haven't applied for any schemes yet."}</p>
              {!filter && (
                <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/schemes')}>Browse Schemes →</button>
              )}
            </div>
          ) : (
            filtered.map((a, i) => <AppCard key={a._id} app={a} delay={i * 0.06} />)
          )}
        </div>
      </div>
    </>
  );
}

function AppCard({ app: a, delay }) {
  const scheme = a.schemeId || {};
  const emoji = CATEGORY_EMOJIS[scheme.category] || '📋';
  const isApproved = a.status === 'approved';
  const isRejected = a.status === 'rejected';

  return (
    <div
      className={`app-card ${a.status} ${isApproved ? 'glow' : ''}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="app-card-header">
        <div className={`app-scheme-icon ${isApproved ? 'approved-icon' : isRejected ? 'rejected-icon' : ''}`}>
          {emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="app-card-title">{scheme.title || 'Scheme'}</div>
          <div className="app-card-no">{a.applicationNo}</div>
          <div className="app-meta">
            <span className="app-meta-chip">📅 Applied: {formatDate(a.appliedAt)}</span>
            {a.reviewedAt && <span className="app-meta-chip">🔍 Reviewed: {formatDate(a.reviewedAt)}</span>}
            {scheme.category && <span className="app-meta-chip">{emoji} {scheme.category}</span>}
          </div>
        </div>
        <span className={`badge badge-${a.status}`}>
          {a.status === 'pending' ? '⏳ ' : a.status === 'approved' ? '✅ ' : '❌ '}
          {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
        </span>
      </div>

      <Stepper status={a.status} />

      {/* APPROVED: Each card independently shows its own officialLink from its own app object */}
      {isApproved && a.officialLink && (
        <div className="approval-notification">
          <div style={{ fontSize: 24, flexShrink: 0 }}>🎉</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-light)', marginBottom: 6 }}>
              Application Approved!
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
              Your application has been verified. Proceed to the official government portal.
            </div>
            <a
              href={a.officialLink}
              target="_blank"
              rel="noopener noreferrer"
              className="official-portal-btn"
              onClick={launchConfetti}
            >
              🏛️ Proceed to Official Government Portal
              <span>→</span>
            </a>
          </div>
        </div>
      )}

      {isApproved && !a.officialLink && (
        <div className="approval-notification">
          <div style={{ fontSize: 22, flexShrink: 0 }}>✅</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-light)', marginBottom: 4 }}>Application Approved!</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Contact the portal admin for the official government link.</div>
          </div>
        </div>
      )}

      {isRejected && (
        <div className="rejection-box">
          <div style={{ fontSize: 20 }}>❌</div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Application Rejected</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Sorry, your application was not approved.
              {(a.adminNote || a.adminRemarks) && (
                <><br /><strong>Reason:</strong> {a.adminNote || a.adminRemarks}</>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
