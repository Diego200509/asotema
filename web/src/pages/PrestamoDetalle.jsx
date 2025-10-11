import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from '../config/axios';
import Layout from '../components/layout/Layout';
import Card from '../components/shared/Card';
import Badge from '../components/shared/Badge';
import Button from '../components/shared/Button';
import PagarCuotaModal from '../components/prestamos/PagarCuotaModal';
import { ArrowLeftIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const PrestamoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useToast();

  const [prestamo, setPrestamo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPagarModal, setShowPagarModal] = useState(false);

  const canPagar = user && (user.rol === 'ADMIN' || user.rol === 'TESORERO' || user.rol === 'CAJERO');

  useEffect(() => {
    fetchPrestamo();
  }, [id]);

  const fetchPrestamo = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/prestamos/${id}`);
      if (response.data.success) {
        setPrestamo(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar préstamo:', error);
      showError('Error al cargar préstamo');
      navigate('/prestamos');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-EC', {
      timeZone: 'America/Guayaquil',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getEstadoBadgeVariant = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'warning';
      case 'CANCELADO': return 'success';
      case 'MORA': return 'danger';
      default: return 'secondary';
    }
  };

  const getCuotaEstadoBadgeVariant = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'warning';
      case 'PAGADA': return 'success';
      case 'PARCIAL': return 'info';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-600">Cargando préstamo...</p>
        </div>
      </Layout>
    );
  }

  if (!prestamo) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-600">Préstamo no encontrado</p>
        </div>
      </Layout>
    );
  }

  const totalEsperado = prestamo.cuotas?.reduce((sum, cuota) => sum + cuota.monto_esperado, 0) || 0;
  const totalPagado = prestamo.cuotas?.reduce((sum, cuota) => sum + cuota.monto_pagado, 0) || 0;
  const totalPendiente = totalEsperado - totalPagado;

  return (
    <Layout>
      <div className="h-full flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={() => navigate('/prestamos')}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Préstamo #{prestamo.id}
              </h1>
              <p className="text-gray-600">
                {prestamo.socio?.nombres} {prestamo.socio?.apellidos}
              </p>
            </div>
          </div>
          
          {canPagar && prestamo.estado === 'PENDIENTE' && (
            <Button
              variant="primary"
              onClick={() => setShowPagarModal(true)}
              className="flex items-center gap-2"
            >
              <CurrencyDollarIcon className="h-4 w-4" />
              Pagar Cuota
            </Button>
          )}
        </div>

        {/* Resumen del préstamo */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(prestamo.capital)}
              </div>
              <div className="text-sm text-gray-600">Capital</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {prestamo.plazo_meses} meses
              </div>
              <div className="text-sm text-gray-600">Plazo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalPagado)}
              </div>
              <div className="text-sm text-gray-600">Pagado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(totalPendiente)}
              </div>
              <div className="text-sm text-gray-600">Pendiente</div>
            </div>
          </div>
        </Card>

        {/* Información del préstamo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información del Préstamo
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <Badge variant={getEstadoBadgeVariant(prestamo.estado)}>
                  {prestamo.estado}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tasa mensual:</span>
                <span className="font-medium">{(prestamo.tasa_mensual * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha de inicio:</span>
                <span className="font-medium">{formatDate(prestamo.fecha_inicio)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Creado por:</span>
                <span className="font-medium">{prestamo.creado_por?.nombre}</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información del Socio
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Nombre:</span>
                <span className="font-medium">
                  {prestamo.socio?.nombres} {prestamo.socio?.apellidos}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cédula:</span>
                <span className="font-medium">{prestamo.socio?.cedula}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Código:</span>
                <span className="font-medium">{prestamo.socio?.codigo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <Badge variant={prestamo.socio?.estado === 'ACTIVO' ? 'success' : 'danger'}>
                  {prestamo.socio?.estado}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Cronograma de cuotas */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cronograma de Cuotas
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cuota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vencimiento
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Cuota
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Interés
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Capital
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Pagado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {prestamo.cuotas?.map((cuota) => (
                  <tr key={cuota.numero_cuota} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {cuota.numero_cuota}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(cuota.fecha_vencimiento)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {formatCurrency(cuota.monto_esperado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                      {formatCurrency(cuota.parte_interes)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                      {formatCurrency(cuota.parte_capital)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                      {formatCurrency(cuota.monto_pagado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Badge variant={getCuotaEstadoBadgeVariant(cuota.estado)}>
                        {cuota.estado}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      
      <PagarCuotaModal
        isOpen={showPagarModal}
        onClose={() => setShowPagarModal(false)}
        prestamoId={id}
        onSuccess={fetchPrestamo}
      />
    </Layout>
  );
};

export default PrestamoDetalle;
