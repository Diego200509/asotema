import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import axios from '../config/axios';
import Layout from '../components/layout/Layout';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import SocioDetalleTabs from '../components/socios/SocioDetalleTabs';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const SocioDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useToast();

  const [socio, setSocio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSocio();
  }, [id]);

  const fetchSocio = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/socios/${id}`);
      if (response.data.success) {
        setSocio(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar socio:', error);
      showError('Error al cargar socio');
      navigate('/socios');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-600">Cargando socio...</p>
        </div>
      </Layout>
    );
  }

  if (!socio) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-600">Socio no encontrado</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-full flex flex-col space-y-6"> {/* SCROLL-FIX: Flex column layout */}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={() => navigate('/socios')}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {socio.nombres} {socio.apellidos}
              </h1>
              <p className="text-gray-600">
                C.I. {socio.cedula} - Código: {socio.codigo}
              </p>
            </div>
          </div>
          
        </div>

        {/* Content */}
        <Card className="flex flex-col h-full min-h-0"> {/* SCROLL-FIX: Flex column for card */}
          <SocioDetalleTabs socio={socio} />
        </Card>
      </div>
    </Layout>
  );
};

export default SocioDetalle;
