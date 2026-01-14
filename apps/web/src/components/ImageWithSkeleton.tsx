import { useState, useEffect, CSSProperties } from 'react'

export const ImageWithSkeleton = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  
  // Reset loaded state when src changes
  useEffect(() => {
    setLoaded(false)
    setError(false)
  }, [src])

  const [style] = useState(() => {
    const duration = 1500
    const offset = Date.now() % duration
    return { '--skeleton-delay': `-${offset}ms` } as CSSProperties
  })

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      {!loaded && !error && (
        <div 
          className="absolute inset-0 skeleton-shimmer flex items-center justify-center z-10"
          style={style}
        >
          <svg className="w-8 h-8 text-gray-400 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-400 z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs font-medium opacity-70">Load Failed</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(true)
            setError(true)
          }}
          loading="lazy"
        />
      )}
    </div>
  )
}
