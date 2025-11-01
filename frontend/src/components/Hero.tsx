'use client'
import { motion, type Variants } from 'motion/react'
import { BackgroundRippleEffect } from './Background-ripple'

import { Spotlight } from './Spotlight'

export function Home() {
  // Animation Variants
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] },
    }),
  } as Variants

  return (
    <main className="bg-grid-white/[0.02] relative flex min-h-screen w-full items-center justify-center overflow-hidden rounded-md bg-white antialiased dark:bg-black/96">
      <Spotlight />
      <div className="pointer-events-none absolute inset-0 bg from-gray-900/20 via-transparent to-black/40" />
      {/* Hero Section */}

      <div className="absolute inset-0 top-10">
        <BackgroundRippleEffect />
      </div>
      <motion.div
        className="relative z-10 flex w-full flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-16 md:px-8 lg:px-0"
        initial="hidden"
        animate="visible"
      >
        {/* Heading */}
        <motion.h1
          className="text-foreground w-full max-w-[748.71px] px-4 text-center font-serif text-[32px] leading-[1.15] font-normal sm:px-0 sm:text-[48px] sm:leading-[1.1] md:text-[64px] lg:text-[80px]"
          variants={fadeUp}
          custom={0.1}
        >
          AI Trading Agent
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-muted-foreground mt-4 w-full max-w-[506.08px] px-6 text-center font-sans text-[15px] leading-[1.5] font-medium sm:mt-6 sm:px-0 sm:text-lg sm:leading-[1.4] md:text-xl"
          variants={fadeUp}
          custom={0.3}
        >
          Monitor live strategy metrics, portfolio performance, and recent agent actions.
        </motion.p>

        {/* Button */}
        <a href="/performance">
          <motion.div
            className="mt-8 flex items-center justify-center backdrop-blur-[8.25px] sm:mt-10"
            variants={fadeUp}
            custom={0.5}
          >
            <button className="bg-primary text-primary-foreground flex h-11 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full px-6 font-sans text-sm leading-5 font-medium shadow-[0px_0px_0px_2.5px_rgba(255,255,255,0.08)_inset] transition-transform duration-300 hover:scale-105 sm:h-11 sm:px-8 sm:text-base md:h-12 md:text-[15px]">
              View Performance
            </button>
          </motion.div>
        </a>

        {/* Tags */}
        <motion.div
          className="mt-6 flex w-full max-w-[640px] flex-wrap items-center justify-center gap-2 bg-transparent px-4 sm:mt-8 sm:px-0 dark:bg-black/[0.96]"
          variants={fadeUp}
          custom={0.7}
        >
        </motion.div>
      </motion.div>
      {/* Bottom decorative section */}
      <div className="// --- Light Mode (Default) --- // --- Dark Mode (Overrides) --- // --- Responsive Sizes (Unchanged) --- absolute right-0 bottom-0 left-0 h-12 border border-gray-200 bg-white bg-[radial-gradient(circle,#D1D5DB_1px,transparent_1px)] [background-size:12px_12px] sm:h-16 sm:[background-size:14px_14px] md:h-18 md:[background-size:16px_16px] dark:border-[#1C1C1F] dark:bg-black dark:bg-[radial-gradient(circle,#1D202A_1px,transparent_1px)]" />
    </main>
  )
}