import { VerifyOtpForm } from "@/components/auth/verify-otp-form"

export function VerifyOtpPage() {
  return (
    <section className="w-full max-w-md rounded-xl border border-border bg-card p-8">
      <div className="mb-6 space-y-2 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
          Verify email
        </p>
        <h1 className="text-[22px] font-medium text-foreground">
          Enter verification code
        </h1>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to your email. It expires in 5 minutes.
        </p>
      </div>

      <VerifyOtpForm />
    </section>
  )
}
