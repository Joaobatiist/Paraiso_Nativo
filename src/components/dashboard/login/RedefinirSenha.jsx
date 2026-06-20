import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@lib/supabase';
import './LoginForm.css';

const RedefinirSenha = () => {
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [sessaoOk, setSessaoOk] = useState(false);
  const navigate = useNavigate();

  // O Supabase injeta a sessão de recovery via hash na URL automaticamente
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessaoOk(true);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== confirmar) {
      setErro('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) throw new Error(error.message);
      setSucesso(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setErro(err.message || 'Erro ao redefinir senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reserva-login-page">
      <div className="reserva-auth-gate">
        <div className="login-header">
          <img src="/logo.png" alt="Paraíso Nativo" className="login-logo" />
          <h3>Nova senha</h3>
          <p>
            {sessaoOk
              ? 'Escolha uma nova senha para sua conta.'
              : 'Aguardando verificação do link...'}
          </p>
        </div>

        {sucesso ? (
          <div className="reserva-feedback sucesso" style={{ marginTop: 8 }}>
            ✓ Senha redefinida com sucesso! Redirecionando para o login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="reserva-auth-form">
            <label>
              <span>Nova senha</span>
              <input
                type="password"
                value={senha}
                onChange={(e) => { setSenha(e.target.value); setErro(''); }}
                placeholder="Mínimo 6 caracteres"
                required
                autoComplete="new-password"
                disabled={!sessaoOk}
              />
            </label>

            <label>
              <span>Confirmar nova senha</span>
              <input
                type="password"
                value={confirmar}
                onChange={(e) => { setConfirmar(e.target.value); setErro(''); }}
                placeholder="Repita a nova senha"
                required
                autoComplete="new-password"
                disabled={!sessaoOk}
              />
            </label>

            {erro && <p className="reserva-feedback erro">{erro}</p>}

            <button
              type="submit"
              className="reserva-submit"
              disabled={loading || !sessaoOk}
            >
              {loading ? 'Salvando...' : 'Salvar nova senha'}
            </button>

            <button
              type="button"
              className="esqueci-voltar"
              onClick={() => navigate('/login')}
            >
              ← Voltar ao login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RedefinirSenha;
