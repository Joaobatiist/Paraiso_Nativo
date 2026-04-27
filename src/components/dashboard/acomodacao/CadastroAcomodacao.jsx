import React, { useState } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaSpinner, FaCheck } from 'react-icons/fa';
import { supabaseService } from '@services/supabaseService';
import './CadastroAcomodacao.css';

const estadoInicial = {
  nome: '',
  descricao: '',
  preco_diaria: '',
  capacidade_pessoas: 2,
  url_capa: '',
  status: 'disponivel',
};

const CadastroAcomodacao = ({ onSalvo }) => {
  const [form, setForm] = useState(estadoInicial);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const handleChange = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
    setErro('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      setErro('O nome da acomodação é obrigatório.');
      return;
    }
    if (!form.preco_diaria || Number(form.preco_diaria) <= 0) {
      setErro('Informe um preço de diária válido.');
      return;
    }
    setLoading(true);
    setErro('');
    setSucesso('');
    try {
      await supabaseService.create('acomodacoes', {
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || null,
        preco_diaria: Number(form.preco_diaria),
        capacidade_pessoas: Number(form.capacidade_pessoas),
        url_capa: form.url_capa.trim() || null,
        status: form.status,
      });
      setSucesso(`Acomodação "${form.nome}" cadastrada com sucesso!`);
      setForm(estadoInicial);
      if (onSalvo) onSalvo();
    } catch (err) {
      setErro('Erro ao cadastrar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cadastro-acomodacao">
      <h2 className="component-title">Nova Acomodação</h2>

      {sucesso && (
        <div className="sucesso-message">
          <FaCheckCircle /> {sucesso}
        </div>
      )}
      {erro && (
        <div className="error-message">
          <span className="error-icon"><FaExclamationTriangle /></span>{erro}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Nome da Acomodação </label>
          <input
            type="text"
            className="form-input"
            value={form.nome}
            onChange={e => handleChange('nome', e.target.value)}
            placeholder="Ex: Chalé Ipê Amarelo"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Descrição</label>
          <textarea
            className="form-input"
            value={form.descricao}
            onChange={e => handleChange('descricao', e.target.value)}
            placeholder="Descreva a acomodação..."
            rows={3}
          />
        </div>

        <div className="form-grid-2">
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
            <label className="form-label">Capacidade (pessoas)</label>
            <input
              type="number"
              className="form-input"
              value={form.capacidade_pessoas}
              onChange={e => handleChange('capacidade_pessoas', e.target.value)}
              min={1}
              max={20}
            />
          </div>
        </div>

        <div className="form-grid-2">
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

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? <><FaSpinner className="loading-spinner" /> Salvando...</> : <><FaCheck /> Cadastrar Acomodação</>}
        </button>
      </form>
    </div>
  );
};

export default CadastroAcomodacao;
