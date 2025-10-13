import axios from '../config/axios';

const eventosService = {
  /**
   * Listar eventos con filtros
   */
  list: async (params = {}) => {
    try {
      const response = await axios.get('/eventos', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener detalle de un evento
   */
  get: async (id) => {
    try {
      const response = await axios.get(`/eventos/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Crear nuevo evento
   */
  create: async (data) => {
    try {
      const response = await axios.post('/eventos', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Actualizar evento
   */
  update: async (id, data) => {
    try {
      const response = await axios.put(`/eventos/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Eliminar evento
   */
  delete: async (id) => {
    try {
      const response = await axios.delete(`/eventos/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Agregar asistentes al evento
   */
  setAsistentes: async (id, socioIds) => {
    try {
      const response = await axios.post(`/eventos/${id}/asistentes`, {
        socio_ids: socioIds,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Toggle asistencia de un socio
   */
  toggleAsistencia: async (id, socioId, asistio) => {
    try {
      const response = await axios.post(`/eventos/${id}/toggle-asistencia`, {
        socio_id: socioId,
        asistio,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Contabilizar evento
   */
  contabilizar: async (id) => {
    try {
      const response = await axios.post(`/eventos/${id}/contabilizar`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reversar contabilización de evento
   */
  reversar: async (id) => {
    try {
      const response = await axios.post(`/eventos/${id}/reversar`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener socios para evento
   */
  getSociosParaEvento: async (params = {}) => {
    try {
      const response = await axios.get('/eventos/socios/para-evento', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default eventosService;
