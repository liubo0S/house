import { Route, Routes } from 'react-router-dom'
import BedroomPage from './pages/Bedroom'
import HomePage from './pages/Home'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/bedroom" element={<BedroomPage />} />
    </Routes>
  )
}
