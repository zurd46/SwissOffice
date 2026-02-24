# Meet — Kommunikationsplattform

Teams-Alternative mit Chat, Kalender, Anrufen, Teams und Dateiverwaltung. Aktuell UI-Prototyp — Backend-Anbindung via Cloud-API in Arbeit.

## Stack

- Next.js 16.1.6 (App Router, React 19)
- TypeScript 5 (strict)
- Tailwind CSS 4
- Lucide React Icons
- date-fns 4 (Datumsformatierung)
- react-dropzone 14 (Datei-Upload)
- Port 3002

## Struktur

```
app/
  layout.tsx              Root-Layout
  page.tsx                Hauptseite (AppShell mit Navigation)
  providers.tsx           Context-Provider (Auth, Chat, Call, WebSocket, Notification)
  globals.css             Globale Stile
  login/page.tsx          Login-Seite
  register/page.tsx       Registrierungs-Seite

components/
  Layout/
    AppShell.tsx           Hauptlayout (Sidebar + Content)
    Sidebar.tsx            Navigation-Seitenleiste
    TopBar.tsx             Kopfleiste
    NavigationItem.tsx     Nav-Eintrag
  Chat/
    ChatPage.tsx           Chat-Übersicht mit Konversationsliste
    ChatView.tsx           Chat-Ansicht (Nachrichten + Input)
    ChatList.tsx           Konversationsliste
    ChatListItem.tsx       Einzelner Listeneintrag
    MessageInput.tsx       Nachrichten-Eingabe mit Attachments
    MessageBubble.tsx      Nachrichten-Blase
    EmojiPicker.tsx        Emoji-Auswahl
    ReactionBar.tsx        Reaktionen unter Nachrichten
    TypingIndicator.tsx    Tipp-Anzeige
    NewChatDialog.tsx      Neuen Chat erstellen
  Call/
    CallsPage.tsx          Anrufverlauf
    CallView.tsx           Aktiver Anruf (Grid-/Speaker-Ansicht)
    CallOverlay.tsx        Anruf-Overlay
    CallTimer.tsx          Anruf-Dauer
  Teams/
    TeamsPage.tsx          Team-Übersicht
    ChannelView.tsx        Kanal-Ansicht
    CreateTeamDialog.tsx   Team erstellen
    CreateChannelDialog.tsx  Kanal erstellen
  Calendar/
    CalendarPage.tsx       Kalender (Tag/Woche/Monat)
  Files/
    FilesPage.tsx          Dateiverwaltung (Grid-/Listenansicht, Filter)
  Notifications/
    NotificationCenter.tsx Benachrichtigungs-Zentrale
    NotificationBadge.tsx  Benachrichtigungs-Badge
  Settings/
    SettingsPage.tsx       Einstellungen (Profil, Audio/Video, Darstellung)
  Shared/
    Avatar.tsx             Benutzer-Avatar
    Badge.tsx              Status-Badge
    Dialog.tsx             Wiederverwendbarer Dialog
    Toast.tsx              Toast-Benachrichtigung
    Tooltip.tsx            Tooltip
    ContextMenu.tsx        Kontextmenü
    Dropdown.tsx           Dropdown-Menü
    Tabs.tsx               Tab-Navigation
    LoadingSpinner.tsx     Ladeanzeige
    SearchInput.tsx        Such-Eingabe
    EmptyState.tsx         Leerer Zustand

lib/
  types/
    index.ts              Typ-Re-Exports
    user.ts               Benutzer-Typen
    team.ts               Team-Typen
    channel.ts            Kanal-Typen
    conversation.ts       Konversations-Typen
    message.ts            Nachrichten-Typen
    call.ts               Anruf-Typen
    meeting.ts            Meeting-Typen
    notification.ts       Benachrichtigungs-Typen
  contexts/
    AuthContext.tsx        Auth-State (Login, User-Info)
    ChatContext.tsx        Chat-State (Konversationen, Nachrichten)
    CallContext.tsx        Anruf-State (aktiver Anruf, Medien)
    WebSocketContext.tsx   WebSocket-Verbindung
    NotificationContext.tsx  Benachrichtigungs-State
  api/
    meetApi.ts            API-Client für Cloud-Backend
  hooks/
    useLocalStorage.ts    LocalStorage-Hook
  utils/
    cn.ts                 className-Helper (Tailwind merge)
    formatDate.ts         Datums-Formatierung (date-fns)
```

## Navigation

Meet nutzt eine Sidebar-Navigation mit folgenden Bereichen:

| Bereich | Komponente | Route/View |
|---|---|---|
| Chat | `ChatPage` | Konversationen + Nachrichten |
| Anrufe | `CallsPage` | Anrufverlauf + aktiver Anruf |
| Teams | `TeamsPage` | Teams + Kanäle |
| Kalender | `CalendarPage` | Tag/Woche/Monat |
| Dateien | `FilesPage` | Dateiliste + Upload |
| Benachrichtigungen | `NotificationCenter` | Alle Benachrichtigungen |
| Einstellungen | `SettingsPage` | Profil, Audio/Video, etc. |

## Status

- UI-Komponenten: Fertig
- Backend-Anbindung: In Arbeit (Chat + Teams via Cloud-API)
- WebSocket: Client vorhanden, Server in `cloud/src/ws/`
- WebRTC (Anrufe): UI-Mockup, kein echtes WebRTC

## Konventionen

- Named Export: `export function Name() {}`
- `'use client'` für alle interaktiven Komponenten
- Path-Alias: `@/*` mappt auf `meet/*`, `@shared/*` auf `shared/`
- Styling: Tailwind CSS
- Icons: `lucide-react`
- Labels: Deutsch
- Shared Components unter `components/Shared/`
- Seiten-Komponenten: `components/{Bereich}/{Bereich}Page.tsx`
- Contexts für State Management statt externer State-Libraries
