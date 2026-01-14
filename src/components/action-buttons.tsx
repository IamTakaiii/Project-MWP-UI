import { Button } from '@/components/ui/button'
import {
  Sparkles,
  Minimize2,
  Copy,
  Download,
  Trash2,
  FileJson,
  Check,
} from 'lucide-react'

export interface ActionButtonsProps {
  onPrettify: () => void
  onMinify: () => void
  onCopy: () => void
  onDownload: () => void
  onClear: () => void
  onLoadSample: () => void
  disabled?: boolean
  hasOutput?: boolean
  isCopied?: boolean
}

/**
 * Action buttons for JSON formatting operations
 * Requirements: 3.1, 4.1, 5.1, 6.1, 7.1, 10.1
 */
export function ActionButtons({
  onPrettify,
  onMinify,
  onCopy,
  onDownload,
  onClear,
  onLoadSample,
  disabled = false,
  hasOutput = false,
  isCopied = false,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* Primary Actions */}
      <Button
        onClick={onPrettify}
        disabled={disabled}
        variant="default"
        size="sm"
        className="gap-2"
      >
        <Sparkles className="w-4 h-4" />
        Prettify
      </Button>

      <Button
        onClick={onMinify}
        disabled={disabled}
        variant="default"
        size="sm"
        className="gap-2"
      >
        <Minimize2 className="w-4 h-4" />
        Minify
      </Button>

      {/* Secondary Actions */}
      <div className="w-px h-8 bg-border mx-1" />

      <Button
        onClick={onCopy}
        disabled={!hasOutput}
        variant="outline"
        size="sm"
        className={`gap-2 transition-colors ${
          isCopied
            ? 'border-emerald-500 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500'
            : ''
        }`}
      >
        {isCopied ? (
          <>
            <Check className="w-4 h-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copy
          </>
        )}
      </Button>

      <Button
        onClick={onDownload}
        disabled={!hasOutput}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        Download
      </Button>

      {/* Utility Actions */}
      <div className="w-px h-8 bg-border mx-1" />

      <Button
        onClick={onClear}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Trash2 className="w-4 h-4" />
        Clear
      </Button>

      <Button
        onClick={onLoadSample}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <FileJson className="w-4 h-4" />
        Sample
      </Button>
    </div>
  )
}
