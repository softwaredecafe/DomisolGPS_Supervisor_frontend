import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header'; 
import Dashboard from './pages/Dashboard';
import './index.css';
import Rutas from './pages/Rutas';
import Personal from './pages/Personal';
import MapaGeneral from './pages/MapaGeneral';

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
  return (
    <BrowserRouter>
      <div className="app">
        
        <Header />

        <main className="main">

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/mapa" element={<MapaGeneral />} />
            <Route path="/perfiles" element={<Personal/>} /> 
            <Route path="/rutas" element={<Rutas />} />
            <Route path="/trafico" element={<Placeholder title="Control de tráfico y ETA" sub="Validación de atrasos con tráfico" />} />
            <Route path="/alertas" element={<Placeholder title="Alertas operativas" sub="Últimos eventos" />} />
            <Route path="/reportes" element={<Placeholder title="Resumen operativo por tienda" sub="Los indicadores se calculan con el personal asignado" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}