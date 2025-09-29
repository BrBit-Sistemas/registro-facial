import * as React from "react"
import { cn } from "@/lib/utils"

// Card container
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Base (100% controlado por tokens)
      "rounded-xl bg-card text-card-foreground shadow-sm transition-all hover:shadow-md",
      "border-border",

      // 🔥 Animação de background
      "animate-card-fade",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

// Header
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-2 p-6",
      "border-border",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

// Title
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-tight tracking-tight",
      "text-card-foreground",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

// Description
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

// Content
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6", className)} {...props} />
))
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardDescription, CardContent }
