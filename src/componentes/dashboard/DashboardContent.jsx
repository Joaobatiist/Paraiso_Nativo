import React, { useState, useEffect } from 'react';
import { reservaService } from '../../services/reservaService';
import { acomodacaoService } from '../../services/acomodacaoService';
import { FaCalendarAlt, FaBed, FaCheckCircle, FaLeaf } from 'react-icons/fa';

const DashboardContent = ({ setCurrentPage, modoCliente = false, userId = null }) => {
  const [stats, setStats] = useState({
    totalReservas: 0,
    reservasAtivas: 0,
    totalAcomodacoes: 0,
    acomodacoesDisponiveis: 0,
    checkinsHoje: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const [reservas, acomodacoes] = await Promise.all([
          modoCliente && userId ? reservaService.listarPorUsuario(userId) : reservaService.listarTodas(),
          acomodacaoService.listarTodasComFotos(),
        ]);

        const hoje = new Date().toISOString().split('T')[0];
        const ativas = reservas.filter(r => r.status_reserva === 'confirmada');
        const checkinsHoje = reservas.filter(r => r.data_checkin?.startsWith(hoje) && r.status_reserva === 'confirmada');
        const disponiveis = acomodacoes.filter(a => a.status === 'disponivel');

        setStats({
          totalReservas: reservas.length,
          reservasAtivas: ativas.length,
          totalAcomodacoes: acomodacoes.length,
          acomodacoesDisponiveis: disponiveis.length,
          checkinsHoje: checkinsHoje.length,
        });
      } catch (err) {
        console.error('Erro ao carregar stats:', err.message);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [modoCliente, userId]);

  const cards = modoCliente
    ? [
        { icon: FaCalendarAlt, valor: stats.totalReservas, label: 'Minhas Reservas', page: 'reservas' },
        { icon: FaCheckCircle, valor: stats.reservasAtivas, label: 'Reservas Confirmadas', page: 'reservas' },
        { icon: FaLeaf, valor: stats.acomodacoesDisponiveis, label: 'Quartos Disponíveis', page: 'reservar' },
      ]
    : [
        { icon: FaCalendarAlt, valor: stats.reservasAtivas, label: 'Reservas Ativas', page: 'reservas' },
        { icon: FaBed, valor: stats.totalAcomodacoes, label: 'Acomodações', page: 'acomodacoes' },
        { icon: FaCheckCircle, valor: stats.checkinsHoje, label: 'Check-ins Hoje', page: 'reservas' },
        { icon: FaLeaf, valor: stats.acomodacoesDisponiveis, label: 'Quartos Disponíveis', page: 'acomodacoes' },
      ];

  return (
    <div className="dashboard-content">
      <div className="dashboard-welcome">
        <h2>{modoCliente ? 'Bem-vindo ao seu painel' : 'Bem-vindo ao Painel da Pousada'}</h2>
        <p>
          {modoCliente
            ? 'Acompanhe suas reservas e faça novas solicitações de hospedagem.'
            : 'Gerencie reservas, acomodações e funcionários do Paraíso Nativo'}
        </p>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '32px' }}>
          Carregando dados...
        </p>
      ) : (
        <div className="dashboard-stats">
          {cards.map((c, i) => (
            <div
              key={i}
              className="stat-card"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (c.page === 'reservar') {
                  setCurrentPage('reservar');
                  return;
                }
                setCurrentPage(c.page);
              }}
            >
              <div className="stat-icon">{React.createElement(c.icon)}</div>
              <div className="stat-info">
                <h3>{c.valor}</h3>
                <p>{c.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardContent;