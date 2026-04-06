import React, { useState } from 'react';

export const Logo = ({ className = "" }: { className?: string }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {!imgError ? (
        <img 
          src="/logo.png" 
          alt="inSaju Logo" 
          className="h-8 md:h-10 object-contain"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="text-xl font-bold tracking-tighter text-[var(--text-main)]">
          inSaju
        </div>
      )}
    </div>
  );
};
