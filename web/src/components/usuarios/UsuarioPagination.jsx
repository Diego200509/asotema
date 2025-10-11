import React from 'react';
import Pagination from '../shared/Pagination';

const UsuarioPagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems,
  perPage
}) => {
  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      showInfo={true}
      showFirstLast={true}
      maxVisiblePages={5}
      totalItems={totalItems}
      perPage={perPage}
    />
  );
};

export default UsuarioPagination;
