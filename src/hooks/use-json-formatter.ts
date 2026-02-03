import { useState, useCallback, useMemo, useEffect } from "react";
import {
  validateJson,
  prettifyJson,
  minifyJson,
  parseJson,
  queryJsonPath,
  compareJson,
  SAMPLE_JSON,
  type ValidationResult,
  type DiffResult,
} from "@/lib/json-utils";

export type FormatterMode = "format" | "diff" | "query";
export type OutputView = "text" | "tree";

export interface UseJsonFormatterReturn {
  // Mode
  mode: FormatterMode;
  setMode: (mode: FormatterMode) => void;
  outputView: OutputView;
  setOutputView: (view: OutputView) => void;

  // Input state
  input: string;
  setInput: (value: string) => void;
  output: string;

  // Validation
  error: string | null;
  isValid: boolean;
  parsedJson: unknown | null;
  validation: ValidationResult;

  // Actions
  prettify: () => void;
  minify: () => void;
  clear: () => void;
  loadSample: () => void;
  copyToClipboard: () => Promise<void>;
  downloadJson: () => void;
  isCopied: boolean;

  // Query mode
  queryPath: string;
  setQueryPath: (path: string) => void;
  queryResult: unknown | null;
  queryError: string | null;
  executeQuery: () => void;

  // Diff mode
  leftInput: string;
  setLeftInput: (value: string) => void;
  rightInput: string;
  setRightInput: (value: string) => void;
  leftError: string | null;
  rightError: string | null;
  diffResults: DiffResult[];
  compare: () => void;
}

/**
 * Custom hook for JSON Formatter functionality
 * Requirements: 1.2, 1.3, 3.1, 4.1, 6.1, 6.2, 7.1, 7.2
 */
export function useJsonFormatter(): UseJsonFormatterReturn {
  // Mode state
  const [mode, setMode] = useState<FormatterMode>("format");
  const [outputView, setOutputView] = useState<OutputView>("text");

  // Format mode state
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  // Query mode state
  const [queryPath, setQueryPath] = useState("");
  const [queryResult, setQueryResult] = useState<unknown | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  // Diff mode state
  const [leftInput, setLeftInput] = useState("");
  const [rightInput, setRightInput] = useState("");
  const [diffResults, setDiffResults] = useState<DiffResult[]>([]);

  // Copy state
  const [isCopied, setIsCopied] = useState(false);

  // Validation - computed from input
  const validation = useMemo(() => validateJson(input), [input]);
  const isValid = validation.isValid;
  const error = validation.error;
  const parsedJson = useMemo(() => parseJson(input), [input]);

  // Diff validation
  const leftValidation = useMemo(() => validateJson(leftInput), [leftInput]);
  const rightValidation = useMemo(() => validateJson(rightInput), [rightInput]);
  const leftError = leftInput ? leftValidation.error : null;
  const rightError = rightInput ? rightValidation.error : null;

  /**
   * Prettify JSON with 2-space indentation
   * Requirements: 3.1, 3.2
   */
  const prettify = useCallback(() => {
    const result = prettifyJson(input);
    if (result.success) {
      setOutput(result.output);
    }
  }, [input]);

  /**
   * Minify JSON by removing whitespace
   * Requirements: 4.1
   */
  const minify = useCallback(() => {
    const result = minifyJson(input);
    if (result.success) {
      setOutput(result.output);
    }
  }, [input]);

  /**
   * Clear input and output
   * Requirements: 6.1, 6.2
   */
  const clear = useCallback(() => {
    setInput("");
    setOutput("");
    setQueryPath("");
    setQueryResult(null);
    setQueryError(null);
    setLeftInput("");
    setRightInput("");
    setDiffResults([]);
  }, []);

  /**
   * Load sample JSON
   * Requirements: 7.1, 7.2
   */
  const loadSample = useCallback(() => {
    const sampleStr = JSON.stringify(SAMPLE_JSON, null, 2);
    setInput(sampleStr);
    setOutput("");
  }, []);

  /**
   * Copy output to clipboard
   * Requirements: 5.1, 5.2, 5.3
   */
  const copyToClipboard = useCallback(async () => {
    if (!output) {
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setIsCopied(true);

      // Reset after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [output]);

  /**
   * Download output as JSON file
   * Requirements: 10.1, 10.2, 10.3
   */
  const downloadJson = useCallback(() => {
    if (!output) {
      return;
    }

    try {
      // Create blob from output
      const blob = new Blob([output], { type: "application/json" });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "formatted.json";

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download:", error);
    }
  }, [output]);

  /**
   * Execute JSONPath query
   * Requirements: 8.2, 8.3, 8.4, 8.5
   */
  const executeQuery = useCallback(() => {
    if (!isValid || !parsedJson) {
      setQueryResult(null);
      setQueryError("กรุณาใส่ JSON ที่ถูกต้องก่อน");
      return;
    }

    if (!queryPath.trim()) {
      setQueryResult(null);
      setQueryError(null);
      return;
    }

    const result = queryJsonPath(parsedJson, queryPath);

    if (result.success) {
      setQueryResult(result.result);
      setQueryError(result.error); // This will be the "no results" message if applicable
    } else {
      setQueryResult(null);
      setQueryError(result.error);
    }
  }, [isValid, parsedJson, queryPath]);

  /**
   * Compare two JSON documents
   * Requirements: 9.2, 9.4, 9.5
   */
  const compare = useCallback(() => {
    if (!leftValidation.isValid || !rightValidation.isValid) {
      setDiffResults([]);
      return;
    }

    const result = compareJson(leftInput, rightInput);

    if (result.success) {
      setDiffResults(result.results);
    } else {
      setDiffResults([]);
    }
  }, [leftInput, rightInput, leftValidation.isValid, rightValidation.isValid]);

  // Auto-compare when both inputs are valid
  useEffect(() => {
    if (
      mode === "diff" &&
      leftInput &&
      rightInput &&
      leftValidation.isValid &&
      rightValidation.isValid
    ) {
      compare();
    } else if (mode === "diff") {
      setDiffResults([]);
    }
  }, [
    mode,
    leftInput,
    rightInput,
    leftValidation.isValid,
    rightValidation.isValid,
    compare,
  ]);

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
    copyToClipboard,
    downloadJson,
    isCopied,

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
  };
}
