import LoginForm from "./components/LoginForm";

export default function Home() {
  return (
    <div className="relative flex min-h-dvh flex-1 items-center justify-center overflow-hidden bg-clinic-bg px-4 py-10 sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-clinic-mint/15 blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-clinic-teal/12 blur-3xl" />
      </div>

      <main className="relative w-full max-w-[420px]">
        <section className="rounded-2xl border border-white/80 bg-white px-6 py-8 shadow-[0_24px_60px_-28px_rgba(1,58,71,0.35)] sm:px-8 sm:py-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-clinic-navy text-xl shadow-[0_8px_20px_-10px_rgba(1,58,71,0.8)]"
                aria-hidden="true"
              >
                🩺
              </span>
              <span className="text-[22px] font-semibold tracking-[-0.03em] text-clinic-navy">
                ClinicDesk
              </span>
            </div>

            <h1 className="mt-7 text-[28px] font-semibold tracking-[-0.04em] text-clinic-navy">
              Welcome back
            </h1>
            <p className="mt-2 max-w-[280px] text-sm leading-6 text-clinic-muted">
              Sign in to manage appointments, patients, and your clinic day.
            </p>
          </div>

          <LoginForm />
        </section>

        <p className="mt-6 text-center text-xs tracking-wide text-clinic-muted">
          Built for independent clinics · Dentist to pediatrician
        </p>
      </main>
    </div>
  );
}
