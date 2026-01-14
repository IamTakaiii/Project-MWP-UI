import { useState, useCallback, useMemo } from 'react'
import {
  validateJson,
  prettifyJson,
  minifyJson,
  parseJson,
  SAMPLE_JSON,
  type ValidationResult,
} from '@/lib/json-utils'

export type FormatterMode = 'format' | 'diff' | 'query'
export type OutputView = 'text' | 'tree'

export interface DiffResult {
  type: 'added' | 'removed' | 'modified' | 'unchanged'
  path: string
  leftValue?: unknown
  rightValue?: unknown
}

export interface UseJsonFormatterReturn {
  // Mode
  mode: FormatterMode
  setMode: (mode: FormatterMode) => void
  outputView: OutputView
  setOutputView: (view: OutputView) => void

  // Input state
  input: string
  setInput: (value: string) => void
  output: string

  // Validation
  error: string | null
  isValid: boolean
  parsedJson: unknown | null
  validation: ValidationResult

  // Actions
  prettify: () => void
  minify: () => void
  clear: () => void
  loadSample: () => void

  // Query mode
  queryPath: string
  setQueryPath: (path: string) => void
  queryResult: unknown | null
  queryError: string | null
  executeQuery: () => void

  // Diff mode
  leftInput: string
  setLeftInput: (value: string) => void
  rightInput: string
  setRightInput: (value: string) => void
  leftError: string | null
  rightError: string | null
  diffResults: DiffResult[]
  compare: () => void
}

/**
 * Custom hook for JSON Formatter functionality
 * Requirements: 1.2, 1.3, 3.1, 4.1, 6.1, 6.2, 7.1, 7.2
 */
export function useJsonFormatter(): UseJsonFormatterReturn {
  // Mode state
  const [mode, setMode] = useState<FormatterMode>('format')
  const [outputView, setOutputView] = useState<OutputView>('text')

  // Format mode state
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  // Query mode state
  const [queryPath, setQueryPath] = useState('')
  const [queryResult, setQueryResult] = useState<unknown | null>(null)
  const [queryError, setQueryError] = useState<string | null>(null)

  // Diff mode state
  const [leftInput, setLeftInput] = useState('')
  const [rightInput, setRightInput] = useState('')
  const [diffResults, setDiffResults] = useState<DiffResult[]>([])

  // Validation - computed from input
  const validation = useMemo(() => validateJson(input), [input])
  const isValid = validation.isValid
  const error = validation.error
  const parsedJson = useMemo(() => parseJson(input), [input])

  // Diff validation
  const leftValidation = useMemo(() => validateJson(leftInput), [leftInput])
  const rightValidation = useMemo(() => validateJson(rightInput), [rightInput])
  const leftError = leftInput ? leftValidation.error : null
  const rightError = rightInput ? rightValidation.error : null

  /**
   * Prettify JSON with 2-space indentation
   * Requirements: 3.1, 3.2
   */
  const prettify = useCallback(() => {
    const result = prettifyJson(input)
    if (result.success) {
      setOutput(result.output)
    }
  }, [input])

  /**
   * Minify JSON by removing whitespace
   * Requirements: 4.1
   */
  const minify = useCallback(() => {
    const result = minifyJson(input)
    if (result.success) {
      setOutput(result.output)
    }
  }, [input])

  /**
   * Clear input and output
   * Requirements: 6.1, 6.2
   */
  const clear = useCallback(() => {
    setInput('')
    setOutput('')
    setQueryPath('')
    setQueryResult(null)
    setQueryError(null)
    setLeftInput('')
    setRightInput('')
    setDiffResults([])
  }, [])

  /**
   * Load sample JSON
   * Requirements: 7.1, 7.2
   */
  const loadSample = useCallback(() => {
    const sampleStr = JSON.stringify(SAMPLE_JSON, null, 2)
    setInput(sampleStr)
    setOutput('')
  }, [])

  /**
   * Execute JSONPath query
   * Requirements: 8.2, 8.3, 8.4, 8.5
   */
  const executeQuery = useCallback(() => {
    if (!isValid || !queryPath.trim()) {
      setQueryResult(null)
      setQueryError(queryPath.trim() ? 'กรุณาใส่ JSON ที่ถูกต้องก่อน' : null)
      return
    }

    // JSONPath query will be implemented in task 7
    // For now, just set placeholder
    setQueryResult(null)
    setQueryError('JSONPath query จะถูก implement ใน task 7')
  }, [isValid, queryPath])

  /**
   * Compare two JSON documents
   * Requirements: 9.2, 9.4, 9.5
   */
  const compare = useCallback(() => {
    if (!leftValidation.isValid || !rightValidation.isValid) {
      setDiffResults([])
      return
    }

    // Diff comparison will be implemented in task 8
    // For now, just set placeholder
    setDiffResults([])
  }, [leftValidation.isValid, rightValidation.isValid])

  return {
    // Mode
    mode,
    setMode,
    outputView,
    setOutputView,

    // Input state
    input,
    setInput,
    output,

    // Validation
    error: input ? error : null,
    isValid,
    parsedJson,
    validation,

    // Actions
    prettify,
    minify,
    clear,
    loadSample,

    // Query mode
    queryPath,
    setQueryPath,
    queryResult,
    queryError,
    executeQuery,

    // Diff mode
    leftInput,
    setLeftInput,
    rightInput,
    setRightInput,
    leftError,
    rightError,
    diffResults,
    compare,
  }
}
