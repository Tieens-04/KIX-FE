
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'charcoal';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-primary text-charcoal hover:scale-105 active:scale-95 shadow-[0_8px_20px_rgba(37,244,37,0.4)]',
    secondary: 'bg-charcoal dark:bg-white text-white dark:text-charcoal hover:bg-primary hover:text-charcoal',
    outline: 'border-2 border-charcoal dark:border-white/50 hover:border-primary hover:text-primary',
    charcoal: 'bg-charcoal text-white hover:bg-primary hover:text-charcoal hover:scale-105 shadow-xl'
  };

  const sizes = {
    sm: 'px-5 py-2 text-xs',
    md: 'px-8 py-3 text-sm',
    lg: 'px-10 py-4 text-base'
  };

  return (
    <button
      className={`rounded-full font-black uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
