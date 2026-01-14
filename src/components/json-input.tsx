import { Textarea } from '@/components/ui/textarea'
import { AlertCircle } from 'lucide-react'
import { useRef } from 'react'
import Editor from 'react-simple-code-editor'
import Prism from 'prismjs'
import 'prismjs/components/prism-json'
import 'prismjs/themes/prism-tomorrow.css'

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
  const editorRef = useRef<HTMLDivElement>(null)

  const highlightCode = (code: string) => {
    return Prism.highlight(code, Prism.languages.json, 'json')
  }

  return (
    <>
      {label && (
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground pb-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          {label}
        </label>
      )}

      <div className="relative w-full h-80">
        {enableHighlight && !error ? (
          <div 
            ref={editorRef}
            className={`
              w-full h-full rounded-xl border border-border overflow-auto
              ${error ? 'border-destructive' : ''}
            `}
          >
            <Editor
              value={value}
              onValueChange={onChange}
              highlight={highlightCode}
              padding={16}
              readOnly={readOnly}
              placeholder={placeholder}
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: '0.875rem',
                lineHeight: '1.5',
                minHeight: '100%',
                backgroundColor: 'transparent',
              }}
              textareaClassName="focus:outline-none"
            />
          </div>
        ) : (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            readOnly={readOnly}
            aria-invalid={!!error}
            className={`
              w-full h-full font-mono text-sm resize-none overflow-auto
              ${error ? 'border-destructive' : ''}
            `}
          />
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg mt-3">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </>
  )
}
