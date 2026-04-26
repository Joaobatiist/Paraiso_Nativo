import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from '@components/header/Header';
import Home from '@components/home/Home';
import Dashboard from '@components/dashboard/Dashboard';
import Reserva from '@components/home/reserva/Reserva';
import Footer from '@components/home/footer/Footer';
import LoginForm from '@components/dashboard/LoginForm';
import Sidebar from '@components/dashboard/sidebar/Sidebar';
import { PrivateRoute } from '@components/PrivateRouter'; 

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