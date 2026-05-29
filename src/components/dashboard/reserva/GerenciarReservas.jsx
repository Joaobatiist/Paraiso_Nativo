import React, { useState, useEffect, useCallback } from 'react';
import { reservaService } from '@services/reservaService';
import CadastroReserva from './CadastroReserva';
import { FaCheck, FaTimes, FaSyncAlt, FaExclamationTriangle, FaPlus, FaEye } from 'react-icons/fa';
import "react-datepicker/dist/react-datepicker.css";
import './GerenciarReservas.css';
import {formatarData} from '@utils/formatters'
import {ordenarReservasPorData} from '@utils/time'


const GerenciarReservas = ({ modoCliente = false, userId = null }) => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [filtro, setFiltro] = useState('todas');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [modalVisualizarAberto, setModalVisualizarAberto] = useState(false);
  const [reservaSelecionada, setReservaSelecionada] = useState(null);

  const carregar = useCallback(async (force = false) => {
    setLoading(true);
    setErro('');
    try {
      const data = modoCliente && userId
        ? await reservaService.listarPorUsuario(userId, { force })
        : await reservaService.listarTodas({ force });
      setReservas(ordenarReservasPorData(data || []));
    } catch (e) {
      setErro('Erro ao carregar reservas: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [modoCliente, userId]);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [filtro, reservas.length]);

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

  const reservasOrdenadas = ordenarReservasPorData(reservas);

  const reservasFiltradas = filtro === 'todas'
    ? reservasOrdenadas
    : reservasOrdenadas.filter(r => r.status_reserva === filtro);

  const totalPaginas = Math.max(1, Math.ceil(reservasFiltradas.length / itensPorPagina));
  const paginaValida = Math.min(paginaAtual, totalPaginas);
  const indiceInicial = (paginaValida - 1) * itensPorPagina;
  const reservasNaPagina = reservasFiltradas.slice(indiceInicial, indiceInicial + itensPorPagina);

  const irParaPagina = (pagina) => {
    const paginaNormalizada = Math.min(Math.max(pagina, 1), totalPaginas);
    setPaginaAtual(paginaNormalizada);
  };

  

  const handleVerDetalhes = (reserva) => {
    setReservaSelecionada(reserva);
    setModalVisualizarAberto(true);
  };

  const ReservaRow = ({ r }) => (
    <tr>
      <td>
        <div className="guest-info">
          <strong>{r.perfis?.nome || '—'}</strong>
          {!modoCliente && r.perfis?.email && (
            <span className="guest-email">{r.perfis.email}</span>
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
          <span className="readonly-text">Somente visualização</span>
        ) : (
          <div className="action-buttons">
            <button
              className="view-button"
              title="Ver detalhes"
              onClick={() => handleVerDetalhes(r)}
            >
              <FaEye />
            </button>
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

      <div className="controls-row">
        {['todas', 'confirmada', 'pendente', 'cancelada'].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`filter-button ${filtro === f ? 'active' : ''}`}
          >
            {f === 'todas' ? 'Todas' : f}
          </button>
        ))}
        <button onClick={() => carregar(true)} className="btn-refresh-small">
          <FaSyncAlt /> Atualizar
        </button>
        {modoCliente ? (
          <button
            onClick={() => { window.location.href = '/reserva'; }}
            className="btn-reservar-more"
          >
            <FaPlus /> Reservar mais
          </button>
        ) : (
          <button
            onClick={() => setMostrarCadastro(true)}
            className="btn-nova-reserva"
          >
            <FaPlus /> Nova Reserva
          </button>
        )}
      </div>

      {erro && <div className="error-message"><span className="error-icon"><FaExclamationTriangle /></span>{erro}</div>}

      {loading ? (
        <p className="loading-text">Carregando...</p>
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
                {reservasNaPagina.map(r => <ReservaRow key={r.id} r={r} />)}
              </tbody>
            </table>
          </div>

          {/* Cards mobile */}
          <div className="dash-cards-mobile">
            {reservasNaPagina.map(r => <ReservaCard key={r.id} r={r} />)}
          </div>

          {reservasFiltradas.length > itensPorPagina && (
            <div className="pagination-container">
              <button
                className="pagination-button pagination-prev"
                onClick={() => irParaPagina(paginaAtual - 1)}
                disabled={paginaAtual === 1}
              >
                ← Anterior
              </button>

              <div className="pagination-summary">
                <strong>Página {paginaValida} de {totalPaginas}</strong>
                <span>({reservasFiltradas.length} reservas)</span>
              </div>

              <button
                className="pagination-button pagination-next"
                onClick={() => irParaPagina(paginaAtual + 1)}
                disabled={paginaAtual === totalPaginas}
              >
                Próximo →
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal de Visualização de Reserva */}
      {modalVisualizarAberto && reservaSelecionada && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Detalhes da Reserva</h3>
            <div className="modal-body">
              <p><strong>Nome:</strong> {reservaSelecionada.perfis?.nome || '—'}</p>
              <p><strong>Documento:</strong> {reservaSelecionada.perfis?.documento || '—'}</p>
              <p><strong>E-mail:</strong> {reservaSelecionada.perfis?.email || '—'}</p>
              <p><strong>Telefone:</strong> {reservaSelecionada.perfis?.telefone || '—'}</p>
              <p><strong>Acomodação:</strong> {reservaSelecionada.acomodacoes?.nome || '—'}</p>
              <p><strong>Check-in:</strong> {formatarData(reservaSelecionada.data_checkin)}</p>
              <p><strong>Check-out:</strong> {formatarData(reservaSelecionada.data_checkout)}</p>
              <p><strong>Status:</strong> {reservaSelecionada.status_reserva || '—'}</p>
              <p><strong>Valor total:</strong> {reservaSelecionada.valor_total ?? reservaSelecionada.valor ?? reservaSelecionada.total ?? '—'}</p>
              <p><strong>Criado em:</strong> {formatarData(reservaSelecionada.criado_em || '—')}</p>
            </div>
            <button className="btn-fechar" onClick={() => setModalVisualizarAberto(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GerenciarReservas;
