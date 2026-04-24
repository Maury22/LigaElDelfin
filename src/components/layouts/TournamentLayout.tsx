import Link from 'next/link'
import Image from 'next/image'
import TournamentNav from '@/components/features/tournaments/TournamentNav'

interface Tournament { id: string; name: string }

export default function TournamentLayout({
  tournament,
  children,
}: {
  tournament: Tournament
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-[#0f2d4a] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/" className="text-white/50 hover:text-white transition-colors text-sm flex items-center gap-1.5">
            ← Inicio
          </Link>
          <div className="w-px h-5 bg-white/20" />
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/Logo.jpg" alt="Liga El Delfin" width={32} height={32} className="rounded-full ring-2 ring-sky-400/30" />
            <span className="font-bold text-white text-sm tracking-tight hidden sm:block">Liga El Delfin</span>
          </Link>
        </div>
      </header>

      {/* Tournament banner */}
      <div className="bg-[#0a1f33]">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">Torneo</p>
          <h1 className="text-2xl font-bold text-white">{tournament.name}</h1>
        </div>
      </div>

      {/* Tab nav */}
      <TournamentNav tournamentId={tournament.id} />

      {/* Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        Liga El Delfin © {new Date().getFullYear()}
      </footer>
    </div>
  )
}
