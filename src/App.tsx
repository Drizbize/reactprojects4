import { useState } from 'react'
import './App.css'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PuzzlePage from './pages/PuzzlePage'
import GroupsPage from './pages/GroupsPage'
import { useAuth } from './Auth'

//QZ7A4P2m9D

const App: React.FC = () => {
  //const uid = useAuth();

  return (
    <>
      <BrowserRouter>
        <nav>
          <h1>Audio Puzzle App</h1>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/puzzle">Puzzle</Link></li>
            <li><Link to="/groups">Groups</Link></li>
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
