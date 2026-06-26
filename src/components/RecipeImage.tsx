'use client';

import { useState } from 'react';

interface RecipeImageProps {
  photo: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  onLoadSuccess?: () => void;
  onLoadError?: () => void;
}

export default function RecipeImage({
  photo,
  alt,
  className,
  fallback,
  onLoadSuccess,
  onLoadError,
}: RecipeImageProps) {
  const [error, setError] = useState(false);

  if (!photo || error) {
    return <>{fallback ?? null}</>;
  }

  return (
    <img
      src={`/images/${photo}`}
      alt={alt}
      className={className}
      loading="lazy"
      onLoad={onLoadSuccess}
      onError={() => {
        setError(true);
        onLoadError?.();
      }}
    />
  );
}
