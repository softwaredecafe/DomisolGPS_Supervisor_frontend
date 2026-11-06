import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '600px'
};

const center = { lat: 14.6349, lng: -90.5069 }; 

export default function MapaGeneral() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const [empleados, setEmpleados] = useState([]);
  const [ultimaSync, setUltimaSync] = useState('Calculando...');
  
  const [map, setMap] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const cargarUbicaciones = async () => {
    try {
      const adminId = localStorage.getItem('admin_id');
      const resPersonal = await fetch(`${import.meta.env.VITE_API_URL}/api/personal/detallado?admin_id=${adminId}`);
      const dataPersonal = await resPersonal.json();
      
      if (dataPersonal.exito) setEmpleados(dataPersonal.datos || []);
      
      setUltimaSync(`hace un momento (${new Date().toLocaleTimeString()})`);
    } catch (error) {
      console.error("Error cargando ubicaciones:", error);
      setUltimaSync('Error de conexión');
    }
  };

  useEffect(() => {
    cargarUbicaciones();
    const intervalo = setInterval(cargarUbicaciones, 10000);
    return () => clearInterval(intervalo);
  }, []);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  useEffect(() => {
    if (map && empleados.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      let hayPuntos = false;

      empleados.forEach(emp => {
        if (emp.latitud && emp.longitud) {
          bounds.extend({ lat: parseFloat(emp.latitud), lng: parseFloat(emp.longitud) });
          hayPuntos = true;
        }
      });

      if (hayPuntos) {
        map.fitBounds(bounds);
        const listener = window.google.maps.event.addListener(map, 'idle', function() {
          if (map.getZoom() > 15) map.setZoom(15);
          window.google.maps.event.removeListener(listener);
        });
      }
    }
  }, [map, empleados]);

  const getMarkerIcon = (rol) => {
    const r = (rol || '').toLowerCase();
    let color = '#1570ef'; 
    if (r.includes('gerente')) color = '#fdb022';
    if (r.includes('supervis')) color = '#ed3f00';
    if (r.includes('asesor mayoreo')) color = '#2f6b00'; 
    else if (r.includes('mayoreo')) color = '#12b76a'; 

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="3"/></svg>`;
    return { url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`, anchor: new window.google.maps.Point(12, 12) };
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', background: '#fcfcfd', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#101828' }}>Mapa general</h2>
          <p style={{ margin: 0, color: '#667085' }}>Ubicación, rutas y estados en Guatemala</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#667085', background: '#fff', padding: '6px 12px', borderRadius: '16px', border: '1px solid #eaecf0' }}>
            {empleados.length} equipos
          </span>
          <span style={{ fontSize: '13px', color: '#667085' }}>Última actualización: {ultimaSync}</span>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #eaecf0', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1, minHeight: '650px', position: 'relative' }}>
        
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #eaecf0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', zIndex: 1 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#101828' }}>Mapa Operativo En Vivo (Google Maps)</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#667085' }}>Ubicaciones en tiempo real del personal</p>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#344054', background: '#f9fafb', padding: '8px 16px', borderRadius: '20px', border: '1px solid #eaecf0', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#1570ef', border: '2px solid #fff' }}></div> Asesor</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#0ea5e9', border: '2px solid #fff' }}></div> Asesor Mayoreo</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fdb022', border: '2px solid #fff' }}></div> Gerente</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#12b76a', border: '2px solid #fff' }}></div> Mayoreo</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#7a5af8', border: '2px solid #fff' }}></div> Supervisión</div>
          </div>
        </div>

        <div style={{ flex: 1, position: 'relative', zIndex: 0, minHeight: '500px' }}>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={12}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={{ mapTypeControl: false, streetViewControl: false }}
            >
              {empleados.map((emp) => {
                if (!emp.latitud || !emp.longitud || parseFloat(emp.latitud) === 0) return null;
                return (
                  <MarkerF 
                    key={`emp-${emp.id}`} 
                    position={{ lat: parseFloat(emp.latitud), lng: parseFloat(emp.longitud) }}
                    icon={getMarkerIcon(emp.rol)}
                    onClick={() => setSelectedMarker({ tipo: 'empleado', datos: emp })}
                  />
                );
              })}

              {selectedMarker && selectedMarker.tipo === 'empleado' && (
                <InfoWindowF
                  position={{ 
                    lat: parseFloat(selectedMarker.datos.latitud), 
                    lng: parseFloat(selectedMarker.datos.longitud) 
                  }}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div style={{ textAlign: 'center', minWidth: '150px', padding: '4px' }}>
                    <strong style={{ display: 'block', fontSize: '15px', color: '#101828' }}>{selectedMarker.datos.nombre}</strong>
                    <span style={{ color: '#667085', fontSize: '12px' }}>{selectedMarker.datos.tienda || 'Sin Tienda'} · {selectedMarker.datos.rol || 'Asesor'}</span>
                    <div style={{ marginTop: '8px', padding: '6px', background: '#f9fafb', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: '1px solid #eaecf0', color: '#344054' }}>
                      Estado: {selectedMarker.datos.estado || 'En ruta'}
                    </div>
                  </div>
                </InfoWindowF>
              )}
            </GoogleMap>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#667085' }}>
              Cargando Google Maps...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}