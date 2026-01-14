import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook for managing state with localStorage persistence
 * Supports both simple strings and complex types (arrays, objects, booleans)
 */
export function useLocalStorage<T = string>(
  key: string, 
  initialValue: T
): [T, (value: T) => void] {
  // Check if we're dealing with a simple string or complex type
  const isSimpleString = typeof initialValue === 'string'

  // Initialize state with value from localStorage or initialValue
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved === null) {
        return initialValue
      }
      
      // For simple strings, return as-is
      if (isSimpleString) {
        return saved as T
      }
      
      // For complex types, parse JSON
      try {
        return JSON.parse(saved) as T
      } catch {
        // If parsing fails, return initialValue
        return initialValue
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Update localStorage whenever value changes
  useEffect(() => {
    try {
      if (isSimpleString) {
        localStorage.setItem(key, value as string)
      } else {
        localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, value, isSimpleString])

  const setStoredValue = useCallback((newValue: T) => {
    setValue(newValue)
  }, [])

  return [value, setStoredValue]
}
