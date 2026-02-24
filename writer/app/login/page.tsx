'use client'

import { LoginForm } from '@shared/components/LoginForm'

export default function WriterLoginPage() {
  return (
    <LoginForm
      appName="ImpulsWriter"
      accentColor="#2563eb"
      onSuccess={() => { window.location.href = '/' }}
    />
  )
}
