import Editor from 'react-simple-code-editor'
import Prism from 'prismjs'
import 'prismjs/components/prism-json'
import 'prismjs/themes/prism-tomorrow.css'

export interface JsonViewerProps {
  value: string
  label?: string
  placeholder?: string
}

/**
 * JSON Viewer with syntax highlighting
 * Read-only display for formatted JSON output
 */
export function JsonViewer({
  value,
  label,
  placeholder = 'ผลลัพธ์จะแสดงที่นี่...',
}: JsonViewerProps) {
  const hasContent = value.trim().length > 0

  const highlightCode = (code: string) => {
    return Prism.highlight(code, Prism.languages.json, 'json')
  }

  return (
    <div className="space-y-3">
      {label && (
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground pb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {label}
        </label>
      )}

      <div className="relative w-full h-80 bg-muted/30 border border-border rounded-xl overflow-hidden">
        {hasContent ? (
          <div className="h-full overflow-auto">
            <Editor
              value={value}
              onValueChange={() => {}} // Read-only
              highlight={highlightCode}
              padding={16}
              readOnly={true}
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
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground font-mono">{placeholder}</p>
          </div>
        )}
      </div>
    </div>
  )
}
