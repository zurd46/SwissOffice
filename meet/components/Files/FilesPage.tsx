'use client'

import { useState, useCallback } from 'react'
import { FolderOpen, Upload, FileText, Image, Film, FileArchive, Download, Trash2, Eye, Grid3X3, List } from 'lucide-react'
import { SearchInput } from '@/components/Shared/SearchInput'
import { EmptyState } from '@/components/Shared/EmptyState'
import { Tabs } from '@/components/Shared/Tabs'
import { Dropdown } from '@/components/Shared/Dropdown'
import { Tooltip } from '@/components/Shared/Tooltip'
import { formatFileSize, formatRelativeTime } from '@/lib/utils/formatDate'
import { cn } from '@/lib/utils/cn'

interface SharedFile {
  id: string
  name: string
  size: number
  mimeType: string
  uploadedBy: string
  channelName?: string
  chatName?: string
  createdAt: string
  url: string
}

const demoFiles: SharedFile[] = [
  { id: 'f1', name: 'Präsentation Q4.pptx', size: 5242880, mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', uploadedBy: 'Anna Müller', channelName: 'Allgemein', createdAt: new Date(Date.now() - 3600000).toISOString(), url: '#' },
  { id: 'f2', name: 'Logo_Final_v3.png', size: 1048576, mimeType: 'image/png', uploadedBy: 'Julia Koch', channelName: 'Design', createdAt: new Date(Date.now() - 86400000).toISOString(), url: '#' },
  { id: 'f3', name: 'Meeting_Recording.mp4', size: 52428800, mimeType: 'video/mp4', uploadedBy: 'Max Weber', channelName: 'Allgemein', createdAt: new Date(Date.now() - 172800000).toISOString(), url: '#' },
  { id: 'f4', name: 'Projektplan_2024.xlsx', size: 524288, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', uploadedBy: 'Daniel Zurmühle', chatName: 'Projektteam Alpha', createdAt: new Date(Date.now() - 259200000).toISOString(), url: '#' },
  { id: 'f5', name: 'API_Dokumentation.pdf', size: 2097152, mimeType: 'application/pdf', uploadedBy: 'Thomas Wagner', channelName: 'Backend', createdAt: new Date(Date.now() - 432000000).toISOString(), url: '#' },
  { id: 'f6', name: 'Assets_Bundle.zip', size: 10485760, mimeType: 'application/zip', uploadedBy: 'Sarah Fischer', channelName: 'Design', createdAt: new Date(Date.now() - 604800000).toISOString(), url: '#' },
]

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <Image size={20} className="text-[#0078d4]" />
  if (mimeType.startsWith('video/')) return <Film size={20} className="text-[#e3008c]" />
  if (mimeType.includes('zip') || mimeType.includes('archive')) return <FileArchive size={20} className="text-[#ca5010]" />
  return <FileText size={20} className="text-[#498205]" />
}

export function FilesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [isDragOver, setIsDragOver] = useState(false)

  const tabs = [
    { id: 'all', label: 'Alle Dateien' },
    { id: 'images', label: 'Bilder' },
    { id: 'videos', label: 'Videos' },
    { id: 'documents', label: 'Dokumente' },
  ]

  const filteredFiles = demoFiles.filter(file => {
    if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (activeTab === 'images') return file.mimeType.startsWith('image/')
    if (activeTab === 'videos') return file.mimeType.startsWith('video/')
    if (activeTab === 'documents') return !file.mimeType.startsWith('image/') && !file.mimeType.startsWith('video/')
    return true
  })

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    // TODO: Datei-Upload
  }, [])

  return (
    <div
      className="flex flex-col h-full bg-white"
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#edebe9]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[#242424]">Dateien</h2>
          <div className="flex items-center gap-2">
            <Tooltip content={viewMode === 'list' ? 'Rasteransicht' : 'Listenansicht'}>
              <button
                onClick={() => setViewMode(v => v === 'list' ? 'grid' : 'list')}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#f3f2f1] text-[#605e5c]"
              >
                {viewMode === 'list' ? <Grid3X3 size={16} /> : <List size={16} />}
              </button>
            </Tooltip>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0078d4] text-white rounded text-sm hover:bg-[#106ebe] transition-colors">
              <Upload size={16} />
              Hochladen
            </button>
          </div>
        </div>
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Dateien suchen..." />
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} className="px-4" />

      {/* Drag Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-40 bg-[#0078d4]/10 border-2 border-dashed border-[#0078d4] flex items-center justify-center">
          <div className="text-center">
            <Upload size={48} className="mx-auto text-[#0078d4] mb-2" />
            <p className="text-lg font-semibold text-[#0078d4]">Dateien hier ablegen</p>
          </div>
        </div>
      )}

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredFiles.length === 0 ? (
          <EmptyState
            icon={<FolderOpen size={48} />}
            title="Keine Dateien"
            description="Geteilte Dateien aus Chats und Channels erscheinen hier"
          />
        ) : viewMode === 'list' ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#edebe9]">
                <th className="text-left text-xs font-semibold text-[#605e5c] pb-2 pl-2">Name</th>
                <th className="text-left text-xs font-semibold text-[#605e5c] pb-2">Geteilt in</th>
                <th className="text-left text-xs font-semibold text-[#605e5c] pb-2">Von</th>
                <th className="text-left text-xs font-semibold text-[#605e5c] pb-2">Grösse</th>
                <th className="text-left text-xs font-semibold text-[#605e5c] pb-2">Datum</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map(file => (
                <tr key={file.id} className="border-b border-[#f3f2f1] hover:bg-[#f3f2f1] transition-colors group">
                  <td className="py-2.5 pl-2">
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.mimeType)}
                      <span className="text-sm text-[#242424]">{file.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-sm text-[#605e5c]">{file.channelName ?? file.chatName}</td>
                  <td className="py-2.5 text-sm text-[#605e5c]">{file.uploadedBy}</td>
                  <td className="py-2.5 text-sm text-[#605e5c]">{formatFileSize(file.size)}</td>
                  <td className="py-2.5 text-sm text-[#605e5c]">{formatRelativeTime(file.createdAt)}</td>
                  <td className="py-2.5">
                    <Dropdown
                      trigger={
                        <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#e8e6e4] text-[#605e5c] opacity-0 group-hover:opacity-100 transition-opacity">
                          <Download size={14} />
                        </button>
                      }
                      items={[
                        { label: 'Herunterladen', icon: <Download size={14} />, onClick: () => {} },
                        { label: 'Vorschau', icon: <Eye size={14} />, onClick: () => {} },
                        { label: '', divider: true, onClick: () => {} },
                        { label: 'Löschen', icon: <Trash2 size={14} />, danger: true, onClick: () => {} },
                      ]}
                      align="right"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {filteredFiles.map(file => (
              <div key={file.id} className="border border-[#e1dfdd] rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-full h-24 bg-[#f5f5f5] rounded flex items-center justify-center mb-2">
                  {getFileIcon(file.mimeType)}
                </div>
                <p className="text-sm font-medium text-[#242424] truncate">{file.name}</p>
                <p className="text-xs text-[#605e5c]">{formatFileSize(file.size)} · {formatRelativeTime(file.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
