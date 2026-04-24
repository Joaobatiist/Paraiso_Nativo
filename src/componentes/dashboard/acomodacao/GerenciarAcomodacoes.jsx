import React, { useState, useEffect, useCallback } from 'react';
import { FaBed, FaEdit, FaSyncAlt, FaExclamationTriangle } from 'react-icons/fa';
import { acomodacaoService } from '../../../services/acomodacaoService';
import EditarAcomodacaoModal from './EditarAcomodacaoModal';
import './GerenciarAcomodacoes.css';

const statusOpcoes = ['disponivel', 'manutencao', 'indisponivel'];

const GerenciarAcomodacoes = ({ onNovaCadastro }) => {
  const [acomodacoes, setAcomodacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [editando, setEditando] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro('');
    try {
      const data = await acomodacaoService.listarTodasComFotos();
      setAcomodacoes(data);
    } catch (e) {
      setErro('Erro ao carregar acomodações: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const handleMudarStatus = async (id, novoStatus) => {
    try {
      await acomodacaoService.atualizarStatus(id, novoStatus);
      setAcomodacoes(prev =>
        prev.map(a => a.id === id ? { ...a, status: novoStatus } : a)
      );
    } catch (e) {
      alert('Erro ao alterar status: ' + e.message);
    }
  };

  const AcomRow = ({ a }) => {
    const fotos = a.galeria_fotos || [];
    const capa = fotos[0]?.url_imagem || null;

    return (
      <tr>
        <td>
          {capa
            ? <img src={capa} alt={a.nome} className="acom-thumb" />
            : <div className="acom-no-image"><FaBed /></div>
          }
        </td>
        <td><strong>{a.nome}</strong></td>
        <td>R$ {Number(a.preco_diaria || 0).toFixed(2)}</td>
        <td>{a.capacidade_pessoas ?? '—'} pax</td>
        <td>
          <select
            value={a.status || 'disponivel'}
            onChange={(e) => handleMudarStatus(a.id, e.target.value)}
            className="acom-status-select"
          >
            {statusOpcoes.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </td>
        <td>{fotos.length} foto{fotos.length !== 1 ? 's' : ''}</td>
        <td>
          <div className="action-buttons">
            <button
              className="edit-button"
              title="Editar acomodação"
              onClick={() => setEditando(a)}
            >
              <FaEdit />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const AcomCard = ({ a }) => {
    const fotos = a.galeria_fotos || [];
    const capa = fotos[0]?.url_imagem || null;

    return (
      <div className="dash-card">
        {capa && (
          <img src={capa} alt={a.nome} />
        )}
        <h4>{a.nome}</h4>
        <p><strong>Diária:</strong> R$ {Number(a.preco_diaria || 0).toFixed(2)}</p>
        <p><strong>Capacidade:</strong> {a.capacidade_pessoas ?? '—'} pax</p>
        <p><strong>Fotos:</strong> {fotos.length}</p>
        <p>
          <span className={`status-badge ${a.status || 'disponivel'}`}>
            {a.status || 'disponivel'}
          </span>
        </p>
        <div className="dash-card-actions">
          <select
            value={a.status || 'disponivel'}
            onChange={(e) => handleMudarStatus(a.id, e.target.value)}
            className="dash-card-select"
          >
            {statusOpcoes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="edit-button" onClick={() => setEditando(a)}><FaEdit /> Editar</button>
        </div>
      </div>
    );
  };

  return (
    <div className="gerenciar-acomodacoes">
      <div className="acom-header">
        <h2 className="component-title">Acomodações</h2>
        <div className="acom-buttons">
          <button
            onClick={carregar}
            className="btn-atualizar"
          >
            <FaSyncAlt /> Atualizar
          </button>
          {onNovaCadastro && (
            <button
              onClick={onNovaCadastro}
              className="btn-nova-acom"
            >
              + Nova Acomodação
            </button>
          )}
        </div>
      </div>

      {erro && <div className="error-message"><span className="error-icon"><FaExclamationTriangle /></span>{erro}</div>}

      {loading ? (
        <p className="acom-loading">Carregando...</p>
      ) : acomodacoes.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma acomodação cadastrada.</p>
          {onNovaCadastro && <button className="submit-button empty-state-button" onClick={onNovaCadastro}>+ Cadastrar Acomodação</button>}
        </div>
      ) : (
        <>
          {/* Tabela desktop */}
          <div className="dash-table-desktop dash-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Nome</th>
                  <th>Diária</th>
                  <th>Cap.</th>
                  <th>Status</th>
                  <th>Fotos</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {acomodacoes.map(a => <AcomRow key={a.id} a={a} />)}
              </tbody>
            </table>
          </div>

          {/* Cards mobile */}
          <div className="dash-cards-mobile">
            {acomodacoes.map(a => <AcomCard key={a.id} a={a} />)}
          </div>
        </>
      )}

      {editando && (
        <EditarAcomodacaoModal
          acomodacao={editando}
          onClose={() => setEditando(null)}
          onSalvo={() => { setEditando(null); carregar(); }}
        />
      )}
    </div>
  );
};

export default GerenciarAcomodacoes;
