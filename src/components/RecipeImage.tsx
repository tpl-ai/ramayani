'use client';

import { useState } from 'react';

interface Props {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  eager?: boolean;
}

export default function RecipeImage({ src, alt, className = '', fallback, eager = false }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!src || error) return <>{fallback ?? null}</>;

  return (
    <img
      src={src}
      alt={alt}
      className={`img-fade${loaded ? ' loaded' : ''} ${className}`}
      loading={eager ? 'eager' : 'lazy'}
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
    />
  );
}
