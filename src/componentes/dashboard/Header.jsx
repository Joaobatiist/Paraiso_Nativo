import React from 'react';
import { FaBars } from 'react-icons/fa';

const Header = ({ currentPage, isSidebarOpen, setIsSidebarOpen, user, perfil }) => {
  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':     return 'Dashboard';
      case 'reservas':      return 'Reservas';
      case 'reservar':      return 'Fazer Reserva';
      case 'acomodacoes':   return 'Acomodações';
      case 'galeria':       return 'Galeria de Fotos';
      case 'clientes':  return 'Clientes';
      default:              return 'Dashboard';
    }
  };

  return (
    <header className="dashboard-header">
      <button
        className="menu-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Alternar menu"
      >
        <FaBars />
      </button>
      <h1 className="page-title">{getPageTitle()}</h1>
      <div className="header-actions">
        <span className="welcome-text">Olá, {perfil?.nome || user?.email?.split('@')[0] || 'Usuário'}!</span>
      </div>
    </header>
  );
};

export default Header;