import { useState, useEffect } from 'react';

export default function Alertas() {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [ultimaSync, setUltimaSync] = useState('Calculando...');

  const cargarAlertas = async () => {
    try {
      const adminId = localStorage.getItem('admin_id');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/alertas/todas?admin_id=${adminId}`);
      const data = await res.json();
      
      if (data.exito) {
        setAlertas(data.datos);
        setUltimaSync(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error("Error al obtener alertas:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAlertas();
    const intervalo = setInterval(cargarAlertas, 15000); // Refresca cada 15 seg
    return () => clearInterval(intervalo);
  }, []);

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/alertas/estado/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      const data = await res.json();
      if (data.exito) {
        setAlertas(prev => prev.map(a => a.id === id ? { ...a, estado: nuevoEstado } : a));
      }
    } catch (error) {
      alert("Error al actualizar el estado de la alerta");
    }
  };

  const getEstiloNivel = (nivel) => {
    switch(nivel?.toLowerCase()) {
      case 'crítica': case 'critica':
        return { bg: '#fee4e2', color: '#d92d20' };
      case 'advertencia':
        return { bg: '#fff5df', color: '#b54708' };
      case 'ok':
        return { bg: '#e6f5ed', color: '#0d945b' };
      default:
        return { bg: '#f2f4f7', color: '#344054' };
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', background: '#fcfcfd', minHeight: '100vh' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#101828' }}>Alertas</h2>
          <p style={{ margin: '4px 0 0 0', color: '#667085', fontSize: '14px' }}>Eventos operativos y manipulación</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#667085', background: '#fff', padding: '8px 16px', borderRadius: '24px', border: '1px solid #eaecf0' }}>
            50 equipos
          </span>
          <span style={{ fontSize: '13px', color: '#667085', background: '#fff', padding: '8px 16px', borderRadius: '24px', border: '1px solid #eaecf0' }}>
            Última actualización: <b>hace un momento ({ultimaSync})</b>
          </span>
          <span style={{ fontSize: '14px', color: '#101828', background: '#fff', padding: '8px 16px', borderRadius: '24px', border: '1px solid #eaecf0', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Rutas nuevas <span style={{ background: '#d92d20', color: '#fff', padding: '2px 6px', borderRadius: '12px', fontSize: '11px' }}>0</span>
          </span>
          <button style={{ background: '#fdb022', color: '#101828', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
            Ver alertas
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #eaecf0', padding: '24px', boxShadow: '0 1px 3px rgba(16, 24, 40, 0.02)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#101828' }}>Alertas operativas</h3>
          <span style={{ fontSize: '13px', color: '#667085' }}>Últimos eventos</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eaecf0' }}>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#667085', fontWeight: '600', textTransform: 'uppercase' }}>Nivel</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#667085', fontWeight: '600', textTransform: 'uppercase' }}>Vendedor</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#667085', fontWeight: '600', textTransform: 'uppercase' }}>Evento</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#667085', fontWeight: '600', textTransform: 'uppercase' }}>Validación</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#667085', fontWeight: '600', textTransform: 'uppercase' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#667085' }}>Cargando historial de alertas...</td></tr>
              ) : alertas.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#667085' }}>No hay alertas registradas para tu personal.</td></tr>
              ) : (
                alertas.map((alerta) => {
                  const estilo = getEstiloNivel(alerta.nivel);
                  return (
                    <tr key={alerta.id} style={{ borderBottom: '1px solid #eaecf0', transition: 'background 0.2s' }}>
                      <td style={{ padding: '16px' }}>
                        <span style={{ background: estilo.bg, color: estilo.color, padding: '4px 10px', borderRadius: '16px', fontSize: '12px', fontWeight: '600' }}>
                          {alerta.nivel}
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#101828' }}>{alerta.vendedor}</td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#344054' }}>{alerta.evento}</td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#667085' }}>{alerta.validacion}</td>
                      <td style={{ padding: '16px' }}>
                        <select 
                          value={alerta.estado}
                          onChange={(e) => cambiarEstado(alerta.id, e.target.value)}
                          style={{
                            border: 'none', background: 'transparent', fontSize: '14px', fontWeight: '500',
                            color: alerta.estado === 'Resuelto' ? '#667085' : '#101828',
                            cursor: 'pointer', outline: 'none'
                          }}
                        >
                          <option value="Abierta">Abierta</option>
                          <option value="Revisar">Revisar</option>
                          <option value="Resuelto">Resuelto</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}