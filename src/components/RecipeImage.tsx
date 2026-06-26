'use client';

import { useState } from 'react';

interface Props {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  priority?: boolean;
}

export default function RecipeImage({ src, alt, className = '', fallback, priority = false }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!src || error) return <>{fallback ?? null}</>;

  return (
    <img
      src={src}
      alt={alt}
      className={`lazy-img ${loaded ? 'lazy-loaded' : ''} ${className}`}
      loading={priority ? 'eager' : 'lazy'}
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
    />
  );
}
