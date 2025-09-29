'use client'

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils" // helper opcional para juntar classes

interface AnimatedButtonProps {
  children: React.ReactNode
  loading?: boolean
  className?: string
  [key: string]: any // permite passar outras props como onClick, type, etc
}

export function AnimatedButton({ children, loading = false, className, ...props }: AnimatedButtonProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      className="w-full"
    >
      <Button
        className={cn(
          "relative w-full transform rounded-lg bg-gradient-to-r bg-blue-500 text-white border-blue-700 hover:bg-blue-800 hover:text-gray-100 shadow-md transition-all duration-300 hover:shadow-lg disabled:opacity-70",
          className
        )}
        disabled={loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando...
          </>
        ) : (
          children
        )}
      </Button>
    </motion.div>
  )
}
