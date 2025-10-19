import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Layout from '../components/layout/Layout';
import Button from '../components/shared/Button';
import Select from '../components/shared/Select';
import PDFPreview from '../components/shared/PDFPreview';
import descuentosMensualesService from '../services/descuentosMensualesService';

const DescuentosMensuales = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [meses, setMeses] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState('');
  const [descuentos, setDescuentos] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMesesDisponibles();
  }, []);

  const fetchMesesDisponibles = async () => {
    try {
      setLoading(true);
      const response = await descuentosMensualesService.getMesesDisponibles();
      if (response.success) {
        setMeses(response.data);
        if (response.data.length > 0) {
          // Seleccionar el mes actual por defecto
          const mesActual = new Date().toISOString().slice(0, 7); // Formato YYYY-MM
          const mesActualEncontrado = response.data.find(mes => mes.value === mesActual);
          const mesPorDefecto = mesActualEncontrado ? mesActual : response.data[0].value;
          setMesSeleccionado(mesPorDefecto);
          
          // Auto-cargar el reporte del mes seleccionado
          await generarReporte(mesPorDefecto);
        }
      }
    } catch (error) {
      showError('Error al cargar meses disponibles');
    } finally {
      setLoading(false);
    }
  };

  const generarReporte = async (mes) => {
    try {
      const response = await descuentosMensualesService.getDescuentosMensuales(mes);
      if (response.success) {
        setDescuentos(response.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al generar el reporte:', error);
      return false;
    }
  };



  const handleMesChange = async (nuevoMes) => {
    setMesSeleccionado(nuevoMes);
    if (nuevoMes) {
      setLoading(true);
      try {
        await generarReporte(nuevoMes);
      } catch (error) {
        showError('Error al cargar el reporte del mes seleccionado');
      } finally {
        setLoading(false);
      }
    }
  };


  // Función helper para calcular total de cuotas de préstamos
  const calcularTotalCuotasPrestamos = (totales) => {
    return Object.entries(totales)
      .filter(([key, value]) => key.startsWith('prestamo_') && typeof value === 'number')
      .reduce((sum, [, value]) => sum + value, 0);
  };

  const canAccess = user?.rol === 'ADMIN' || user?.rol === 'TESORERO';

  if (!canAccess) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
            <p className="text-gray-600">No tienes permisos para acceder a este módulo.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Descuentos Mensuales</h1>
          <p className="text-gray-600">Generar reporte de descuentos mensuales por socio</p>
        </div>

        {/* Selector de mes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <Select
                label="Seleccionar Mes"
                value={mesSeleccionado}
                onChange={(e) => handleMesChange(e.target.value)}
                options={meses.map(mes => ({
                  value: mes.value,
                  label: mes.label
                }))}
                placeholder="Seleccionar mes"
              />
            </div>
            <div className="flex space-x-3">
              <PDFPreview
                url={`/reportes/descuentos-mensuales/preview?mes=${mesSeleccionado}`}
                filename={`descuentos_mensuales_${mesSeleccionado}.pdf`}
                previewButtonText="Vista Previa"
                downloadButtonText="Descargar PDF"
                showBothButtons={true}
                buttonVariant="secondary"
                downloadButtonVariant="success"
              />
            </div>
          </div>
        </div>


        {/* Resumen del reporte */}
        {descuentos && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen - {descuentos.mes}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-700 mb-1">Total Ahorros</div>
                <div className="text-xl font-bold text-blue-900">
                  ${(descuentos.totales.ahorro || 0).toFixed(2)}
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-sm font-medium text-orange-700 mb-1">Total Gastos</div>
                <div className="text-xl font-bold text-orange-900">
                  ${(descuentos.totales.gastos_eventos || 0).toFixed(2)}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm font-medium text-green-700 mb-1">Total Cuotas Préstamos</div>
                <div className="text-xl font-bold text-green-900">
                  ${calcularTotalCuotasPrestamos(descuentos.totales).toFixed(2)}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-1">Total General</div>
                <div className="text-xl font-bold text-gray-900">
                  ${(descuentos.totales.total || 0).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Total de socios con descuentos: <strong>{descuentos.descuentos.length}</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DescuentosMensuales;
