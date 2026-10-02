import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="mark">DM</div>
        <div>
          <h1>Field Control</h1>
          <p>Dashboard supervisor</p>
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
      </div>

      <div className="sidebox">
        <b>Validación operativa</b>
        <p>El supervisor ve ruta declarada por vendedor, ubicación real, tráfico, check-ins y alertas.</p>
      </div>
    </aside>
  );
}