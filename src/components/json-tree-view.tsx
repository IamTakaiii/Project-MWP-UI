import { useState } from 'react'
import {
  ChevronRight,
  ChevronDown,
  Braces,
  Brackets,
  Hash,
  Type,
  CheckCircle2,
  XCircle,
  Minus,
  Copy,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export interface JsonTreeViewProps {
  data: unknown
  onPathClick?: (path: string) => void
}

interface TreeNodeProps {
  name: string
  value: unknown
  path: string
  defaultExpanded?: boolean
  onPathClick?: (path: string) => void
}

/**
 * Get data type and corresponding icon/color
 */
function getTypeInfo(value: unknown): {
  type: string
  icon: React.ReactNode
  color: string
} {
  if (value === null) {
    return {
      type: 'null',
      icon: <Minus className="w-3 h-3" />,
      color: 'text-gray-500',
    }
  }

  if (Array.isArray(value)) {
    return {
      type: 'array',
      icon: <Brackets className="w-3 h-3" />,
      color: 'text-purple-500',
    }
  }

  const type = typeof value

  switch (type) {
    case 'object':
      return {
        type: 'object',
        icon: <Braces className="w-3 h-3" />,
        color: 'text-blue-500',
      }
    case 'string':
      return {
        type: 'string',
        icon: <Type className="w-3 h-3" />,
        color: 'text-green-500',
      }
    case 'number':
      return {
        type: 'number',
        icon: <Hash className="w-3 h-3" />,
        color: 'text-orange-500',
      }
    case 'boolean':
      return {
        type: 'boolean',
        icon: value ? (
          <CheckCircle2 className="w-3 h-3" />
        ) : (
          <XCircle className="w-3 h-3" />
        ),
        color: value ? 'text-emerald-500' : 'text-red-500',
      }
    default:
      return {
        type: 'unknown',
        icon: <Minus className="w-3 h-3" />,
        color: 'text-gray-500',
      }
  }
}

/**
 * Format value for display
 */
function formatValue(value: unknown): string {
  if (value === null) return 'null'
  if (typeof value === 'string') return `"${value}"`
  if (typeof value === 'boolean') return value.toString()
  if (typeof value === 'number') return value.toString()
  return ''
}

/**
 * Check if value is expandable (object or array)
 */
function isExpandable(value: unknown): boolean {
  return (
    value !== null &&
    (typeof value === 'object' || Array.isArray(value))
  )
}

/**
 * Get size info for objects and arrays
 */
function getSizeInfo(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.length}]`
  }
  if (value !== null && typeof value === 'object') {
    const keys = Object.keys(value)
    return `{${keys.length}}`
  }
  return ''
}

/**
 * Recursive TreeNode component
 * Requirements: 11.2, 11.3, 11.4, 11.5
 */
function TreeNode({
  name,
  value,
  path,
  defaultExpanded = false,
  onPathClick,
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const typeInfo = getTypeInfo(value)
  const expandable = isExpandable(value)
  const sizeInfo = getSizeInfo(value)

  const handleToggle = () => {
    if (expandable) {
      setIsExpanded(!isExpanded)
    }
  }

  const handlePathClick = () => {
    if (onPathClick) {
      onPathClick(path)
    }
  }

  return (
    <div className="font-mono text-sm">
      {/* Node Header */}
      <div
        className="flex items-center gap-2 py-1 px-2 hover:bg-muted/50 rounded cursor-pointer group"
        onClick={handleToggle}
      >
        {/* Expand/Collapse Icon */}
        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
          {expandable ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )
          ) : (
            <span className="w-4" />
          )}
        </div>

        {/* Type Icon */}
        <div className={`flex-shrink-0 ${typeInfo.color}`}>
          {typeInfo.icon}
        </div>

        {/* Key Name */}
        <span className="text-foreground font-semibold">{name}:</span>

        {/* Value or Size Info */}
        {expandable ? (
          <span className="text-muted-foreground text-xs ml-1">
            {sizeInfo}
          </span>
        ) : (
          <span className="text-muted-foreground ml-1">
            {formatValue(value)}
          </span>
        )}

        {/* JSONPath with Tooltip (shown on hover) - Requirements: 11.6 */}
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePathClick()
                }}
                className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-xs text-primary hover:underline flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                {path}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">คลิกเพื่อคัดลอก JSONPath</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Children (if expanded) */}
      {expandable && isExpanded && (
        <div className="ml-6 border-l border-border pl-2">
          {Array.isArray(value) ? (
            // Array items
            value.map((item, index) => (
              <TreeNode
                key={index}
                name={`[${index}]`}
                value={item}
                path={`${path}[${index}]`}
                onPathClick={onPathClick}
              />
            ))
          ) : (
            // Object properties
            Object.entries(value as Record<string, unknown>).map(
              ([key, val]) => (
                <TreeNode
                  key={key}
                  name={key}
                  value={val}
                  path={`${path}.${key}`}
                  onPathClick={onPathClick}
                />
              )
            )
          )}
        </div>
      )}
    </div>
  )
}

/**
 * JSON Tree View Component
 * Displays JSON as an interactive collapsible tree structure
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 */
export function JsonTreeView({ data, onPathClick }: JsonTreeViewProps) {
  if (data === null || data === undefined) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        ไม่มีข้อมูลที่จะแสดง
      </div>
    )
  }

  return (
    <div className="w-full h-80 bg-muted/30 border border-border rounded-xl overflow-auto p-4">
      <TreeNode
        name="root"
        value={data}
        path="$"
        defaultExpanded={true}
        onPathClick={onPathClick}
      />
    </div>
  )
}
