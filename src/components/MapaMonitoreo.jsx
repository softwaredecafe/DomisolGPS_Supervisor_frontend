import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function MapaMonitoreo({ vendedores }) {
    const center = [14.6208, -90.5431];

    return (
        <div style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                />
                
                {vendedores.map((vendedor) => (
                    vendedor.latitud && vendedor.longitud ? (
                        <Marker key={vendedor.id} position={[vendedor.latitud, vendedor.longitud]}>
                            <Popup>
                                <strong>{vendedor.nombre}</strong><br />
                                <small style={{color: 'gray'}}>Última ubicación:</small><br />
                                {vendedor.direccion}<br />
                                <small>Inactivo hace: {vendedor.minutos_inactivo} min</small>
                            </Popup>
                        </Marker>
                    ) : null
                ))}
            </MapContainer>
        </div>
    );
}