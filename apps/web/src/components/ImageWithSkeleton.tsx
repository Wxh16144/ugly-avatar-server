import { useState, useEffect } from 'react'

export const ImageWithSkeleton = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [loaded, setLoaded] = useState(false)
  
  // Reset loaded state when src changes
  useEffect(() => {
    setLoaded(false)
  }, [src])

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 skeleton-shimmer flex items-center justify-center z-10">
          <svg className="w-8 h-8 text-gray-400 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        loading="lazy"
      />
    </div>
  )
}
