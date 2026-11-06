import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 

export default function Reportes() {
    const navigate = useNavigate(); 

    const [vendedores, setVendedores] = useState([]);
    const [tiendas, setTiendas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [ultimaSync, setUltimaSync] = useState('Calculando...');
    const [rolUsuario, setRolUsuario] = useState('');

    const [kpisGenerales, setKpisGenerales] = useState({ tiendasTotal: 0, personalTotal: 0, visitasTotal: 0, cumplimientoGlobal: 0 });

    const cargarReportes = async () => {
        try {
            const adminId = localStorage.getItem('admin_id');
            const rol = localStorage.getItem('admin_rol') || '';
            setRolUsuario(rol.toLowerCase());

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/supervision/reportes-tienda?admin_id=${adminId}`);
            const data = await res.json();

            if (data.exito && data.datos) {
                const listaVendedores = data.datos.vendedores || [];
                const listaTiendas = data.datos.tiendas || [];
                
                setVendedores(listaVendedores);
                setTiendas(listaTiendas);

                let pTotal = listaVendedores.length;
                let vReal = 0;
                let vMeta = 0;

                listaVendedores.forEach(v => {
                    vReal += v.visitasReal;
                    vMeta += v.visitasMeta;
                });

                let globalComp = vMeta > 0 ? Math.round((vReal / vMeta) * 100) : 0;

                setKpisGenerales({
                    tiendasTotal: listaTiendas.length,
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

    const isSupervisor = rolUsuario.includes('super');

    return (
        <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', background: '#fcfcfd', minHeight: '100vh' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '24px', color: '#101828' }}>Reportes</h2>
                    <p style={{ margin: '4px 0 0 0', color: '#667085', fontSize: '14px' }}>Indicadores para supervisión y gerencia</p>
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
                    <div style={{ fontSize: '13px', color: '#0d945b', marginTop: '4px' }}>Resumen activo</div>
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
                        <h3 style={{ margin: 0, fontSize: '16px', color: '#101828' }}>Resumen operativo por vendedor</h3>
                        <p style={{ margin: '4px 0 0 0', color: '#667085', fontSize: '13px' }}>
                            Rendimiento individual del personal en campo
                        </p>
                    </div>
                    <span style={{ fontSize: '11px', background: '#e6f5ed', color: '#0d945b', padding: '4px 10px', borderRadius: '16px', fontWeight: 'bold' }}>ACTUALIZADO</span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #eaecf0' }}>
                                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#667085', fontWeight: '600', textTransform: 'uppercase' }}>VENDEDOR</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#667085', fontWeight: '600', textTransform: 'uppercase' }}>SUCURSAL / ROL</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#667085', fontWeight: '600', textTransform: 'uppercase' }}>REPORTANDO</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#667085', fontWeight: '600', textTransform: 'uppercase' }}>VISITAS</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#667085', fontWeight: '600', textTransform: 'uppercase', width: '200px' }}>CUMPLIMIENTO</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#667085', fontWeight: '600', textTransform: 'uppercase' }}>ALERTAS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cargando ? (
                                <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#667085' }}>Cargando personal...</td></tr>
                            ) : vendedores.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#667085' }}>No hay personal registrado en tu cuenta.</td></tr>
                            ) : (
                                vendedores.map((v, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #eaecf0' }}>
                                        <td style={{ padding: '16px', color: '#101828', fontWeight: 'bold' }}>
                                            {v.nombre}
                                        </td>
                                        <td style={{ padding: '16px', color: '#344054' }}>
                                            {v.tienda}
                                            <span style={{ display: 'block', fontSize: '11px', color: '#667085' }}>{v.rol}</span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ background: v.reportando ? '#e6f5ed' : '#fff5df', color: v.reportando ? '#0d945b' : '#b54708', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                                                {v.reportando ? 'Señal Activa' : 'Sin Señal'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', color: '#344054', fontWeight: '600' }}>
                                            {v.visitasReal}/{v.visitasMeta}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <b style={{ fontSize: '12px', width: '32px' }}>{v.cumplimiento}%</b>
                                                <div style={{ flex: 1, height: '6px', background: '#f2f4f7', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${v.cumplimiento}%`, height: '100%', background: '#1570ef', borderRadius: '4px' }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span 
                                                onClick={() => navigate('/alertas')}
                                                title="Ir a módulo de alertas"
                                                style={{ 
                                                    cursor: 'pointer', 
                                                    display: 'inline-block',
                                                    background: v.alertasCriticas > 0 ? '#fee4e2' : '#e6f5ed', 
                                                    color: v.alertasCriticas > 0 ? '#d92d20' : '#0d945b', 
                                                    padding: '4px 10px', 
                                                    borderRadius: '16px', 
                                                    fontSize: '11px', 
                                                    fontWeight: 'bold',
                                                    transition: 'opacity 0.2s'
                                                }}
                                                onMouseOver={(e) => e.target.style.opacity = '0.8'}
                                                onMouseOut={(e) => e.target.style.opacity = '1'}
                                            >
                                                {v.alertasCriticas > 0 ? `${v.alertasCriticas} críticas` : 'Normal'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isSupervisor && tiendas.length > 0 && (
                <div style={{ marginTop: '40px' }}>
                    <h3 style={{ fontSize: '18px', color: '#101828', marginBottom: '20px' }}>Resumen consolidado por sucursal</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                        {tiendas.map((t, idx) => (
                             <div 
                                key={idx} 
                                onClick={() => navigate('/perfiles')} 
                                title={`Ver personal de ${t.tienda}`}
                                style={{ 
                                    cursor: 'pointer',
                                    background: '#fff', 
                                    borderRadius: '16px', 
                                    border: '1px solid #eaecf0', 
                                    padding: '20px', 
                                    boxShadow: '0 1px 3px rgba(16, 24, 40, 0.02)',
                                    transition: 'box-shadow 0.2s, transform 0.1s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 25px rgba(16,24,40,0.08)'}
                                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(16, 24, 40, 0.02)'}
                             >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '18px', color: '#101828' }}>{t.tienda}</h3>
                                        <p style={{ margin: '4px 0 0 0', color: '#667085', fontSize: '13px' }}>
                                            {t.personalCount} integrantes · {t.asesoresCount} asesores · {t.gerentesCount} gerentes
                                        </p>
                                    </div>
                                    
                                    <span 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate('/alertas');
                                        }}
                                        title="Ir a módulo de alertas"
                                        style={{ 
                                            cursor: 'pointer',
                                            background: t.alertasCriticas > 0 ? '#fee4e2' : '#e6f5ed', 
                                            color: t.alertasCriticas > 0 ? '#d92d20' : '#0d945b', 
                                            padding: '4px 10px', 
                                            borderRadius: '16px', 
                                            fontSize: '11px', 
                                            fontWeight: 'bold' 
                                        }}>
                                        {t.alertasCriticas > 0 ? `${t.alertasCriticas} alertas` : 'Normal'}
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                    <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #eaecf0' }}>
                                        <span style={{ fontSize: '11px', color: '#667085', textTransform: 'uppercase' }}>VISITAS</span>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#101828', marginTop: '4px' }}>{t.visitasReal}/{t.visitasMeta}</div>
                                    </div>
                                    <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #eaecf0' }}>
                                        <span style={{ fontSize: '11px', color: '#667085', textTransform: 'uppercase' }}>CUMPLIMIENTO</span>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#101828', marginTop: '4px' }}>{t.cumplimiento}%</div>
                                    </div>
                                    <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #eaecf0' }}>
                                        <span style={{ fontSize: '11px', color: '#667085', textTransform: 'uppercase' }}>REPORTANDO</span>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#101828', marginTop: '4px' }}>{t.reportandoCount}/{t.personalCount}</div>
                                    </div>
                                    <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #eaecf0' }}>
                                        <span style={{ fontSize: '11px', color: '#667085', textTransform: 'uppercase' }}>TRÁFICO ALTO</span>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#101828', marginTop: '4px' }}>0</div>
                                    </div>
                                </div>

                                {t.alertasCriticas > 0 ? (
                                    <div style={{ padding: '12px', background: '#fff5df', borderRadius: '8px', border: '1px solid #fec84b', color: '#b54708', fontSize: '13px', marginBottom: '0px' }}>
                                        Revisar incidencias pendientes en la tienda.
                                    </div>
                                ) : (
                                    <div style={{ padding: '12px', background: '#fff9ea', borderRadius: '8px', border: '1px solid #fde29f', color: '#9b6d10', fontSize: '13px', marginBottom: '0px' }}>
                                        Operación estable sin incidencias críticas.
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}