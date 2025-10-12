import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook personalizado para infinite scroll
 * @param {Function} loadMore - Función a ejecutar cuando se alcanza el final
 * @param {boolean} hasMore - Si hay más elementos para cargar
 * @param {boolean} isLoading - Si está cargando actualmente
 * @returns {Object} - Referencia del elemento observado
 */
const useInfiniteScroll = (loadMore, hasMore, isLoading) => {
  const observerRef = useRef();
  const elementRef = useRef();

  const lastElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();
      
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            loadMore();
          }
        },
        { threshold: 0.1 }
      );
      
      if (node) observerRef.current.observe(node);
    },
    [isLoading, hasMore, loadMore]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { elementRef, lastElementRef };
};

export default useInfiniteScroll;
