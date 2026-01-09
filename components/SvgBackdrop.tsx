import React from 'react';

const GRID_PATTERN = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
    <defs>
      <pattern id='grid' width='38' height='38' patternUnits='userSpaceOnUse'>
        <path d='M 38 0 L 0 0 0 38' fill='none' stroke='%23d4d4d8' stroke-width='1' stroke-opacity='0.35'/>
        <circle cx='2' cy='2' r='1.2' fill='%23f43f5e' fill-opacity='0.45'/>
      </pattern>
    </defs>
    <rect width='100%25' height='100%25' fill='url(%23grid)' />
  </svg>`
)}
`;

const RINGS_PATTERN = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800'>
    <defs>
      <radialGradient id='glow' cx='50%25' cy='50%25' r='50%25'>
        <stop stop-color='%23f43f5e' stop-opacity='0.45' offset='0%25'/>
        <stop stop-color='%23f43f5e' stop-opacity='0' offset='100%25'/>
      </radialGradient>
    </defs>
    <g fill='none' stroke='%23f43f5e' stroke-opacity='0.28'>
      <circle cx='400' cy='400' r='160' stroke-width='1.5'/>
      <circle cx='400' cy='400' r='240' stroke-width='1.5'/>
      <circle cx='400' cy='400' r='320' stroke-width='1.5'/>
    </g>
    <circle cx='400' cy='400' r='260' fill='url(%23glow)' />
  </svg>`
)}
`;

export const SvgBackdrop: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className ?? ''}`}>
      <div
        className="absolute inset-0 opacity-35 dark:opacity-25"
        style={{ backgroundImage: `url("${GRID_PATTERN}")`, backgroundSize: '320px 320px' }}
      />
      <div
        className="absolute -top-32 -right-24 w-[520px] h-[520px] opacity-70 mix-blend-screen dark:mix-blend-soft-light"
        style={{ backgroundImage: `url("${RINGS_PATTERN}")`, backgroundRepeat: 'no-repeat', backgroundSize: '100% 100%' }}
      />
      <div
        className="absolute -bottom-40 -left-28 w-[520px] h-[520px] opacity-55 rotate-3 mix-blend-multiply dark:mix-blend-screen"
        style={{ backgroundImage: `url("${RINGS_PATTERN}")`, backgroundRepeat: 'no-repeat', backgroundSize: '100% 100%' }}
      />
    </div>
  );
};
