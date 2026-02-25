import { useState, useEffect } from 'react'
import './App.css'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PuzzlePage from './pages/PuzzlePage'
import GroupsPage from './pages/GroupsPage'
import { useAuth } from './Auth'

//uid QZ7A4P2m9D

const App: React.FC = () => {
  const {uid, authUid, deconnecter} = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const localUid = localStorage.getItem('uid');
    if (localUid)
    {
      authUid(localUid);
      console.log("Local storage login")
    }
    setIsLoading(false);
  }, [authUid]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const isConnected = uid && uid !== "";

  return (
    <>
      <BrowserRouter>
        <nav>
          <h1>Audio Puzzle App</h1>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/puzzle">Puzzle</Link></li>
            <li><Link to="/groups">Groups</Link></li>
            {isConnected && 
              <li><a href="" onClick={deconnecter}>Disconnect</a></li>
            }
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/puzzle" element={<PuzzlePage />} />
          <Route path="/groups" element={<GroupsPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
