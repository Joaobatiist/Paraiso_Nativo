import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from '@components/home/header/Header';
import Home from '@components/home/Home';
import Dashboard from '@components/dashboard/Dashboard';
import Reserva from '@components/home/reserva/Reserva';
import PagamentoFeedback from '@components/home/reserva/PagamentoFeedback';
import RedefinirSenha from '@components/dashboard/login/RedefinirSenha';
import LoginForm from '@components/dashboard/login/LoginForm';
import { PrivateRoute } from '@components/privateRouter/PrivateRouter'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ROTAS PÚBLICAS (Site da Pousada) */}
        <Route path="/" element={
          <>
            <Header />
            <Home />
          </>
        } />

        <Route path="/reserva" element={
          <>
            <Reserva />
          </>
        } />

        <Route path="/login" element={<LoginForm />} />
        <Route 
          path="/dashboard/" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />

        {/* RETORNO DO MERCADO PAGO APÓS PAGAMENTO */}
        <Route path="/reserva/sucesso" element={<PagamentoFeedback />} />
        <Route path="/reserva/falha" element={<PagamentoFeedback />} />
        <Route path="/reserva/pendente" element={<PagamentoFeedback />} />

        {/* REDEFINIÇÃO DE SENHA (link enviado por email pelo Supabase) */}
        <Route path="/reset-senha" element={<RedefinirSenha />} />

        {/* REDIRECIONAMENTO PARA ERRO 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;