import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axios';
import Header from '../components/shared/Header';
import Card from '../components/shared/Card';
import Alert from '../components/shared/Alert';
import UsuarioFormFields from '../components/usuarios/UsuarioFormFields';
import UsuarioFormActions from '../components/usuarios/UsuarioFormActions';

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
      <Header
        title="ASOTEMA"
        subtitle={isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
        user={user}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card padding="lg">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {isEdit ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </h2>

          {error && (
            <Alert type="error" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <UsuarioFormFields
              formData={formData}
              onChange={handleChange}
              isEdit={isEdit}
            />
            
            <UsuarioFormActions
              isEdit={isEdit}
              loading={loading}
              onCancel={handleCancel}
            />
          </form>
        </Card>
      </main>
    </div>
  );
};

export default UsuarioForm;

