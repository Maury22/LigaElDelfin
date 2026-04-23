import AdminLayout from '@/components/layouts/AdminLayout'
import Link from 'next/link'

const sections = [
  { href: '/admin/incidencias', label: 'Cargar Incidencia', desc: 'Gol, tarjeta o expulsión', color: 'bg-blue-600' },
  { href: '/admin/partidos', label: 'Partidos', desc: 'Crear y cerrar partidos', color: 'bg-gray-800' },
  { href: '/admin/equipos', label: 'Equipos', desc: 'Agregar equipos', color: 'bg-gray-800' },
]

export default function AdminHomePage() {
  return (
    <AdminLayout>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Panel de Control</h1>
      <div className="grid grid-cols-1 gap-3">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`${s.color} text-white rounded-xl px-5 py-4 flex items-center justify-between active:opacity-80 transition-opacity`}
          >
            <div>
              <p className="font-semibold">{s.label}</p>
              <p className="text-sm opacity-70">{s.desc}</p>
            </div>
            <span className="text-white/50 text-xl">→</span>
          </Link>
        ))}
      </div>
    </AdminLayout>
  )
}
