import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Schemes', path: '/schemes' },
  { label: 'Eligibility', path: '/eligibility' },
  { label: 'My Applications', path: '/my-applications' },
  { label: '💬 Feedback', path: '/feedback' },
];

export default function UserNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
        <div className="nav-emblem">🏛</div>
        <span className="nav-title">Gov Portal</span>
      </div>
      <div className="nav-links">
        {links.map(l => (
          <button
            key={l.path}
            className={`nav-link ${location.pathname === l.path ? 'active' : ''}`}
            onClick={() => navigate(l.path)}
          >
            {l.label}
          </button>
        ))}
      </div>
      <div className="nav-right">
        {user && <span className="nav-user">{user.name}</span>}
        <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
      </div>
    </nav>
  );
}
