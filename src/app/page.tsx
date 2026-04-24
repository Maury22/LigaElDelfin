import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

export const revalidate = 60

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function HomePage() {
  const [{ data: tournaments }, newsResult, { data: teamCounts }] = await Promise.all([
    supabase.from('tournaments').select('id, name').eq('is_active', true).order('name'),
    supabase.from('news').select('*').order('published_at', { ascending: false }).limit(7),
    supabase.from('teams').select('tournament_id').not('tournament_id', 'is', null),
  ])

  const newsList = (newsResult.data ?? []) as any[]
  const hero = newsList[0] ?? null
  const restNews = newsList.slice(1)

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

      {/* Hero noticia */}
      {hero && (
        <section className="relative h-[480px] sm:h-[540px] overflow-hidden">
          {hero.image_url ? (
            <img src={hero.image_url} alt={hero.title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f2d4a] to-[#1e4976]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050f1a] via-[#050f1a]/60 to-transparent" />
          <div className="relative z-10 flex flex-col justify-end h-full max-w-6xl mx-auto px-6 pb-12">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">Noticias</span>
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 max-w-3xl leading-tight">
              {hero.title}
            </h2>
            {hero.excerpt && (
              <p className="text-white/70 text-base sm:text-lg mb-6 max-w-2xl line-clamp-2">{hero.excerpt}</p>
            )}
            <time className="text-white/40 text-sm">{formatDate(hero.published_at)}</time>
          </div>
        </section>
      )}

      {/* Si no hay noticias, banner de bienvenida */}
      {!hero && (
        <section className="relative h-[300px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f2d4a] to-[#1e4976]" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
            <Image src="/Logo.jpg" alt="Liga El Delfin" width={80} height={80} className="rounded-full mb-4 ring-4 ring-amber-400/30" />
            <h2 className="text-3xl font-bold text-white mb-2">Liga El Delfin</h2>
            <p className="text-white/60">Seguí todos los torneos, resultados y estadísticas</p>
          </div>
        </section>
      )}

      <main className="flex-1">

        {/* Grid de noticias */}
        {restNews.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 py-10">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Últimas noticias</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {restNews.map((news: any) => (
                <article key={news.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
                    {news.image_url ? (
                      <img src={news.image_url} alt={news.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#0f2d4a] to-[#1e4976] flex items-center justify-center">
                        <Image src="/Logo.jpg" alt="" width={48} height={48} className="rounded-full opacity-40" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-amber-600 text-xs font-bold uppercase tracking-wide">Noticias</span>
                    <h3 className="font-bold text-gray-900 mt-1 mb-2 line-clamp-2 leading-snug">{news.title}</h3>
                    {news.excerpt && <p className="text-gray-500 text-sm line-clamp-2">{news.excerpt}</p>}
                    <time className="text-gray-400 text-xs mt-3 block">{formatDate(news.published_at)}</time>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Torneos */}
        <section id="torneos" className="bg-[#0a1f33] py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-xl font-bold text-white mb-8">Torneos</h2>
            {(tournaments ?? []).length === 0 ? (
              <p className="text-white/40 text-sm">Sin torneos activos.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(tournaments ?? []).map((t) => (
                  <Link
                    key={t.id}
                    href={`/torneos/${t.id}/posiciones`}
                    className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 rounded-xl p-6 transition-all"
                  >
                    <h3 className="text-white font-bold text-lg mb-1">{t.name}</h3>
                    <p className="text-white/40 text-sm mb-4">
                      {countByTournament[t.id] ?? 0} equipo{(countByTournament[t.id] ?? 0) !== 1 ? 's' : ''}
                    </p>
                    <span className="text-amber-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Ver torneo <span>→</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

      </main>

      <footer className="bg-[#050f1a] py-5 text-center text-xs text-white/30">
        Liga El Delfin © {new Date().getFullYear()}
      </footer>

    </div>
  )
}
