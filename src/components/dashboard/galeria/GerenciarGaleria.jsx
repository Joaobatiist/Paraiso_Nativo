import React, { useState, useEffect, useCallback } from 'react';
import { acomodacaoService } from '@services/acomodacaoService';
import { galeriaService } from '@services/galeriaService';
import { storageService } from '@services/arquivoService';
import { FaBed, FaSyncAlt, FaExclamationTriangle, FaSpinner, FaTimes } from 'react-icons/fa';
import './GerenciarGaleria.css';

const GerenciarGaleria = () => {
  const [acomodacoes, setAcomodacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [addForm, setAddForm] = useState({}); // { [idAcom]: { url, legenda } }
  const [salvando, setSalvando] = useState({});

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro('');
    try {
      const data = await acomodacaoService.listarTodasComFotos();
      setAcomodacoes(data);
    } catch (e) {
      setErro('Erro ao carregar: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const handleAddFoto = async (idAcom) => {
    const f = addForm[idAcom] || {};
    if (!f.arquivo) {
      alert('Selecione um arquivo de imagem.');
      return;
    }
    setSalvando(prev => ({ ...prev, [idAcom]: true }));
    try {
      const url = await storageService.subirFotoAcomodacao(f.arquivo);
      await galeriaService.adicionarFoto(idAcom, url, f.legenda?.trim() || null);
      setAddForm(prev => ({ ...prev, [idAcom]: { arquivo: null, legenda: '' } }));
      await carregar();
    } catch (e) {
      console.error('Erro ao adicionar foto')
    } finally {
      setSalvando(prev => ({ ...prev, [idAcom]: false }));
    }
  };

  const handleRemoverFoto = async (idFoto) => {
    if (!window.confirm('Remover esta foto?')) return;
    try {
      await galeriaService.removerFoto(idFoto);
      await carregar();
    } catch (e) {
      console.error('Erro ao remover foto!');
    }
  };

  const setField = (idAcom, campo, valor) => {
    setAddForm(prev => ({
      ...prev,
      [idAcom]: { ...(prev[idAcom] || {}), [campo]: valor },
    }));
  };

  if (loading) {
    return (
      <div className="gerenciar-galeria">
        <h2 className="component-title">Galeria de Fotos</h2>
        <p className="galeria-loading-text">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="gerenciar-galeria">
      <div className="galeria-header">
        <h2 className="component-title">Galeria de Fotos</h2>
        <button
          onClick={carregar}
          className="galeria-refresh-btn"
        >
          <FaSyncAlt /> Atualizar
        </button>
      </div>

      {erro && <div className="error-message"><span className="error-icon"><FaExclamationTriangle /></span>{erro}</div>}

      {acomodacoes.length === 0 ? (
        <div className="empty-state"><p>Nenhuma acomodação encontrada.</p></div>
      ) : (
        acomodacoes.map(acom => {
          const fotos = acom.galeria_fotos || [];
          const f = addForm[acom.id] || {};
          return (
            <div key={acom.id} className="galeria-acom">
              <h3><FaBed /> {acom.nome} <span className="galeria-count-badge">({fotos.length} foto{fotos.length !== 1 ? 's' : ''})</span></h3>

              {fotos.length > 0 ? (
                <div className="galeria-fotos-grid">
                  {fotos.map(foto => (
                    <div key={foto.id} className="galeria-foto-item">
                      <img
                        src={foto.url_imagem}
                        alt={foto.legenda || acom.nome}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                      <button
                        className="galeria-foto-remove"
                        onClick={() => handleRemoverFoto(foto.id)}
                        title="Remover foto"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="galeria-empty-text">
                  Nenhuma foto ainda.
                </p>
              )}

              {/* Formulário para adicionar foto */}
              <div className="galeria-add-form">
                <input
                  type="file"
                  className="form-input"
                  accept="image/*"
                  onChange={e => setField(acom.id, 'arquivo', e.target.files[0] || null)}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Legenda (opcional)"
                  value={f.legenda || ''}
                  onChange={e => setField(acom.id, 'legenda', e.target.value)}
                />
                <button
                  className="galeria-add-btn"
                  onClick={() => handleAddFoto(acom.id)}
                  disabled={salvando[acom.id]}
                >
                  {salvando[acom.id] ? <FaSpinner className="loading-spinner" /> : '+ Adicionar'}
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default GerenciarGaleria;
