'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // createBrowserClient guarda el PKCE code verifier en cookies,
  // no en localStorage — el servidor puede leerlas en el callback
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return

    setStatus('loading')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setErrorMsg(error.message)
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Liga Delfin</h1>
          <p className="text-sm text-gray-500 mt-1">Panel de administración</p>
        </div>

        {status === 'sent' ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-3xl mb-3">📬</div>
            <h2 className="font-semibold text-gray-900 mb-1">Revisá tu email</h2>
            <p className="text-sm text-gray-500">
              Enviamos un link de acceso a <strong>{email}</strong>.
              Hacé click en el link para ingresar.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-4 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Usar otro email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email del organizador
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vos@ejemplo.com"
                required
                autoFocus
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading' || !email}
              className="w-full bg-gray-900 text-white rounded-lg py-3 font-semibold text-sm disabled:opacity-50 transition-opacity"
            >
              {status === 'loading' ? 'Enviando...' : 'Enviar link de acceso'}
            </button>

            {status === 'error' && (
              <p className="text-red-500 text-xs text-center">
                {errorMsg || 'Error al enviar. Intentá de nuevo.'}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
