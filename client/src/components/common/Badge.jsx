import React from 'react';

const Badge = ({ children, color = 'blue' }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-50 text-${color}-700 border border-${color}-200`}>
      {children}
    </span>
  );
};

export default Badge;
