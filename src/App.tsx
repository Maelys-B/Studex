 import { useState, useEffect } from 'react';
import { LoginForm } from './features/auth/components/LoginForm'
import { RegisterForm } from './features/auth/components/RegisterForm'
import { getProfil } from './features/auth/services/authService'
import { BoosterOpening } from './features/boosters/components/BoosterOpening'
import { MyCardPage } from './features/creation-card/components/MyCardPage'
import { AdminPage } from './features/admin/components/AdminPage'
import { Routes, Route, NavLink, Navigate } from 'react-router'


function App() {
  const [estConnecte, setEstConnecte] = useState(!!localStorage.getItem('token'))
  const [AreAdmin, setAreAdmin] = useState(false)
  const [pageAuth, setPageAuth] = useState<'login' | 'register'>('register')

  useEffect(() => {
    if (!estConnecte) { setAreAdmin(false); return }
    getProfil()
      .then(user => setAreAdmin(user.role === 'admin'))
      .catch(() => setEstConnecte(false))
  }, [estConnecte])

  const deconnexion = () => {
    localStorage.removeItem('token')
    setEstConnecte(false)
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
      <nav>
        <NavLink to="/">Boosters</NavLink>
        <NavLink to="/ma-carte">Ma carte</NavLink>
        {AreAdmin && <NavLink to="/admin">Modération</NavLink>}
        <button onClick={deconnexion}>se déconnecter</button>
      </nav>

      <Routes>
        <Route path="/" element={<BoosterOpening />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/admin" element={AreAdmin ? <AdminPage /> : <Navigate to="/" replace />} />
        <Route path="/ma-carte" element={<MyCardPage />} />
      </Routes>
    </div>
  )
}

export default App
