# Shared — Gemeinsamer Code

Wiederverwendbarer Code für alle Frontend-Module (Writer, Tabulator, Meet).

## Importieren

In den Frontend-Modulen via Path-Alias:
```tsx
import { useAuth, AuthProvider } from '@shared/contexts/AuthContext'
import { createApiClient } from '@shared/api/client'
import { AuthGuard } from '@shared/components/AuthGuard'
```

Voraussetzung: `@shared/*` Path-Alias in `tsconfig.json` + `next.config.ts` (`transpilePackages`, `experimental.externalDir`).

## Struktur

```
shared/
  index.ts                Re-Exports aller öffentlichen APIs

  api/
    client.ts             HTTP-Client für Cloud-API (createApiClient)
    tokenManager.ts       JWT Token-Verwaltung:
                            - getAccessToken / getRefreshToken
                            - setTokens / clearTokens
                            - isTokenExpired
                            - scheduleTokenRefresh (Auto-Refresh)
    types.ts              API-Typen (ApiResponse, ApiError, AuthUser,
                          LoginRequest, RegisterRequest, CloudDocument)

  contexts/
    AuthContext.tsx        AuthProvider + useAuth Hook
                            - login / register / logout
                            - user State, isAuthenticated, isLoading
    CloudContext.tsx       CloudProvider + useCloud Hook
                            - Cloud-Verbindungsstatus
                            - Dokument-Sync

  components/
    AuthGuard.tsx          Route-Schutz (Redirect zu /login wenn nicht eingeloggt)
    LoginForm.tsx          Wiederverwendbares Login-Formular
    RegisterForm.tsx       Wiederverwendbares Registrierungs-Formular

  hooks/
    useCloudStatus.ts     Cloud-Status Hook (online/offline, sync-Status)

  ws/
    wsClient.ts           WebSocket-Client (createWsClient)
                            - Auto-Reconnect
                            - Message-Handler-Registration
                            - Token-basierte Auth
```

## Konventionen

- Alles was von mehr als einem Modul gebraucht wird, gehört hierher
- Öffentliche API immer in `index.ts` re-exportieren
- Named Exports
- `'use client'` für Contexts und Components
- Keine modul-spezifische Logik — nur geteilter Code
