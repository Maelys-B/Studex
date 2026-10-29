import { useState, useEffect } from 'react';
import { LoginForm } from './features/auth/components/LoginForm'
import { RegisterForm } from './features/auth/components/RegisterForm'
import { getProfil } from './features/auth/services/authService'
import { BoosterOpening } from './features/boosters/components/BoosterOpening'


function App() {
  const [estConnecte, setEstConnecte] = useState(!!localStorage.getItem('token'))
  const [pageAuth, setPageAuth] = useState<'login' | 'register'>('register')

  useEffect(() => {
    if (!localStorage.getItem('token')) return
    getProfil().catch(() => setEstConnecte(false))
  }, [])

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
      <p>Bienvenue</p>
      <button onClick={deconnexion}>se déconnecter</button>
      <BoosterOpening />
    </div>
  )
}

export default App
