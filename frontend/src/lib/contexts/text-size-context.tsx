import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type TextSize = 'small' | 'medium' | 'large'

const TEXT_SIZE_KEY = 'text-size-preference'

const textSizeClasses: Record<TextSize, string> = {
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-lg',
}

interface TextSizeContextValue {
  textSize: TextSize
  setTextSize: (size: TextSize) => void
  textSizeClass: string
}

const TextSizeContext = createContext<TextSizeContextValue | null>(null)

function getStoredTextSize(): TextSize {
  try {
    const stored = localStorage.getItem(TEXT_SIZE_KEY)
    if (stored === 'small' || stored === 'medium' || stored === 'large') {
      return stored
    }
  } catch {
    // localStorage unavailable
  }
  return 'medium'
}

function storeTextSize(size: TextSize): void {
  try {
    localStorage.setItem(TEXT_SIZE_KEY, size)
  } catch {
    // localStorage unavailable
  }
}

interface TextSizeProviderProps {
  children: ReactNode
}

export function TextSizeProvider({ children }: TextSizeProviderProps) {
  const [textSize, setTextSizeState] = useState<TextSize>(getStoredTextSize)

  useEffect(() => {
    document.documentElement.classList.remove(
      textSizeClasses.small,
      textSizeClasses.medium,
      textSizeClasses.large
    )
    document.documentElement.classList.add(textSizeClasses[textSize])
  }, [textSize])

  function setTextSize(size: TextSize) {
    setTextSizeState(size)
    storeTextSize(size)
  }

  return (
    <TextSizeContext.Provider
      value={{
        textSize,
        setTextSize,
        textSizeClass: textSizeClasses[textSize],
      }}
    >
      {children}
    </TextSizeContext.Provider>
  )
}

export function useTextSize(): TextSizeContextValue {
  const context = useContext(TextSizeContext)
  if (!context) {
    throw new Error('useTextSize must be used within TextSizeProvider')
  }
  return context
}