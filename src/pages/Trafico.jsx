import { useState, useEffect, useCallback } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

export default function Trafico() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const [rutasTrafico, setRutasTrafico] = useState([]);
  const [cargando, setCargando] = useState(true);

  const calcularTraficoReal = useCallback(async (rutasDb) => {
    if (!window.google) return rutasDb;
    
    const directionsService = new window.google.maps.DirectionsService();
    
    const promesas = rutasDb.map(async (ruta) => {
      const paradas = ruta.paradas || [];
      
      if (!ruta.origen_lat || parseFloat(ruta.origen_lat) === 0 || paradas.length === 0) {
        return {
          ...ruta,
          detalleETA: 'Esperando coordenadas de origen o destino para evaluar.',
          estadoBoton: 'Sin Señal GPS',
          estiloBoton: { bg: '#f2f4f7', color: '#344054' }
        };
      }

      if (ruta.minutos_inactivo > 15 && ruta.minutos_inactivo !== 9999) {
        return {
          ...ruta,
          detalleETA: `Vendedor sin movimiento hace ${ruta.minutos_inactivo} minutos.`,
          estadoBoton: 'Revisar Detención',
          estiloBoton: { bg: '#fff5df', color: '#b54708' }
        };
      }

      try {
        const origenConfig = { lat: parseFloat(ruta.origen_lat), lng: parseFloat(ruta.origen_lng) };
        
        const ultimaParada = paradas[paradas.length - 1];
        const destinoConfig = { lat: parseFloat(ultimaParada.latDestino), lng: parseFloat(ultimaParada.lngDestino) };

        const waypointsIntermedios = [];
        for (let i = 0; i < paradas.length - 1; i++) {
            waypointsIntermedios.push({
                location: { lat: parseFloat(paradas[i].latDestino), lng: parseFloat(paradas[i].lngDestino) },
                stopover: true
            });
        }

        return new Promise((resolve) => {
          directionsService.route({
            origin: origenConfig,
            destination: destinoConfig,
            waypoints: waypointsIntermedios,
            travelMode: window.google.maps.TravelMode.DRIVING,
            drivingOptions: {
              departureTime: new Date(),
              trafficModel: 'bestguess'
            }
          }, (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              let totalDuration = 0;
              let totalTraffic = 0;
              let totalDistanceMeters = 0;
              
              result.routes[0].legs.forEach(leg => {
                  totalDuration += leg.duration.value;
                  totalTraffic += leg.duration_in_traffic ? leg.duration_in_traffic.value : leg.duration.value;
                  totalDistanceMeters += leg.distance.value;
              });
              
              const diffMinutes = (totalTraffic - totalDuration) / 60;
              const distanceKm = (totalDistanceMeters / 1000).toFixed(1);
              
              const formatTime = (secs) => {
                  const h = Math.floor(secs / 3600);
                  const m = Math.floor((secs % 3600) / 60);
                  return h > 0 ? `${h}h ${m}m` : `${m} mins`;
              };

              let estadoBoton = '';
              let estiloBoton = {};
              
              if (diffMinutes > 15) {
                estadoBoton = 'Justificado (Tráfico)';
                estiloBoton = { bg: '#e6f5ed', color: '#0d945b' };
              } else if (diffMinutes < -5) {
                estadoBoton = 'Vía rápida';
                estiloBoton = { bg: '#eff8ff', color: '#175cd3' };
              } else {
                estadoBoton = 'En tiempo normal';
                estiloBoton = { bg: '#f2f4f7', color: '#344054' };
              }

              resolve({
                ...ruta,
                detalleETA: `ETA original ${formatTime(totalDuration)} · ETA actual ${formatTime(totalTraffic)} · Total ${distanceKm} km`,
                estadoBoton,
                estiloBoton
              });
            } else {
              resolve({
                ...ruta,
                detalleETA: `Error de cálculo (Google Directions): ${status}`,
                estadoBoton: 'Error de API',
                estiloBoton: { bg: '#fee4e2', color: '#d92d20' }
              });
            }
          });
        });

      } catch (error) {
        console.error("Error API Google detallado:", error);
        return {
          ...ruta,
          detalleETA: 'Excepción al consultar tráfico en el mapa.',
          estadoBoton: 'Error de API',
          estiloBoton: { bg: '#fee4e2', color: '#d92d20' }
        };
      }
    });

    return await Promise.all(promesas);
  }, []);

  useEffect(() => {
    const cargarTraficoETA = async () => {
      if (!isLoaded) return;
      
      try {
        setCargando(true);
        const adminId = localStorage.getItem('admin_id');
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rutas/todas?admin_id=${adminId}`);
        const data = await response.json();

        if (data.exito) {
          const rutasActivas = data.datos.filter(r => r.estado === 'aprobada' || r.estado === 'pendiente' || r.estado === 'en_ruta');
          const rutasEvaluadas = await calcularTraficoReal(rutasActivas);
          setRutasTrafico(rutasEvaluadas);
        }
      } catch (error) {
        console.error("Error al cargar tráfico:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarTraficoETA();
    const intervalo = setInterval(cargarTraficoETA, 45000); 
    return () => clearInterval(intervalo);
  }, [isLoaded, calcularTraficoReal]);

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', background: '#fcfcfd', minHeight: '100vh' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#101828' }}>Tráfico / ETA</h2>
        <p style={{ margin: '4px 0 0 0', color: '#667085', fontSize: '14px' }}>Auditoría automatizada de rutas y desvíos</p>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #eaecf0', padding: '24px', boxShadow: '0 1px 3px rgba(16, 24, 40, 0.02)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#101828' }}>Monitoreo GPS vs ETA de Google</h3>
          <span style={{ background: '#e6f5ed', color: '#0d945b', padding: '6px 14px', borderRadius: '16px', fontSize: '12px', fontWeight: '600' }}>
            API de Google Activa
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cargando ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#667085', fontWeight: '500' }}>
              Conectando con Google Maps API y evaluando tiempos reales...
            </div>
          ) : rutasTrafico.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#667085', border: '1px dashed #d0d5dd', borderRadius: '12px' }}>
              No hay rutas activas en este momento para evaluar.
            </div>
          ) : (
            rutasTrafico.map((ruta) => (
              <div 
                key={ruta.id} 
                style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  border: '1px solid #eaecf0', borderRadius: '12px', padding: '16px 20px',
                  background: '#fff', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', color: '#101828' }}>
                      {ruta.vendedor}
                    </h4>
                    <span style={{ fontSize: '11px', color: '#98a2b3', fontWeight: '600' }}>➔ {ruta.nombre_cliente}</span>
                  </div>
                  
                  <p style={{ margin: 0, fontSize: '13px', color: '#667085' }}>
                    {ruta.detalleETA}
                  </p>
                </div>
                
                <span style={{ 
                  background: ruta.estiloBoton?.bg ? ruta.estiloBoton.bg : '#f2f4f7', 
                  color: ruta.estiloBoton?.color ? ruta.estiloBoton.color : '#344054', 
                  padding: '6px 14px', borderRadius: '16px', fontSize: '12px', fontWeight: '700' 
                }}>
                  {ruta.estadoBoton}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}