import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme()

  return (
    <Sonner
      theme={resolvedTheme as "light" | "dark"}
      className="toaster group"
      position="bottom-right"
      richColors
      {...props}
    />
  )
}

export { Toaster }
