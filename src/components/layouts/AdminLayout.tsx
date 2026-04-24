import Link from 'next/link'

const navItems = [
  { href: '/admin', label: 'Inicio' },
  { href: '/admin/torneos', label: 'Torneos' },
  { href: '/admin/noticias', label: 'Noticias' },
  { href: '/admin/partidos', label: 'Partidos' },
  { href: '/admin/equipos', label: 'Equipos' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-[#0f2d4a] text-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/Logo.jpg" alt="Logo" className="w-7 h-7 rounded-full" />
            <span className="font-bold text-sm tracking-wide uppercase">Admin · Liga El Delfin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-gray-400 hover:text-white transition-colors">
              Ver sitio
            </Link>
            <form action="/admin/logout" method="POST">
              <button
                type="submit"
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200 overflow-x-auto">
        <div className="max-w-2xl mx-auto px-4 flex gap-1 py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  )
}
