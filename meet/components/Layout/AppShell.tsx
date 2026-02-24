'use client'

import { useState } from 'react'
import { Sidebar, type NavPage } from './Sidebar'
import { TopBar } from './TopBar'
import { AuthProvider } from '@/lib/contexts/AuthContext'
import { ChatProvider } from '@/lib/contexts/ChatContext'
import { CallProvider } from '@/lib/contexts/CallContext'
import { NotificationProvider } from '@/lib/contexts/NotificationContext'
import { ToastProvider } from '@/components/Shared/Toast'
import { ChatPage } from '@/components/Chat/ChatPage'
import { TeamsPage } from '@/components/Teams/TeamsPage'
import { CallsPage } from '@/components/Call/CallsPage'
import { CalendarPage } from '@/components/Calendar/CalendarPage'
import { FilesPage } from '@/components/Files/FilesPage'
import { SettingsPage } from '@/components/Settings/SettingsPage'
import { CallOverlay } from '@/components/Call/CallOverlay'

export function AppShell() {
  const [activePage, setActivePage] = useState<NavPage>('chat')

  return (
    <AuthProvider>
      <ChatProvider>
        <CallProvider>
          <NotificationProvider>
            <ToastProvider>
              <div className="h-screen flex flex-col bg-white">
                <TopBar />
                <div className="flex flex-1 overflow-hidden">
                  <Sidebar activePage={activePage} onPageChange={setActivePage} />
                  <main className="flex-1 overflow-hidden">
                    {activePage === 'chat' && <ChatPage />}
                    {activePage === 'teams' && <TeamsPage />}
                    {activePage === 'calls' && <CallsPage />}
                    {activePage === 'calendar' && <CalendarPage />}
                    {activePage === 'files' && <FilesPage />}
                    {activePage === 'settings' && <SettingsPage />}
                  </main>
                </div>
                <CallOverlay />
              </div>
            </ToastProvider>
          </NotificationProvider>
        </CallProvider>
      </ChatProvider>
    </AuthProvider>
  )
}
