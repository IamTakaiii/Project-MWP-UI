import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  value: string
  onChange: (value: string) => void
  options: readonly ComboboxOption[]
  placeholder?: string
  className?: string
  required?: boolean
  formatValue?: (value: string) => string
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder = 'เลือกหรือพิมพ์...',
  className,
  required,
  formatValue,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync inputValue with value prop
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
    setIsOpen(true)
  }

  const handleBlur = () => {
    // Auto-format value on blur if formatValue function is provided
    if (formatValue && inputValue) {
      const formatted = formatValue(inputValue)
      if (formatted !== inputValue) {
        setInputValue(formatted)
        onChange(formatted)
      }
    }
  }

  const handleSelectOption = (option: ComboboxOption) => {
    setInputValue(option.value)
    onChange(option.value)
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'ArrowDown' && !isOpen) {
      setIsOpen(true)
    }
  }

  // Filter options based on input
  const filteredOptions = options.filter(
    (opt) =>
      opt.value.toLowerCase().includes(inputValue.toLowerCase()) ||
      opt.label.toLowerCase().includes(inputValue.toLowerCase())
  )

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          className={cn(
            'flex h-10 w-full rounded-xl border border-input bg-input px-3 py-2 pr-10 text-sm',
            'ring-offset-background placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'border-[rgba(255,255,255,0.15)] focus:border-ring'
          )}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95">
          <div className="max-h-[200px] overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                ไม่พบตัวเลือก
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors text-left',
                    value === option.value
                      ? 'bg-primary/20 text-primary'
                      : 'hover:bg-white/10'
                  )}
                >
                  <span>{option.label}</span>
                  <span className="text-muted-foreground text-xs font-mono">{option.value}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
