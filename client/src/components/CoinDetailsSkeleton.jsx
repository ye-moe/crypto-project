function CoinDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 animate-pulse rounded-full bg-slate-800" />

              <div>
                <div className="h-4 w-16 animate-pulse rounded bg-slate-800" />
                <div className="mt-2 h-10 w-52 animate-pulse rounded bg-slate-800" />
              </div>
            </div>

            <div className="mt-6 h-8 w-40 animate-pulse rounded bg-slate-800" />
            <div className="mt-3 h-4 w-24 animate-pulse rounded bg-slate-800" />
          </div>

          <div className="grid grid-cols-2 gap-4 md:min-w-80">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="h-4 w-20 animate-pulse rounded bg-slate-800" />
              <div className="mt-3 h-6 w-24 animate-pulse rounded bg-slate-800" />
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="h-4 w-16 animate-pulse rounded bg-slate-800" />
              <div className="mt-3 h-6 w-24 animate-pulse rounded bg-slate-800" />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
        <div className="flex flex-col gap-2 border-b border-slate-800 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="h-6 w-48 animate-pulse rounded bg-slate-800" />
            <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-800" />
          </div>

          <div className="h-8 w-24 animate-pulse rounded-full bg-slate-800" />
        </div>

        <div className="mt-6 h-80 animate-pulse rounded-xl bg-slate-800/70" />
      </section>
    </div>
  );
}

export default CoinDetailsSkeleton;