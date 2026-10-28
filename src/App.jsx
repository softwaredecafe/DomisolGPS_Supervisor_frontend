import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header'; 
import Dashboard from './pages/Dashboard';
import './index.css';
import Rutas from './pages/Rutas';
import Personal from './pages/Personal';
import MapaGeneral from './pages/MapaGeneral';
import LoginAdmin from './pages/LoginAdmin';
import Trafico from './pages/Trafico';
import Alertas from './pages/Alertas'; 

const Placeholder = ({ title, sub }) => (
  <section className="section active">
    <div className="card">
      <div className="cardhead">
        <div>
          <h3>{title}</h3>
          <small>{sub}</small>
        </div>
      </div>
      <div className="notice" style={{ marginTop: '16px' }}>Módulo en construcción...</div>
    </div>
  </section>
);

export default function App() {
  const [userRole, setUserRole] = useState(null);
  
  useEffect(() => {
    const rolGuardado = localStorage.getItem('admin_rol');
    if (rolGuardado) {
      setUserRole(rolGuardado);
    }
  }, []);

  const handleLogin = (rol) => {
    setUserRole(rol);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_id');
    localStorage.removeItem('admin_nombre');
    localStorage.removeItem('admin_rol');
    setUserRole(null);
  };

  if (!userRole) {
    return <LoginAdmin onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="app">
        <Header userRole={userRole} onLogout={handleLogout} />

        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard userRole={userRole} />} />
            <Route path="/mapa" element={<MapaGeneral userRole={userRole} />} />
            <Route path="/rutas" element={<Rutas userRole={userRole} />} />
            
            <Route path="/perfiles" element={<Personal />} />
            
            <Route path="/trafico" element={<Trafico />}/>
            <Route path="/alertas" element={<Alertas />} />
            <Route path="/reportes" element={<Placeholder title="Resumen operativo por tienda" sub="Los indicadores se calculan con el personal asignado" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}