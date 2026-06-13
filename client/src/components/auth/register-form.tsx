import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { z } from "zod"

import { FormTextInput } from "@/components/common/form-inputs"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useRegisterMutation } from "@/queries/auth.query"
import { authService } from "@/services/auth.service"

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    username: z
      .string()
      .min(2, "Username must be at least 2 characters")
      .regex(
        /^[a-z0-9._-]+$/,
        "Use lowercase letters, numbers, dots, dashes, or underscores",
      ),
    email: z.email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const navigate = useNavigate()
  const { mutateAsync: register, isPending } = useRegisterMutation()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    await register({
      name: values.name,
      username: values.username,
      email: values.email,
      password: values.password,
    })

    await authService.sendOtp()
    navigate("/verify-otp", { replace: true, state: { from: "/documents" } })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormTextInput
          form={form}
          name="name"
          label="Name"
          autoComplete="name"
          required
        />
        <FormTextInput
          form={form}
          name="username"
          label="Username"
          autoComplete="username"
          required
        />
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
          autoComplete="new-password"
          required
        />
        <FormTextInput
          form={form}
          name="confirmPassword"
          type="password"
          label="Confirm password"
          autoComplete="new-password"
          required
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Creating account..." : "Create account"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </Form>
  )
}
