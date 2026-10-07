import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';

const center = { lat: 14.6208, lng: -90.5431 };

export default function Dashboard() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const [vendedores, setVendedores] = useState([]);
  const [visitas, setVisitas] = useState([]);
  const [ultimaSync, setUltimaSync] = useState('Calculando...');

  const [map, setMap] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [rutasPendientes, setRutasPendientes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resMonitoreo = await fetch(`${import.meta.env.VITE_API_URL}/api/supervision/monitoreo`);
        const dataMonitoreo = await resMonitoreo.json();
        
      const resVisitas = await fetch(`${import.meta.env.VITE_API_URL}/api/supervision/visitas`);
      const dataVisitas = await resVisitas.json();

      const resRutas = await fetch(`${import.meta.env.VITE_API_URL}/api/rutas/todas`);
      const dataRutas = await resRutas.json();
        
        if (dataMonitoreo.exito) setVendedores(dataMonitoreo.datos);
        if (dataVisitas.exito) setVisitas(dataVisitas.datos);

        if (dataRutas.exito) {
      const pendientes = dataRutas.datos.filter(r => r.estado !== 'aprobada');
    setRutasPendientes(pendientes);
}
        
        setUltimaSync(new Date().toLocaleTimeString());
      } catch (error) {
        console.error("Error al obtener datos en vivo:", error);
      }
    };

    fetchData();
    const intervalo = setInterval(fetchData, 10000); 
    return () => clearInterval(intervalo);
  }, []);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  useEffect(() => {
    if (map && (vendedores.length > 0 || visitas.length > 0)) {
      const bounds = new window.google.maps.LatLngBounds();
      let hayPuntos = false;

      vendedores.forEach(v => {
        if (v.latitud && v.longitud) {
          bounds.extend({ lat: parseFloat(v.latitud), lng: parseFloat(v.longitud) });
          hayPuntos = true;
        }
      });

      visitas.forEach(v => {
        if (v.latitud && v.longitud) {
          bounds.extend({ lat: parseFloat(v.latitud), lng: parseFloat(v.longitud) });
          hayPuntos = true;
        }
      });

      if (hayPuntos) {
        map.fitBounds(bounds);
        const listener = window.google.maps.event.addListener(map, 'idle', function() {
          if (map.getZoom() > 16) map.setZoom(16);
          window.google.maps.event.removeListener(listener);
        });
      }
    }
  }, [map, vendedores, visitas]);

  const getDotIcon = (inactivo) => {
    const color = inactivo ? '#8792a3' : '#2573d8';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="25" height="25"><circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="3"/></svg>`;
    return { url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`, anchor: new window.google.maps.Point(12, 12) };
  };

  const getCheckInIcon = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" width="25" height="25"><circle cx="12.5" cy="12.5" r="10" fill="#1f9d63" stroke="white" stroke-width="3"/><path d="M8 12.5 l3 3 l6 -6" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    return { url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`, anchor: new window.google.maps.Point(12, 12) };
  };
