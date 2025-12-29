import { useState, useEffect, useRef } from 'react'
import { DebouncedInput } from './DebouncedInput'

export const PowerOfTwoSlider = ({ value, onChange }: { value: number, onChange: (val: number) => void }) => {
  // Ensure value is within bounds for log calculation, default to 16 if invalid
  const safeValue = Math.max(16, Math.min(2048, value || 16))
  // Calculate exponent for slider position (4 to 11)
  const exponent = Math.log2(safeValue)
  // Round to nearest integer for slider display
  const sliderValue = Math.max(4, Math.min(11, Math.round(exponent)))

  const [localExponent, setLocalExponent] = useState(sliderValue)
  const isFirstRender = useRef(true)

  useEffect(() => {
    setLocalExponent(sliderValue)
  }, [sliderValue])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const timer = setTimeout(() => {
      const newValue = Math.pow(2, localExponent)
      if (newValue !== safeValue) {
        onChange(newValue)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [localExponent])

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalExponent(parseInt(e.target.value))
  }

  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min="4"
        max="11"
        step="1"
        value={localExponent}
        onChange={handleSliderChange}
        className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
      <DebouncedInput
        type="number"
        value={value}
        onChange={(val) => onChange(Number(val))}
        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
        min="16"
        max="2048"
      />
    </div>
  )
}
