import React from 'react';
import { formatDateForEcuador } from '../../utils/dateUtils';

const CronogramaPreview = ({ capital, plazo, tasa = 0.01, fechaInicio }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString, monthsToAdd) => {
    return formatDateForEcuador(dateString, monthsToAdd);
  };

  const calcularCuotaFija = (capital, tasa, plazo) => {
    if (tasa === 0) {
      return capital / plazo;
    }
    const factor = Math.pow(1 + tasa, plazo);
    return capital * (tasa * factor) / (factor - 1);
  };

  const generarCronograma = () => {
    if (!capital || !plazo || !fechaInicio) return [];

    const capitalTotal = parseFloat(capital);
    const interesFijo = capitalTotal * tasa; // Interés fijo del 1% sobre el capital total
    const capitalPorCuota = capitalTotal / parseInt(plazo); // Capital dividido en partes iguales
    const cuotaFija = capitalPorCuota + interesFijo; // Cuota = Capital + Interés fijo
    
    const cronograma = [];
    let saldoPendiente = capitalTotal;

    for (let i = 1; i <= parseInt(plazo); i++) {
      // Para la última cuota, ajustar el capital para que no quede saldo
      let capitalCuota = capitalPorCuota;
      if (i === parseInt(plazo)) {
        capitalCuota = saldoPendiente;
      }

      cronograma.push({
        numero: i,
        fecha: formatDate(fechaInicio, i),
        cuota: cuotaFija,
        interes: interesFijo, // Interés fijo en todas las cuotas
        capital: capitalCuota,
        saldo: saldoPendiente - capitalCuota
      });

      saldoPendiente -= capitalCuota;
    }

    return cronograma;
  };

  const cronograma = generarCronograma();
  const cuotaFija = capital && plazo ? (parseFloat(capital) / parseInt(plazo)) + (parseFloat(capital) * tasa) : 0;
  const totalInteres = cronograma.reduce((sum, cuota) => sum + cuota.interes, 0);
  const totalPagar = cronograma.reduce((sum, cuota) => sum + cuota.cuota, 0);

  if (!capital || !plazo || !fechaInicio) {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600 text-center">
          Complete los datos del préstamo para ver el cronograma
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-blue-900 mb-2">
          Resumen del Préstamo
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Capital:</span>
            <div className="font-semibold">{formatCurrency(capital)}</div>
          </div>
          <div>
            <span className="text-gray-600">Cuota fija:</span>
            <div className="font-semibold">{formatCurrency(cuotaFija)}</div>
          </div>
          <div>
            <span className="text-gray-600">Total interés:</span>
            <div className="font-semibold">{formatCurrency(totalInteres)}</div>
          </div>
          <div>
            <span className="text-gray-600">Total a pagar:</span>
            <div className="font-semibold text-green-600">{formatCurrency(totalPagar)}</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">Cronograma de Pagos</h4>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Cuota
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Vencimiento
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Cuota
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Interés
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Capital
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Saldo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cronograma.map((cuota) => (
                <tr key={cuota.numero} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm font-medium text-gray-900">
                    {cuota.numero}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-500">
                    {cuota.fecha}
                  </td>
                  <td className="px-3 py-2 text-sm text-right font-medium text-gray-900">
                    {formatCurrency(cuota.cuota)}
                  </td>
                  <td className="px-3 py-2 text-sm text-right text-gray-500">
                    {formatCurrency(cuota.interes)}
                  </td>
                  <td className="px-3 py-2 text-sm text-right text-gray-500">
                    {formatCurrency(cuota.capital)}
                  </td>
                  <td className="px-3 py-2 text-sm text-right text-gray-500">
                    {formatCurrency(cuota.saldo)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CronogramaPreview;
