import { NavLink } from 'react-router-dom';

export default function Sidebar({ userRole, onLogout }) {
  const isSupervisor = userRole && userRole.toLowerCase().includes('supervis');

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="mark">DM</div>
        <div>
          <h1>Field Control</h1>
          <p>Dashboard {userRole || 'Admin'}</p>
        </div>
      </div>
      
      <div className="nav">
        <NavLink to="/" className={({isActive}) => isActive ? "active" : ""}>▣ Dashboard</NavLink>
        <NavLink to="/mapa" className={({isActive}) => isActive ? "active" : ""}>⌖ Mapa general</NavLink>
        
        <NavLink to="/perfiles" className={({isActive}) => isActive ? "active" : ""}>▤ Personal</NavLink>
        
        <NavLink to="/rutas" className={({isActive}) => isActive ? "active" : ""}>⇄ Rutas del día</NavLink>
        <NavLink to="/trafico" className={({isActive}) => isActive ? "active" : ""}>▥ Tráfico / ETA</NavLink>
        <NavLink to="/alertas" className={({isActive}) => isActive ? "active" : ""}>⚠ Alertas</NavLink>
        <NavLink to="/reportes" className={({isActive}) => isActive ? "active" : ""}>◷ Reportes</NavLink>
        
        <button onClick={onLogout} style={{ marginTop: '20px', color: '#ff6b6b' }}>
          ⎋ Cerrar Sesión
        </button>
      </div>

      <div className="sidebox">
        <b>Validación operativa</b>
        <p>El supervisor ve ruta declarada por vendedor, ubicación real, tráfico, check-ins y alertas.</p>
      </div>
    </aside>
  );
}