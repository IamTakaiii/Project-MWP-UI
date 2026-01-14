import { Textarea } from '@/components/ui/textarea'
import { AlertCircle } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useState, useRef } from 'react'

export interface JsonInputProps {
  value: string
  onChange: (value: string) => void
  error?: string | null
  placeholder?: string
  label?: string
  readOnly?: boolean
  enableHighlight?: boolean
}

/**
 * JSON Input component with validation error display and optional syntax highlighting
 * Requirements: 1.1, 1.4, 2.4
 */
export function JsonInput({
  value,
  onChange,
  error,
  placeholder = 'วาง JSON ที่นี่...',
  label,
  readOnly = false,
  enableHighlight = true,
}: JsonInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Show syntax highlighting only when not focused and has valid JSON
  const showHighlight = enableHighlight && !isFocused && value && !error

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)

  return (
    <div className="space-y-3">
      {label && (
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground pb-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          {label}
        </label>
      )}

      <div className="relative w-full h-80">
        {/* Syntax Highlighted Background */}
        {showHighlight && (
          <div className="absolute inset-0 pointer-events-none overflow-auto rounded-xl border border-border">
            <SyntaxHighlighter
              language="json"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '0.75rem',
                background: 'transparent',
                fontSize: '0.875rem',
                lineHeight: '1.5',
              }}
              codeTagProps={{
                style: {
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                },
              }}
            >
              {value}
            </SyntaxHighlighter>
          </div>
        )}

        {/* Editable Textarea */}
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          readOnly={readOnly}
          aria-invalid={!!error}
          className={`
            w-full h-full font-mono text-sm resize-none
            ${showHighlight ? 'text-transparent caret-white' : ''}
            ${error ? 'border-destructive' : ''}
          `}
          style={{
            caretColor: showHighlight ? 'white' : 'auto',
          }}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  )
}
