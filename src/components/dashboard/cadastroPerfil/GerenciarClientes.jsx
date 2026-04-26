import React, { useState, useEffect, useCallback } from 'react';
import { FaSyncAlt, FaExclamationTriangle, FaPlus } from 'react-icons/fa';
import { supabaseService } from '../../../services/supabaseService';
import CadastroFuncionario from './CadastroFuncionario';

const GerenciarClientes = () => {
  const [perfis, setPerfis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [modalAberto, setModalAberto] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro('');
    try {
      const data = await supabaseService.getAll('perfis');
      setPerfis(data || []);
    } catch (e) {
      setErro('Erro ao carregar funcionários: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const PerfilRow = ({ p }) => (
    <tr>
      <td><strong>{p.nome || '—'}</strong></td>
      <td>{p.email || '—'}</td>
      <td>{p.documento || '—'}</td>
      <td>{p.role || '—'}</td>
      <td>{p.cidade || '—'}</td>
    </tr>
  );

  const PerfilCard = ({ p }) => (
    <div className="dash-card">
      <h4>{p.nome || '—'}</h4>
      <p><strong>E-mail:</strong> {p.email || '—'}</p>
      <p><strong>Documento:</strong> {p.documento || '—'}</p>
      <p><strong>Cargo:</strong> {p.role || '—'}</p>
      <p><strong>Cidade:</strong> {p.cidade || '—'}</p>
    </div>
  );

  return (
    <div className="gerenciar-funcionarios">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 className="component-title" style={{ margin: 0 }}>Clientes</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={carregar}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--gray-300)', background: 'var(--gray-100)', cursor: 'pointer', fontSize: '13px' }}
          >
            <FaSyncAlt /> Atualizar
          </button>
          <button
            onClick={() => setModalAberto(true)}
            style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: 'var(--primary-blue)', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
          >
            <FaPlus /> Novo perfil
          </button>
        </div>
      </div>

      {erro && <div className="error-message"><span className="error-icon"><FaExclamationTriangle /></span>{erro}</div>}

      {loading ? (
        <p style={{ textAlign: 'center', padding: '32px', color: 'var(--gray-500)' }}>Carregando...</p>
      ) : perfis.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum perfil cadastrado.</p>
          <button
            className="submit-button"
            onClick={() => setModalAberto(true)}
            style={{ marginTop: '16px', width: 'auto', padding: '10px 24px' }}
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
                  <th>Cidade</th>
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

      {modalAberto && (
        <CadastroFuncionario
          onClose={() => setModalAberto(false)}
          onSuccess={() => { setModalAberto(false); carregar(); }}
        />
      )}
    </div>
  );
};

export default GerenciarClientes;
