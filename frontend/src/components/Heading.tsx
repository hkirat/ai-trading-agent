import React from 'react'
import { cn } from '@/lib/utils'

const Heading: React.FC<{
  heading: string
  showButton?: boolean
  buttonLink?: string
  className?: string
}> = ({ heading, showButton, buttonLink, className }) => {
  return (
    <div>
      <div
        className={cn(
          'text-foreground border-border bg-background flex items-center justify-between border-t-2 border-b-2 px-3 py-2 text-2xl font-semibold sm:px-[5%] sm:text-3xl md:py-3 md:text-4xl',
          className
        )}
      >
        <h1>{heading}</h1>

        {showButton && buttonLink && (
          <a href={buttonLink}>
            <button className="border-border bg-muted text-muted-foreground hover:bg-muted/80 rounded-full border-2 px-4 py-1.5 text-xs transition sm:px-6 sm:text-sm">
              See all
            </button>
          </a>
        )}
      </div>
    </div>
  )
}

export default Heading