/**
 * JSON Utilities for JSON Formatter
 * Provides validation, prettify, and minify functions
 */

import { JSONPath } from 'jsonpath-plus'

export interface ValidationResult {
  isValid: boolean
  error: string | null
  lineNumber?: number
}

export interface FormatResult {
  success: boolean
  output: string
  error: string | null
}

export interface QueryResult {
  success: boolean
  result: unknown | null
  error: string | null
}

export interface DiffResult {
  type: 'added' | 'removed' | 'modified' | 'unchanged'
  path: string
  leftValue?: unknown
  rightValue?: unknown
}

export interface DiffComparisonResult {
  success: boolean
  results: DiffResult[]
  error: string | null
}

/**
 * Validates JSON string and returns detailed error information
 * Requirements: 2.1, 2.2, 2.3
 */
export function validateJson(input: string): ValidationResult {
  if (!input.trim()) {
    return {
      isValid: false,
      error: 'กรุณาใส่ JSON ก่อน',
    }
  }

  try {
    JSON.parse(input)
    return {
      isValid: true,
      error: null,
    }
  } catch (e) {
    const error = e as SyntaxError
    const message = error.message

    // Try to extract line number from error message
    const lineMatch = message.match(/position (\d+)/)
    let lineNumber: number | undefined

    if (lineMatch) {
      const position = parseInt(lineMatch[1], 10)
      // Calculate line number from position
      const beforeError = input.substring(0, position)
      lineNumber = (beforeError.match(/\n/g) || []).length + 1
    }

    return {
      isValid: false,
      error: `JSON ไม่ถูกต้อง: ${message}`,
      lineNumber,
    }
  }
}

/**
 * Prettifies JSON with 2-space indentation
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */
export function prettifyJson(input: string): FormatResult {
  const validation = validateJson(input)

  if (!validation.isValid) {
    return {
      success: false,
      output: '',
      error: validation.error,
    }
  }

  try {
    const parsed = JSON.parse(input)
    const formatted = JSON.stringify(parsed, null, 2)
    return {
      success: true,
      output: formatted,
      error: null,
    }
  } catch (e) {
    const error = e as Error
    return {
      success: false,
      output: '',
      error: `JSON ไม่ถูกต้อง: ${error.message}`,
    }
  }
}

/**
 * Minifies JSON by removing all unnecessary whitespace
 * Requirements: 4.1, 4.2, 4.3
 */
export function minifyJson(input: string): FormatResult {
  const validation = validateJson(input)

  if (!validation.isValid) {
    return {
      success: false,
      output: '',
      error: validation.error,
    }
  }

  try {
    const parsed = JSON.parse(input)
    const minified = JSON.stringify(parsed)
    return {
      success: true,
      output: minified,
      error: null,
    }
  } catch (e) {
    const error = e as Error
    return {
      success: false,
      output: '',
      error: `JSON ไม่ถูกต้อง: ${error.message}`,
    }
  }
}

/**
 * Parses JSON and returns the parsed value or null
 */
export function parseJson(input: string): unknown | null {
  try {
    return JSON.parse(input)
  } catch {
    return null
  }
}

/**
 * Sample JSON for demonstration
 * Requirements: 7.2
 */
export const SAMPLE_JSON = {
  name: 'JSON Formatter',
  version: '1.0.0',
  features: ['prettify', 'minify', 'validate', 'query', 'diff'],
  config: {
    indentSize: 2,
    sortKeys: false,
  },
  users: [
    { id: 1, name: 'Alice', active: true },
    { id: 2, name: 'Bob', active: false },
  ],
  metadata: {
    created: '2024-01-15',
    updated: null,
  },
}

/**
 * Query JSON using JSONPath expression
 * Requirements: 8.2, 8.3, 8.4, 8.5
 */
