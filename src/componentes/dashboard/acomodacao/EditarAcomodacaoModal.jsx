import React, { useState, useEffect } from 'react';
import { FaEdit, FaExclamationTriangle, FaSpinner, FaCheck } from 'react-icons/fa';
import { supabaseService } from '../../../services/supabaseService';

const EditarAcomodacaoModal = ({ acomodacao, onClose, onSalvo }) => {
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    preco_diaria: '',
    capacidade_pessoas: 2,
    url_capa: '',
    status: 'disponivel',
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (acomodacao) {
      setForm({
        nome: acomodacao.nome || '',
        descricao: acomodacao.descricao || '',
        preco_diaria: acomodacao.preco_diaria || '',
        capacidade_pessoas: acomodacao.capacidade_pessoas || 2,
        url_capa: acomodacao.url_capa || '',
        status: acomodacao.status || 'disponivel',
      });
    }
  }, [acomodacao]);

  const handleChange = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
    setErro('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      setErro('O nome é obrigatório.');
      return;
    }
    setLoading(true);
    setErro('');
    try {
      await supabaseService.update('acomodacoes', acomodacao.id, {
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || null,
        preco_diaria: Number(form.preco_diaria),
        capacidade_pessoas: Number(form.capacidade_pessoas),
        url_capa: form.url_capa.trim() || null,
        status: form.status,
      });
      if (onSalvo) onSalvo();
    } catch (err) {
      setErro('Erro ao salvar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3><FaEdit /> Editar Acomodação</h3>

        {erro && (
          <div className="error-message" style={{ marginBottom: '16px' }}>
            <span className="error-icon"><FaExclamationTriangle /></span>{erro}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nome *</label>
            <input
              type="text"
              className="form-input"
              value={form.nome}
              onChange={e => handleChange('nome', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descrição</label>
            <textarea
              className="form-input"
              value={form.descricao}
              onChange={e => handleChange('descricao', e.target.value)}
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Preço da Diária (R$) *</label>
              <input
                type="number"
                className="form-input"
                value={form.preco_diaria}
                onChange={e => handleChange('preco_diaria', e.target.value)}
                placeholder="Ex: 350.00"
                min={0}
                step={0.01}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Capacidade</label>
              <input
                type="number"
                className="form-input"
                value={form.capacidade_pessoas}
                onChange={e => handleChange('capacidade_pessoas', e.target.value)}
                min={1} max={20}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-input"
                value={form.status}
                onChange={e => handleChange('status', e.target.value)}
              >
                <option value="disponivel">Disponível</option>
                <option value="manutencao">Manutenção</option>
                <option value="indisponivel">Indisponível</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">URL da Foto de Capa</label>
              <input
                type="text"
                className="form-input"
                value={form.url_capa}
                onChange={e => handleChange('url_capa', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancelar" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-salvar" disabled={loading}>
              {loading ? <><FaSpinner className="loading-spinner" /> Salvando...</> : <><FaCheck /> Salvar</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarAcomodacaoModal;
