import axios from '../config/axios';

const descuentosMensualesService = {
  // Obtener meses disponibles
  getMesesDisponibles: async () => {
    try {
      const response = await axios.get('/reportes/descuentos-mensuales/meses');
      return response.data;
    } catch (error) {
      console.error('Error al obtener meses disponibles:', error);
      throw error;
    }
  },

  // Obtener descuentos mensuales
  getDescuentosMensuales: async (mes) => {
    try {
      const response = await axios.get('/reportes/descuentos-mensuales', {
        params: { mes }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener descuentos mensuales:', error);
      throw error;
    }
  },

  // Descargar PDF
  downloadPDF: async (mes) => {
    try {
      const response = await axios.get('/reportes/descuentos-mensuales/pdf', {
        params: { mes },
        responseType: 'blob'
      });
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `descuentos-mensuales-${mes}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      throw error;
    }
  },

  // Vista previa del PDF
  previewPDF: async (mes) => {
    try {
      const response = await axios.get('/reportes/descuentos-mensuales/preview', {
        params: { mes }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener vista previa:', error);
      throw error;
    }
  }
};

export default descuentosMensualesService;
