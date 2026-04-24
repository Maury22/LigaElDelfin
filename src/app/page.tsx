import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import InstagramEmbed from '@/components/features/news/InstagramEmbed'

export const revalidate = 60

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function HomePage() {
  const [{ data: tournaments }, newsResult, { data: teamCounts }] = await Promise.all([
    supabase.from('tournaments').select('id, name').eq('is_active', true).order('name'),
    supabase.from('news').select('*').order('published_at', { ascending: false }).limit(12),
    supabase.from('teams').select('tournament_id').not('tournament_id', 'is', null),
  ])

  const newsList = (newsResult.data ?? []) as any[]
  const countByTournament = (teamCounts ?? []).reduce<Record<string, number>>((acc, t) => {
    if (t.tournament_id) acc[t.tournament_id] = (acc[t.tournament_id] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* Header */}
      <header className="bg-[#0f2d4a] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/Logo.jpg" alt="Liga El Delfin" width={38} height={38} className="rounded-full ring-2 ring-sky-400/40" />
            <span className="font-bold text-lg tracking-tight text-white">Liga El Delfin</span>
          </Link>
          <a href="#torneos" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
            Torneos
          </a>
        </div>
      </header>

      <main className="flex-1">

        {/* Torneos — prominente arriba */}
        <section id="torneos" className="bg-[#0a1f33] py-10">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-base font-bold text-white/60 uppercase tracking-widest mb-5">Torneos</h2>
            {(tournaments ?? []).length === 0 ? (
              <p className="text-white/40 text-sm">Sin torneos activos.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {(tournaments ?? []).map((t) => (
                  <Link
                    key={t.id}
                    href={`/torneos/${t.id}/posiciones`}
                    className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/50 rounded-xl px-5 py-4 transition-all"
                  >
                    <div>
                      <p className="text-white font-bold">{t.name}</p>
                      <p className="text-white/40 text-xs">{countByTournament[t.id] ?? 0} equipos</p>
                    </div>
                    <span className="text-amber-400 text-lg group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Grid de noticias / Instagram */}
        {newsList.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 py-10">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Noticias</h2>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
              {newsList.map((item: any) => (
                item.instagram_url ? (
                  <div key={item.id} className="break-inside-avoid">
                    <InstagramEmbed url={item.instagram_url} />
                  </div>
                ) : (
                  <article key={item.id} className="break-inside-avoid bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {item.image_url && (
                      <div className="aspect-[4/3] overflow-hidden">
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1 leading-snug">{item.title}</h3>
                      {item.excerpt && <p className="text-gray-500 text-sm line-clamp-3 mb-2">{item.excerpt}</p>}
                      <time className="text-gray-400 text-xs">{formatDate(item.published_at)}</time>
                    </div>
                  </article>
                )
              ))}
            </div>
          </section>
        )}

      </main>

      <footer className="bg-[#050f1a] py-5 text-center text-xs text-white/30">
        Liga El Delfin © {new Date().getFullYear()}
      </footer>

    </div>
  )
}
