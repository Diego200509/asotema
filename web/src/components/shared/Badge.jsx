import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default',
  className = '',
  ...props 
}) => {
  const variantClasses = {
    default: 'px-3 py-1 text-xs font-medium rounded-full border bg-gray-100 text-gray-800 border-gray-200',
    admin: 'badge-admin',
    cajero: 'badge-cajero',
    tesorero: 'badge-tesorero',
    active: 'badge-active',
    inactive: 'badge-inactive',
    success: 'badge-active',
    danger: 'badge-inactive'
  };

  return (
    <span className={`${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;
