import { useState, useEffect } from 'react';
import { LoginForm } from './features/auth/components/LoginForm'
import { RegisterForm } from './features/auth/components/RegisterForm'
import { getProfile } from './features/auth/services/authService'
import { BoosterOpening } from './features/boosters/components/BoosterOpening'
import { MyCardPage } from './features/creation-card/components/MyCardPage'
import { AdminPage } from './features/admin/components/AdminPage'
import { FriendsPage } from './features/friends/components/FriendsPage'
import { CollectionPage  } from './features/collection/components/CollectionPage'
import { Routes, Route, NavLink, Navigate } from 'react-router'
import { PasswordForm } from './features/profile/components/PasswordForm';
import { ProfileForm } from './features/profile/components/ProfileForm';
import type {User} from './features/auth/types';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))
  const [isAdmin, setIsAdmin] = useState(false)
  const [authPage, setAuthPage] = useState<'login' | 'register'>('register')
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (!isLoggedIn) return
    getProfile()
      .then(user => {
        setUser(user)
        setIsAdmin(user.role === 'admin')
      })
      .catch(() => setIsLoggedIn(false))
  }, [isLoggedIn])

  const logout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    setIsAdmin(false)
    setUser(null)
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

  return (
    <div>
      <nav>
        <NavLink to="/">Boosters</NavLink>
        {isAdmin && <NavLink to="/admin">Modération</NavLink>}
        <NavLink to="/friends">Amis</NavLink>
        <NavLink to="/collection">Collection</NavLink>
        <NavLink to="/profile">Profil</NavLink>
        <button onClick={logout}>se déconnecter</button>
      </nav>

      <Routes>
        <Route path="/" element={<BoosterOpening />} />
        <Route path="/collection" element={<CollectionPage/>}/>
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/admin" element={isAdmin ? <AdminPage /> : <Navigate to="/" replace />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/profile" element={user && (
          <>
            <ProfileForm user={user} onUpdate={reloadProfile} />
            <PasswordForm onUpdate={() => {}} />
            <MyCardPage />
          </>
        )} />
      </Routes>
    </div>
  )
}

export default App
