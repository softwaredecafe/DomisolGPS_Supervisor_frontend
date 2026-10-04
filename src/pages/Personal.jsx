import { useState, useEffect } from 'react';

export default function Personal() {
  const [empleados, setEmpleados] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [tiendas, setTiendas] = useState({});
  const [ultimaSync, setUltimaSync] = useState('Calculando...');
  
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: '', usuario: '', password: '' });
  const [mensajeModal, setMensajeModal] = useState('');

  const cargarPersonal = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/personal/detallado`);
      const data = await response.json();
      
      if (data.exito) {
        setEmpleados(data.datos);
        
        const tiendasAgrupadas = data.datos.reduce((acc, emp) => {
          const nombreTienda = emp.tienda || 'Sin Tienda Asignada';
          if (!acc[nombreTienda]) acc[nombreTienda] = [];
          acc[nombreTienda].push(emp);
          return acc;
        }, {});
        
        setTiendas(tiendasAgrupadas);
        setUltimaSync(`hace un momento (${new Date().toLocaleTimeString()})`);

        setSelectedEmp(prevSelected => {
          if (!prevSelected && data.datos.length > 0) return data.datos[0];
          if (prevSelected) {
            const actualizado = data.datos.find(e => e.id === prevSelected.id);
            return actualizado || prevSelected;
          }
          return null;
        });
      }
    } catch (error) {
      console.error("Error cargando personal:", error);
      setUltimaSync('Error de conexión');
    }
  };

  useEffect(() => {
    cargarPersonal();
    const intervalo = setInterval(cargarPersonal, 10000);
    return () => clearInterval(intervalo);
  }, []);

  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    setMensajeModal('Guardando...');
    
    try {
      const response = await fetch('http://localhost:3000/api/usuarios/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoUsuario)
      });
      
      const data = await response.json();
      
      if (data.exito) {
        setMensajeModal('¡Usuario creado con éxito!');
        setNuevoUsuario({ nombre: '', usuario: '', password: '' });
        cargarPersonal(); 
        setTimeout(() => {
          setMostrarModal(false);
          setMensajeModal('');
        }, 1500);
      } else {
        setMensajeModal(data.mensaje || 'Error al crear usuario');
      }
    } catch (error) {
      setMensajeModal('Error de conexión con el servidor');
    }
  };

  const getBadgeStyle = (estado) => {
    switch(estado) {
      case 'En ruta': 
      case 'En tienda': return { color: '#0d945b', bg: '#e6f5ed' }; 
      case 'Fuera de ruta': 
      case 'GPS apagado': return { color: '#d92d20', bg: '#fee4e2' }; 
      case 'Detenido': return { color: '#b54708', bg: '#fef0c7' }; 
      case 'Sin reporte':
      default: return { color: '#344054', bg: '#f2f4f7' }; 
    }
  };

  const getAvatarBorder = (rol) => {
    const rolSeguro = rol || '';
    return rolSeguro.toLowerCase().includes('gerente') ? '#fdb022' : '#1570ef'; 
  };

  const obtenerIniciales = (nombre) => {
    if (!nombre) return 'US';
    const partes = nombre.trim().split(' ');
    if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
    return nombre.substring(0, 2).toUpperCase();
  };

  const pillTiendas = Object.keys(tiendas).map(nombre => ({
    nombre, cantidad: tiendas[nombre].length
  }));

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', background: '#fcfcfd', minHeight: '100vh', position: 'relative' }}>
      
      {/* HEADER SUPERIOR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#101828' }}>Personal</h2>
          <p style={{ margin: 0, color: '#667085' }}>Perfil detallado y trazabilidad</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#667085', background: '#fff', padding: '6px 12px', borderRadius: '16px', border: '1px solid #eaecf0' }}>
            {empleados.length} equipos
          </span>
          <span style={{ fontSize: '13px', color: '#667085' }}>Última actualización: {ultimaSync}</span>
          
          <button 
            onClick={() => setMostrarModal(true)}
            style={{ background: '#1570ef', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
          >
            + Nuevo Asesor
          </button>
        </div>
      </div>

      {/* LAYOUT HORIZONTAL PRINCIPAL */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* COLUMNA IZQUIERDA: LISTA DESPLAZABLE */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #eaecf0', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
            <h3 style={{ margin: 0 }}>Personal por tienda</h3>
            <span style={{ fontSize: '12px', color: '#667085', border: '1px solid #eaecf0', padding: '2px 8px', borderRadius: '12px' }}>
              {empleados.length} personas
            </span>
          </div>
          <p style={{ color: '#667085', fontSize: '14px', margin: '0 0 15px 0' }}>Selecciona una persona para desplegar su perfil</p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '25px' }}>
            {pillTiendas.map(t => (
              <span key={t.nombre} style={{ fontSize: '12px', fontWeight: '500', color: '#344054' }}>
                {t.nombre} · {t.cantidad}
              </span>
            ))}
          </div>

          {Object.keys(tiendas).map(nombreTienda => {
            const numAsesores = tiendas[nombreTienda].filter(e => !(e.rol || 'Asesor').toLowerCase().includes('gerente')).length;
            const numGerentes = tiendas[nombreTienda].filter(e => (e.rol || 'Asesor').toLowerCase().includes('gerente')).length;

            return (
              <div key={nombreTienda} style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #f2f4f7' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '15px', color: '#101828' }}>{nombreTienda}</div>
                    <div style={{ fontSize: '12px', color: '#667085' }}>{tiendas[nombreTienda].length} integrantes asignados</div>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '600', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {numAsesores > 0 && <span style={{ color: '#1570ef' }}>{numAsesores} asesores</span>}
                    {numGerentes > 0 && <span style={{ color: '#fdb022' }}>{numGerentes} gerentes</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {tiendas[nombreTienda].map(emp => {
                    const isSelected = selectedEmp?.id === emp.id;
                    const estadoSeguro = emp.estado || 'Sin reporte';
                    const rolSeguro = emp.rol || 'Asesor';
                    const badge = getBadgeStyle(estadoSeguro);

                    return (
                      <div 
                        key={emp.id}
                        onClick={() => setSelectedEmp(emp)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                          border: isSelected ? '1px solid #d0d5dd' : '1px solid transparent',
                          background: isSelected ? '#f9fafb' : '#fff',
                          boxShadow: isSelected ? '0 1px 2px rgba(16,24,40,0.05)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ 
                            width: '40px', height: '40px', borderRadius: '50%', 
                            background: '#f2f4f7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 'bold', color: '#101828',
                            border: `2px solid ${getAvatarBorder(rolSeguro)}`
                          }}>
                            {emp.iniciales || obtenerIniciales(emp.nombre)}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: '#101828' }}>{emp.nombre}</div>
                            <div style={{ fontSize: '12px', color: '#667085' }}>{emp.tienda || 'Central'} · {rolSeguro}</div>
                          </div>
                        </div>
                        <span style={{ 
                          background: badge.bg, color: badge.color, 
                          padding: '4px 10px', borderRadius: '16px', fontSize: '12px', fontWeight: '600' 
                        }}>
                          {estadoSeguro}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* COLUMNA DERECHA: PERFIL FIJO DETALLADO */}
        {selectedEmp && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #eaecf0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    width: '56px', height: '56px', borderRadius: '50%', fontSize: '18px',
                    background: '#f2f4f7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', color: '#101828', border: `3px solid ${getAvatarBorder(selectedEmp.rol)}`
                  }}>
                    {selectedEmp.iniciales || obtenerIniciales(selectedEmp.nombre)}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '20px', color: '#101828' }}>{selectedEmp.nombre}</h2>
                    <p style={{ margin: '4px 0 0 0', color: '#667085', fontSize: '14px' }}>
                      {selectedEmp.rol || 'Asesor de Tienda'} · {selectedEmp.correo || 'No registrado'} <br/> 
                      {selectedEmp.telefonoCorp || 'No asignado'} · Jornada {selectedEmp.horario || 'Diurna'}
                    </p>
                  </div>
                </div>
                <span style={{ 
                  background: getBadgeStyle(selectedEmp.estado || 'Sin reporte').bg, 
                  color: getBadgeStyle(selectedEmp.estado || 'Sin reporte').color, 
                  padding: '6px 12px', borderRadius: '16px', fontSize: '14px', fontWeight: '600' 
                }}>
                  {selectedEmp.estado || 'Sin reporte'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid #eaecf0', paddingTop: '24px' }}>
                <InfoItem label="TIENDA / SUCURSAL" value={selectedEmp.tienda || 'No registrada'} />
                <InfoItem label="CARGO" value={selectedEmp.rol || 'Asesor'} />
                <InfoItem label="SUPERVISOR" value={selectedEmp.supervisor || 'Pendiente'} />
                <InfoItem label="TELÉFONO CORPORATIVO" value={selectedEmp.telefonoCorp || 'N/A'} />
                <InfoItem label="CORREO" value={selectedEmp.correo || 'N/A'} />
                <InfoItem label="TELÉFONO TIENDA" value={selectedEmp.telefonoTienda || 'N/A'} />
                <InfoItem label="ÚLTIMA LATITUD" value={selectedEmp.latitud ? String(selectedEmp.latitud).substring(0, 8) : 'Sin GPS'} />
                <InfoItem label="ÚLTIMA LONGITUD" value={selectedEmp.longitud ? String(selectedEmp.longitud).substring(0, 9) : 'Sin GPS'} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE NUEVO USUARIO */}
      {mostrarModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(16, 24, 40, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '400px', boxShadow: '0 20px 24px -4px rgba(16, 24, 40, 0.08)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#101828' }}>Crear Nuevo Asesor</h3>
            <form onSubmit={handleCrearUsuario} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#344054', marginBottom: '6px' }}>Nombre Completo</label>
                <input 
                  type="text" required
                  value={nuevoUsuario.nombre}
                  onChange={(e) => setNuevoUsuario({...nuevoUsuario, nombre: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d0d5dd', boxSizing: 'border-box' }}
                  placeholder="Ej: Karla Argueta"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#344054', marginBottom: '6px' }}>Usuario (App Móvil)</label>
                <input 
                  type="text" required
                  value={nuevoUsuario.usuario}
                  onChange={(e) => setNuevoUsuario({...nuevoUsuario, usuario: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d0d5dd', boxSizing: 'border-box' }}
                  placeholder="Ej: kargueta"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#344054', marginBottom: '6px' }}>Contraseña</label>
                <input 
                  type="password" required
                  value={nuevoUsuario.password}
                  onChange={(e) => setNuevoUsuario({...nuevoUsuario, password: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d0d5dd', boxSizing: 'border-box' }}
                />
              </div>

              {mensajeModal && (
                <div style={{ fontSize: '14px', color: mensajeModal.includes('éxito') ? '#0d945b' : '#d92d20', fontWeight: '500' }}>
                  {mensajeModal}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => { setMostrarModal(false); setMensajeModal(''); }}
                  style={{ flex: 1, padding: '10px', background: '#fff', border: '1px solid #d0d5dd', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', color: '#344054' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  style={{ flex: 1, padding: '10px', background: '#1570ef', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', color: '#fff' }}
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div style={{ paddingBottom: '12px', borderBottom: '1px solid #f9fafb' }}>
      <div style={{ fontSize: '11px', color: '#98a2b3', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '14px', color: '#101828', fontWeight: '500' }}>{value}</div>
    </div>
  );
}