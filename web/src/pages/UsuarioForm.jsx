import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axios';

const UsuarioForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: '',
    rol: 'CAJERO',
    activo: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchUsuario();
    }
  }, [id]);

  const fetchUsuario = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/usuarios/${id}`);
      if (response.data.success) {
        const usuario = response.data.data;
        setFormData({
          nombre: usuario.nombre,
          correo: usuario.correo,
          password: '', // No mostrar la contraseña
          rol: usuario.rol,
          activo: usuario.activo,
        });
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      setError('Error al cargar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const dataToSend = { ...formData };
      
      // Si es edición y no se cambió la contraseña, no enviarla
      if (isEdit && !dataToSend.password) {
        delete dataToSend.password;
      }

      const response = isEdit
        ? await axios.put(`/usuarios/${id}`, dataToSend)
        : await axios.post('/usuarios', dataToSend);

      if (response.data.success) {
        navigate('/usuarios');
      }
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      setError(error.response?.data?.message || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/usuarios');
  };

  if (loading && isEdit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ASOTEMA</h1>
              <p className="text-sm text-gray-600">
                {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.nombre}</p>
              <p className="text-xs text-gray-600">{user?.rol}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {isEdit ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </h2>

          {error && (
            <div className="mb-6 p-3 bg-danger-50 border border-danger-200 text-danger-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div>
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Ej: Juan Pérez"
              />
            </div>

            {/* Correo */}
            <div>
              <label
                htmlFor="correo"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="correo"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="usuario@asotema.com"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Contraseña {!isEdit && <span className="text-red-500">*</span>}
                {isEdit && (
                  <span className="text-xs text-gray-500 ml-2">
                    (Dejar en blanco para mantener la actual)
                  </span>
                )}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEdit}
                minLength={6}
                className="input-field"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            {/* Rol */}
            <div>
              <label
                htmlFor="rol"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Rol <span className="text-red-500">*</span>
              </label>
              <select
                id="rol"
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                required
                className="input-field bg-white"
              >
                <option value="ADMIN">Administrador</option>
                <option value="CAJERO">Cajero</option>
                <option value="TESORERO">Tesorero</option>
              </select>
            </div>

            {/* Estado Activo */}
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Usuario Activo
                </span>
              </label>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : isEdit ? 'Actualizar Usuario' : 'Crear Usuario'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default UsuarioForm;

