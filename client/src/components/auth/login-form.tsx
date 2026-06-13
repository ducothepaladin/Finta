import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { z } from "zod"

import { FormTextInput } from "@/components/common/form-inputs"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useLoginMutation } from "@/queries/auth.query"
import { authService } from "@/services/auth.service"

const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { mutateAsync: login, isPending } = useLoginMutation()

  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? "/documents"

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    await login(values)
    const user = await authService.getMe()

    if (!user.isOtpVerified) {
      await authService.sendOtp()
      navigate("/verify-otp", { replace: true, state: { from: redirectTo } })
      return
    }

    navigate(redirectTo, { replace: true })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormTextInput
          form={form}
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          required
        />
        <FormTextInput
          form={form}
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          required
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Signing in..." : "Sign in"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </Form>
  )
}
