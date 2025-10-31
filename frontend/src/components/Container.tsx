import React, { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge' // 1. Import the helper

interface ContainerProps {
  children: ReactNode
  className?: string
}

const Container: React.FC<ContainerProps> = ({ children, className }) => {
  // 2. Define base classes
  const baseClasses = 'max-w-7xl mx-auto border-l border-r border-zinc-200 dark:border-[#27272a]'

  return (
    // 3. Merge base classes with incoming className
    <div className={twMerge(baseClasses, className)}>{children}</div>
  )
}

export default Container