export default function Loading() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6" aria-busy="true" aria-label="Loading HealthcareOS">
      <div className="mx-auto max-w-[1440px] animate-pulse space-y-6">
        <div className="h-12 w-full rounded-xl bg-slate-200" />
        <div className="h-8 w-64 rounded-lg bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-32 rounded-2xl bg-slate-200" />
          <div className="h-32 rounded-2xl bg-slate-200" />
          <div className="h-32 rounded-2xl bg-slate-200" />
        </div>
      </div>
    </main>
  );
}
