import { useState, useEffect } from 'react';
import { LoginForm } from './features/auth/components/LoginForm'
import { RegisterForm } from './features/auth/components/RegisterForm'
import { getProfile } from './features/auth/services/authService'
import { BoosterOpening } from './features/boosters/components/BoosterOpening'
import { MyCardPage } from './features/creation-card/components/MyCardPage'
import { AdminPage } from './features/admin/components/AdminPage'
import { FriendsPage } from './features/friends/components/FriendsPage'
import { AppNav } from './features/navigation/components/AppNav'
import { CollectionPage } from './features/collection/components/CollectionPage'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router'
import { fetchMyCard } from './features/creation-card/services/cardApi'
import { PasswordForm } from './features/profile/components/PasswordForm'
import { ProfileForm } from './features/profile/components/ProfileForm'
import type { User } from './features/auth/types'

function App() {
  const { pathname } = useLocation()
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))
  const [isAdmin, setIsAdmin] = useState(false)
  const [authPage, setAuthPage] = useState<'login' | 'register'>('register')
  const [user, setUser] = useState<User | null>(null)
  const [hasCard, setHasCard] = useState<boolean | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoggedIn) return
    getProfile()
      .then(user => {
        setUser(user)
        setIsAdmin(user.role === 'admin')
      })
      .catch(() => setIsLoggedIn(false))
    fetchMyCard()
      .then(card => setHasCard(card !== null && card.status !== 'rejected'))
      .catch(() => setHasCard(false))
  }, [isLoggedIn])

  const logout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    setIsAdmin(false)
    setUser(null)
    setHasCard(null)
  }

  const reloadProfile = () => {
    getProfile()
      .then(setUser)
      .catch(() => setIsLoggedIn(false))
  }

  if (!isLoggedIn) {
    return authPage === 'login' ? (
      <LoginForm
        onLogin={() => setIsLoggedIn(true)}
        onGoToRegister={() => setAuthPage('register')}
      />
    ) : (
      <RegisterForm
        onRegister={() => setIsLoggedIn(true)}
        onGoToLogin={() => setAuthPage('login')}
      />
    )
  }

  if (hasCard === null) return <p>Chargement...</p>

  if (!hasCard) {
    return (
      <div>
        <nav className="app-nav">
          <span />
          <button className="app-nav__logout" onClick={logout} aria-label="Se déconnecter">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9" />
            </svg>
            <span>Se déconnecter</span>
          </button>
        </nav>
        <MyCardPage
          onSaved={() => {
            setHasCard(true)
            navigate('/')
          }}
        />
      </div>
    )
  }

  return (
    <div>
      <AppNav isAdmin={isAdmin} onLogout={logout} />

      <div className="app-page" key={pathname}>
        <Routes>
          <Route path="/" element={<BoosterOpening />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/admin" element={isAdmin ? <AdminPage /> : <Navigate to="/" replace />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/profile" element={user && (
            <>
              <MyCardPage />
              <ProfileForm user={user} onUpdate={reloadProfile} />
              <PasswordForm onUpdate={() => {}} />
            </>
          )} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
