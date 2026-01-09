import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'brand';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading,
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold tracking-[0.15em] uppercase transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:pointer-events-none rounded-none border";
  
  const variants = {
    primary: "bg-black dark:bg-white text-white dark:text-black border-transparent hover:border-black/20 dark:hover:border-white/20 hover:bg-zinc-900 dark:hover:bg-zinc-100 shadow-sm",
    secondary: "bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border-transparent hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-700",
    brand: "bg-brand-500 text-white border-transparent hover:border-brand-600 hover:bg-brand-600 shadow-lg",
    outline: "border-zinc-200 dark:border-zinc-800 text-black dark:text-white hover:border-black dark:hover:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900",
    ghost: "bg-transparent border-transparent hover:border-zinc-100 dark:hover:border-zinc-800 text-black dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900"
  };

  const sizes = {
    sm: "h-9 px-4 text-[10px]",
    md: "h-12 px-7 text-[11px]",
    lg: "h-14 px-10 text-[12px]"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      <span className="relative z-10">{children}</span>
    </button>
  );
};