import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from '../config/axios';
import Header from '../components/shared/Header';
import Card from '../components/shared/Card';
import UsuarioSearch from '../components/usuarios/UsuarioSearch';
import UsuarioTable from '../components/usuarios/UsuarioTable';
import UsuarioPagination from '../components/usuarios/UsuarioPagination';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(10);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchUsuarios();
  }, [currentPage, search]);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/usuarios', {
        params: {
          page: currentPage,
          per_page: perPage,
          search: search,
        },
      });

      if (response.data.success) {
        setUsuarios(response.data.data.data);
        setTotalPages(response.data.data.last_page);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) {
      return;
    }

    try {
      const response = await axios.delete(`/usuarios/${id}`);
      if (response.data.success) {
        showSuccess('Usuario eliminado exitosamente');
        fetchUsuarios();
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      showError('Error al eliminar usuario');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleEdit = (id) => {
    navigate(`/usuarios/editar/${id}`);
  };

  const handleNewUsuario = () => {
    navigate('/usuarios/nuevo');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="ASOTEMA"
        subtitle="Sistema de Gestión de Usuarios"
        user={user}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UsuarioSearch
          search={search}
          onSearchChange={handleSearch}
          onNewUsuario={handleNewUsuario}
        />

        <Card className="overflow-hidden">
          <UsuarioTable
            usuarios={usuarios}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          
          <UsuarioPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </Card>
      </main>
    </div>
  );
};

export default Usuarios;

