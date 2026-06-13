import { RegisterForm } from "@/components/auth/register-form"

export function RegisterPage() {
  return (
    <section className="w-full max-w-md rounded-xl border border-border bg-card p-8">
      <div className="mb-6 space-y-2 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
          Get started
        </p>
        <h1 className="text-[22px] font-medium text-foreground">Create account</h1>
        <p className="text-sm text-muted-foreground">
          Upload PDFs and use AI tools on your documents.
        </p>
      </div>

      <RegisterForm />
    </section>
  )
}
