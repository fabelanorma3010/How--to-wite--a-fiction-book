import NoirNav from '@/components/library/NoirNav'

export default function LibraryShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:flex">
      <NoirNav />
      <main className="min-h-screen flex-1 pb-24 pt-16 md:pb-0 md:pt-0">{children}</main>
    </div>
  )
}
