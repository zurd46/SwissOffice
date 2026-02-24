'use client'

import dynamic from 'next/dynamic'

const WriterEditor = dynamic(
  () => import('../components/Editor/Editor').then(mod => ({ default: mod.WriterEditor })),
  {
    ssr: false,
    loading: () => (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
        <div style={{ color: '#888' }}>Editor wird geladen...</div>
      </div>
    ),
  }
)

export function WriterClientPage() {
  return <WriterEditor />
}
