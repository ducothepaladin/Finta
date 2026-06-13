import { LoginForm } from "@/components/auth/login-form"

export function LoginPage() {
  return (
    <section className="w-full max-w-md rounded-xl border border-border bg-card p-8">
      <div className="mb-6 space-y-2 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
          Welcome back
        </p>
        <h1 className="text-[22px] font-medium text-foreground">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Access your documents and reading workspace.
        </p>
      </div>

      <LoginForm />
    </section>
  )
}
