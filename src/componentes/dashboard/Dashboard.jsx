import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { perfilService } from '../../services/perfilService';
import './dashboard.css';

import Sidebar from './Sidebar';
import Header from './Header';
import DashboardContent from './DashboardContent';
import GerenciarReservas from './reserva/GerenciarReservas';
import GerenciarAcomodacoes from './acomodacao/GerenciarAcomodacoes';
import CadastroAcomodacao from './acomodacao/CadastroAcomodacao';
import GerenciarGaleria from './GerenciarGaleria';
import GerenciarClientes from './cadastroPerfil/GerenciarClientes';
import Reserva from '../home/reserva/reserva';
import { useAuth } from '../hooks/useAuth';
import { useResponsiveSidebar } from '../hooks/useResponsiveSidebar';

const Dashboard = () => {
  const { user, session, perfil, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [subAcom, setSubAcom] = useState('lista');
  const [isSidebarOpen, setIsSidebarOpen] = useResponsiveSidebar();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    if (page) {
      setCurrentPage(page);
      if (page !== 'acomodacoes') setSubAcom('lista');
    }
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentPage('dashboard');
  };
  
  const roleAtual = (perfil?.role || '').toString().toLowerCase();
  const isAdmin = roleAtual === 'admin';
  const isCliente = !isAdmin;
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--gray-50)' }}>
        <p style={{ color: 'var(--gray-500)', fontSize: '18px' }}>Carregando...</p>
      </div>
    );
  }

  


  const pageComponents = {
    reservas: () => <GerenciarReservas modoCliente={isCliente} userId={session?.user?.id} />,
    reservar: () => <Reserva />,
    acomodacoes: () => 
      isCliente 
        ? <GerenciarReservas modoCliente userId={session?.user?.id} />
        : subAcom === 'cadastro'
          ? <CadastroAcomodacao onSalvo={() => setSubAcom('lista')} />
          : <GerenciarAcomodacoes onNovaCadastro={() => setSubAcom('cadastro')} />,
    galeria: () => 
      isCliente 
        ? <GerenciarReservas modoCliente userId={session?.user?.id} />
        : <GerenciarGaleria />,
    clientes: () => 
      isCliente 
        ? <GerenciarReservas modoCliente userId={session?.user?.id} />
        : <GerenciarClientes />,
    dashboard: () => <DashboardContent setCurrentPage={setCurrentPage} modoCliente={isCliente} userId={session?.user?.id} />,
  };

  const renderPage = () => {
    const Component = pageComponents[currentPage] || pageComponents.dashboard;
    return <Component />;
  };

  const handleSetPage = (page) => {
    setCurrentPage(page);
    setSubAcom('lista');
  };

  return (
    <div className="dashboard-app dashboard">
      {/* Overlay mobile */}
      {isSidebarOpen && window.innerWidth < 1024 && (
        <div className="sidebar-overlay show" onClick={() => setIsSidebarOpen(false)} />
      )}

      <Sidebar
        user={session.user}
        perfil={perfil}
        currentPage={currentPage}
        setCurrentPage={handleSetPage}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleLogout={handleLogout}
      />

      <div className={`dashboard-main ${isSidebarOpen ? '' : 'expanded'}`}>
        <Header
          currentPage={currentPage}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          user={session.user}
          perfil={perfil}
        />

        <main className="main-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
