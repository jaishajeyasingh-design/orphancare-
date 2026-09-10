import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const base = "px-4 py-2 rounded-lg font-medium text-sm transition-all focus:outline-none";
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-sm",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50",
  };

  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
