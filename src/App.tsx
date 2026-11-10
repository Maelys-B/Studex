import { useState, useEffect } from 'react';
import { LoginForm } from './features/auth/components/LoginForm'
import { RegisterForm } from './features/auth/components/RegisterForm'
import { getProfil } from './features/auth/services/authService'
import { BoosterOpening } from './features/boosters/components/BoosterOpening'
import { MyCardPage } from './features/creation-card/components/MyCardPage'
import { AdminPage } from './features/admin/components/AdminPage'
import { FriendsPage } from './features/friends/components/FriendsPage'
import { CollectionPage  } from './features/collection/components/CollectionPage'
import { Routes, Route, NavLink, Navigate } from 'react-router'
import { MdpForm } from './features/profile/components/MdpForm';
import { ProfilForm } from './features/profile/components/ProfilForm';
import type {User} from './features/auth/types';


function App() {
  const [estConnecte, setEstConnecte] = useState(!!localStorage.getItem('token'))
  const [AreAdmin, setAreAdmin] = useState(false)
  const [pageAuth, setPageAuth] = useState<'login' | 'register'>('register')
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (!estConnecte) return
    getProfil()
      .then(user => {
        setUser(user)
        setAreAdmin(user.role === 'admin')
      })
      .catch(() => setEstConnecte(false))
  }, [estConnecte])

  const deconnexion = () => {
    localStorage.removeItem('token')
    setEstConnecte(false)
    setAreAdmin(false)
    setUser(null)
  }

  const rechargerProfil = () => {
    getProfil()
      .then(setUser)
      .catch(() => setEstConnecte(false))
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
        <NavLink to="/amis">Amis</NavLink>
        <NavLink to="/collection">Collection</NavLink>
        <NavLink to="/profil">Profil</NavLink>
        <button onClick={deconnexion}>se déconnecter</button>
      </nav>

      <Routes>
        <Route path="/" element={<BoosterOpening />} />
        <Route path="/collection" element={<CollectionPage/>}/>
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/admin" element={AreAdmin ? <AdminPage /> : <Navigate to="/" replace />} />
        <Route path="/ma-carte" element={<MyCardPage />} />
        <Route path="/amis" element={<FriendsPage />} />
        <Route path="/profil" element={user && (
          <>
            <ProfilForm user={user} onModification={rechargerProfil} />
            <MdpForm onModification={() => {}} />
          </>
        )} />
      </Routes>
    </div>
  )
}

export default App
