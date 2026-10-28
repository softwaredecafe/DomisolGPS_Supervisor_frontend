import { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, MarkerF } from '@react-google-maps/api';

export default function Rutas() {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    const [rutas, setRutas] = useState([]);
    const [cargando, setCargando] = useState(true);
    
    const [selectedRuta, setSelectedRuta] = useState(null);
    const [directionsResult, setDirectionsResult] = useState(null);

    const cargarRutas = async () => {
        try {
            const adminId = localStorage.getItem('admin_id');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rutas/todas?admin_id=${adminId}`);
            const data = await response.json();
            
            if (data.exito) {
                const rutasAprobadas = data.datos.filter(r => r.estado === 'aprobada');
                setRutas(rutasAprobadas);
            }
        } catch (error) {
            console.error("Error al cargar rutas:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarRutas();
        const intervalo = setInterval(cargarRutas, 15000); 
        return () => clearInterval(intervalo);
    }, []);

    useEffect(() => {
        if (selectedRuta && selectedRuta.origen_lat && selectedRuta.lat_destino && window.google) {
            const directionsService = new window.google.maps.DirectionsService();
            directionsService.route({
                origin: { lat: parseFloat(selectedRuta.origen_lat), lng: parseFloat(selectedRuta.origen_lng) },
                destination: { lat: parseFloat(selectedRuta.lat_destino), lng: parseFloat(selectedRuta.lng_destino) },
                travelMode: window.google.maps.TravelMode.DRIVING
            }, (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setDirectionsResult(result);
                } else {
                    console.error("Error al trazar la ruta en Google Maps");
                }
            });
        }
    }, [selectedRuta]);

    const handleCerrarModal = () => {
        setSelectedRuta(null);
        setDirectionsResult(null);
    };

    const getVendorIcon = () => {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30"><circle cx="12" cy="12" r="10" fill="#1570ef" stroke="white" stroke-width="3"/><circle cx="12" cy="12" r="4" fill="white"/></svg>`;
        return { 
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`, 
            anchor: new window.google.maps.Point(15, 15) 
        };
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', background: '#fcfcfd', minHeight: '100vh' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '24px', color: '#101828' }}>Rutas declaradas por vendedores</h2>
                    <p style={{ margin: '4px 0 0 0', color: '#667085', fontSize: '14px' }}>Planificación del día enviada desde la aplicación móvil</p>
                </div>
                <span style={{ background: '#e6f5ed', color: '#0d945b', padding: '6px 14px', borderRadius: '16px', fontSize: '12px', fontWeight: '700' }}>
                    EN VIVO
                </span>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #eaecf0', boxShadow: '0 1px 3px rgba(16, 24, 40, 0.02)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #eaecf0', background: '#f9fafb' }}>
                            <th style={{ padding: '12px 20px', fontSize: '12px', color: '#667085', fontWeight: '600' }}>ID</th>
                            <th style={{ padding: '12px 20px', fontSize: '12px', color: '#667085', fontWeight: '600' }}>VENDEDOR</th>
                            <th style={{ padding: '12px 20px', fontSize: '12px', color: '#667085', fontWeight: '600' }}>CLIENTE / DESTINO</th>
                            <th style={{ padding: '12px 20px', fontSize: '12px', color: '#667085', fontWeight: '600' }}>MOTIVO</th>
                            <th style={{ padding: '12px 20px', fontSize: '12px', color: '#667085', fontWeight: '600' }}>ESTADO</th>
                            <th style={{ padding: '12px 20px', fontSize: '12px', color: '#667085', fontWeight: '600' }}>ACCIÓN</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cargando ? (
                            <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#667085' }}>Cargando rutas operativas...</td></tr>
                        ) : rutas.length === 0 ? (
                            <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#667085' }}>No hay rutas aprobadas en este momento.</td></tr>
                        ) : (
                            rutas.map((ruta) => (
                                <tr key={ruta.id} style={{ borderBottom: '1px solid #eaecf0', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#344054' }}>{ruta.id}</td>
                                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#101828', fontWeight: '600' }}>{ruta.vendedor}</td>
                                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#344054' }}>{ruta.nombre_cliente}</td>
                                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#667085' }}>{ruta.motivo}</td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span style={{ background: '#e6f5ed', color: '#0d945b', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', fontWeight: '600' }}>
                                            {ruta.estado}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <button 
                                            onClick={() => setSelectedRuta(ruta)}
                                            style={{ background: '#1570ef', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                        >
                                            Ver ruta
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL DEL MAPA EN VIVO */}
            {selectedRuta && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(16,24,40,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                    <div style={{ background: '#fff', borderRadius: '16px', width: '800px', maxWidth: '95%', overflow: 'hidden', boxShadow: '0 20px 24px -4px rgba(16,24,40,0.1)' }}>
                        
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #eaecf0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px', color: '#101828' }}>Monitoreo de Ruta: {selectedRuta.vendedor}</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#667085' }}>Destino: {selectedRuta.nombre_cliente}</p>
                            </div>
                            <button onClick={handleCerrarModal} style={{ background: '#f2f4f7', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#344054' }}>
                                Cerrar (X)
                            </button>
                        </div>

                        <div style={{ height: '450px', width: '100%', background: '#f9fafb', position: 'relative' }}>
                            {isLoaded ? (
                                <GoogleMap
                                    mapContainerStyle={{ width: '100%', height: '100%' }}
                                    center={{ lat: parseFloat(selectedRuta.lat_destino || 14.6208), lng: parseFloat(selectedRuta.lng_destino || -90.5431) }}
                                    zoom={13}
                                    options={{ streetViewControl: false, mapTypeControl: false }}
                                >
                                    {/* Dibuja la línea de la ruta */}
                                    {directionsResult && (
                                        <DirectionsRenderer 
                                            directions={directionsResult} 
                                            options={{ suppressMarkers: true, polylineOptions: { strokeColor: '#1570ef', strokeWeight: 5 } }}
                                        />
                                    )}

                                    {/* Marcador de destino */}
                                    {selectedRuta.lat_destino && (
                                        <MarkerF position={{ lat: parseFloat(selectedRuta.lat_destino), lng: parseFloat(selectedRuta.lng_destino) }} />
                                    )}

                                    {/* Marcador en vivo del vendedor */}
                                    {selectedRuta.origen_lat && (
                                        <MarkerF 
                                            position={{ lat: parseFloat(selectedRuta.origen_lat), lng: parseFloat(selectedRuta.origen_lng) }} 
                                            icon={getVendorIcon()}
                                            title="Ubicación actual del vendedor"
                                        />
                                    )}
                                </GoogleMap>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#667085' }}>Cargando mapa de Google...</div>
                            )}
                        </div>
                        
                        <div style={{ padding: '16px 24px', background: '#f9fafb', borderTop: '1px solid #eaecf0', fontSize: '13px', color: '#667085', display: 'flex', gap: '20px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', background: '#1570ef', borderRadius: '50%' }}></div> Posición Actual GPS</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', background: '#ea4335', borderRadius: '50%' }}></div> Cliente / Destino</span>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}