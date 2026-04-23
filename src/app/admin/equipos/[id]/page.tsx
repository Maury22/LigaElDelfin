import { createClient } from '@supabase/supabase-js'
import AdminLayout from '@/components/layouts/AdminLayout'
import EditTeamForm from '@/components/features/teams/EditTeamForm'
import DeleteTeamButton from '@/components/features/teams/DeleteTeamButton'
import TeamPlayersManager from '@/components/features/players/TeamPlayersManager'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export default async function AdminEquipoEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = getAdminClient()

  const [{ data: team }, { data: tournaments }, { data: players }] = await Promise.all([
    supabase.from('teams').select('id, name, logo_url, tournament_id').eq('id', id).single(),
    supabase.from('tournaments').select('id, name').eq('is_active', true).order('name'),
    supabase.from('players').select('id, name, dni, is_suspended').eq('team_id', id).order('name'),
  ])

  if (!team) notFound()

  return (
    <AdminLayout>
      <Link
        href="/admin/equipos"
        className="text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6 inline-block"
      >
        ← Volver a equipos
      </Link>

      <div className="flex items-center gap-3 mb-6">
        {team.logo_url ? (
          <img src={team.logo_url} alt={team.name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-500">
            {team.name.charAt(0)}
          </div>
        )}
        <h1 className="text-xl font-bold text-gray-900">{team.name}</h1>
      </div>

      <EditTeamForm team={team} tournaments={tournaments ?? []} />
      <TeamPlayersManager teamId={team.id} initialPlayers={players ?? []} />
      <DeleteTeamButton teamId={team.id} teamName={team.name} />
    </AdminLayout>
  )
}
