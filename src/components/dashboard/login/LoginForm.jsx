import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@lib/supabase';
import { useAuth } from '@hooks/useAuth';
import { loginControlado } from '@services/authService';
import { FaLock } from "react-icons/fa6";
import './LoginForm.css';

const LoginForm = ({ onLogin }) => {
  const [authModo, setAuthModo] = useState('login'); // 'login' | 'cadastro' | 'esqueci'
  const [authLoading, setAuthLoading] = useState(false);
  const [authErro, setAuthErro] = useState('');
  const [authMsg, setAuthMsg] = useState('');
  const [bloqueioTempo, setBloqueioTempo] = useState(0);
  const [authForm, setAuthForm] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });
  const navigate = useNavigate();
  const { user } = useAuth();
  const BLOQUEIO_KEY = 'paraiso_login_bloqueio';

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  useEffect(() => {
    const bloqueioArmazenado = localStorage.getItem(BLOQUEIO_KEY);
    if (bloqueioArmazenado) {
      const tempoExpiracao = parseInt(bloqueioArmazenado);
      const tempoRestante = Math.ceil((tempoExpiracao - Date.now()) / 1000);
      if (tempoRestante > 0) {
        setBloqueioTempo(tempoRestante);
        setAuthErro(`Muitas tentativas. Tente novamente em ${tempoRestante}s`);
      } else {
        localStorage.removeItem(BLOQUEIO_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (bloqueioTempo <= 0) {
      localStorage.removeItem(BLOQUEIO_KEY);
      return;
    }
    const interval = setInterval(() => {
      setBloqueioTempo((prev) => {
        const novo = prev - 1;
        if (novo <= 0) {
          setAuthErro('');
          setAuthMsg('Você pode tentar novamente agora.');
          localStorage.removeItem(BLOQUEIO_KEY);
        }
        return novo;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [bloqueioTempo]);

  const handleAuthChange = (campo, valor) => {
    setAuthForm((prev) => ({ ...prev, [campo]: valor }));
    setAuthErro('');
    setAuthMsg('');
  };

  const trocarModo = (modo) => {
    setAuthModo(modo);
    setAuthErro('');
    setAuthMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthErro('');
    setAuthMsg('');

    if (bloqueioTempo > 0) {
      setAuthErro(`Aguarde ${bloqueioTempo}s antes de tentar novamente.`);
      return;
    }

    
    if (authModo === 'esqueci') {
      if (!authForm.email.trim()) {
        setAuthErro('Informe seu e-mail.');
        return;
      }
      setAuthLoading(true);
      try {
        const base = import.meta.env.VITE_SITE_URL || window.location.origin;
        const { error } = await supabase.auth.resetPasswordForEmail(
          authForm.email.trim(),
          { redirectTo: `${base}/reset-senha` }
        );
        if (error) throw new Error(error.message);
        setAuthMsg('Link enviado! Verifique sua caixa de entrada e spam.');
      } catch (err) {
        setAuthErro(err.message || 'Erro ao enviar o link. Tente novamente.');
      } finally {
        setAuthLoading(false);
      }
      return;
    }

    if (!authForm.email.trim() || !authForm.senha.trim()) {
      setAuthErro('Informe e-mail e senha.');
      return;
    }

    if (authModo === 'cadastro') {
      if (!authForm.nome.trim()) {
        setAuthErro('Informe seu nome para criar a conta.');
        return;
      }
      if (authForm.senha.length < 6) {
        setAuthErro('A senha precisa ter pelo menos 6 caracteres.');
        return;
      }
      if (authForm.senha !== authForm.confirmarSenha) {
        setAuthErro('As senhas não coincidem.');
        return;
      }
    }

    setAuthLoading(true);
    try {
      if (authModo === 'login') {
        const email = authForm.email.trim();
        const senha = authForm.senha;
        await loginControlado(email, senha);
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw new Error(error.message);
        setAuthForm((prev) => ({ ...prev, senha: '', confirmarSenha: '' }));
        navigate('/dashboard');
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: authForm.email.trim(),
        password: authForm.senha,
        options: { data: { nome: authForm.nome.trim() } },
      });
      if (error) throw new Error(error.message);

      if (!data.session) {
        setAuthMsg('Conta criada! Verifique seu e-mail para confirmar e depois faça login.');
        trocarModo('login');
        setAuthForm((prev) => ({ ...prev, senha: '', confirmarSenha: '' }));
        return;
      }
      navigate('/dashboard');
    } catch (err) {
      const mensagem = err.message || 'Email ou senha incorretos!';
      if (mensagem.includes('Muitas tentativas')) {
        const match = mensagem.match(/(\d+)s/);
        const segundos = match ? parseInt(match[1]) : 60;
        localStorage.setItem(BLOQUEIO_KEY, (Date.now() + segundos * 1000).toString());
        setBloqueioTempo(segundos);
        setAuthErro(`Muitas tentativas. Tente novamente em ${segundos}s`);
      } else {
        setAuthErro(mensagem);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="reserva-login-page">
      <div className="reserva-auth-gate">
        <button
          type="button"
          className="login-back"
          onClick={() => { window.location.href = '/'; }}
          aria-label="Voltar para a tela principal"
        >
          &lt;- Voltar
        </button>

        <div className="login-header">
          <img src="/logo.png" alt="Paraíso Nativo" className="login-logo" />
          <h3>
            {authModo === 'esqueci' ? 'Redefinir senha' : 'Bem-vindo ao Paraíso Nativo'}
          </h3>
          <p>
            {authModo === 'esqueci'
              ? 'Informe seu e-mail e enviaremos um link para criar uma nova senha.'
              : 'Faça login ou crie sua conta para continuar.'}
          </p>
        </div>

        {authModo !== 'esqueci' && (
          <div className="reserva-auth-tabs">
            <button
              type="button"
              className={authModo === 'login' ? 'ativo' : ''}
              onClick={() => trocarModo('login')}
            >
              Entrar
            </button>
            <button
              type="button"
              className={authModo === 'cadastro' ? 'ativo' : ''}
              onClick={() => trocarModo('cadastro')}
            >
              Cadastrar
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="reserva-auth-form">
          {authModo === 'cadastro' && (
            <label>
              <span>Nome completo</span>
              <input
                type="text"
                value={authForm.nome}
                onChange={(e) => handleAuthChange('nome', e.target.value)}
                placeholder="Seu nome"
                required
              />
            </label>
          )}

          <label>
            <span>E-mail</span>
            <input
              type="email"
              value={authForm.email}
              onChange={(e) => handleAuthChange('email', e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
          </label>

          {authModo !== 'esqueci' && (
            <label>
              <span>Senha</span>
              <input
                type="password"
                value={authForm.senha}
                onChange={(e) => handleAuthChange('senha', e.target.value)}
                placeholder="******"
                required
                autoComplete={authModo === 'login' ? 'current-password' : 'new-password'}
              />
            </label>
          )}

          {authModo === 'login' && (
            <div className="esqueci-link-wrapper">
              <button
                type="button"
                className="esqueci-link"
                onClick={() => trocarModo('esqueci')}
              >
                Esqueceu sua senha?
              </button>
            </div>
          )}

          {authModo === 'cadastro' && (
            <label>
              <span>Confirmar senha</span>
              <input
                type="password"
                value={authForm.confirmarSenha}
                onChange={(e) => handleAuthChange('confirmarSenha', e.target.value)}
                placeholder="******"
                required
              />
            </label>
          )}

          {authErro && (
            <p className="reserva-feedback erro">
              {bloqueioTempo > 0 && <FaLock style={{ marginRight: '8px' }} />}
              {authErro}
            </p>
          )}
          {authMsg && <p className="reserva-feedback sucesso">{authMsg}</p>}

          <button
            type="submit"
            className="reserva-submit"
            disabled={authLoading || bloqueioTempo > 0}
          >
            {bloqueioTempo > 0
              ? `Bloqueado por ${bloqueioTempo}s`
              : authLoading
              ? 'Processando...'
              : authModo === 'cadastro'
              ? 'Criar conta para reservar'
              : authModo === 'esqueci'
              ? 'Enviar link de redefinição'
              : 'Entrar e continuar'}
          </button>

          {authModo === 'esqueci' && (
            <button
              type="button"
              className="esqueci-voltar"
              onClick={() => trocarModo('login')}
            >
              ← Voltar ao login
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
