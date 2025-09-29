import * as React from "react"
import { cn } from "@/lib/utils"
interface InputProps extends React.ComponentProps<"input"> {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onChange, ...props }, ref) => {
    // Exemplo simples de handleChange que chama a prop onChange
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      // Aqui você pode adicionar lógica extra antes de repassar o evento
      if (onChange) {
        onChange(event)
      }
    }
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-4 py-2 text-base text-foreground placeholder:text-muted-foreground transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"
export { Input }