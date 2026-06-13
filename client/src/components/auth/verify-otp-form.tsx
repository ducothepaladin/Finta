import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
import { z } from "zod"

import { FormOtpInput } from "@/components/common/form-inputs"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import {
  useSendOtpMutation,
  useVerifyOtpMutation,
} from "@/queries/auth.query"

const verifyOtpSchema = z.object({
  code: z.string().length(6, "Enter the 6-digit code"),
})

type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>

export function VerifyOtpForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const verifyOtpMutation = useVerifyOtpMutation()
  const sendOtpMutation = useSendOtpMutation()

  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? "/documents"

  const form = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { code: "" },
  })

  const onSubmit = async (values: VerifyOtpFormValues) => {
    await verifyOtpMutation.mutateAsync(values)
    navigate(redirectTo, { replace: true })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormOtpInput form={form} name="code" label="Verification code" />

        <Button
          type="submit"
          className="w-full"
          disabled={verifyOtpMutation.isPending}
        >
          {verifyOtpMutation.isPending ? "Verifying..." : "Verify email"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          disabled={sendOtpMutation.isPending}
          onClick={() => sendOtpMutation.mutate()}
        >
          {sendOtpMutation.isPending ? "Sending code..." : "Resend code"}
        </Button>
      </form>
    </Form>
  )
}
