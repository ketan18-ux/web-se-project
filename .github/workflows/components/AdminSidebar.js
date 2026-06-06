import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
  { label: 'Schemes', path: '/admin/schemes', icon: '📜' },
  { label: 'Applications', path: '/admin/applications', icon: '📋' },
  { label: 'Users', path: '/admin/users', icon: '👥' },
  { label: 'Add Scheme', path: '/admin/add-scheme', icon: '➕' },
  { label: 'Feedback', path: '/admin/feedback', icon: '💬' },
];

export default function AdminSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="nav-emblem" style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}>⚙️</div>
        <div className="sidebar-brand-name">Gov Portal</div>
        <div className="sidebar-brand-sub">Administrator</div>
      </div>
      <nav className="sidebar-nav">
        {links.map(l => (
          <button
            key={l.path}
            className={`sidebar-link ${location.pathname === l.path ? 'active' : ''}`}
            onClick={() => navigate(l.path)}
          >
            <span className="sidebar-icon">{l.icon}</span>
            {l.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="btn-logout btn-full" onClick={handleLogout}>Sign Out</button>
      </div>
    </aside>
  );
}
