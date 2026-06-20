import { useLocation, useNavigate } from 'react-router-dom';

const configs = {
  sucesso: {
    titulo: 'Pagamento aprovado!',
    mensagem: 'Sua reserva foi confirmada. Em breve você receberá um e-mail com os detalhes.',
    cor: '#2e7d32',
  },
  falha: {
    titulo: 'Pagamento não aprovado',
    mensagem: 'Houve um problema com seu pagamento. Tente novamente ou entre em contato.',
    cor: '#c62828',
  },
  pendente: {
    titulo: 'Pagamento em análise',
    mensagem: 'Seu pagamento está sendo processado. Você será notificado assim que for confirmado.',
    cor: '#e65100',
  },
};

const PagamentoFeedback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tipo = location.pathname.split('/').pop();
  const config = configs[tipo] || configs.pendente;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'sans-serif',
    }}>
      <div style={{
        maxWidth: '480px',
        textAlign: 'center',
        border: `2px solid ${config.cor}`,
        borderRadius: '12px',
        padding: '2.5rem',
      }}>
        <h1 style={{ color: config.cor, marginBottom: '1rem' }}>{config.titulo}</h1>
        <p style={{ color: '#444', marginBottom: '2rem' }}>{config.mensagem}</p>
        <button
          onClick={() => navigate('/dashboard/')}
          style={{
            background: config.cor,
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Ir para minhas reservas
        </button>
      </div>
    </div>
  );
};

export default PagamentoFeedback;
