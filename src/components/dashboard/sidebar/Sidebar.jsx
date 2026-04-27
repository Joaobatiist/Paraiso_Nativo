import React from 'react';
import { FaHome, FaCalendarAlt, FaBed, FaImages, FaUsers, FaLeaf, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ user, perfil, currentPage, setCurrentPage, isSidebarOpen, setIsSidebarOpen, handleLogout }) => {
    
 

  const roleAtual = (perfil?.role || '').toString().toLowerCase();
  const isAdmin = roleAtual === 'admin' ;
  const isCliente = !isAdmin;

  const menuItems = isCliente
    ? [
        { id: 'dashboard', icon: FaHome, label: 'Dashboard' },
        { id: 'reservas', icon: FaCalendarAlt, label: 'Minhas Reservas' },
        { id: 'reservar', icon: FaLeaf, label: 'Fazer Reserva' },
      ]
    : [
        { id: 'dashboard', icon: FaHome, label: 'Dashboard' },
        { id: 'reservas', icon: FaCalendarAlt, label: 'Reservas' },
        { id: 'acomodacoes', icon: FaBed, label: 'Acomodações' },
        { id: 'galeria', icon: FaImages, label: 'Galeria de Fotos' },
        { id: 'clientes', icon: FaUsers, label: 'Clientes' },
      ];

  const footerItems = [
    {
      id: 'voltar',
      icon: FaLeaf,
      label: 'Voltar ao Site',
      action: () => { window.location.href = '/'; },
      className: 'secondary',
    },
    {
      id: 'sair',
      icon: FaSignOutAlt,
      label: 'Sair',
      action: handleLogout,
      className: 'danger',
    },
  ];

  const handleItemClick = (item) => {
    if (item.action) {
      item.action();
    } else {
      setCurrentPage(item.id);
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
    }
  };

  return (
    <div className={`sidebar ${isSidebarOpen ? 'open' : 'collapsed'}`}>
      <div className="sidebar-header">
        <img src="/logo.png" alt="Paraíso Nativo" className="sidebar-logo" />
        <div>
          <h3 className="sidebar-title">Paraíso Nativo</h3>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => handleItemClick(item)}
          >
            <span className="sidebar-icon">{React.createElement(item.icon)}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}

        <div className="sidebar-nav-divider">
          {footerItems.map(item => (
            <button
              key={item.id}
              className={`sidebar-item ${item.className || ''}`}
              onClick={() => handleItemClick(item)}
            >
              <span className="sidebar-icon">{React.createElement(item.icon)}</span>
              <span className="sidebar-label">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar"><FaUserCircle /></div>
          <div className="user-details">
            <p className="user-name">{user?.email || 'Usuário'}</p>
            <p className="user-role">{isCliente ? 'Cliente' : 'Administrador'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
