import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple"
  defaultValue?: string
  collapsible?: boolean
  value?: string
  onValueChange?: (value: string) => void
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ className, type = "single", defaultValue, collapsible = true, value, onValueChange, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || "")
    const isControlled = value !== undefined
    const currentValue = isControlled ? value : internalValue

    const handleValueChange = (newValue: string) => {
      if (!isControlled) {
        setInternalValue(currentValue === newValue && collapsible ? "" : newValue)
      }
      onValueChange?.(currentValue === newValue && collapsible ? "" : newValue)
    }

    return (
      <div
        ref={ref}
        className={cn("w-full", className)}
        data-type={type}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              currentValue,
              onValueChange: handleValueChange,
            })
          }
          return child
        })}
      </div>
    )
  }
)
Accordion.displayName = "Accordion"

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  currentValue?: string
  onValueChange?: (value: string) => void
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, currentValue, onValueChange, children, ...props }, ref) => {
    const isOpen = currentValue === value

    return (
      <div
        ref={ref}
        className={cn("border-b border-neutral-200", className)}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              isOpen,
              value,
              onValueChange,
            })
          }
          return child
        })}
      </div>
    )
  }
)
AccordionItem.displayName = "AccordionItem"

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  isOpen?: boolean
  value?: string
  onValueChange?: (value: string) => void
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, isOpen, value, onValueChange, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex w-full items-center justify-between py-3 px-1 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors",
        className
      )}
      onClick={() => onValueChange?.(value || "")}
      {...props}
    >
      {children}
      <ChevronDown className={cn("h-4 w-4 text-neutral-400 transition-transform duration-200", isOpen && "rotate-180")} />
    </button>
  )
)
AccordionTrigger.displayName = "AccordionTrigger"

interface AccordionContentProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onValueChange'> {
  isOpen?: boolean
}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, isOpen, children, ...props }, ref) => {
    const { onValueChange, ...restProps } = props as typeof props & { onValueChange?: unknown }
    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
          className
        )}
        {...restProps}
      >
        <div className="pb-3 pt-1">{children}</div>
      </div>
    )
  }
)
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }