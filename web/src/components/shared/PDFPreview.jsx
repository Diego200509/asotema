import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import axios from '../../config/axios';
import Button from './Button';

const PDFPreview = ({ 
  url, 
  filename, 
  onSuccess, 
  onError, 
  previewButtonText = "Vista Previa",
  downloadButtonText = "Descargar PDF",
  showBothButtons = true,
  buttonVariant = "outline",
  downloadButtonVariant = "secondary",
  className = "",
  ...props 
}) => {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const generatePDF = async () => {
    if (!url) {
      showError('URL del PDF no proporcionada');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('No se encontró el token de autenticación.');
        return;
      }

      const response = await axios.get(url, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        }
      });

      // Verificar que la respuesta sea exitosa y contenga datos
      if (response.status === 200 && response.data && response.data.size > 0) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const pdfUrl = window.URL.createObjectURL(blob);
        
        // Abrir el PDF en una nueva ventana para vista previa
        const previewWindow = window.open(pdfUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
        
        if (previewWindow) {
          showSuccess('PDF generado exitosamente. Se abrió en nueva ventana.');
          
          // Limpiar la URL después de un tiempo
          setTimeout(() => {
            window.URL.revokeObjectURL(pdfUrl);
          }, 30000); // 30 segundos
          
          if (onSuccess) onSuccess(pdfUrl);
        } else {
          // Si no se puede abrir la ventana, mostrar error
          showError('No se pudo abrir la vista previa. Verifique que los pop-ups estén permitidos.');
          window.URL.revokeObjectURL(pdfUrl);
          if (onError) onError('Pop-ups bloqueados');
        }
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('Error al generar vista previa del PDF:', error);
      
      let errorMessage = 'Error al generar la vista previa del PDF';
      
      if (error.response?.status === 401) {
        errorMessage = 'Token de autenticación inválido o expirado';
      } else if (error.response?.status === 404) {
        errorMessage = 'Ruta del PDF no encontrada';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error interno del servidor al generar el PDF';
      } else if (error.message === 'Respuesta inválida del servidor') {
        errorMessage = 'El servidor no pudo generar el PDF';
      }
      
      showError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!url) {
      showError('URL del PDF no proporcionada');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('No se encontró el token de autenticación.');
        return;
      }

      const response = await axios.get(url, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        }
      });

      // Verificar que la respuesta sea exitosa y contenga datos
      if (response.status === 200 && response.data && response.data.size > 0) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const pdfUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = filename || 'documento.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(pdfUrl);
        
        showSuccess('PDF descargado exitosamente');
        if (onSuccess) onSuccess(pdfUrl);
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      
      let errorMessage = 'Error al generar el PDF del documento';
      
      if (error.response?.status === 401) {
        errorMessage = 'Token de autenticación inválido o expirado';
      } else if (error.response?.status === 404) {
        errorMessage = 'Ruta del PDF no encontrada';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error interno del servidor al generar el PDF';
      } else if (error.message === 'Respuesta inválida del servidor') {
        errorMessage = 'El servidor no pudo generar el PDF';
      }
      
      showError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (showBothButtons) {
    return (
      <div className={`flex gap-2 ${className}`} {...props}>
        <Button
          variant={buttonVariant}
          onClick={generatePDF}
          disabled={loading}
        >
          {loading ? 'Generando...' : previewButtonText}
        </Button>
        <Button
          variant={downloadButtonVariant}
          onClick={downloadPDF}
          disabled={loading}
        >
          {loading ? 'Descargando...' : downloadButtonText}
        </Button>
      </div>
    );
  }

  // Solo mostrar un botón (para casos específicos)
  return (
    <div className={className} {...props}>
      <Button
        variant={buttonVariant}
        onClick={generatePDF}
        disabled={loading}
      >
        {loading ? 'Generando...' : previewButtonText}
      </Button>
    </div>
  );
};

export default PDFPreview;
