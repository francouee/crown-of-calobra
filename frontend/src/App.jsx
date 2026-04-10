import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import StagePage from './pages/StagePage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/stage/:id" element={<StagePage />} />
    </Routes>
  )
}
