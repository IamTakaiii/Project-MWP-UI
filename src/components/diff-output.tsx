import { Plus, Minus, Edit, CheckCircle2 } from 'lucide-react'
import type { DiffResult } from '@/lib/json-utils'

interface DiffOutputProps {
  results: DiffResult[]
}

export function DiffOutput({ results }: DiffOutputProps) {
  if (results.length === 0) {
    return (
      <div className="p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex flex-col items-center justify-center gap-2">
        <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
          ไม่พบความแตกต่าง
        </p>
        <p className="text-xs text-muted-foreground">
          JSON ทั้งสองชุดเหมือนกันทุกประการ
        </p>
      </div>
    )
  }

  // Group results by type
  const added = results.filter(r => r.type === 'added')
  const removed = results.filter(r => r.type === 'removed')
  const modified = results.filter(r => r.type === 'modified')

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4 p-4 bg-muted/30 border border-border rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">สรุป:</span>
        </div>
        {added.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm text-emerald-700 dark:text-emerald-300">
              เพิ่ม {added.length}
            </span>
          </div>
        )}
        {removed.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Minus className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-sm text-red-700 dark:text-red-300">
              ลบ {removed.length}
            </span>
          </div>
        )}
        {modified.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Edit className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm text-amber-700 dark:text-amber-300">
              แก้ไข {modified.length}
            </span>
          </div>
        )}
      </div>

      {/* Detailed Changes */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {/* Added Items */}
        {added.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              เพิ่มใหม่ ({added.length})
            </h3>
            {added.map((result, index) => (
              <DiffItem key={`added-${index}`} result={result} />
            ))}
          </div>
        )}

        {/* Modified Items */}
        {modified.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-2">
              <Edit className="w-4 h-4" />
              แก้ไข ({modified.length})
            </h3>
            {modified.map((result, index) => (
              <DiffItem key={`modified-${index}`} result={result} />
            ))}
          </div>
        )}

        {/* Removed Items */}
        {removed.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
              <Minus className="w-4 h-4" />
              ลบออก ({removed.length})
            </h3>
            {removed.map((result, index) => (
              <DiffItem key={`removed-${index}`} result={result} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DiffItem({ result }: { result: DiffResult }) {
  return (
    <div
      className={`
        p-3 rounded-lg border
        ${result.type === 'added' 
          ? 'bg-emerald-500/10 border-emerald-500/30' 
          : result.type === 'removed'
          ? 'bg-red-500/10 border-red-500/30'
          : 'bg-amber-500/10 border-amber-500/30'
        }
      `}
    >
      {/* Path */}
      <div className="font-mono text-xs text-muted-foreground mb-2">
        {result.path}
      </div>

      {/* Values */}
      <div className="space-y-1">
        {result.type === 'added' && (
          <div className="flex items-start gap-2">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              ค่าใหม่:
            </span>
            <div className="font-mono text-sm text-emerald-700 dark:text-emerald-300 flex-1">
              {formatValue(result.rightValue)}
            </div>
          </div>
        )}
        
        {result.type === 'removed' && (
          <div className="flex items-start gap-2">
            <span className="text-xs text-red-600 dark:text-red-400 font-medium mt-0.5">
              ค่าเดิม:
            </span>
            <div className="font-mono text-sm text-red-700 dark:text-red-300 flex-1">
              {formatValue(result.leftValue)}
            </div>
          </div>
        )}
        
        {result.type === 'modified' && (
          <>
            <div className="flex items-start gap-2">
              <span className="text-xs text-red-600 dark:text-red-400 font-medium mt-0.5">
                เดิม:
              </span>
              <div className="font-mono text-sm text-red-700 dark:text-red-300 flex-1">
                {formatValue(result.leftValue)}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                ใหม่:
              </span>
              <div className="font-mono text-sm text-emerald-700 dark:text-emerald-300 flex-1">
                {formatValue(result.rightValue)}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function formatValue(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return `"${value}"`
  if (typeof value === 'object') {
    const str = JSON.stringify(value, null, 2)
    // If it's a short object/array, show inline
    if (str.length < 100) return str
    // Otherwise show first line with ellipsis
    return str.split('\n')[0] + '...'
  }
  return String(value)
}
