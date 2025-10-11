import React, { useState, useEffect } from 'react';
import { ahorrosAPI } from '../../services/api/ahorros';
import Card from '../shared/Card';
import Badge from '../shared/Badge';

const AhorrosResumen = ({ socioId }) => {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (socioId) {
      fetchResumen();
    }
  }, [socioId]);

  const fetchResumen = async () => {
    try {
      setLoading(true);
      const response = await ahorrosAPI.getResumenSocio(socioId);
      if (response.success) {
        setResumen(response.data);
      }
    } catch (error) {
      console.error('Error al cargar resumen de ahorros:', error);
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
      month: 'short'
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!resumen) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No se pudo cargar el resumen de ahorros</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saldo Actual</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(resumen.saldo_actual)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Depósitos</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(resumen.total_depositos)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Retiros</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(resumen.total_retiros)}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráfico simple por mes */}
      {resumen.historico_por_mes && resumen.historico_por_mes.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Histórico de Ahorros (Últimos 12 meses)</h3>
          
          <div className="space-y-3">
            {resumen.historico_por_mes.slice(-12).map((mes, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-20 text-sm text-gray-600">
                    {formatDate(mes.mes)}
                  </div>
                  <div className="flex items-center space-x-2">
                    {mes.depositos > 0 && (
                      <Badge variant="success" size="sm">
                        +{formatCurrency(mes.depositos)}
                      </Badge>
                    )}
                    {mes.retiros > 0 && (
                      <Badge variant="destructive" size="sm">
                        -{formatCurrency(mes.retiros)}
                      </Badge>
                    )}
                    {mes.depositos === 0 && mes.retiros === 0 && (
                      <span className="text-sm text-gray-400">Sin movimientos</span>
                    )}
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {formatCurrency(mes.saldo_mes)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Estado general */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Estado de Ahorros</h3>
            <p className="text-sm text-gray-600">
              {resumen.saldo_actual > 0 ? 
                'El socio tiene ahorros activos' : 
                'El socio no tiene ahorros registrados'
              }
            </p>
          </div>
          <Badge 
            variant={resumen.saldo_actual > 0 ? 'success' : 'secondary'}
            size="lg"
          >
            {resumen.saldo_actual > 0 ? 'Activo' : 'Sin Ahorros'}
          </Badge>
        </div>
      </Card>
    </div>
  );
};

export default AhorrosResumen;
