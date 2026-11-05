import { useState, useEffect } from 'react';

export default function Reportes() {
    const [reporte, setReporte] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [ultimaSync, setUltimaSync] = useState('Calculando...');

    const [kpis, setKpis] = useState({ personal: 0, planificadas: 0, completadas: 0, cumplimiento: 0 });

    const cargarEfectividad = async () => {
        try {
            const adminId = localStorage.getItem('admin_id');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/supervision/efectividad?admin_id=${adminId}`);
            const data = await res.json();

            if (data.exito) {
                setReporte(data.datos);
                
                let totalPlanificadas = 0;
                let totalCompletadas = 0;
                
                data.datos.forEach(user => {
                    totalPlanificadas += user.meta_visitas;
                    totalCompletadas += user.visitas_reales;
                });

                const prom = totalPlanificadas > 0 ? Math.round((totalCompletadas / totalPlanificadas) * 100) : 0;

                setKpis({
                    personal: data.datos.length,
                    planificadas: totalPlanificadas,
                    completadas: totalCompletadas,
                    cumplimiento: prom > 100 ? 100 : prom
                });

                setUltimaSync(new Date().toLocaleTimeString());
            }
        } catch (error) {
            console.error("Error al cargar reportes:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarEfectividad();
        const intervalo = setInterval(cargarEfectividad, 30000); 
    }, []);

    const getSemaforo = (porcentaje, meta) => {
        if (meta === 0 && porcentaje === 0) return { bar: '#e4e8ef', text: '#667085', bg: '#f2f4f7', label: 'Sin ruta' };
        if (porcentaje >= 80) return { bar: '#0d945b', text: '#0d945b', bg: '#e6f5ed', label: 'Óptimo' };
        if (porcentaje > 0 && porcentaje < 80) return { bar: '#1570ef', text: '#1570ef', bg: '#eff8ff', label: 'En proceso' };
        return { bar: '#d92d20', text: '#d92d20', bg: '#fee4e2', label: 'Crítico (0%)' };
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', background: '#fcfcfd', minHeight: '100vh' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '24px', color: '#101828' }}>Reportes de Efectividad</h2>
                    <p style={{ margin: '4px 0 0 0', color: '#667085', fontSize: '14px' }}>Ranking de cumplimiento operativo en campo</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#667085', background: '#fff', padding: '8px 16px', borderRadius: '24px', border: '1px solid #eaecf0' }}>
                        {kpis.personal} equipos evaluados
                    </span>
                    <span style={{ fontSize: '13px', color: '#667085', background: '#fff', padding: '8px 16px', borderRadius: '24px', border: '1px solid #eaecf0' }}>
                        Última actualización: <b>hace un momento ({ultimaSync})</b>
                    </span>
                    <button style={{ background: '#fdb022', color: '#101828', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                        Exportar a Excel
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #eaecf0', boxShadow: '0 1px 3px rgba(16,24,40,0.02)' }}>
                    <span style={{ fontSize: '11px', color: '#667085', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PERSONAL MONITOREADO</span>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#101828', marginTop: '8px' }}>{kpis.personal}</div>
                    <div style={{ fontSize: '13px', color: '#0d945b', marginTop: '4px' }}>Vendedores activos hoy</div>
                </div>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #eaecf0', boxShadow: '0 1px 3px rgba(16,24,40,0.02)' }}>
                    <span style={{ fontSize: '11px', color: '#667085', textTransform: 'uppercase', letterSpacing: '0.5px' }}>METAS PLANIFICADAS</span>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#101828', marginTop: '8px' }}>{kpis.planificadas}</div>
                    <div style={{ fontSize: '13px', color: '#667085', marginTop: '4px' }}>Destinos totales de ruta</div>
                </div>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #eaecf0', boxShadow: '0 1px 3px rgba(16,24,40,0.02)' }}>
                    <span style={{ fontSize: '11px', color: '#667085', textTransform: 'uppercase', letterSpacing: '0.5px' }}>VISITAS COMPLETADAS</span>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#101828', marginTop: '8px' }}>{kpis.completadas}</div>
                    <div style={{ fontSize: '13px', color: '#0d945b', marginTop: '4px' }}>Check-ins registrados</div>
                </div>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #eaecf0', boxShadow: '0 1px 3px rgba(16,24,40,0.02)' }}>
                    <span style={{ fontSize: '11px', color: '#667085', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CUMPLIMIENTO GLOBAL</span>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#101828', marginTop: '8px' }}>{kpis.cumplimiento}%</div>
                    <div style={{ fontSize: '13px', color: '#1570ef', marginTop: '4px' }}>Promedio de la empresa</div>
                </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #eaecf0', padding: '24px', boxShadow: '0 1px 3px rgba(16, 24, 40, 0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#101828' }}>Ranking Operativo por Vendedor</h3>
                    <span style={{ fontSize: '11px', background: '#e6f5ed', color: '#0d945b', padding: '4px 10px', borderRadius: '16px', fontWeight: 'bold' }}>ACTUALIZADO</span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #eaecf0' }}>
                                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#667085', fontWeight: '600', textTransform: 'uppercase' }}>VENDEDOR</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#667085', fontWeight: '600', textTransform: 'uppercase' }}>SUCURSAL / ROL</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#667085', fontWeight: '600', textTransform: 'uppercase' }}>VISITAS (REAL / META)</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#667085', fontWeight: '600', textTransform: 'uppercase', width: '250px' }}>CUMPLIMIENTO</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#667085', fontWeight: '600', textTransform: 'uppercase' }}>ESTADO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cargando ? (
                                <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#667085' }}>Calculando métricas...</td></tr>
                            ) : reporte.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#667085' }}>No hay personal para evaluar.</td></tr>
                            ) : (
                                reporte.map((user) => {
                                    const semaforo = getSemaforo(user.porcentaje, user.meta_visitas);

                                    return (
                                        <tr key={user.id} style={{ borderBottom: '1px solid #eaecf0' }}>
                                            <td style={{ padding: '16px', color: '#101828', fontWeight: 'bold', fontSize: '14px' }}>
                                                {user.nombre}
                                            </td>
                                            <td style={{ padding: '16px', color: '#344054', fontSize: '13px' }}>
                                                {user.tienda || 'Sin Asignar'} <br/>
                                                <span style={{ color: '#667085', fontSize: '11px' }}>{user.rol}</span>
                                            </td>
                                            <td style={{ padding: '16px', color: '#101828', fontSize: '15px', fontWeight: '600' }}>
                                                {user.visitas_reales} <span style={{ color: '#98a2b3', fontSize: '13px' }}>/ {user.meta_visitas}</span>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <b style={{ fontSize: '13px', width: '35px', color: semaforo.text }}>{user.porcentaje}%</b>
                                                    <div style={{ flex: 1, height: '6px', background: '#f2f4f7', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${user.porcentaje}%`, height: '100%', background: semaforo.bar, borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{ background: semaforo.bg, color: semaforo.text, padding: '4px 10px', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold' }}>
                                                    {semaforo.label}
                                                </span>
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