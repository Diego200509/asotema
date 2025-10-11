import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from '../config/axios';
import Layout from '../components/layout/Layout';
import Card from '../components/shared/Card';
import PrestamoSearch from '../components/prestamos/PrestamoSearch';
import PrestamoTable from '../components/prestamos/PrestamoTable';
import PrestamoPagination from '../components/prestamos/PrestamoPagination';
import PrestamoModal from '../components/prestamos/PrestamoModal';

const Prestamos = () => {
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { user } = useAuth();
  const { showError } = useToast();

  // Verificar permisos
  const canCreate = user && (user.rol === 'ADMIN' || user.rol === 'TESORERO');
  const canModify = user && (user.rol === 'ADMIN' || user.rol === 'TESORERO' || user.rol === 'CAJERO');

  useEffect(() => {
    fetchPrestamos();
  }, [currentPage, search, estado]);

  const fetchPrestamos = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: perPage,
      };

      if (search) {
        params.q = search;
      }

      if (estado) {
        params.estado = estado;
      }

      const response = await axios.get('/prestamos', { params });

      if (response.data.success) {
        setPrestamos(response.data.data.data || []);
        setTotalPages(response.data.data.last_page || 1);
        setTotalItems(response.data.data.total || 0);
      }
    } catch (error) {
      console.error('Error al cargar préstamos:', error);
      showError('Error al cargar préstamos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleEstadoChange = (e) => {
    setEstado(e.target.value);
    setCurrentPage(1);
  };

  const handleNewPrestamo = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalSuccess = () => {
    fetchPrestamos();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleView = (id) => {
    // Navigate to detail page
    window.location.href = `/prestamos/${id}`;
  };

  return (
    <Layout>
      <div className="h-full flex flex-col">
        <PrestamoSearch
          search={search}
          onSearchChange={handleSearch}
          estado={estado}
          onEstadoChange={handleEstadoChange}
          onNewPrestamo={handleNewPrestamo}
          canCreate={canCreate}
        />

        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <PrestamoTable
              prestamos={prestamos}
              loading={loading}
              onView={handleView}
              canModify={canModify}
            />
          </div>
          
          <PrestamoPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            perPage={perPage}
          />
        </Card>
      </div>
      
      <PrestamoModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </Layout>
  );
};

export default Prestamos;
