import axios from '../../config/axios';

export const sociosAPI = {
  // Obtener lista de socios con filtros
  getSocios: async (params = {}) => {
    const response = await axios.get('/socios', { params });
    return response.data;
  },

  // Obtener todos los socios ordenados alfabéticamente
  getAllSociosOrdenados: async () => {
    const response = await axios.get('/socios', {
      params: {
        order: 'apellido_asc',
        per_page: 'all'
      }
    });
    return response.data;
  },

  // Obtener socio por ID
  getSocio: async (id) => {
    const response = await axios.get(`/socios/${id}`);
    return response.data;
  },

  // Crear socio
  crearSocio: async (data) => {
    const response = await axios.post('/socios', data);
    return response.data;
  },

  // Actualizar socio
  actualizarSocio: async (id, data) => {
    const response = await axios.put(`/socios/${id}`, data);
    return response.data;
  },

  // Eliminar socio
  eliminarSocio: async (id) => {
    const response = await axios.delete(`/socios/${id}`);
    return response.data;
  }
};