//-----------------------------------------------------------------------------------------

  const handleAprobarRuta = async (vendedorId) => {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/rutas/aprobar/${vendedorId}`, {
            method: 'PUT'
        });
        const data = await res.json();
        if (data.exito) {
            setRutasPendientes(prev => prev.filter(r => String(r.vendedor_id) !== String(vendedorId)));
            alert("¡Ruta aprobada! El celular reaccionará en breve.");
        }
    } catch (error) {
        console.error("Error al aprobar ruta:", error);
        alert("Error de conexión al aprobar la ruta.");
    }
};

  return (
    <section id="dashboard" className="section active">
      
      {/* PANEL DE ÚLTIMOS CHECK-INS EN VIVO */}
      <div className="card routeInbox" style={{ marginBottom: '18px', background: '#e8f7ef', borderColor: '#1f9d63' }}>
        <div className="cardhead">
          <div>
            <h3 style={{ color: '#1f9d63', margin: 0 }}>Últimos Check-ins Registrados</h3>
            <small style={{ color: '#2f3640' }}>Visitas a clientes confirmadas desde campo</small>
          </div>
          <span className="status ok" style={{ background: '#1f9d63', color: 'white' }}>EN VIVO</span>
        </div>
        
        <div style={{ marginTop: '12px', display: 'flex', gap: '10px', flexDirection: 'column' }}>
          {visitas.length === 0 ? (
            <div style={{ padding: '10px', color: '#6b7485', fontSize: '13px' }}>No se han registrado visitas el día de hoy.</div>
          ) : (
            visitas.slice(0, 3).map((v) => (
              <div key={`panel-${v.id}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', background: 'white', padding: '12px', borderRadius: '12px', border: '1px solid #dcdde1', alignItems: 'center' }}>
                <div><span style={{ fontSize: '10px', color: '#7f8fa6', textTransform: 'uppercase' }}>Cliente</span><br/><b style={{ fontSize: '13px' }}>{v.nombre_cliente}</b></div>
                <div><span style={{ fontSize: '10px', color: '#7f8fa6', textTransform: 'uppercase' }}>Vendedor</span><br/><b style={{ fontSize: '13px' }}>{v.vendedor}</b></div>
                <div><span style={{ fontSize: '10px', color: '#7f8fa6', textTransform: 'uppercase' }}>Hora</span><br/><b style={{ fontSize: '13px' }}>{new Date(v.fecha_visita).toLocaleTimeString()}</b></div>
                <div><span style={{ fontSize: '10px', color: '#7f8fa6', textTransform: 'uppercase' }}>Dirección</span><br/><b style={{ fontSize: '11px' }}>{v.direccion || 'Coordenada GPS'}</b></div>
              </div>
            ))
          )}
        </div>
      </div>
          
      {/* PANEL DE RUTAS PENDIENTES DE APROBACIÓN */}
{rutasPendientes.length > 0 && (
  <div className="card routeInbox" style={{ marginBottom: '18px', background: '#fff9e6', borderColor: '#fdb022' }}>
    <div className="cardhead">
      <div>
        <h3 style={{ color: '#b54708', margin: 0 }}>Rutas Pendientes de Aprobación</h3>
        <small style={{ color: '#2f3640' }}>Revisa y autoriza los planes de visita de hoy</small>
      </div>
      <span className="status warn" style={{ background: '#fdb022', color: 'white' }}>{rutasPendientes.length} PENDIENTES</span>
    </div>

    <div style={{ marginTop: '12px', display: 'flex', gap: '10px', flexDirection: 'column' }}>
      {rutasPendientes.map((ruta) => (
        <div key={`ruta-${ruta.id}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', background: 'white', padding: '12px', borderRadius: '12px', border: '1px solid #dcdde1', alignItems: 'center' }}>
          <div><span style={{ fontSize: '10px', color: '#7f8fa6', textTransform: 'uppercase' }}>Vendedor ID</span><br/><b style={{ fontSize: '13px' }}>{ruta.vendedor_id}</b></div>
          <div><span style={{ fontSize: '10px', color: '#7f8fa6', textTransform: 'uppercase' }}>Destino</span><br/><b style={{ fontSize: '13px' }}>{ruta.nombre_cliente}</b></div>
          <div><span style={{ fontSize: '10px', color: '#7f8fa6', textTransform: 'uppercase' }}>Dirección</span><br/><b style={{ fontSize: '11px' }}>{ruta.direccion}</b></div>
          <button 
            onClick={() => handleAprobarRuta(ruta.vendedor_id)}
            style={{ background: '#1f9d63', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Aprobar Ruta
          </button>
        </div>
      ))}
    </div>
  </div>
)}

      {/* TARJETAS DE MÉTRICAS DINÁMICAS */}
      <div className="cards grid">
        <div className="card metric">
          <span>Activos</span>
          <strong>{vendedores.length}</strong>
          <em>Equipos enlazados</em>
        </div>
        <div className="card metric">
          <span>Última Sincronización</span>
          <strong style={{ fontSize: '22px' }}>{ultimaSync}</strong>
          <em>Actualización en vivo</em>
        </div>
        <div className="card metric">
          <span>Check-ins Hoy</span>
          <strong style={{ color: 'var(--green)' }}>{visitas.length}</strong>
          <em style={{ color: 'var(--green)' }}>Visitas exitosas</em>
        </div>
        <div className="card metric">
          <span>Sin reporte (+5 min)</span>
          <strong style={{ color: 'var(--gray)' }}>
            {vendedores.filter(v => v.minutos_inactivo > 5).length}
          </strong>
          <em style={{ color: 'var(--gray)' }}>Revisión requerida</em>
        </div>
      </div>

      <div className="layout">
        {/* MAPA OPERATIVO */}
        <div className="card mapcard">
          <div className="mapTop">
            <div>
              <h3 style={{ margin: 0 }}>Mapa Operativo En Vivo (Google)</h3>
              <small style={{ color: 'var(--muted)' }}>Ubicaciones azules (Personal) | Pines verdes (Check-ins de clientes)</small>
            </div>
          </div>
          <div style={{ height: '560px', width: '100%', position: 'relative' }}>
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ height: '100%', width: '100%' }}
                center={center}
                zoom={12}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{ mapTypeControl: false, streetViewControl: false }}
              >
                {/* Marcadores de Vendedores */}
                {vendedores.map((vendedor) => {
                  if (!vendedor.latitud || !vendedor.longitud) return null;
                  return (
                    <MarkerF 
                      key={`ven-${vendedor.id}`} 
                      position={{ lat: parseFloat(vendedor.latitud), lng: parseFloat(vendedor.longitud) }}
                      icon={getDotIcon(vendedor.minutos_inactivo > 5)}
                      onClick={() => setSelectedMarker({ tipo: 'vendedor', datos: vendedor })}
                    />
                  );
                })}

                {/* Marcadores de Check-ins (Visitas) */}
                {visitas.map((visita) => {
                  if (!visita.latitud || !visita.longitud) return null;
                  return (
                    <MarkerF 
                      key={`vis-${visita.id}`} 
                      position={{ lat: parseFloat(visita.latitud), lng: parseFloat(visita.longitud) }}
                      icon={getCheckInIcon()}
                      onClick={() => setSelectedMarker({ tipo: 'visita', datos: visita })}
                    />
                  );
                })}

                {/* Ventana Emergente (Popup) */}
                {selectedMarker && (
                  <InfoWindowF
                    position={{ 
                      lat: parseFloat(selectedMarker.datos.latitud), 
                      lng: parseFloat(selectedMarker.datos.longitud) 
                    }}
                    onCloseClick={() => setSelectedMarker(null)}
                  >
                    <div style={{ padding: '5px', minWidth: '150px' }}>
                      {selectedMarker.tipo === 'vendedor' ? (
                        <>
                          <b style={{ fontSize: '14px', color: '#172033', display: 'block' }}>{selectedMarker.datos.nombre}</b>
                          <div style={{ marginTop: '5px', color: '#6b7485', fontSize: '12px' }}>
                            <b>Inactivo:</b> hace {selectedMarker.datos.minutos_inactivo} min<br/>
                            <b>Ubicación:</b> {selectedMarker.datos.direccion || 'Coordenadas'}
                          </div>
                        </>
                      ) : (
                        <>
                          <b style={{ fontSize: '14px', color: '#1f9d63', display: 'block' }}>Visita: {selectedMarker.datos.nombre_cliente}</b>
                          <div style={{ marginTop: '5px', color: '#6b7485', fontSize: '12px' }}>
                            <b>Atendido por:</b> {selectedMarker.datos.vendedor}<br/>
                            <b>Hora:</b> {new Date(selectedMarker.datos.fecha_visita).toLocaleTimeString()}
                          </div>
                        </>
                      )}
                    </div>
                  </InfoWindowF>
                )}
              </GoogleMap>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#6b7485' }}>
                Cargando mapa de Google...
              </div>
            )}
          </div>
        </div>
        
        {/* LISTADO DINÁMICO */}
        <div className="card">
          <div className="cardhead">
            <h3>Vendedores monitoreados</h3>
            <small>Actualización en tiempo real</small>
          </div>
          <div id="sellerList" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {vendedores.length === 0 ? (
               <div style={{ padding: '15px', color: '#8792a3', fontSize: '14px', border: '1px dashed #e4e8ef', borderRadius: '12px', textAlign: 'center' }}>Esperando señal GPS...</div>
            ) : (
              vendedores.map((vendedor) => (
                <div key={vendedor.id} style={{ display: 'flex', alignItems: 'center', padding: '10px', border: '1px solid #dcdde1', borderRadius: '8px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f8f9fa', border: `2px solid ${vendedor.minutos_inactivo > 5 ? '#8792a3' : '#2573d8'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#2f3640', marginRight: '15px' }}>
                    {vendedor.nombre.substring(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#2f3640' }}>{vendedor.nombre}</div>
                    <div style={{ fontSize: '11px', color: '#7f8fa6' }}>Hace {vendedor.minutos_inactivo} minutos</div>
                  </div>
                  <span className="pill" style={{ background: vendedor.minutos_inactivo > 5 ? '#f1f2f6' : '#e8f8f5', color: vendedor.minutos_inactivo > 5 ? '#7f8fa6' : '#1abc9c', fontSize: '11px', padding: '4px 8px', borderRadius: '12px' }}>
                    {vendedor.minutos_inactivo > 5 ? 'Sin reporte' : 'Reportando'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}