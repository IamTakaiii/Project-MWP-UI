/**
 * JSON Utilities for JSON Formatter
 * Provides validation, prettify, and minify functions
 */

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
