import { createClient } from '@supabase/supabase-js'
import AdminLayout from '@/components/layouts/AdminLayout'
import Link from 'next/link'
import CreateTeamForm from '@/components/features/teams/CreateTeamForm'

export const dynamic = 'force-dynamic'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export default async function AdminEquiposPage() {
  const supabase = getAdminClient()

  const [{ data: teams }, { data: tournaments }] = await Promise.all([
    supabase
      .from('teams')
      .select('id, name, logo_url, tournament_id, tournaments(name)')
      .order('name'),
    supabase.from('tournaments').select('id, name').eq('is_active', true).order('name'),
  ])

  return (
    <AdminLayout>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Equipos</h1>

      {/* Lista de equipos */}
      {(teams ?? []).length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">Equipos registrados</h2>
          <div className="flex flex-col gap-2">
            {(teams ?? []).map((team: any) => (
              <Link
                key={team.id}
                href={`/admin/equipos/${team.id}`}
                className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-gray-300 transition-colors"
              >
                {team.logo_url ? (
                  <img src={team.logo_url} alt={team.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
                    {team.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{team.name}</p>
                  {team.tournaments?.name && (
                    <p className="text-xs text-gray-400 truncate">{team.tournaments.name}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400">Editar →</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Crear nuevo equipo */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 mb-3">Nuevo equipo</h2>
        <CreateTeamForm tournaments={tournaments ?? []} />
      </section>
    </AdminLayout>
  )
}