export function queryJsonPath(json: unknown, path: string): QueryResult {
  if (!path.trim()) {
    return {
      success: false,
      result: null,
      error: 'กรุณาใส่ JSONPath query',
    }
  }

  try {
    const result = JSONPath({
      path,
      json: json as object | any[],
      wrap: false,
    })

    // Check if result is undefined or no matches found
    if (result === undefined) {
      return {
        success: true,
        result: null,
        error: 'ไม่พบข้อมูลที่ตรงกับ path นี้',
      }
    }

    return {
      success: true,
      result,
      error: null,
    }
  } catch (e) {
    const error = e as Error
    return {
      success: false,
      result: null,
      error: `JSONPath ไม่ถูกต้อง: ${error.message}`,
    }
  }
}

/**
 * Deep comparison of two JSON values to find differences
 * Requirements: 9.2, 9.4, 9.5
 */
export function compareJson(
  left: string,
  right: string
): DiffComparisonResult {
  // Validate both inputs
  const leftValidation = validateJson(left)
  const rightValidation = validateJson(right)

  if (!leftValidation.isValid) {
    return {
      success: false,
      results: [],
      error: `JSON ซ้าย: ${leftValidation.error}`,
    }
  }

  if (!rightValidation.isValid) {
    return {
      success: false,
      results: [],
      error: `JSON ขวา: ${rightValidation.error}`,
    }
  }

  try {
    const leftParsed = JSON.parse(left)
    const rightParsed = JSON.parse(right)

    const results: DiffResult[] = []

    // Perform deep comparison
    deepCompare(leftParsed, rightParsed, '$', results)

    return {
      success: true,
      results,
      error: null,
    }
  } catch (e) {
    const error = e as Error
    return {
      success: false,
      results: [],
      error: `เกิดข้อผิดพลาดในการเปรียบเทียบ: ${error.message}`,
    }
  }
}

/**
 * Recursively compare two values and collect differences
 */
function deepCompare(
  left: unknown,
  right: unknown,
  path: string,
  results: DiffResult[]
): void {
  // Check if values are identical
  if (JSON.stringify(left) === JSON.stringify(right)) {
    return
  }

  // Get types
  const leftType = getValueType(left)
  const rightType = getValueType(right)

  // If types differ, it's a modification
  if (leftType !== rightType) {
    results.push({
      type: 'modified',
      path,
      leftValue: left,
      rightValue: right,
    })
    return
  }

  // Handle objects
  if (leftType === 'object' && rightType === 'object') {
    const leftObj = left as Record<string, unknown>
    const rightObj = right as Record<string, unknown>

    const leftKeys = Object.keys(leftObj)
    const rightKeys = Object.keys(rightObj)
    const allKeys = new Set([...leftKeys, ...rightKeys])

    for (const key of allKeys) {
      const newPath = `${path}.${key}`
      const hasLeft = key in leftObj
      const hasRight = key in rightObj

      if (hasLeft && !hasRight) {
        // Key removed
        results.push({
          type: 'removed',
          path: newPath,
          leftValue: leftObj[key],
        })
      } else if (!hasLeft && hasRight) {
        // Key added
        results.push({
          type: 'added',
          path: newPath,
          rightValue: rightObj[key],
        })
      } else {
        // Key exists in both, recurse
        deepCompare(leftObj[key], rightObj[key], newPath, results)
      }
    }
    return
  }

  // Handle arrays
  if (leftType === 'array' && rightType === 'array') {
    const leftArr = left as unknown[]
    const rightArr = right as unknown[]

    const maxLength = Math.max(leftArr.length, rightArr.length)

    for (let i = 0; i < maxLength; i++) {
      const newPath = `${path}[${i}]`

      if (i < leftArr.length && i < rightArr.length) {
        // Both have element at this index
        deepCompare(leftArr[i], rightArr[i], newPath, results)
      } else if (i < leftArr.length) {
        // Left has element, right doesn't
        results.push({
          type: 'removed',
          path: newPath,
          leftValue: leftArr[i],
        })
      } else {
        // Right has element, left doesn't
        results.push({
          type: 'added',
          path: newPath,
          rightValue: rightArr[i],
        })
      }
    }
    return
  }

  // Primitive values that differ
  results.push({
    type: 'modified',
    path,
    leftValue: left,
    rightValue: right,
  })
}

/**
 * Get the type of a value for comparison purposes
 */
function getValueType(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}
