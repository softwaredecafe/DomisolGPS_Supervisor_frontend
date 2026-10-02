import { useState, useEffect } from 'react';

export default function Rutas() {
    const [rutas, setRutas] = useState([]);

    useEffect(() => {
        const cargarRutas = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/rutas/todas');
                const data = await response.json();
                if (data.exito) {
                    setRutas(data.datos);
                }
            } catch (error) {
                console.error("Error cargando rutas:", error);
            }
        };

        cargarRutas();
        const intervalo = setInterval(cargarRutas, 3000); 
        return () => clearInterval(intervalo);
    }, []);

    return (
        <section className="section active">
            <div className="card">
                <div className="cardhead">
                    <div>
                        <h3>Rutas declaradas por vendedores</h3>
                        <small>Planificación del día enviada desde la aplicación móvil</small>
                    </div>
                    <span className="status ok">EN VIVO</span>
                </div>
                
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Vendedor</th>
                            <th>Cliente / Destino</th>
                            <th>Motivo</th>
                            <th>Registro</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rutas.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#6b7485' }}>
                                    Esperando rutas de los vendedores...
                                </td>
                            </tr>
                        ) : (
                            rutas.map(r => (
                                <tr key={r.id}>
                                    <td>{r.id}</td>
                                    <td><b>{r.vendedor}</b></td>
                                    <td>{r.nombre_cliente}</td>
                                    <td>{r.motivo}</td>
                                    <td style={{ color: '#6b7485' }}>{r.fecha}</td>
                                    <td>
                                        <span className={r.estado === 'Pendiente' ? 'status warn' : 'status ok'}>
                                            {r.estado}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}