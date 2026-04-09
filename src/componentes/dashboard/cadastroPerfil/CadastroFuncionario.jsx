import React, { useState } from 'react';
import {
  FaCheckCircle, FaExclamationTriangle, FaUserPlus, FaEye, FaEyeSlash,
  FaSpinner, FaTimes, FaLock, FaUser, FaEnvelope, FaIdCard, FaBriefcase, FaMapMarkerAlt,
} from 'react-icons/fa';
import { perfilService } from '../../../services/perfilService';
import { supabase } from '../../../lib/supabase';
import './CadastroFuncionario.css';

/* ── Field fora do componente pai para não perder foco a cada keystroke ── */
const Field = ({ campo, label, type = 'text', placeholder, icon: Icon, required, autoComplete, end, value, onChange, error }) => (
  <div className="cf-field">
    <label className="cf-label">{label}{required && ' *'}</label>
    <div className={`cf-input-wrap${error ? ' error' : ''}`}>
      <Icon className="cf-icon-left" />
      <input
        type={type}
        className={`cf-input${end ? ' has-end-icon' : ''}`}
        value={value}
        onChange={e => onChange(campo, e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      {end}
    </div>
    {error && <span className="cf-field-error"><FaExclamationTriangle />{error}</span>}
  </div>
);

/* ══════════════════════════════════════
   MÁSCARAS DE FORMATAÇÃO
══════════════════════════════════════ */
const mascaraCPF = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
};

const mascaraCEP = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0,5)}-${d.slice(5)}`;
};

const apenasLetras = (v) =>
  v.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');

const validarCPF = (cpf) => {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false;
  const calc = (len) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += parseInt(d[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 || r === 11 ? 0 : r;
  };
  return calc(9) === parseInt(d[9]) && calc(10) === parseInt(d[10]);
};


const forcaSenha = (senha) => {
  if (!senha) return { nivel: 0, texto: '', cor: '' };
  let pontos = 0;
  if (senha.length >= 6)  pontos++;
  if (senha.length >= 10) pontos++;
  if (/[A-Z]/.test(senha)) pontos++;
  if (/[0-9]/.test(senha)) pontos++;
  if (/[^A-Za-z0-9]/.test(senha)) pontos++;
  if (pontos <= 1) return { nivel: 1, texto: 'Fraca',  cor: '#ef4444' };
  if (pontos <= 3) return { nivel: 2, texto: 'Média',  cor: '#f59e0b' };
  return               { nivel: 3, texto: 'Forte',  cor: '#10b981' };
};

const estadoInicial = {
  nome: '', email: '', documento: '',
  cidade: '', cep: '', senha: '', confirmarSenha: '',
};

const CadastroFuncionario = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState(estadoInicial);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const handleChange = (campo, valor) => {
    let v = valor;
    if (campo === 'documento') v = mascaraCPF(valor);
    if (campo === 'cep')       v = mascaraCEP(valor);
    if (campo === 'nome')      v = apenasLetras(valor);
    if (campo === 'cidade')    v = apenasLetras(valor);
    setForm(prev => ({ ...prev, [campo]: v }));
    if (errors[campo]) setErrors(prev => ({ ...prev, [campo]: '' }));
  };

  const validate = () => {
    const errs = {};

    // Nome
    if (!form.nome.trim())
      errs.nome = 'Nome é obrigatório';
    else if (form.nome.trim().length < 3)
      errs.nome = 'Mínimo de 3 caracteres';
    else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(form.nome.trim()))
      errs.nome = 'Apenas letras são permitidas';

    // CPF
    if (!form.documento.trim())
      errs.documento = 'CPF é obrigatório';
    else if (!validarCPF(form.documento))
      errs.documento = 'CPF inválido';

    // Cidade (opcional)
    if (form.cidade.trim() && !/^[a-zA-ZÀ-ÿ\s]+$/.test(form.cidade.trim()))
      errs.cidade = 'Apenas letras são permitidas';

    // CEP (opcional, mas se preenchido valida formato)
    if (form.cep.trim() && form.cep.replace(/\D/g, '').length !== 8)
      errs.cep = 'CEP deve ter 8 dígitos';

    // E-mail
    if (!form.email.trim())
      errs.email = 'E-mail é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'E-mail inválido';

    // Senha
    if (!form.senha)
      errs.senha = 'Senha é obrigatória';
    else if (form.senha.length < 6)
      errs.senha = 'Mínimo de 6 caracteres';
    else if (!/[A-Za-z]/.test(form.senha))
      errs.senha = 'Use ao menos uma letra';
    else if (!/[0-9]/.test(form.senha))
      errs.senha = 'Use ao menos um número';

    // Confirmar senha
    if (!form.confirmarSenha)
      errs.confirmarSenha = 'Confirme a senha';
    else if (form.senha !== form.confirmarSenha)
      errs.confirmarSenha = 'As senhas não coincidem';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const forca = forcaSenha(form.senha);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});
    try {
      // Preserva a sessão do admin antes de criar o novo usuário
      const { data: { session: sessaoAdmin } } = await supabase.auth.getSession();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.senha,
      });
      if (authError) throw new Error(authError.message);

      // Restaura imediatamente a sessão do admin
      if (sessaoAdmin) {
        await supabase.auth.setSession({
          access_token: sessaoAdmin.access_token,
          refresh_token: sessaoAdmin.refresh_token,
        });
      }

      // Salva perfil vinculado ao id do auth — role:'admin' é coluna válida no schema
      await perfilService.salvarPerfil({
        id: authData.user.id,
        nome: form.nome.trim(),
        email: form.email.trim(),
        documento: form.documento.trim(),
        role: 'admin',
        cidade: form.cidade.trim() || null,
        cep: form.cep.trim() || null,
      });

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        else if (onClose) onClose();
      }, 2000);
    } catch (err) {
      setErrors({ submit: err.message || 'Erro ao cadastrar funcionário.' });
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Tela de Sucesso ── */
  if (success) {
    return (
      <div className="cf-overlay">
        <div className="cf-card">
          <div className="cf-success-card">
            <div className="cf-success-icon"><FaCheckCircle /></div>
            <h3 className="cf-success-title">Funcionário cadastrado!</h3>
            <p className="cf-success-desc">O acesso ao painel foi criado com sucesso.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cf-overlay" onClick={onClose}>
      <div className="cf-card" onClick={e => e.stopPropagation()}>

        {/* ── Cabeçalho ── */}
        <div className="cf-header">
          <div className="cf-header-left">
            <div className="cf-header-badge"><FaUserPlus /></div>
            <div>
              <h2 className="cf-title">Novo Funcionário</h2>
              <p className="cf-subtitle">Preencha os dados e crie o acesso ao painel</p>
            </div>
          </div>
          <button className="cf-close" onClick={onClose} type="button" aria-label="Fechar">
            <FaTimes />
          </button>
        </div>

        {/* ── Formulário ── */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="cf-body">

            {errors.submit && (
              <div className="cf-error-banner">
                <FaExclamationTriangle />
                {errors.submit}
              </div>
            )}

            {/* ── Seção: Dados Pessoais ── */}
            <div className="cf-section">
              <p className="cf-section-title">Dados Pessoais</p>

              <Field
                campo="nome" label="Nome completo" icon={FaUser} required
                placeholder="Nome do funcionário"
                value={form.nome} onChange={handleChange} error={errors.nome}
              />

              <div className="cf-grid2">
                <Field
                  campo="documento" label="CPF / Documento" icon={FaIdCard} required
                  placeholder="000.000.000-00"
                  value={form.documento} onChange={handleChange} error={errors.documento}
                />
                <div className="cf-field">
                  <label className="cf-label">Cargo</label>
                  <div className="cf-cargo-badge">
                    <FaBriefcase />
                    <span>Administrador</span>
                  </div>
                </div>
              </div>

              <div className="cf-grid2">
                <Field
                  campo="cidade" label="Cidade" icon={FaMapMarkerAlt}
                  placeholder="Cidade"
                  value={form.cidade} onChange={handleChange} error={errors.cidade}
                />
                <Field
                  campo="cep" label="CEP" icon={FaMapMarkerAlt}
                  placeholder="00000-000"
                  value={form.cep} onChange={handleChange} error={errors.cep}
                />
              </div>
            </div>

            {/* ── Seção: Acesso ao Sistema ── */}
            <div className="cf-section">
              <p className="cf-section-title">Acesso ao Sistema</p>

              <Field
                campo="email" label="E-mail" icon={FaEnvelope} required
                type="email" placeholder="email@pousada.com" autoComplete="off"
                value={form.email} onChange={handleChange} error={errors.email}
              />

              <div className="cf-grid2">
                <Field
                  campo="senha" label="Senha" icon={FaLock} required
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  value={form.senha} onChange={handleChange} error={errors.senha}
                  end={
                    <button type="button" className="cf-eye" onClick={() => setMostrarSenha(v => !v)} tabIndex={-1}>
                      {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  }
                />
                <Field
                  campo="confirmarSenha" label="Confirmar Senha" icon={FaLock} required
                  type={mostrarConfirmar ? 'text' : 'password'}
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                  value={form.confirmarSenha} onChange={handleChange} error={errors.confirmarSenha}
                  end={
                    <button type="button" className="cf-eye" onClick={() => setMostrarConfirmar(v => !v)} tabIndex={-1}>
                      {mostrarConfirmar ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  }
                />
              </div>

              {/* Indicador de força da senha */}
              {form.senha && (
                <div className="cf-senha-forca">
                  <div className="cf-senha-forca-bar">
                    {[1, 2, 3].map(n => (
                      <span
                        key={n}
                        className="cf-senha-forca-seg"
                        style={{ background: n <= forca.nivel ? forca.cor : '#e8e4de' }}
                      />
                    ))}
                  </div>
                  <span className="cf-senha-forca-texto" style={{ color: forca.cor }}>
                    {forca.texto}
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* ── Rodapé ── */}
          <div className="cf-footer">
            <button type="button" className="cf-btn-cancel" onClick={onClose} disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className="cf-btn-submit" disabled={isLoading}>
              {isLoading
                ? <><FaSpinner className="cf-spinner" /> Cadastrando...</>
                : <><FaUserPlus /> Cadastrar Funcionário</>
              }
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default CadastroFuncionario;

