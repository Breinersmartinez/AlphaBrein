import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import HomePage from './components/HomePage';
import Login from './components/Login';
import ClientSignUp from './components/ClientSignUp';
import Dashboard from './components/Dashboard';
import UserDashboard from './components/UserDashboard'; // Importa tu componente admin

const App = () => {
  const { isLoading, isAuthenticated, user } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  // Mientras carga la autenticación
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si está autenticado, mostrar Dashboard según el rol
  if (isAuthenticated) {
    if (user?.role === 'ADMIN') {
      return <UserDashboard navigateTo={navigateTo} />;
    } else if (user?.role === 'USER') {
      return <Dashboard navigateTo={navigateTo} />;
    }
  }

  // Si no está autenticado, mostrar Home, Login o SignUp
  switch (currentPage) {
    case 'home':
      return <HomePage navigateTo={navigateTo} />;
    case 'login':
      return <Login navigateTo={navigateTo} />;
    case 'clientSignUp':
      return <ClientSignUp navigateTo={navigateTo} />;
    case 'dashboard':
      return <Dashboard navigateTo={navigateTo} />;
    case 'userDashboard':
      return <UserDashboard navigateTo={navigateTo} />;
    default:
      return <HomePage navigateTo={navigateTo} />;
  }
};

export default App;