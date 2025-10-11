import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from '../config/axios';
import Layout from '../components/layout/Layout';
import Card from '../components/shared/Card';
import UsuarioSearch from '../components/usuarios/UsuarioSearch';
import UsuarioTable from '../components/usuarios/UsuarioTable';
import UsuarioPagination from '../components/usuarios/UsuarioPagination';
import UsuarioModal from '../components/usuarios/UsuarioModal';
import ConfirmModal from '../components/shared/ConfirmModal';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage] = useState(6);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsuarioId, setEditingUsuarioId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingUsuario, setDeletingUsuario] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
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
                setTotalItems(response.data.data.total);
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

    const handleDelete = (id) => {
        const usuario = usuarios.find(u => u.id === id);
        setDeletingUsuario(usuario);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingUsuario) return;
        
        setDeleteLoading(true);
        try {
            const response = await axios.delete(`/usuarios/${deletingUsuario.id}`);
            if (response.data.success) {
                showSuccess('Usuario eliminado exitosamente');
                fetchUsuarios();
                setIsDeleteModalOpen(false);
                setDeletingUsuario(null);
            }
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            showError('Error al eliminar usuario');
        } finally {
            setDeleteLoading(false);
        }
    };

    const cancelDelete = () => {
        setIsDeleteModalOpen(false);
        setDeletingUsuario(null);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleEdit = (id) => {
        setEditingUsuarioId(id);
        setIsModalOpen(true);
    };

    const handleNewUsuario = () => {
        setEditingUsuarioId(null);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingUsuarioId(null);
    };

    const handleModalSuccess = () => {
        fetchUsuarios(); // Refresh the table
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

  return (
    <Layout>
      <div className="h-full flex flex-col">
        <UsuarioSearch
          search={search}
          onSearchChange={handleSearch}
          onNewUsuario={handleNewUsuario}
        />

        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <UsuarioTable
              usuarios={usuarios}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
          
          <UsuarioPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            perPage={perPage}
          />
        </Card>
      </div>
      
      {/* Modal para crear/editar usuario */}
      <UsuarioModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        usuarioId={editingUsuarioId}
        onSuccess={handleModalSuccess}
      />

      {/* Modal de confirmación para eliminar usuario */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar al usuario "${deletingUsuario?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleteLoading}
      />
    </Layout>
  );
};

export default Usuarios;

