import axios from '../../config/axios';

export const prestamosAPI = {
  // Obtener lista de préstamos con filtros
  getPrestamos: async (params = {}) => {
    const response = await axios.get('/prestamos', { params });
    return response.data;
  },

  // Obtener préstamos por socio ID
  getPrestamosBySocio: async (socioId, params = {}) => {
    const response = await axios.get(`/prestamos`, { 
      params: {
        socio_id: socioId,
        ...params
      }
    });
    return response.data;
  },

  // Obtener préstamo por ID
  getPrestamo: async (id) => {
    const response = await axios.get(`/prestamos/${id}`);
    return response.data;
  },

  // Crear préstamo
  crearPrestamo: async (data) => {
    const response = await axios.post('/prestamos', data);
    return response.data;
  },

  // Actualizar préstamo
  actualizarPrestamo: async (id, data) => {
    const response = await axios.put(`/prestamos/${id}`, data);
    return response.data;
  },

  // Eliminar préstamo
  eliminarPrestamo: async (id) => {
    const response = await axios.delete(`/prestamos/${id}`);
    return response.data;
  }
};
