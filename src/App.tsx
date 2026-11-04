 import { useState, useEffect } from 'react';
import { LoginForm } from './features/auth/components/LoginForm'
import { RegisterForm } from './features/auth/components/RegisterForm'
import { getProfil } from './features/auth/services/authService'
import { BoosterOpening } from './features/boosters/components/BoosterOpening'
import { MyCardPage } from './features/creation-card/components/MyCardPage'
import { AdminPage } from './features/admin/components/AdminPage'
import { FriendsPage } from './features/friends/components/FriendsPage'
import { AppNav } from './features/navigation/components/AppNav'
import { Routes, Route, Navigate, useLocation } from 'react-router'


function App() {
  const { pathname } = useLocation()
  const [estConnecte, setEstConnecte] = useState(!!localStorage.getItem('token'))
  const [AreAdmin, setAreAdmin] = useState(false)
  const [pageAuth, setPageAuth] = useState<'login' | 'register'>('register')

  useEffect(() => {
    if (!estConnecte) return
    getProfil()
      .then(user => setAreAdmin(user.role === 'admin'))
      .catch(() => setEstConnecte(false))
  }, [estConnecte])

  const deconnexion = () => {
    localStorage.removeItem('token')
    setEstConnecte(false)
    setAreAdmin(false)
  }

  if (!estConnecte) {
    return pageAuth === 'login' ? (
      <LoginForm
        onConnexion={() => setEstConnecte(true)}
        onAllerVersInscription={() => setPageAuth('register')}
      />
    ) : (
      <RegisterForm
        onInscription={() => setEstConnecte(true)}
        onAllerVersConnexion={() => setPageAuth('login')}
      />
    )
  }

  return (
    <div>
      <AppNav isAdmin={AreAdmin} onLogout={deconnexion} />

      <div className="app-page" key={pathname}>
        <Routes>
          <Route path="/" element={<BoosterOpening />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/admin" element={AreAdmin ? <AdminPage /> : <Navigate to="/" replace />} />
          <Route path="/ma-carte" element={<MyCardPage />} />
          <Route path="/amis" element={<FriendsPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
