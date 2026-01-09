import React from 'react';
import { ServiceCategory } from '../types';

type PlaceholderType = 'service' | 'stylist' | 'hero' | 'abstract';

interface ImagePlaceholderProps {
  type: PlaceholderType;
  className?: string;
  seed?: string;
  category?: ServiceCategory;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({ type, className = "", seed = "1", category }) => {
  const rotation = (seed.length * 13) % 360;
  
  const getServiceArt = () => {
    switch (category) {
      case ServiceCategory.HAIRCUT:
        return (
          <g className="text-brand-500">
             <path d="M10 10 L90 90 M90 10 L10 90" stroke="currentColor" strokeWidth="1" opacity="0.6" />
             <rect x="30" y="30" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" transform={`rotate(${rotation} 50 50)`} />
             <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </g>
        );
      case ServiceCategory.COLOR:
        return (
          <g className="text-brand-400">
             <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
             <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="10 5" />
             <circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.2" />
          </g>
        );
      case ServiceCategory.TREATMENT:
        return (
          <g className="text-brand-300">
            <path d="M50 10 V90 M10 50 H90" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            <rect x="25" y="25" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
          </g>
        );
      default:
        return (
          <g className="text-zinc-500">
            <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <path d="M10 10 L90 90 M90 10 L10 90" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
          </g>
        );
    }
  };

  const getArt = () => {
    if (type === 'service' && category) return getServiceArt();

    switch (type) {
      case 'stylist':
        return (
          <g transform={`rotate(${rotation} 50 50)`}>
             <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-zinc-600" />
             <path d="M50 5 V95 M5 50 H95" stroke="currentColor" strokeWidth="1" className="text-brand-500" />
          </g>
        );
      case 'hero':
        return (
          <g>
            <defs>
              <pattern id="premiumGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-zinc-800"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#premiumGrid)" />
            <circle cx="50%" cy="50%" r="30%" fill="currentColor" className="text-brand-500/5 blur-[120px]" />
          </g>
        );
      default:
        return getServiceArt();
    }
  };

  return (
    <div className={`overflow-hidden relative ${className}`}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        {getArt()}
      </svg>
    </div>
  );
};