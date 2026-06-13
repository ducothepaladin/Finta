import { Eye, EyeOff } from "lucide-react"
import { useState, type ComponentProps, type HTMLInputTypeAttribute, type ReactNode } from "react"
import type { FieldValues, Path, UseFormReturn } from "react-hook-form"

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type FormTextInputProps<T extends FieldValues> = Omit<
  ComponentProps<"input">,
  "form"
> & {
  form: UseFormReturn<T>
  name: Path<T>
  label: string | ReactNode
  type?: HTMLInputTypeAttribute
  wrapperClassName?: string
  labelClassName?: string
  description?: ReactNode
}

export function FormTextInput<T extends FieldValues>({
  form,
  name,
  label,
  type = "text",
  wrapperClassName,
  labelClassName,
  description,
  className,
  required,
  ...props
}: FormTextInputProps<T>) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === "password"

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("space-y-2", wrapperClassName)}>
          <FormLabel className={labelClassName}>
            {label}
            {required ? <span className="ml-1 text-destructive">*</span> : null}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                {...props}
                type={isPassword && showPassword ? "text" : type}
                className={cn(isPassword && "pr-10", className)}
              />
              {isPassword ? (
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              ) : null}
            </div>
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
