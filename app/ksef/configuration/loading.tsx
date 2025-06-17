import { Skeleton } from "@/components/ui/skeleton"
import { Header } from "@/app/components/header"

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <Header title="KSEF" />
      <div className="flex">
        <aside className="w-[220px] min-h-[calc(100vh-64px)] border-r border-gray-200 bg-white">
          <nav className="py-4">
            <ul className="space-y-1 px-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <li key={i}>
                  <Skeleton className="h-8 w-full" />
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main className="flex-1 p-8">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-10 w-[280px]" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Skeleton className="h-[400px] w-full" />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
