import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './componentes/header/header';
import Home from './componentes/home/home';
import Dashboard from './componentes/dashboard/Dashboard';
import Reserva from './componentes/home/reserva/reserva';
import Footer from './componentes/home/footer/footer';
import LoginForm from './componentes/dashboard/LoginForm';
import Sidebar from './componentes/dashboard/Sidebar';
import { PrivateRoute } from './componentes/PriveteRouter'; // Onde você salvou o passo anterior

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

        {/* REDIRECIONAMENTO PARA ERRO 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;