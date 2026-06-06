function DashboardSkeleton() {
  const skeletonRows = Array.from({ length: 8 });

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-800" />
        <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded bg-slate-800" />
        <div className="mt-2 h-4 w-80 animate-pulse rounded bg-slate-800" />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg">
        <div className="flex flex-col gap-4 border-b border-slate-800 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="h-6 w-52 animate-pulse rounded bg-slate-800" />
            <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-800" />
          </div>

          <div className="h-10 w-full animate-pulse rounded-xl bg-slate-800 md:w-80" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-190 text-left">
            <thead className="bg-slate-800 text-sm uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Coin</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">24h Change</th>
                <th className="px-6 py-4">Market Cap</th>
                <th className="px-6 py-4">Volume</th>
              </tr>
            </thead>

            <tbody>
              {skeletonRows.map((_, index) => (
                <tr key={index} className="border-b border-slate-800">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 animate-pulse rounded-full bg-slate-800" />
                      <div>
                        <div className="h-4 w-28 animate-pulse rounded bg-slate-800" />
                        <div className="mt-2 h-3 w-12 animate-pulse rounded bg-slate-800" />
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-800" />
                  </td>

                  <td className="px-6 py-4">
                    <div className="h-4 w-16 animate-pulse rounded bg-slate-800" />
                  </td>

                  <td className="px-6 py-4">
                    <div className="h-4 w-20 animate-pulse rounded bg-slate-800" />
                  </td>

                  <td className="px-6 py-4">
                    <div className="h-4 w-20 animate-pulse rounded bg-slate-800" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default DashboardSkeleton;