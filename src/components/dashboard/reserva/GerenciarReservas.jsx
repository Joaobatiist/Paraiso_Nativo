import React, { useState, useEffect, useCallback } from 'react';
import { reservaService } from '@services/reservaService';
import CadastroReserva from './CadastroReserva';
import { FaCheck, FaTimes, FaSyncAlt, FaExclamationTriangle, FaPlus, FaEye } from 'react-icons/fa';
import { FaCircleExclamation, FaCircleCheck, FaEnvelope, FaXmark } from 'react-icons/fa6';
import "react-datepicker/dist/react-datepicker.css";
import './GerenciarReservas.css';
import { formatarData, formatarMoeda } from '@utils/formatters';
import { ordenarReservasPorData } from '@utils/time';

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

  // Estado do modal de status para o cliente
  const [modalClienteAberto, setModalClienteAberto] = useState(false);
  const [reservaCliente, setReservaCliente] = useState(null);
  const [loadingAcao, setLoadingAcao] = useState(false);
  const [erroModal, setErroModal] = useState('');

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

  const handleVerDetalhes = (reserva) => {
    setReservaSelecionada(reserva);
    setModalVisualizarAberto(true);
  };

  // Abre modal do cliente
  const handleVerDetalhesCliente = (r) => {
    setReservaCliente(r);
    setErroModal('');
    setModalClienteAberto(false);
    // pequeno delay para forçar re-render se já estava aberto
    setTimeout(() => setModalClienteAberto(true), 0);
  };

  const handlePagarModal = async () => {
    setLoadingAcao(true);
    setErroModal('');
    try {
      const url = await reservaService.iniciarPagamento(reservaCliente.id);
      window.location.href = url;
    } catch {
      setErroModal('Não foi possível iniciar o pagamento. Tente novamente.');
      setLoadingAcao(false);
    }
  };

  const handleCancelarModal = async () => {
    if (!window.confirm('Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.')) return;
    setLoadingAcao(true);
    setErroModal('');
    try {
      const resultado = await reservaService.mudarStatus(reservaCliente.id, 'cancelada');
      if (!resultado) {
        setErroModal('Não foi possível cancelar. Verifique suas permissões ou tente novamente.');
        return;
      }
      setReservas(prev =>
        prev.map(r => r.id === reservaCliente.id ? { ...r, status_reserva: 'cancelada' } : r)
      );
      setModalClienteAberto(false);
    } catch (e) {
      setErroModal('Não foi possível cancelar: ' + (e.message || 'Tente novamente.'));
    } finally {
      setLoadingAcao(false);
    }
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
    setPaginaAtual(Math.min(Math.max(pagina, 1), totalPaginas));
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
          <button
            className="view-button"
            title="Ver detalhes"
            onClick={() => handleVerDetalhesCliente(r)}
          >
            <FaEye />
          </button>
        ) : (
          <div className="action-buttons">
            <button className="view-button" title="Ver detalhes" onClick={() => handleVerDetalhes(r)}>
              <FaEye />
            </button>
            {r.status_reserva !== 'confirmada' && (
              <button className="edit-button" title="Confirmar reserva" onClick={() => handleMudarStatus(r.id, 'confirmada')}>
                <FaCheck />
              </button>
            )}
            {r.status_reserva !== 'cancelada' && (
              <button className="delete-button" title="Cancelar reserva" onClick={() => handleCancelar(r.id)}>
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
      <div className="dash-card-actions">
        {modoCliente ? (
          <button className="view-button" onClick={() => handleVerDetalhesCliente(r)}>
            <FaEye /> Ver detalhes
          </button>
        ) : (
          <>
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
          </>
        )}
      </div>
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
          <button onClick={() => { window.location.href = '/reserva'; }} className="btn-reservar-more">
            <FaPlus /> Reservar mais
          </button>
        ) : (
          <button onClick={() => setMostrarCadastro(true)} className="btn-nova-reserva">
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

      {/* Modal de detalhes — admin */}
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
              <p><strong>Status pagamento:</strong> {reservaSelecionada.status_pagamento || 'pendente'}</p>
              <p><strong>Valor total:</strong> {reservaSelecionada.valor_total ?? '—'}</p>
              <p><strong>Criado em:</strong> {formatarData(reservaSelecionada.criado_em || '—')}</p>
            </div>
            <button className="btn-fechar" onClick={() => setModalVisualizarAberto(false)}>Fechar</button>
          </div>
        </div>
      )}

      {/* Modal de status — cliente */}
      {modalClienteAberto && reservaCliente && (
        <div className="modal-overlay" onClick={() => setModalClienteAberto(false)}>
          <div className="modal-status-cliente" onClick={e => e.stopPropagation()}>
            <button
              className="modal-status-fechar"
              onClick={() => setModalClienteAberto(false)}
              aria-label="Fechar"
            >
              <FaXmark />
            </button>

            {reservaCliente.status_reserva === 'pendente' ? (
              <div className="mrc-panel pendente">
                <div className="mrc-header">
                  <FaCircleExclamation className="mrc-icone" />
                  <div>
                    <strong>Reserva pendente de pagamento</strong>
                    <p>Conclua o pagamento ou cancele para fazer uma nova reserva.</p>
                  </div>
                </div>
                <table className="mrc-tabela">
                  <tbody>
                    <tr><td>Acomodação</td><td>{reservaCliente.acomodacoes?.nome}</td></tr>
                    <tr><td>Check-in</td><td>{formatarData(reservaCliente.data_checkin)} às 14h</td></tr>
                    <tr><td>Check-out</td><td>{formatarData(reservaCliente.data_checkout)} às 12h</td></tr>
                    <tr><td>Hóspedes</td><td>{reservaCliente.hospedes} hóspede(s)</td></tr>
                    <tr><td>Valor total</td><td><strong>{formatarMoeda(reservaCliente.valor_total)}</strong></td></tr>
                  </tbody>
                </table>
                {erroModal && <p className="mrc-erro">{erroModal}</p>}
                <div className="mrc-acoes">
                  <button className="mrc-btn-pagar" onClick={handlePagarModal} disabled={loadingAcao}>
                    {loadingAcao ? 'Aguarde...' : 'Concluir pagamento →'}
                  </button>
                  <button className="mrc-btn-cancelar" onClick={handleCancelarModal} disabled={loadingAcao}>
                    Cancelar reserva
                  </button>
                </div>
              </div>

            ) : reservaCliente.status_reserva === 'confirmada' ? (
              <div className="mrc-panel confirmada">
                <div className="mrc-header">
                  <FaCircleCheck className="mrc-icone" />
                  <div>
                    <strong>Reserva confirmada!</strong>
                    <p>Seu pagamento foi aprovado. A pousada foi notificada da sua chegada.</p>
                  </div>
                </div>
                <table className="mrc-tabela">
                  <tbody>
                    <tr><td>Acomodação</td><td>{reservaCliente.acomodacoes?.nome}</td></tr>
                    <tr><td>Check-in</td><td>{formatarData(reservaCliente.data_checkin)} às 14h</td></tr>
                    <tr><td>Check-out</td><td>{formatarData(reservaCliente.data_checkout)} às 12h</td></tr>
                    <tr><td>Hóspedes</td><td>{reservaCliente.hospedes} hóspede(s)</td></tr>
                    <tr><td>Valor total</td><td><strong>{formatarMoeda(reservaCliente.valor_total)}</strong></td></tr>
                  </tbody>
                </table>
                <div className="mrc-email-info">
                  <FaEnvelope />
                  <p>
                    Verifique sua caixa de entrada por um e-mail enviado de{' '}
                    <strong>paraisonativo@gmail.com</strong> com todos os detalhes do seu check-in,
                    regras e informações da pousada.
                  </p>
                </div>
              </div>

            ) : (
              <div className="mrc-panel cancelada">
                <div className="mrc-header">
                  <div>
                    <strong>Reserva cancelada</strong>
                    <p>Esta reserva foi cancelada e não está mais ativa.</p>
                  </div>
                </div>
                <table className="mrc-tabela">
                  <tbody>
                    <tr><td>Acomodação</td><td>{reservaCliente.acomodacoes?.nome}</td></tr>
                    <tr><td>Check-in</td><td>{formatarData(reservaCliente.data_checkin)}</td></tr>
                    <tr><td>Check-out</td><td>{formatarData(reservaCliente.data_checkout)}</td></tr>
                    <tr><td>Valor total</td><td>{formatarMoeda(reservaCliente.valor_total)}</td></tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GerenciarReservas;
