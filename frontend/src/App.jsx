import { createContext, useContext } from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import StagePage from './pages/StagePage.jsx'
import { useTheme } from './hooks/useTheme.js'

export const ThemeContext = createContext({ theme: 'dark', toggle: () => {} })
export function useThemeContext() { return useContext(ThemeContext) }

export default function App() {
  const { theme, toggle } = useTheme()
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/stage/:id" element={<StagePage />} />
      </Routes>
    </ThemeContext.Provider>
  )
}
