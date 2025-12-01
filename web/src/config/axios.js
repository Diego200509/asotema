import axios from 'axios';

// Crear instancia de axios
const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variable para controlar si ya estamos refrescando el token (evitar loops)
let isRefreshing = false;
let failedQueue = [];

// Función para procesar la cola de peticiones fallidas después de refrescar
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor de request para agregar el token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de response para manejar errores de autenticación y refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no es una petición de login o refresh
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url?.includes('/auth/login') &&
        !originalRequest.url?.includes('/auth/refresh')) {
      
      // Si ya estamos refrescando, agregar esta petición a la cola
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Intentar refrescar el token
        const refreshTokenValue = localStorage.getItem('refresh_token');
        
        if (!refreshTokenValue) {
          throw new Error('No hay refresh token disponible');
        }

        // Usar axios directamente (sin instancia) para evitar el interceptor
        // y usar la misma baseURL
        const response = await axios.post(`${axiosInstance.defaults.baseURL}/auth/refresh`, {
          refresh_token: refreshTokenValue
        });

        if (response.data.success) {
          const { token, refresh_token } = response.data.data;
          localStorage.setItem('token', token);
          localStorage.setItem('refresh_token', refresh_token);

          // Actualizar el header de la petición original
          originalRequest.headers.Authorization = `Bearer ${token}`;

          // Procesar la cola de peticiones pendientes
          processQueue(null, token);

          // Reintentar la petición original
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Si el refresh falla, limpiar todo y redirigir a login
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // Solo redirigir si no estamos ya en la página de login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Para otros errores 401 (login, refresh, etc.) o si ya se reintentó
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      // Si no hay refresh token o ya se intentó refrescar, hacer logout
      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (!refreshTokenValue || originalRequest._retry) {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

