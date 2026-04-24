'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Cliente server-side — usa service role, bypasea RLS
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// Sube un archivo de logo a Supabase Storage y devuelve la URL pública
async function uploadLogo(supabase: ReturnType<typeof getAdminClient>, teamId: string, file: File): Promise<string | null> {
  // Crear bucket si no existe (ignorar error si ya existe)
  await supabase.storage.createBucket('team-logos', { public: true })

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const filename = `${teamId}.${ext}`
  const bytes = await file.arrayBuffer()

  const { error } = await supabase.storage
    .from('team-logos')
    .upload(filename, bytes, { contentType: file.type, upsert: true })

  if (error) return null

  const { data } = supabase.storage.from('team-logos').getPublicUrl(filename)
  return data.publicUrl
}

export async function createNews(formData: FormData) {
  const supabase = getAdminClient()
  const title = (formData.get('title') as string)?.trim()
  const excerpt = (formData.get('excerpt') as string)?.trim()
  const content = (formData.get('content') as string)?.trim()
  const tournament_id = (formData.get('tournament_id') as string) || null
  const instagram_url = (formData.get('instagram_url') as string)?.trim() || null
  const file = formData.get('image') as File

  if (!title && !instagram_url) return { error: 'El título es obligatorio' }

  const { data: news, error } = await supabase
    .from('news')
    .insert({ title: title || '—', excerpt: excerpt || null, content: content || null, tournament_id, instagram_url })
    .select('id')
    .single()

  if (error) return { error: error.message }

  if (file && file.size > 0) {
    await supabase.storage.createBucket('news-images', { public: true })
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const filename = `${news.id}.${ext}`
    const bytes = await file.arrayBuffer()
    const { error: uploadErr } = await supabase.storage
      .from('news-images')
      .upload(filename, bytes, { contentType: file.type, upsert: true })
    if (!uploadErr) {
      const { data: urlData } = supabase.storage.from('news-images').getPublicUrl(filename)
      await supabase.from('news').update({ image_url: urlData.publicUrl }).eq('id', news.id)
    }
  }

  revalidatePath('/')
  return { success: true }
}

export async function deleteNews(newsId: string) {
  const supabase = getAdminClient()
  const { error } = await supabase.from('news').delete().eq('id', newsId)
  if (error) return { error: error.message }
  revalidatePath('/')
  return { success: true }
}

export async function createTournament(data: { name: string }) {
  const supabase = getAdminClient()
  const { error } = await supabase.from('tournaments').insert({ name: data.name })
  if (error) return { error: error.message }
  revalidatePath('/')
  return { success: true }
}

export async function createTeam(formData: FormData) {
  const supabase = getAdminClient()
  const name = (formData.get('name') as string)?.trim()
  const tournament_id = formData.get('tournament_id') as string
  const file = formData.get('logo') as File

  if (!name || !tournament_id) return { error: 'Faltan datos obligatorios' }

  const { data: team, error: insertError } = await supabase
    .from('teams')
    .insert({ name, tournament_id })
    .select('id')
    .single()

  if (insertError) return { error: insertError.message }

  if (file && file.size > 0) {
    const logoUrl = await uploadLogo(supabase, team.id, file)
    if (logoUrl) {
      await supabase.from('teams').update({ logo_url: logoUrl }).eq('id', team.id)
    }
  }

  revalidatePath('/admin/equipos')
  revalidatePath('/')
  return { success: true }
}

export async function updateTeam(formData: FormData) {
  const supabase = getAdminClient()
  const teamId = formData.get('team_id') as string
  const name = (formData.get('name') as string)?.trim()
  const tournament_id = formData.get('tournament_id') as string
  const file = formData.get('logo') as File

  const updates: Record<string, string> = {}
  if (name) updates.name = name
  if (tournament_id) updates.tournament_id = tournament_id

  if (file && file.size > 0) {
    const logoUrl = await uploadLogo(supabase, teamId, file)
    if (logoUrl) updates.logo_url = logoUrl
  }

  const { error } = await supabase.from('teams').update(updates).eq('id', teamId)
  if (error) return { error: error.message }

  revalidatePath('/admin/equipos')
  revalidatePath(`/admin/equipos/${teamId}`)
  revalidatePath(`/equipos/${teamId}`)
  revalidatePath('/')
  return { success: true }
}

