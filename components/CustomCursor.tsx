'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  // Motion values for the cursor position
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  // Spring configuration for the trailing glow effect
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  useEffect(() => {
    setMounted(true)
    
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }
    
    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)

    // Handle hover states on clickable elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if hovering over a clickable element
      if (
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', moveCursor)
      window.addEventListener('mousedown', handleMouseDown)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('mouseover', handleMouseOver)
      
      return () => {
        window.removeEventListener('mousemove', moveCursor)
        window.removeEventListener('mousedown', handleMouseDown)
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('mouseover', handleMouseOver)
      }
    }
  }, [cursorX, cursorY])

  if (!mounted) return null
  
  // Hide on mobile devices or smaller screens where touch is primarily used
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return null
  }

  return (
    <>
      {/* Glow outer trail effect */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9998] h-10 w-10 rounded-full bg-orange-500/40 blur-md"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isClicking ? 1.5 : isHovering ? 1.8 : 1,
          backgroundColor: isHovering ? 'rgba(234, 88, 12, 0.6)' : 'rgba(249, 115, 22, 0.4)',
        }}
        transition={{ duration: 0.2 }}
      />
    </>
  )
}
