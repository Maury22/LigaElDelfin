'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createNews, deleteNews } from '@/app/admin/actions'

interface NewsItem {
  id: string
  title: string
  excerpt: string | null
  image_url: string | null
  published_at: string
  tournament_id: string | null
}
interface Tournament { id: string; name: string }

export default function AdminNoticiasClient({
  news: initialNews,
  tournaments,
}: {
  news: NewsItem[]
  tournaments: Tournament[]
}) {
  const [news, setNews] = useState(initialNews)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formRef.current) return
    setStatus('loading')
    setErrorMsg('')
    const formData = new FormData(formRef.current)
    const result = await createNews(formData)
    if (result.error) {
      setErrorMsg(result.error)
      setStatus('error')
    } else {
      setStatus('success')
      formRef.current.reset()
      setPreview(null)
      setTimeout(() => { setStatus('idle'); router.refresh() }, 1500)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const result = await deleteNews(id)
    if (result.error) { setDeletingId(null); setConfirmId(null) }
    else { setNews(prev => prev.filter(n => n.id !== id)); setDeletingId(null); setConfirmId(null) }
  }

  return (
    <>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Noticias</h1>

      {/* Lista */}
      {news.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">Publicadas</h2>
          <div className="flex flex-col gap-2">
            {news.map((n) => (
              <div key={n.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3">
                {confirmId === n.id ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">¿Eliminar <strong>{n.title}</strong>?</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleDelete(n.id)} disabled={deletingId === n.id}
                        className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-50">
                        {deletingId === n.id ? 'Eliminando...' : 'Sí, eliminar'}
                      </button>
                      <button onClick={() => setConfirmId(null)}
                        className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {n.image_url && (
                      <img src={n.image_url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{n.title}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {new Date(n.published_at).toLocaleDateString('es-AR')}
                        {n.tournament_id && tournaments.find(t => t.id === n.tournament_id) && (
                          <span className="ml-2">· {tournaments.find(t => t.id === n.tournament_id)?.name}</span>
                        )}
                      </p>
                    </div>
                    <button onClick={() => setConfirmId(n.id)}
                      className="shrink-0 text-xs text-red-400 hover:text-red-600 transition-colors">
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Formulario */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 mb-3">Nueva noticia</h2>
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Opción Instagram */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Post de Instagram
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Pegá la URL del post (ej: https://www.instagram.com/p/XXXXX/). Si completás esto, se muestra el post embebido y no hace falta imagen ni texto.
            </p>
            <input name="instagram_url"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
              placeholder="https://www.instagram.com/p/..." />
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-400">
            <div className="flex-1 h-px bg-gray-200" />
            <span>o cargá una noticia manual</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input name="title" required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Título de la noticia" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resumen</label>
            <input name="excerpt"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Descripción corta (aparece en las cards)" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
            <textarea name="content" rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
              placeholder="Texto completo de la noticia..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Torneo (opcional)</label>
            <select name="tournament_id"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900">
              <option value="">General (sin torneo)</option>
              {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
            {preview && (
              <img src={preview} alt="preview" className="w-full h-40 object-cover rounded-lg mb-2" />
            )}
            <input name="image" type="file" accept="image/*"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) setPreview(URL.createObjectURL(f))
                else setPreview(null)
              }}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-sm file:font-medium hover:file:bg-gray-200" />
          </div>

          <button type="submit" disabled={status === 'loading'}
            className="w-full bg-gray-900 text-white rounded-lg py-3 font-semibold text-sm disabled:opacity-50">
            {status === 'loading' ? 'Publicando...' : 'Publicar noticia'}
          </button>

          {status === 'success' && <p className="text-green-600 text-sm text-center">Noticia publicada.</p>}
          {status === 'error' && <p className="text-red-500 text-sm text-center">{errorMsg}</p>}
        </form>
      </section>
    </>
  )
}
