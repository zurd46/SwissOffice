'use client'

import { LoginForm } from '@shared/components/LoginForm'

export default function MeetLoginPage() {
  return (
    <LoginForm
      appName="ImpulsMeet"
      accentColor="#6264a7"
      onSuccess={() => { window.location.href = '/' }}
    />
  )
}
