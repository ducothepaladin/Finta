import type { ReactNode } from "react"
import type { FieldValues, Path, UseFormReturn } from "react-hook-form"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { cn } from "@/lib/utils"

export type FormOtpInputProps<T extends FieldValues> = {
  form: UseFormReturn<T>
  name: Path<T>
  label?: string | ReactNode
  length?: number
  wrapperClassName?: string
  containerClassName?: string
}

export function FormOtpInput<T extends FieldValues>({
  form,
  name,
  label = "Verification code",
  length = 6,
  wrapperClassName,
  containerClassName,
}: FormOtpInputProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("space-y-2", wrapperClassName)}>
          {label ? <FormLabel>{label}</FormLabel> : null}
          <FormControl>
            <InputOTP
              maxLength={length}
              value={field.value}
              onChange={field.onChange}
              containerClassName={cn("justify-center", containerClassName)}
            >
              <InputOTPGroup>
                {Array.from({ length }, (_, index) => (
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
