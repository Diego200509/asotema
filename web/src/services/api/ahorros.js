import axios from '../../config/axios';

export const ahorrosAPI = {
  // Obtener lista de aportes con filtros
  getAportes: async (params = {}) => {
    const response = await axios.get('/ahorros', { params });
    return response.data;
  },

  // Obtener estadísticas generales
  getEstadisticas: async () => {
    const response = await axios.get('/ahorros/estadisticas');
    return response.data;
  },

  // Obtener socios para selección
  getSocios: async (params = {}) => {
    const response = await axios.get('/ahorros/socios', { params });
    return response.data;
  },

  // Obtener resumen de socio
  getResumenSocio: async (socioId) => {
    const response = await axios.get(`/ahorros/socio/${socioId}/resumen`);
    return response.data;
  },

  // Obtener saldo de socio
  getSaldoSocio: async (socioId) => {
    const response = await axios.get(`/ahorros/socio/${socioId}/saldo`);
    return response.data;
  },

  // Registrar depósito individual
  registrarDeposito: async (data) => {
    const response = await axios.post('/ahorros/deposito', data);
    return response.data;
  },

  // Registrar depósitos en lote
  registrarDepositoLote: async (data) => {
    const response = await axios.post('/ahorros/deposito-lote', data);
    return response.data;
  },

  // Registrar retiro
  registrarRetiro: async (data) => {
    const response = await axios.post('/ahorros/retiro', data);
    return response.data;
  },

  // Eliminar aporte
  eliminarAporte: async (id) => {
    const response = await axios.delete(`/ahorros/${id}`);
    return response.data;
  }
};
