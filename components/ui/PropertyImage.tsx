'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Home } from 'lucide-react';

interface PropertyImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  unoptimized?: boolean;
  sizes?: string;
}

/**
 * A wrapper around next/image for property photos.
 *
 * - Renders an inline gray + Home icon fallback when src is empty or image fails
 * - Shows a shimmer loading state until the image is ready
 * - Always uses fill mode — caller must provide a sized, position:relative container
 */
export function PropertyImage({
  src,
  alt,
  className = 'object-cover',
  priority = false,
  unoptimized = false,
  sizes,
}: PropertyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  // Show fallback immediately for missing src OR after an error
  if (!src || errored) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <Home className="w-8 h-8 text-gray-300" aria-hidden="true" />
      </div>
    );
  }

  return (
    <>
      {/* Shimmer shown while image loads */}
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        priority={priority}
        unoptimized={unoptimized}
        sizes={sizes}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
      />
    </>
  );
}
