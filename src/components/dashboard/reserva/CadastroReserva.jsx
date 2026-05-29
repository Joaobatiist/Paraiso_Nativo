import React, { useState, useEffect } from 'react';
import {
  FaCheckCircle, FaExclamationTriangle, FaCalendarAlt,
  FaSpinner, FaTimes, FaUser, FaEnvelope, FaIdCard,
  FaBed, FaPhone, FaUsers, FaConciergeBell,
} from 'react-icons/fa';
import { acomodacaoService } from '@services/acomodacaoService';
import { reservaService } from '@services/reservaService';
import { perfilService } from '@services/perfilService';
import { calcularReservaService } from '@services/calcularReservaService';
import {calcularDiariaPorHospedes} from '@utils/calculadores'
import './CadastroReserva.css';
import {mascaraCPF, mascaraTelefone, apenasLetras} from '@utils/masks'
import { validate } from '@utils/validators'
import { Field, SelectField } from './ReservaFields';


const estadoInicial = {
  nome: '', cpf: '', email: '', telefone: '',
  id_acomodacao: '', data_checkin: '', data_checkout: '',
  num_hospedes: '1', observacoes: '',
};

const CadastroReserva = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState(estadoInicial);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [acomodacoes, setAcomodacoes] = useState([]);

  useEffect(() => {
    acomodacaoService.listarTodasComFotos()
      .then(data => setAcomodacoes(data || []))
      .catch(() => {});
  }, []);

  const handleChange = (campo, valor) => {
    let v = valor;
    if (campo === 'cpf')      v = mascaraCPF(valor);
    if (campo === 'telefone') v = mascaraTelefone(valor);
    if (campo === 'nome')     v = apenasLetras(valor);
    setForm(prev => ({ ...prev, [campo]: v }));
    if (errors[campo]) setErrors(prev => ({ ...prev, [campo]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { valido, erros } = validate(form);
    if (!valido) {
      setErrors(erros);
      return;
    }
    setIsLoading(true);
    setErrors({});
    try {
      // Salva ou atualiza o perfil do hóspede
      const perfilData = await perfilService.salvarPerfil({
        nome: form.nome.trim(),
        email: form.email.trim(),
        documento: form.cpf.trim(),
        telefone: form.telefone.trim(),

      });

      const idUsuario = perfilData?.id ?? perfilData?.[0]?.id ?? null;

      // Busca dados da acomodação
      const acomodacao = acomodacoes.find(a => a.id === form.id_acomodacao);
      
      if (!acomodacao) {
        throw new Error('Acomodação não encontrada');
      }

      // Calcula valor_total considerando pacotes promocionais
      const resultadoCalculo = await calcularReservaService.calcularValorTotal(
        form.id_acomodacao,
        form.data_checkin,
        form.data_checkout,
        acomodacao.preco_diaria,
        form.num_hospedes
      );

      await reservaService.criarNovaReserva({
        id_usuario: idUsuario,
        id_acomodacao: form.id_acomodacao,
        data_checkin: form.data_checkin,
        data_checkout: form.data_checkout,
        valor_total: resultadoCalculo.valorTotal,
        status_reserva: 'pendente',
      });

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        else if (onClose) onClose();
      }, 2000);
    } catch (err) {
      setErrors({ submit: err.message || 'Erro ao criar reserva.' });
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Tela de Sucesso ── */
  if (success) {
    return (
      <div className="cr-overlay">
        <div className="cr-card">
          <div className="cr-success-card">
            <div className="cr-success-icon"><FaCheckCircle /></div>
            <h3 className="cr-success-title">Reserva criada!</h3>
            <p className="cr-success-desc">A reserva foi registrada com sucesso e está aguardando confirmação.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cr-overlay" onClick={onClose}>
      <div className="cr-card" onClick={e => e.stopPropagation()}>

        {/* ── Cabeçalho ── */}
        <div className="cr-header">
          <div className="cr-header-left">
            <div className="cr-header-badge"><FaConciergeBell /></div>
            <div>
              <h2 className="cr-title">Nova Reserva</h2>
              <p className="cr-subtitle">Preencha os dados do hóspede e da estadia</p>
            </div>
          </div>
          <button className="cr-close" onClick={onClose} type="button" aria-label="Fechar">
            <FaTimes />
          </button>
        </div>

        {/* ── Formulário ── */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="cr-body">

            {errors.submit && (
              <div className="cr-error-banner">
                <FaExclamationTriangle />
                {errors.submit}
              </div>
            )}

            {/* ── Seção: Dados do Hóspede ── */}
            <div className="cr-section">
              <p className="cr-section-title">Dados do Hóspede</p>

              <Field
                campo="nome" label="Nome completo" icon={FaUser} required
                placeholder="Nome do hóspede"
                value={form.nome} onChange={handleChange} error={errors.nome}
              />

              <div className="cr-grid2">
                <Field
                  campo="cpf" label="CPF" icon={FaIdCard} required
                  placeholder="000.000.000-00"
                  value={form.cpf} onChange={handleChange} error={errors.cpf}
                />
                <Field
                  campo="email" label="E-mail" icon={FaEnvelope} required
                  type="email" placeholder="hospede@email.com" autoComplete="off"
                  value={form.email} onChange={handleChange} error={errors.email}
                />
              </div>

              <div className="cr-grid2">
                <Field
                  campo="telefone" label="Telefone" icon={FaPhone} required
                  placeholder="(00) 00000-0000"
                  value={form.telefone} onChange={handleChange} error={errors.telefone}
                />
                <SelectField
                  campo="num_hospedes" label="Nº de Hóspedes" icon={FaUsers}
                  value={form.num_hospedes} onChange={handleChange} error={errors.num_hospedes}
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <option key={n} value={String(n)}>{n} {n === 1 ? 'hóspede' : 'hóspedes'}</option>
                  ))}
                </SelectField>
              </div>
            </div>

            {/* ── Seção: Dados da Reserva ── */}
            <div className="cr-section">
              <p className="cr-section-title">Dados da Reserva</p>

              <SelectField
                campo="id_acomodacao" label="Acomodação" icon={FaBed} required
                value={form.id_acomodacao} onChange={handleChange} error={errors.id_acomodacao}
              >
                <option value="">Selecione uma acomodação</option>
                {acomodacoes.map(a => (
                  <option key={a.id} value={a.id}>{a.nome}</option>
                ))}
              </SelectField>

              <div className="cr-grid2">
                <Field
                  campo="data_checkin" label="Check-in" icon={FaCalendarAlt} required
                  type="date"
                  value={form.data_checkin} onChange={handleChange} error={errors.data_checkin}
                />
                <Field
                  campo="data_checkout" label="Check-out" icon={FaCalendarAlt} required
                  type="date"
                  value={form.data_checkout} onChange={handleChange} error={errors.data_checkout}
                />
              </div>

              <div className="cr-field">
                <label className="cr-label">Observações</label>
                <textarea
                  className="cr-textarea"
                  value={form.observacoes}
                  onChange={e => handleChange('observacoes', e.target.value)}
                  placeholder="Ex: chegada tardia, quarto acessível, berço para bebê..."
                  rows={3}
                />
              </div>
            </div>

          </div>

          {/* ── Rodapé ── */}
          <div className="cr-footer">
            <button type="button" className="cr-btn-cancel" onClick={onClose} disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className="cr-btn-submit" disabled={isLoading}>
              {isLoading
                ? <><FaSpinner className="cr-spinner" /> Salvando...</>
                : <><FaConciergeBell /> Criar Reserva</>
              }
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default CadastroReserva;
