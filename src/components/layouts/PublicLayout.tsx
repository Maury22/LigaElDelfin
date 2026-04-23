import Link from 'next/link'
import Image from 'next/image'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[#0f2d4a] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/Logo.jpg" alt="Liga El Delfin" width={38} height={38} className="rounded-full ring-2 ring-sky-400/40" />
            <span className="font-bold text-lg tracking-tight text-white">Liga El Delfin</span>
          </Link>
          <nav className="flex gap-6 text-sm font-medium">
            <Link href="/" className="text-white/70 hover:text-white transition-colors">Posiciones</Link>
            <Link href="/fixture" className="text-white/70 hover:text-white transition-colors">Fixture</Link>
            <Link href="/estadisticas" className="text-white/70 hover:text-white transition-colors">Estadísticas</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        Liga El Delfin © {new Date().getFullYear()}
      </footer>
    </div>
  )
}
