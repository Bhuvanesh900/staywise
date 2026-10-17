interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', variant = 'dark', size = 'md' }: LogoProps) {
  const isLight = variant === 'light';
  const textClass = isLight ? 'text-white' : 'text-stone-900';
  const subtextClass = isLight ? 'text-emerald-300' : 'text-emerald-800';
  const iconBg = isLight ? 'bg-emerald-600 text-white' : 'bg-emerald-900 text-white';

  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8.5 h-8.5 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 font-sans select-none ${className}`}>
      {/* Original architectural symbol: roofline + doorway + compass point */}
      <div
        className={`${iconSizes[size]} ${iconBg} rounded-xl flex items-center justify-center shadow-xs transition-transform duration-200 hover:scale-105`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M3 10.5L12 3l9 7.5v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M9 21v-7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7" />
          <circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className={`font-bold tracking-tight leading-none ${textSizes[size]} ${textClass}`}>
          Staywise
        </div>
        <span className={`text-[10px] font-medium tracking-wider uppercase mt-0.5 ${subtextClass}`}>
          Direct Real Estate
        </span>
      </div>
    </div>
  );
}
