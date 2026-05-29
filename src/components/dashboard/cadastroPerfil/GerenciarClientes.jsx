import React, { useState, useEffect, useCallback } from 'react';
import { FaSyncAlt, FaExclamationTriangle, FaPlus, FaEye, FaTrash } from 'react-icons/fa';
import { supabaseService } from '@services/supabaseService';
import CadastroFuncionario from './CadastroFuncionario';
import './GerenciarClientes.css';

const GerenciarClientes = () => {
  const [perfis, setPerfis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [modalVisualizarAberto, setModalVisualizarAberto] = useState(false);  
  const [perfilSelecionado, setPerfilSelecionado] = useState(null);

  const carregar = useCallback(async (force = false) => {
    setLoading(true);
    setErro('');
    try {
      const data = await supabaseService.getAll('perfis', '*', { force });
      setPerfis(data || []);
    } catch (e) {
      setErro('Erro ao carregar funcionários: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const handleVerDetalhes = (perfil) => {
    setPerfilSelecionado(perfil);
    setModalVisualizarAberto(true);
  };



  const PerfilRow = ({ p }) => (
    <tr>
      <td><strong>{p.nome || '—'}</strong></td>
      <td>{p.email || '—'}</td>
      <td>{p.documento || '—'}</td>
      <td>{p.role || '—'}</td>
      <td className="acoes-botoes">
        <button 
          className="btn-icon btn-view" 
          title="Ver dados" 
          onClick={() => handleVerDetalhes(p)}
        >
          <FaEye />
        </button>
      </td>
    </tr>
  );

  const PerfilCard = ({ p }) => (
    <div className="dash-card">
      <h4>{p.nome || '—'}</h4>
      <p><strong>E-mail:</strong> {p.email || '—'}</p>
      <p><strong>Documento:</strong> {p.documento || '—'}</p>
      <p><strong>Cargo:</strong> {p.role || '—'}</p>
      <div className="card-acoes">
        <button 
          className="card-action-button card-view-button"
          onClick={() => handleVerDetalhes(p)}
        >
          <FaEye /> Ver Dados
        </button>
      </div>
    </div>
  );

  return (
    <div className="gerenciar-funcionarios">
      <div className="header-section">
        <h2 className="component-title">Clientes</h2>
        <div className="header-buttons">
          <button className="btn-refresh" onClick={() => carregar(true)}>
            <FaSyncAlt /> Atualizar
          </button>
          <button className="btn-novo" onClick={() => setModalAberto(true)}>
            <FaPlus /> Novo perfil
          </button>
        </div>
      </div>

      {erro && <div className="error-message"><span className="error-icon"><FaExclamationTriangle /></span>{erro}</div>}

      {loading ? (
        <p className="loading-text">Carregando...</p>
      ) : perfis.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum perfil cadastrado.</p>
          <button
            className="submit-button"
            onClick={() => setModalAberto(true)}
          >
            <FaPlus /> Cadastrar perfil
          </button>
        </div>
      ) : (
        <>
          {/* Tabela desktop */}
          <div className="dash-table-desktop dash-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Documento</th>
                  <th>Cargo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {perfis.map(p => <PerfilRow key={p.id} p={p} />)}
              </tbody>
            </table>
          </div>

          {/* Cards mobile */}
          <div className="dash-cards-mobile">
            {perfis.map(p => <PerfilCard key={p.id} p={p} />)}
          </div>
        </>
      )}

      {/* Modal de Cadastro */}
      {modalAberto && (
        <CadastroFuncionario
          onClose={() => setModalAberto(false)}
          onSuccess={() => { setModalAberto(false); carregar(); }}
        />
      )}

      {/* Modal de Visualização de Dados */}
      {modalVisualizarAberto && perfilSelecionado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">
              Detalhes do Perfil
            </h3>
            <div className="modal-body">
              <p><strong>Nome:</strong> {perfilSelecionado.nome || '—'}</p>
              <p><strong>E-mail:</strong> {perfilSelecionado.email || '—'}</p>
              <p><strong>Documento:</strong> {perfilSelecionado.documento || '—'}</p>
              <p><strong>Cargo:</strong> {perfilSelecionado.role || '—'}</p>
              <p><strong>Cidade:</strong> {perfilSelecionado.cidade || '—'}</p>
            </div>
            
            <button 
              className="btn-fechar" 
              onClick={() => setModalVisualizarAberto(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GerenciarClientes;