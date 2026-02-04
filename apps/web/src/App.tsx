import { useState, useEffect } from 'react'
import { useQueryParams, StringParam, NumberParam, withDefault } from 'use-query-params'
import { VirtuosoGrid } from 'react-virtuoso'
import { saveAs } from 'file-saver'
import { generateIds } from './utils/random'
import { ImageWithSkeleton } from './components/ImageWithSkeleton'
import { DebouncedInput } from './components/DebouncedInput'
import { PowerOfTwoSlider } from './components/PowerOfTwoSlider'
import { GridList, GridItem } from './components/GridComponents'
import { DEFAULT_CONFIG } from './constants'

function App() {
  const [query, setQuery] = useQueryParams({
    format: withDefault(StringParam, DEFAULT_CONFIG.format),
    baseUrl: withDefault(StringParam, DEFAULT_CONFIG.baseUrl),
    size: withDefault(NumberParam, DEFAULT_CONFIG.size),
    bg: StringParam,
  })

  const { format, baseUrl, size, bg } = query
  const [ids, setIds] = useState<string[]>([])
  const [isConfigOpen, setIsConfigOpen] = useState(false)

  useEffect(() => {
    setIds(generateIds(50))
  }, [])

  const loadMore = () => {
    // Simulate network delay slightly to show loading state if needed, 
    // but for local generation it's instant.
    // Adding more items for infinite scroll
    setTimeout(() => {
      setIds(prev => [...prev, ...generateIds(20)])
    }, 200)
  }

  const getImageUrl = (id: string) => {
    let url = `${baseUrl}/${id}.${format}?s=${size}`
    if (bg) {
      url += `&bg=${encodeURIComponent(bg)}`
    }
    return url
  }

  const handleDownload = async (id: string) => {
    const url = getImageUrl(id)
    const filename = `avatar-${id}-${size}.${format}`
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      saveAs(blob, filename)
    } catch (error) {
      console.error('Download failed:', error)
      // Fallback for simple download if fetch fails (e.g. CORS)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const handleCopy = async (id: string) => {
    const url = getImageUrl(id)
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
      } else {
        throw new Error('Clipboard API not available')
      }
    } catch (err) {
      console.error('Failed to copy, trying fallback:', err)
      const textArea = document.createElement('textarea')
      textArea.value = url
      // Avoid scrolling to bottom
      textArea.style.top = '0'
      textArea.style.left = '0'
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand('copy')
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr)
      }
      
      document.body.removeChild(textArea)
    }
  }

  const reset = () => {
    setQuery({
      format: DEFAULT_CONFIG.format,
      baseUrl: DEFAULT_CONFIG.baseUrl,
      size: DEFAULT_CONFIG.size,
      bg: undefined
    })
  }

  return (
    <div className={`min-h-screen bg-gray-50 p-4 md:p-8 md:pb-8 ${isConfigOpen ? 'pb-96' : 'pb-24'}`}>
      <div className="w-full mx-auto h-full flex flex-col">
        <div className="flex-shrink-0 md:w-full md:max-w-7xl md:mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Ugly Avatar Gallery</h1>
        </div>
          
        <div className="
          fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]
          md:sticky md:top-4 md:bottom-auto md:left-auto md:right-auto md:bg-white/90 md:border md:shadow-xl md:rounded-lg md:p-6 md:mb-8 md:z-30 md:backdrop-blur-md transition-all
          md:w-full md:max-w-7xl md:mx-auto
        ">
            <div 
              className="flex justify-between items-center md:hidden cursor-pointer select-none"
              onClick={() => setIsConfigOpen(!isConfigOpen)}
            >
              <h2 className="font-bold text-gray-700 flex items-center gap-2">
                Configuration
                <svg 
                  className={`w-4 h-4 transition-transform ${isConfigOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </h2>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  reset()
                }} 
                className="text-sm text-indigo-600 font-medium"
              >
                Reset
              </button>
            </div>

            <div className={`grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr_1fr_1.5fr_auto] md:gap-6 items-end ${isConfigOpen ? 'mt-4' : 'hidden md:grid'}`}>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Base URL</label>
                <DebouncedInput
                  type="text"
                  value={baseUrl}
                  onChange={(val) => setQuery({ baseUrl: val })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="http://localhost:3000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                <select
                  value={format}
                  onChange={(e) => setQuery({ format: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {['svg', 'png', 'jpg', 'webp', 'avif', 'gif'].map(f => (
                    <option key={f} value={f}>{f.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size (px)</label>
                <PowerOfTwoSlider
                  value={size}
                  onChange={(val) => setQuery({ size: val })}
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
                <div className="flex gap-2">
                  <DebouncedInput
                    type="text"
                    value={bg || ''}
                    onChange={(val) => setQuery({ bg: val || undefined })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Random"
                  />
                  <DebouncedInput
                    type="color"
                    value={bg?.startsWith('#') ? bg : '#ffffff'}
                    onChange={(val) => setQuery({ bg: val })}
                    className="h-[42px] w-[42px] p-1 border border-gray-300 rounded-md cursor-pointer"
                    debounce={200} // Faster debounce for color picker
                  />
                </div>
              </div>

              <div className="hidden md:block">
                <button 
                  onClick={reset} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        {/* </header> removed to allow sticky positioning */}

        <div className="flex-grow">
          <VirtuosoGrid
            useWindowScroll
            totalCount={ids.length}
            endReached={loadMore}
            overscan={200}
            components={{
              List: GridList,
              Item: GridItem,
            }}
            itemContent={(index) => {
              const id = ids[index]
              return (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-100 relative group">
                    <ImageWithSkeleton
                      src={getImageUrl(id)}
                      alt={`Avatar ${id}`}
                      className="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 gap-2 pointer-events-none md:pointer-events-auto">
                      <span className="text-xs font-mono bg-white/90 px-2 py-1 rounded shadow-sm">{id}</span>
                    </div>
                    
                    <div className="absolute bottom-2 right-2 flex gap-2 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopy(id)
                        }}
                        className="bg-white/90 p-2 rounded-full shadow-sm text-gray-700 hover:text-indigo-600 transition-colors"
                        title="Copy URL"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(id)
                        }}
                        className="bg-white/90 p-2 rounded-full shadow-sm text-gray-700 hover:text-indigo-600 transition-colors"
                        title="Download"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default App