export async function createPlayer(data: { name: string; dni: string; team_id: string }) {
  const supabase = getAdminClient()
  const { error } = await supabase.from('players').insert(data)
  if (error) return { error: error.message }
  revalidatePath('/jugadores')
  return { success: true }
}

export async function createMatch(data: {
  home_team_id: string
  away_team_id: string
  date: string
  tournament_id: string
}) {
  const supabase = getAdminClient()
  const { error } = await supabase.from('matches').insert({
    ...data,
    date: new Date(data.date).toISOString(),
  })
  if (error) return { error: error.message }
  revalidatePath('/fixture')
  return { success: true }
}

export async function closeMatch(matchId: string, scoreHome: number, scoreAway: number) {
  const supabase = getAdminClient()
  const { error } = await supabase
    .from('matches')
    .update({ status: 'finished', score_home: scoreHome, score_away: scoreAway })
    .eq('id', matchId)
  if (error) return { error: error.message }
  revalidatePath('/fixture')
  revalidatePath('/')
  return { success: true }
}

export async function createIncident(data: {
  match_id: string
  player_id: string
  type: string
  minute?: number
}) {
  const supabase = getAdminClient()
  const { error } = await supabase.from('incidents').insert({ ...data, minute: data.minute ?? 1 })
  if (error) return { error: error.message }
  revalidatePath(`/admin/partidos/${data.match_id}`)
  revalidatePath(`/fixture/${data.match_id}`)
  revalidatePath('/jugadores')
  return { success: true }
}

export async function updateMatchTournament(matchId: string, tournamentId: string) {
  const supabase = getAdminClient()
  const { error } = await supabase
    .from('matches')
    .update({ tournament_id: tournamentId })
    .eq('id', matchId)
  if (error) return { error: error.message }
  revalidatePath(`/admin/partidos/${matchId}`)
  revalidatePath('/fixture')
  return { success: true }
}

export async function deleteTeam(teamId: string) {
  const supabase = getAdminClient()

  // Obtener todos los partidos del equipo
  const { data: matches } = await supabase
    .from('matches')
    .select('id')
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)

  if (matches && matches.length > 0) {
    const matchIds = matches.map((m) => m.id)
    // Borrar incidencias de esos partidos
    await supabase.from('incidents').delete().in('match_id', matchIds)
    // Borrar los partidos
    await supabase.from('matches').delete().in('id', matchIds)
  }

  // Borrar jugadores del equipo (también elimina sus incidencias por CASCADE)
  await supabase.from('players').delete().eq('team_id', teamId)

  const { error } = await supabase.from('teams').delete().eq('id', teamId)
  if (error) return { error: error.message }

  revalidatePath('/admin/equipos')
  revalidatePath('/fixture')
  revalidatePath('/')
  return { success: true }
}

export async function deletePlayer(playerId: string) {
  const supabase = getAdminClient()

  // Borrar incidencias del jugador antes de borrarlo
  await supabase.from('incidents').delete().eq('player_id', playerId)

  const { error } = await supabase.from('players').delete().eq('id', playerId)
  if (error) return { error: error.message }

  revalidatePath('/admin/jugadores')
  revalidatePath('/estadisticas')
  return { success: true }
}

export async function deleteIncident(incidentId: string) {
  const supabase = getAdminClient()
  const { data: incident } = await supabase
    .from('incidents')
    .select('match_id')
    .eq('id', incidentId)
    .single()
  const { error } = await supabase.from('incidents').delete().eq('id', incidentId)
  if (error) return { error: error.message }
  revalidatePath('/admin/partidos')
  if (incident?.match_id) {
    revalidatePath(`/admin/partidos/${incident.match_id}`)
    revalidatePath(`/fixture/${incident.match_id}`)
  }
  revalidatePath('/fixture')
  revalidatePath('/')
  return { success: true }
}
