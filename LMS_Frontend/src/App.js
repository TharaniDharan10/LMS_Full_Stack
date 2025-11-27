import './App.css';
import  { useState } from 'react';
import {Login} from './components/Login';
import { Register } from './components/Register';
import {Dashboard} from './components/Dashboard';


export default function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
  };

  return (
    <>
      {view === 'login' && (
        <Login onLogin={handleLogin} onSwitchToRegister={() => setView('register')} />
      )}
      {view === 'register' && (
        <Register onBack={() => setView('login')} />
      )}
      {view === 'dashboard' && user && (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </>
  );
}