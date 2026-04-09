import React, { useState, useEffect, useCallback } from 'react';
import { reservaService } from '../../../services/reservaService';
import CadastroReserva from './CadastroReserva';
import { FaCheck, FaTimes, FaSyncAlt, FaExclamationTriangle, FaPlus } from 'react-icons/fa';

const formatarData = (d) => {
  if (!d) return '—';
  const [ano, mes, dia] = d.split('T')[0].split('-');
  return `${dia}/${mes}/${ano}`;
};

const GerenciarReservas = ({ modoCliente = false, userId = null }) => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [filtro, setFiltro] = useState('todas');
  const [mostrarCadastro, setMostrarCadastro] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro('');
    try {
      const data = modoCliente && userId
        ? await reservaService.listarPorUsuario(userId)
        : await reservaService.listarTodas();
      setReservas(data);
    } catch (e) {
      setErro('Erro ao carregar reservas: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [modoCliente, userId]);

  useEffect(() => { carregar(); }, [carregar]);

  const handleMudarStatus = async (id, novoStatus) => {
    try {
      await reservaService.mudarStatus(id, novoStatus);
      setReservas(prev =>
        prev.map(r => r.id === id ? { ...r, status_reserva: novoStatus } : r)
      );
    } catch (e) {
      alert('Erro ao alterar status: ' + e.message);
    }
  };

  const handleCancelar = async (id) => {
    if (!window.confirm('Deseja cancelar esta reserva?')) return;
    await handleMudarStatus(id, 'cancelada');
  };

  const reservasFiltradas = filtro === 'todas'
    ? reservas
    : reservas.filter(r => r.status_reserva === filtro);

  const ReservaRow = ({ r }) => (
    <tr>
      <td>
        <div style={{ display: 'grid', gap: '2px' }}>
          <strong>{r.perfis?.nome || '—'}</strong>
          {!modoCliente && r.perfis?.email && (
            <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{r.perfis.email}</span>
          )}
        </div>
      </td>
      <td>{r.acomodacoes?.nome || '—'}</td>
      <td>{formatarData(r.data_checkin)}</td>
      <td>{formatarData(r.data_checkout)}</td>
      <td>
        <span className={`status-badge ${r.status_reserva || 'pendente'}`}>
          {r.status_reserva || 'pendente'}
        </span>
      </td>
      <td>
        {modoCliente ? (
          <span style={{ color: 'var(--gray-500)', fontSize: '13px' }}>Somente visualização</span>
        ) : (
          <div className="action-buttons">
            {r.status_reserva !== 'confirmada' && (
              <button
                className="edit-button"
                title="Confirmar reserva"
                onClick={() => handleMudarStatus(r.id, 'confirmada')}
              >
                <FaCheck />
              </button>
            )}
            {r.status_reserva !== 'cancelada' && (
              <button
                className="delete-button"
                title="Cancelar reserva"
                onClick={() => handleCancelar(r.id)}
              >
                <FaTimes />
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );

  const ReservaCard = ({ r }) => (
    <div className="dash-card">
      <h4>{r.acomodacoes?.nome || 'Acomodação'}</h4>
      <p><strong>Hóspede:</strong> {r.perfis?.nome || '—'}</p>
      {!modoCliente && r.perfis?.email && <p><strong>E-mail:</strong> {r.perfis.email}</p>}
      {!modoCliente && r.perfis?.telefone && <p><strong>Telefone:</strong> {r.perfis.telefone}</p>}
      <p><strong>Check-in:</strong> {formatarData(r.data_checkin)}</p>
      <p><strong>Check-out:</strong> {formatarData(r.data_checkout)}</p>
      <p>
        <span className={`status-badge ${r.status_reserva || 'pendente'}`}>
          {r.status_reserva || 'pendente'}
        </span>
      </p>
      {!modoCliente && (
        <div className="dash-card-actions">
          {r.status_reserva !== 'confirmada' && (
            <button className="edit-button" onClick={() => handleMudarStatus(r.id, 'confirmada')}>
              <FaCheck /> Confirmar
            </button>
          )}
          {r.status_reserva !== 'cancelada' && (
            <button className="delete-button" onClick={() => handleCancelar(r.id)}>
              <FaTimes /> Cancelar
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="gerenciar-reservas">
      <h2 className="component-title">{modoCliente ? 'Minhas Reservas' : 'Reservas'}</h2>

      {mostrarCadastro && !modoCliente && (
        <CadastroReserva
          onClose={() => setMostrarCadastro(false)}
          onSuccess={() => { setMostrarCadastro(false); carregar(); }}
        />
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['todas', 'confirmada', 'pendente', 'cancelada'].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: '2px solid var(--primary-blue)',
              background: filtro === f ? 'var(--primary-blue)' : 'transparent',
              color: filtro === f ? 'white' : 'var(--primary-blue)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '13px',
              textTransform: 'capitalize',
            }}
          >
            {f === 'todas' ? 'Todas' : f}
          </button>
        ))}
        <button
          onClick={carregar}
          style={{
            marginLeft: 'auto',
            padding: '6px 16px',
            borderRadius: '20px',
            border: '1px solid var(--gray-300)',
            background: 'var(--gray-100)',
            color: 'var(--gray-700)',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          <FaSyncAlt /> Atualizar
        </button>
        {modoCliente ? (
          <button
            onClick={() => { window.location.href = '/reserva'; }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 18px',
              borderRadius: '20px',
              border: 'none',
              background: 'linear-gradient(135deg, #004AAD, #1a5fc0)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 3px 10px rgba(0,74,173,0.28)',
            }}
          >
            <FaPlus /> Reservar mais
          </button>
        ) : (
          <button
            onClick={() => setMostrarCadastro(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 18px',
              borderRadius: '20px',
              border: 'none',
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 3px 10px rgba(5,150,105,0.28)',
            }}
          >
            <FaPlus /> Nova Reserva
          </button>
        )}
      </div>

      {erro && <div className="error-message"><span className="error-icon"><FaExclamationTriangle /></span>{erro}</div>}

      {loading ? (
        <p style={{ textAlign: 'center', padding: '32px', color: 'var(--gray-500)' }}>Carregando...</p>
      ) : reservasFiltradas.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma reserva encontrada.</p>
        </div>
      ) : (
        <>
          {/* Tabela desktop */}
          <div className="dash-table-desktop dash-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Hóspede</th>
                  <th>Acomodação</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {reservasFiltradas.map(r => <ReservaRow key={r.id} r={r} />)}
              </tbody>
            </table>
          </div>

          {/* Cards mobile */}
          <div className="dash-cards-mobile">
            {reservasFiltradas.map(r => <ReservaCard key={r.id} r={r} />)}
          </div>
        </>
      )}
    </div>
  );
};

export default GerenciarReservas;
