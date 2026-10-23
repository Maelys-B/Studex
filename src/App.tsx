import { useState } from 'react';
import { LoginForm } from './features/auth/components/LoginForm'
import { RegisterForm } from './features/auth/components/RegisterForm'
import { useAuth } from './features/auth/hooks/useAuth'
import { BoosterOpening } from './features/boosters/components/BoosterOpening'


function App() {
  const { user, error, handleLogin, handleRegister, logout, clearError } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('register')


  if (!user) {
    if (mode === 'login'){
      return (
      <div>        
      <LoginForm onLogin={handleLogin} error={error} />
      <button onClick={() => {setMode('register'); clearError()}}>Pas encore de compte ? S'inscrire</button>
      </div>
      )
    }
    else{
    return(
      <div>
        <RegisterForm onRegister={handleRegister} error={error} />
        <button onClick={() => {setMode('login'); clearError()}}>Déjà un compte ? Se connecter</button>
      </div>
    )}
  }

  return (
    <div>
      <p>Bienvenue {user.pseudo}</p>
      <button onClick={logout}>se déconnecter</button>
      <BoosterOpening />
    </div>
  )
}

export default App
