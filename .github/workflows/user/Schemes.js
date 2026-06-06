import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, CATEGORY_EMOJIS } from '../../utils/api';
import UserNavbar from '../../components/UserNavbar';

const CATEGORIES = ['All', 'Agriculture', 'Education', 'Health', 'Housing', 'Employment', 'Women', 'Disability'];

export default function Schemes() {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== 'All') params.set('category', category);
    if (search) params.set('search', search);
    setLoading(true);
    apiFetch('/schemes?' + params.toString())
      .then(data => { setSchemes(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [category, search]);

  return (
    <>
      <div className="ashoka-stripe" />
      <UserNavbar />
      <div className="page-wrapper">
        <div className="container">
          <div className="page-header">
            <h1>Government Schemes</h1>
            <p>Browse all active welfare schemes you may be eligible for</p>
          </div>

          {/* Search */}
          <div className="search-bar" style={{ maxWidth: 480, marginBottom: 20 }}>
            <span>🔍</span>
            <input placeholder="Search schemes…" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <span style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSearch('')}>✕</span>}
          </div>

          {/* Category tabs */}
          <div className="filter-tabs">
            {CATEGORIES.map(c => (
              <button key={c} className={`filter-tab ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
                {CATEGORY_EMOJIS[c]} {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="schemes-grid">
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 200 }} />)}
            </div>
          ) : schemes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No schemes found</h3>
              <p>Try a different category or search term.</p>
            </div>
          ) : (
            <div className="schemes-grid">
              {schemes.map((s, i) => (
                <div key={s._id} className="scheme-card" style={{ animationDelay: `${i * 0.04}s` }}
                  onClick={() => navigate(`/schemes/${s._id}`)}>
                  <div>
                    <span className="scheme-cat-badge">{CATEGORY_EMOJIS[s.category]} {s.category}</span>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{s.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{s.shortDesc}</div>
                  </div>
                  {s.benefits && (
                    <div style={{ fontSize: 13, color: 'var(--green-light)', background: 'var(--green-dim)', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.15)' }}>
                      🎁 {s.benefits}
                    </div>
                  )}
                  {s.lastDate && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      📅 Last date: {new Date(s.lastDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary btn-sm">Apply Now →</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
