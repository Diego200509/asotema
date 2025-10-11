import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from '../config/axios';
import Layout from '../components/layout/Layout';
import Card from '../components/shared/Card';
import ConfirmModal from '../components/shared/ConfirmModal';
import SocioSearch from '../components/socios/SocioSearch';
import SocioTable from '../components/socios/SocioTable';
import SocioPagination from '../components/socios/SocioPagination';
import SocioModal from '../components/socios/SocioModal';

const Socios = () => {
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage] = useState(6);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSocioId, setEditingSocioId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingSocio, setDeletingSocio] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  // Verificar permisos: ADMIN y TESORERO pueden modificar, CAJERO solo lectura
  const canModify = user && (user.rol === 'ADMIN' || user.rol === 'TESORERO');

  useEffect(() => {
    fetchSocios();
  }, [currentPage, search]);

  const fetchSocios = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/socios', {
        params: {
          page: currentPage,
          per_page: perPage,
          q: search,
        },
      });

      if (response.data.success) {
        setSocios(response.data.data.data);
        setTotalPages(response.data.data.last_page);
        setTotalItems(response.data.data.total);
      }
    } catch (error) {
      console.error('Error al cargar socios:', error);
      showError('Error al cargar socios');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = (id) => {
    const socio = socios.find(s => s.id === id);
    setDeletingSocio(socio);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingSocio) return;
    
    setDeleteLoading(true);
    try {
      const response = await axios.delete(`/socios/${deletingSocio.id}`);
      if (response.data.success) {
        showSuccess('Socio eliminado exitosamente');
        fetchSocios();
        setIsDeleteModalOpen(false);
        setDeletingSocio(null);
      }
    } catch (error) {
      console.error('Error al eliminar socio:', error);
      showError('Error al eliminar socio');
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeletingSocio(null);
  };

  const handleEdit = (id) => {
    setEditingSocioId(id);
    setIsModalOpen(true);
  };

  const handleNewSocio = () => {
    setEditingSocioId(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingSocioId(null);
  };

  const handleModalSuccess = () => {
    fetchSocios();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Layout>
      <div className="h-full flex flex-col">
        <SocioSearch
          search={search}
          onSearchChange={handleSearch}
          onNewSocio={handleNewSocio}
          canCreate={canModify}
        />

        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <SocioTable
              socios={socios}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canModify={canModify}
            />
          </div>
          
          <SocioPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            perPage={perPage}
          />
        </Card>
      </div>
      
      {/* Modal para crear/editar socio */}
      <SocioModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        socioId={editingSocioId}
        onSuccess={handleModalSuccess}
      />

      {/* Modal de confirmación para eliminar socio */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Eliminar Socio"
        message={`¿Estás seguro de que deseas eliminar al socio "${deletingSocio?.nombres} ${deletingSocio?.apellidos}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleteLoading}
      />
    </Layout>
  );
};

export default Socios;

