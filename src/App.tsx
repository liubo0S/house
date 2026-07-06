import { Navigate, Route, Routes } from 'react-router-dom'
import BedroomPage from './pages/Bedroom'
import HomePage from './pages/Home'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/bedroom" element={<BedroomPage />} />
      {/* 未知路径回退到首页 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
