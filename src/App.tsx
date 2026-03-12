import { useState, useEffect } from 'react'
import './App.css'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PuzzlePage from './pages/PuzzlePage'
import GroupsPage from './pages/GroupsPage'
import StudentInfoPage from './pages/StudentInfoPage'
import { useAuth } from './Auth'

// Wrapper for routes that require authentication
const AuthenticatedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { uid } = useAuth();
  const isConnected = uid && uid !== "";
  
  if (!isConnected) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const { uid, authUid, deconnecter } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const localUid = localStorage.getItem('uid');
    if (localUid) {
      authUid(localUid);
      console.log("Local storage login")
    }
    setIsLoading(false);
  }, [authUid]);

  if (isLoading) {
    return (
      <div className="flex-center" style={{ height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="loading-spinner"></div>
        <p className="text-muted">Loading Application...</p>
      </div>
    );
  }

  const isConnected = uid && uid !== "";

  const handleDisconnect = () => {
    deconnecter();
    navigate('/');
  };

  return (
    <div className="app-container">
      <nav className="app-navbar glass-panel">
        <h1>Audio Puzzle</h1>
        <ul>
          <li><Link to="/">Home</Link></li>
          {isConnected && (
            <>
              <li><Link to="/puzzle">Puzzle</Link></li>
              <li><Link to="/groups">Groups</Link></li>
              <li><Link to="/students">Students</Link></li>
              <li>
                <button className="btn-secondary" onClick={handleDisconnect}>Disconnect</button>
              </li>
            </>
          )}
        </ul>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/puzzle" 
            element={<AuthenticatedRoute><PuzzlePage /></AuthenticatedRoute>} 
          />
          <Route 
            path="/groups" 
            element={<AuthenticatedRoute><GroupsPage /></AuthenticatedRoute>} 
          />
          <Route 
            path="/students" 
            element={<AuthenticatedRoute><StudentInfoPage /></AuthenticatedRoute>} 
          />
          {/* Catch-all redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
