'use client'

import { useEffect } from 'react'

declare global {
  interface Window { instgrm?: { Embeds: { process: () => void } } }
}

export default function InstagramEmbed({ url }: { url: string }) {
  useEffect(() => {
    if (window.instgrm) {
      window.instgrm.Embeds.process()
    } else {
      const existing = document.getElementById('instagram-embed-script')
      if (!existing) {
        const script = document.createElement('script')
        script.id = 'instagram-embed-script'
        script.src = 'https://www.instagram.com/embed.js'
        script.async = true
        document.body.appendChild(script)
      }
    }
  }, [url])

  return (
    <div className="flex justify-center w-full overflow-hidden">
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        data-instgrm-captioned
        style={{ maxWidth: '100%', width: '100%', minWidth: 0, margin: 0 }}
      />
    </div>
  )
}
