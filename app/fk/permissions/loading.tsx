import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nagłówek */}
      <div className="flex justify-between items-center px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-6 rounded" />
          <div className="flex items-center">
            <Skeleton className="h-10 w-32 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-48 rounded-md" />
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      {/* Menu boczne i zawartość */}
      <div className="flex">
        <aside className="w-64 min-h-[calc(100vh-64px)] border-r border-gray-200 bg-white">
          <nav className="py-4">
            <ul className="space-y-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="px-6 py-3">
                  <Skeleton className="h-6 w-full rounded" />
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Zawartość główna */}
        <main className="flex-1 p-8">
          <Skeleton className="h-10 w-64 mb-6 rounded" />

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Skeleton className="h-10 w-64 rounded" />
              <Skeleton className="h-10 w-32 rounded" />
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-32 rounded" />
                ))}
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="p-4">
                  <Skeleton className="h-8 w-full rounded mb-4" />
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded mb-2" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
