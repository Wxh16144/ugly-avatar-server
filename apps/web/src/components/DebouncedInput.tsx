import { useState, useEffect, useRef } from 'react'

// Debounced Input Component
// Note: We use setTimeout for debouncing instead of useTransition because useTransition 
// is for CPU-bound updates, while here we want to prevent excessive network requests (IO-bound).
export const DebouncedInput = ({ 
  value, 
  onChange, 
  debounce = 500,
  ...props 
}: { 
  value: string | number | undefined;
  onChange: (val: string) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>) => {
  const [localValue, setLocalValue] = useState<string | number | undefined>(value)
  const isFirstRender = useRef(true)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(String(localValue || ''))
      }
    }, debounce)

    return () => clearTimeout(timer)
  }, [localValue, debounce]) // Intentionally omitting onChange/value to avoid loops, logic relies on localValue change

  return (
    <input
      {...props}
      value={localValue === undefined ? '' : localValue}
      onChange={(e) => setLocalValue(e.target.value)}
    />
  )
}
