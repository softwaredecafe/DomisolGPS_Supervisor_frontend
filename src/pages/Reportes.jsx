import { useState, useEffect } from 'react';

export default function Reportes() {
    const [tiendas, setTiendas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [ultimaSync, setUltimaSync] = useState('Calculando...');

    const [kpisGenerales, setKpisGenerales] = useState({ tiendasTotal: 0, personalTotal: 0, visitasTotal: 0, cumplimientoGlobal: 0 });

    const cargarReportes = async () => {
        try {
            const adminId = localStorage.getItem('admin_id');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/supervision/reportes-tienda?admin_id=${adminId}`);
            const data = await res.json();

            if (data.exito) {
                const lista = data.datos || [];
                setTiendas(lista);

                let tCount = lista.length;
                let pTotal = 0;
                let vReal = 0;
                let vMeta = 0;

                lista.forEach(t => {
                    pTotal += t.personalCount;
                    vReal += t.visitasReal;
                    vMeta += t.visitasMeta;
                });

                let globalComp = vMeta > 0 ? Math.round((vReal / vMeta) * 100) : 0;

                setKpisGenerales({
                    tiendasTotal: tCount,
                    personalTotal: pTotal,
                    visitasTotal: vReal,
                    cumplimientoGlobal: globalComp > 100 ? 100 : globalComp
                });

                setUltimaSync(new Date().toLocaleTimeString());
            }
        } catch (error) {
            console.error("Error cargando reportes:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarReportes();
        const intervalo = setInterval(cargarReportes, 20000);
        return () => clearInterval(intervalo);
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', background: '#fcfcfd', minHeight: '100vh' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '24px', color: '#101828' }}>Reportes</h2>
                    <p style={{ margin: '4px 0 0 0', color: '#667085', fontSize: '14px' }}>Indicadores para supervisión</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#667085', background: '#fff', padding: '8px 16px', borderRadius: '24px', border: '1px solid #eaecf0' }}>
                        {kpisGenerales.personalTotal} equipos
                    </span>
                    <span style={{ fontSize: '13px', color: '#667085', background: '#fff', padding: '8px 16px', borderRadius: '24px', border: '1px solid #eaecf0' }}>
                        Última actualización: <b>hace un momento ({ultimaSync})</b>
                    </span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '30px' }}>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #eaecf0', boxShadow: '0 1px 3px rgba(16,24,40,0.02)' }}>
                    <span style={{ fontSize: '11px', color: '#667085', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TIENDAS MONITOREADAS</span>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#101828', marginTop: '8px' }}>{kpisGenerales.tiendasTotal}</div>
                    <div style={{ fontSize: '13px', color: '#0d945b', marginTop: '4px' }}>Resumen por sucursal</div>
                </div>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #eaecf0', boxShadow: '0 1px 3px rgba(16,24,40,0.02)' }}>
                    <span style={{ fontSize: '11px', color: '#667085', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PERSONAL MONITOREADO</span>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#101828', marginTop: '8px' }}>{kpisGenerales.personalTotal}</div>
                    <div style={{ fontSize: '13px', color: '#667085', marginTop: '4px' }}>Asesores, gerentes y supervisión</div>
                </div>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #eaecf0', boxShadow: '0 1px 3px rgba(16,24,40,0.02)' }}>
                    <span style={{ fontSize: '11px', color: '#667085', textTransform: 'uppercase', letterSpacing: '0.5px' }}>VISITAS COMPLETADAS</span>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#101828', marginTop: '8px' }}>{kpisGenerales.visitasTotal}</div>
                    <div style={{ fontSize: '13px', color: '#0d945b', marginTop: '4px' }}>De visitas planificadas</div>
                </div>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #eaecf0', boxShadow: '0 1px 3px rgba(16,24,40,0.02)' }}>
                    <span style={{ fontSize: '11px', color: '#667085', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CUMPLIMIENTO DE RUTA</span>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#101828', marginTop: '8px' }}>{kpisGenerales.cumplimientoGlobal}%</div>
                    <div style={{ fontSize: '13px', color: '#1570ef', marginTop: '4px' }}>Promedio general</div>
                </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #eaecf0', padding: '24px', boxShadow: '0 1px 3px rgba(16, 24, 40, 0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '16px', color: '#101828' }}>Resumen operativo por tienda</h3>
                        <p style={{ margin: '4px 0 0 0', color: '#667085', fontSize: '13px' }}>Los indicadores se calculan con el personal asignado a cada sucursal</p>
                    </div>
                    <span style={{ fontSize: '11px', background: '#e6f5ed', color: '#0d945b', padding: '4px 10px', borderRadius: '16px', fontWeight: 'bold' }}>ACTUALIZADO</span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #eaecf0' }}>
                                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#667085', fontWeight: '600' }}>TIENDA</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#667085', fontWeight: '600' }}>PERSONAL</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#667085', fontWeight: '600' }}>ASESORES</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#667085', fontWeight: '600' }}>GERENTES</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#667085', fontWeight: '600' }}>REPORTANDO</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#667085', fontWeight: '600' }}>VISITAS</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#667085', fontWeight: '600', width: '200px' }}>CUMPLIMIENTO</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#667085', fontWeight: '600' }}>ALERTAS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cargando ? (
                                <tr><td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#667085' }}>Cargando reporte de tiendas...</td></tr>
                            ) : tiendas.length === 0 ? (
                                <tr><td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#667085' }}>No hay tiendas ni personal registrado en tu cuenta.</td></tr>
                            ) : (
                                tiendas.map((t, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #eaecf0' }}>
                                        <td style={{ padding: '16px', color: '#101828', fontWeight: 'bold' }}>
                                            {t.tienda}
                                            <span style={{ display: 'block', fontSize: '11px', color: '#667085', fontWeight: 'normal' }}>
                                                {t.alertasCriticas > 0 ? `${t.alertasCriticas} alertas críticas` : 'Sin alertas críticas'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', color: '#344054' }}>{t.personalCount}</td>
                                        <td style={{ padding: '16px', color: '#344054' }}>{t.asesoresCount}</td>
                                        <td style={{ padding: '16px', color: '#344054' }}>{t.gerentesCount}</td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ background: t.reportandoCount === t.personalCount ? '#e6f5ed' : '#fff5df', color: t.reportandoCount === t.personalCount ? '#0d945b' : '#b54708', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                                                {t.reportandoCount}/{t.personalCount}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', color: '#344054', fontWeight: '600' }}>
                                            {t.visitasReal}/{t.visitasMeta}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <b style={{ fontSize: '12px', width: '32px' }}>{t.cumplimiento}%</b>
                                                <div style={{ flex: 1, height: '6px', background: '#f2f4f7', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${t.cumplimiento}%`, height: '100%', background: '#1570ef', borderRadius: '4px' }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ background: t.alertasCriticas > 0 ? '#fee4e2' : '#e6f5ed', color: t.alertasCriticas > 0 ? '#d92d20' : '#0d945b', padding: '4px 10px', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold' }}>
                                                {t.alertasCriticas > 0 ? `${t.alertasCriticas} críticas` : '0'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}