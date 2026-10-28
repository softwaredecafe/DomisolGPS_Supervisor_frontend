import { useState } from 'react';

export default function LoginAdmin({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    
    if (usuario === 'super' && password === '123') {
      localStorage.setItem('admin_id', '999');
      localStorage.setItem('admin_nombre', 'Antonio (Supervisor)');
      localStorage.setItem('admin_rol', 'supervisor');
      onLogin('supervisor');
      return; 
    }
    
    if (usuario === 'gerente' && password === '123') {
      localStorage.setItem('admin_id', '888');
      localStorage.setItem('admin_nombre', 'Carlos (Gerente)');
      localStorage.setItem('admin_rol', 'gerente');
      onLogin('gerente');
      return; 
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password })
      });

      const data = await response.json();

      if (response.ok && data.exito) {
        localStorage.setItem('admin_id', data.datos.id);
        localStorage.setItem('admin_nombre', data.datos.nombre);
        localStorage.setItem('admin_rol', data.datos.rol);
        onLogin(data.datos.rol); 
      } else {
        setError(data.mensaje || "Credenciales incorrectas");
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      setError("Error de red. Revisa tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f3f5f8' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '22px', boxShadow: '0 16px 45px rgba(15,32,55,.11)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ background: 'linear-gradient(135deg, #c89b3c, #f2d893)', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#07182c', fontWeight: '900', fontSize: '24px' }}>
          DM
        </div>
        <h1 style={{ margin: '0 0 10px', color: '#172033' }}>Portal Administrativo</h1>
        <p style={{ color: '#6b7485', marginBottom: '30px' }}>Acceso exclusivo para Gerentes y Supervisores.</p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Usuario</label>
            <input 
              type="text" 
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e4e8ef' }}
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e4e8ef' }}
              required 
            />
          </div>
          <button type="submit" disabled={loading} style={{ background: '#c89b3c', color: '#101828', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
            {loading ? 'Verificando...' : 'Ingresar al Dashboard'}
          </button>
          
          {error && <p style={{ color: '#d33f49', fontWeight: 'bold', margin: '0', textAlign: 'center' }}>{error}</p>}
        </form>
      </div>
    </div>
  );
}