import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

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
            <SyntaxHighlighter
              language="json"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '1rem',
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
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground font-mono">{placeholder}</p>
          </div>
        )}
      </div>
    </div>
  )
}
