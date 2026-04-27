import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@lib/supabase';
import { useAuth } from '@hooks/useAuth';
import { loginControlado } from '@services/authService';
import { FaLock } from "react-icons/fa6";
import './LoginForm.css';

const LoginForm = ({ onLogin }) => {
  const [authModo, setAuthModo] = useState('login');
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

  // Se já estiver logado, redireciona para o dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Restaurar bloqueio do localStorage ao carregar a página
  useEffect(() => {
    const bloqueioArmazenado = localStorage.getItem(BLOQUEIO_KEY);
    if (bloqueioArmazenado) {
      const tempoExpiracao = parseInt(bloqueioArmazenado);
      const agora = Date.now();
      const tempoRestante = Math.ceil((tempoExpiracao - agora) / 1000);

      if (tempoRestante > 0) {
        setBloqueioTempo(tempoRestante);
        setAuthErro(`Muitas tentativas. Tente novamente em ${tempoRestante}s`);
      } else {
        // Bloqueio expirou
        localStorage.removeItem(BLOQUEIO_KEY);
      }
    }
  }, []);

  // 🔒 Contagem regressiva do bloqueio
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthErro('');
    setAuthMsg('');

    // Bloquear se ainda está em cooldown
    if (bloqueioTempo > 0) {
      setAuthErro(`Aguarde ${bloqueioTempo}s antes de tentar novamente.`);
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

  // Login real (cria sessão)
    const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) throw new Error(error.message);

  setAuthForm((prev) => ({
    ...prev,
    senha: '',
    confirmarSenha: '',
  }));
        navigate('/dashboard');
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: authForm.email.trim(),
        password: authForm.senha,
        options: {
          data: {
            nome: authForm.nome.trim(),
          },
        },
      });
      if (error) throw new Error(error.message);

      if (!data.session) {
        setAuthMsg('Conta criada! Verifique seu e-mail para confirmar e depois faça login.');
        setAuthModo('login');
        setAuthForm((prev) => ({
          ...prev,
          senha: '',
          confirmarSenha: '',
        }));
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      const mensagem = err.message || 'Email ou senha incorretos!';
      
      // Se contém mensagem de bloqueio, ativar contagem regressiva
      if (mensagem.includes('Muitas tentativas')) {
        const match = mensagem.match(/(\d+)s/);
        const segundos = match ? parseInt(match[1]) : 60;
        const tempoExpiracao = Date.now() + segundos * 1000;
        
        localStorage.setItem(BLOQUEIO_KEY, tempoExpiracao.toString());
        
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
          <h3>Bem-vindo ao Paraíso Nativo</h3>
          <p>Faça login ou crie sua conta para continuar.</p>
        </div>

        <div className="reserva-auth-tabs">
          <button
            type="button"
            className={authModo === 'login' ? 'ativo' : ''}
            onClick={() => { setAuthModo('login'); setAuthErro(''); setAuthMsg(''); }}
          >
            Entrar
          </button>
          <button
            type="button"
            className={authModo === 'cadastro' ? 'ativo' : ''}
            onClick={() => { setAuthModo('cadastro'); setAuthErro(''); setAuthMsg(''); }}
          >
            Cadastrar
          </button>
        </div>

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

          <button type="submit" className="reserva-submit" disabled={authLoading || bloqueioTempo > 0}>
            {bloqueioTempo > 0
              ? `Bloqueado por ${bloqueioTempo}s`
              : authLoading
              ? 'Processando...'
              : authModo === 'cadastro'
                ? 'Criar conta para reservar'
                : 'Entrar e continuar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;