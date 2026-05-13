import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/useAuth'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import FamilyPage from './pages/FamilyPage'
import SharedResultPage from './pages/SharedResultPage'
import AuthCallbackPage from './pages/AuthCallbackPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Auth callback — Supabase magic link lands here */}
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Shared result — no auth needed */}
        <Route path="/r/:slug" element={<SharedResultPage />} />

        {/* Main app */}
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/family" element={<FamilyPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
