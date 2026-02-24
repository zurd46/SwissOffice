'use client'

import { useState } from 'react'
import { User, Volume2, Bell, Palette, Shield, Info } from 'lucide-react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { Avatar } from '@/components/Shared/Avatar'
import { cn } from '@/lib/utils/cn'
import type { PresenceStatus } from '@/lib/types'

type SettingsSection = 'profile' | 'audio-video' | 'notifications' | 'appearance' | 'privacy' | 'about'

const sections: { id: SettingsSection; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profil', icon: <User size={18} /> },
  { id: 'audio-video', label: 'Audio & Video', icon: <Volume2 size={18} /> },
  { id: 'notifications', label: 'Benachrichtigungen', icon: <Bell size={18} /> },
  { id: 'appearance', label: 'Darstellung', icon: <Palette size={18} /> },
  { id: 'privacy', label: 'Datenschutz', icon: <Shield size={18} /> },
  { id: 'about', label: 'Über ImpulsMeet', icon: <Info size={18} /> },
]

const presenceOptions: { value: PresenceStatus; label: string; color: string }[] = [
  { value: 'online', label: 'Verfügbar', color: 'bg-[#92c353]' },
  { value: 'busy', label: 'Beschäftigt', color: 'bg-[#c4314b]' },
  { value: 'dnd', label: 'Nicht stören', color: 'bg-[#c4314b]' },
  { value: 'away', label: 'Abwesend', color: 'bg-[#f8d22a]' },
  { value: 'offline', label: 'Als offline anzeigen', color: 'bg-[#8a8886]' },
]

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile')
  const { currentUser, updatePresence, updateCustomStatus } = useAuth()
  const [customStatus, setCustomStatus] = useState(currentUser?.customStatus ?? '')
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light')

  return (
    <div className="flex h-full bg-white">
      {/* Sidebar */}
      <div className="w-56 border-r border-[#e1dfdd] flex flex-col">
        <div className="px-4 py-4 border-b border-[#edebe9]">
          <h2 className="text-lg font-semibold text-[#242424]">Einstellungen</h2>
        </div>
        <div className="flex-1 py-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                activeSection === section.id
                  ? 'bg-[#e8e6e4] text-[#242424] font-medium'
                  : 'text-[#605e5c] hover:bg-[#f3f2f1]'
              )}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl">
        {activeSection === 'profile' && currentUser && (
          <div>
            <h3 className="text-xl font-semibold text-[#242424] mb-6">Profil</h3>
            <div className="flex items-center gap-4 mb-8">
              <Avatar name={currentUser.displayName} size="xl" presence={currentUser.presence} />
              <div>
                <h4 className="text-lg font-semibold">{currentUser.displayName}</h4>
                <p className="text-sm text-[#605e5c]">{currentUser.email}</p>
                <button className="text-sm text-[#0078d4] hover:underline mt-1">Bild ändern</button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#242424] mb-1">Anzeigename</label>
                <input
                  defaultValue={currentUser.displayName}
                  className="w-full h-9 px-3 rounded border border-[#8a8886] text-sm focus:border-[#0078d4] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#242424] mb-1">Status</label>
                <div className="flex flex-wrap gap-2">
                  {presenceOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => updatePresence(option.value)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-colors',
                        currentUser.presence === option.value
                          ? 'border-[#0078d4] bg-[#f0f6ff] text-[#0078d4]'
                          : 'border-[#e1dfdd] hover:bg-[#f3f2f1] text-[#605e5c]'
                      )}
                    >
                      <span className={cn('w-2.5 h-2.5 rounded-full', option.color)} />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#242424] mb-1">Benutzerdefinierter Status</label>
                <input
                  value={customStatus}
                  onChange={(e) => {
                    setCustomStatus(e.target.value)
                    updateCustomStatus(e.target.value)
                  }}
                  placeholder="Was machst du gerade?"
                  className="w-full h-9 px-3 rounded border border-[#8a8886] text-sm focus:border-[#0078d4] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'audio-video' && (
          <div>
            <h3 className="text-xl font-semibold text-[#242424] mb-6">Audio & Video</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#242424] mb-1">Mikrofon</label>
                <select className="w-full h-9 px-3 rounded border border-[#8a8886] text-sm focus:border-[#0078d4] focus:outline-none bg-white">
                  <option>Standard-Mikrofon</option>
                  <option>Internes Mikrofon</option>
                  <option>USB-Headset</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#242424] mb-1">Lautsprecher</label>
                <select className="w-full h-9 px-3 rounded border border-[#8a8886] text-sm focus:border-[#0078d4] focus:outline-none bg-white">
                  <option>Standard-Lautsprecher</option>
                  <option>Interner Lautsprecher</option>
                  <option>USB-Headset</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#242424] mb-1">Kamera</label>
                <select className="w-full h-9 px-3 rounded border border-[#8a8886] text-sm focus:border-[#0078d4] focus:outline-none bg-white">
                  <option>Standard-Kamera</option>
                  <option>FaceTime HD</option>
                  <option>Externe USB-Kamera</option>
                </select>
              </div>
              <div className="p-4 bg-[#f5f5f5] rounded-lg">
                <h4 className="text-sm font-medium mb-2">Kamera-Vorschau</h4>
                <div className="w-64 h-36 bg-[#323130] rounded-lg flex items-center justify-center">
                  <span className="text-sm text-white/60">Kamera nicht aktiv</span>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-[#0078d4]" />
                <span className="text-sm">Geräuschunterdrückung aktivieren</span>
              </label>
            </div>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div>
            <h3 className="text-xl font-semibold text-[#242424] mb-6">Benachrichtigungen</h3>
            <div className="space-y-4">
              {[
                { label: 'Neue Nachrichten', desc: 'Benachrichtigung bei neuen Nachrichten' },
                { label: 'Erwähnungen', desc: 'Benachrichtigung wenn du erwähnt wirst' },
                { label: 'Anrufe', desc: 'Benachrichtigung bei eingehenden Anrufen' },
                { label: 'Meeting-Erinnerungen', desc: 'Erinnerung vor anstehenden Meetings' },
                { label: 'Sounds', desc: 'Benachrichtigungstöne abspielen' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-[#242424]">{item.label}</p>
                    <p className="text-xs text-[#605e5c]">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-[#8a8886] peer-checked:bg-[#0078d4] rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'appearance' && (
          <div>
            <h3 className="text-xl font-semibold text-[#242424] mb-6">Darstellung</h3>
            <div>
              <label className="block text-sm font-medium text-[#242424] mb-3">Design</label>
              <div className="flex gap-3">
                {([
                  { value: 'light', label: 'Hell', preview: 'bg-white border-[#e1dfdd]' },
                  { value: 'dark', label: 'Dunkel', preview: 'bg-[#1b1a19] border-[#484644]' },
                  { value: 'system', label: 'System', preview: 'bg-gradient-to-r from-white to-[#1b1a19] border-[#e1dfdd]' },
                ] as const).map(option => (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors',
                      theme === option.value ? 'border-[#0078d4]' : 'border-[#e1dfdd] hover:border-[#a19f9d]'
                    )}
                  >
                    <div className={cn('w-20 h-14 rounded border', option.preview)} />
                    <span className="text-sm">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'privacy' && (
          <div>
            <h3 className="text-xl font-semibold text-[#242424] mb-6">Datenschutz</h3>
            <div className="space-y-4">
              {[
                { label: 'Lesebestätigungen', desc: 'Anderen zeigen, wenn du Nachrichten gelesen hast' },
                { label: 'Online-Status', desc: 'Deinen Online-Status für andere sichtbar machen' },
                { label: 'Tipp-Indikator', desc: 'Anderen zeigen, wenn du gerade tippst' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-[#242424]">{item.label}</p>
                    <p className="text-xs text-[#605e5c]">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-[#8a8886] peer-checked:bg-[#0078d4] rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'about' && (
          <div>
            <h3 className="text-xl font-semibold text-[#242424] mb-6">Über ImpulsMeet</h3>
            <div className="space-y-4">
              <div className="p-4 bg-[#f5f5f5] rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#6264a7] flex items-center justify-center text-white font-bold text-lg">M</div>
                  <div>
                    <h4 className="font-semibold text-[#242424]">ImpulsMeet</h4>
                    <p className="text-sm text-[#605e5c]">Version 0.1.0</p>
                  </div>
                </div>
                <p className="text-sm text-[#605e5c]">
                  ImpulsMeet ist Teil der ImpulsOffice Suite — eine professionelle Kommunikationsplattform
                  für Teams und Unternehmen.
                </p>
              </div>
              <div className="text-sm text-[#605e5c]">
                <p>© 2024 ImpulsOffice. Alle Rechte vorbehalten.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
