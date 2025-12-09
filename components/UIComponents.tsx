
import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseStyle = "px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform active:scale-95 will-change-transform flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border";
  
  const variants = {
    primary: "bg-gray-900 hover:bg-black text-white border-transparent shadow-sm",
    secondary: "bg-white hover:bg-gray-50 text-gray-900 border-gray-200 shadow-sm",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900 border-transparent"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="flex flex-col gap-2 w-full">
    {label && <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">{label}</label>}
    <input 
      className={`w-full bg-white border border-gray-200 text-gray-900 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors placeholder-gray-400 shadow-sm ${className}`}
      {...props}
    />
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className = '', title }) => (
  <div className={`glass-panel rounded-xl p-6 ${className}`}>
    {title && <h3 className="text-xl font-display font-bold mb-4 text-gray-900">{title}</h3>}
    {children}
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, children, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">{label}</label>
    <div className="relative">
      <select 
        {...props} 
        className="w-full appearance-none bg-white border border-gray-200 text-gray-900 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors shadow-sm"
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
    {children}
  </span>
);
