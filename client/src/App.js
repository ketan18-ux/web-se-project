import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// User pages
import UserLogin from './pages/user/UserLogin';
import UserRegister from './pages/user/UserRegister';
import UserDashboard from './pages/user/UserDashboard';
import Schemes from './pages/user/Schemes';
import SchemeDetail from './pages/user/SchemeDetail';
import MyApplications from './pages/user/MyApplications';
import EligibilityCheck from './pages/user/EligibilityCheck';
import Feedback from './pages/user/Feedback';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApplications from './pages/admin/AdminApplications';
import AdminSchemes from './pages/admin/AdminSchemes';
import AdminAddScheme from './pages/admin/AdminAddScheme';
import AdminUsers from './pages/admin/AdminUsers';
import AdminFeedback from './pages/admin/AdminFeedback';

/* ── Protected route wrappers ───────────────────────────── */
function RequireAuth({ children }) {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { token, isAdmin } = useAuth();
  const location = useLocation();
  if (!token) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function RedirectIfLoggedIn({ children, adminRedirect = false }) {
  const { token, isAdmin } = useAuth();
  if (token) return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />;
  return children;
}

/* ── Root landing — redirect based on auth ─────────────── */
function Root() {
  const { token, isAdmin } = useAuth();
  if (token) return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />;
  return <Navigate to="/login" replace />;
}

/* ── App shell ──────────────────────────────────────────── */
function AppRoutes() {
  return (
    <Routes>
      {/* Root */}
      <Route path="/" element={<Root />} />

      {/* Auth */}
      <Route path="/login" element={<RedirectIfLoggedIn><UserLogin /></RedirectIfLoggedIn>} />
      <Route path="/register" element={<RedirectIfLoggedIn><UserRegister /></RedirectIfLoggedIn>} />
      <Route path="/admin/login" element={<RedirectIfLoggedIn><AdminLogin /></RedirectIfLoggedIn>} />

      {/* User */}
      <Route path="/dashboard" element={<RequireAuth><UserDashboard /></RequireAuth>} />
      <Route path="/schemes" element={<RequireAuth><Schemes /></RequireAuth>} />
      <Route path="/schemes/:id" element={<RequireAuth><SchemeDetail /></RequireAuth>} />
      <Route path="/my-applications" element={<RequireAuth><MyApplications /></RequireAuth>} />
      <Route path="/eligibility" element={<RequireAuth><EligibilityCheck /></RequireAuth>} />
      <Route path="/feedback" element={<RequireAuth><Feedback /></RequireAuth>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
      <Route path="/admin/applications" element={<RequireAdmin><AdminApplications /></RequireAdmin>} />
      <Route path="/admin/schemes" element={<RequireAdmin><AdminSchemes /></RequireAdmin>} />
      <Route path="/admin/add-scheme" element={<RequireAdmin><AdminAddScheme /></RequireAdmin>} />
      <Route path="/admin/users" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />
      <Route path="/admin/feedback" element={<RequireAdmin><AdminFeedback /></RequireAdmin>} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
