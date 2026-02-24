'use client'

import { LoginForm } from '@shared/components/LoginForm'

export default function TabulatorLoginPage() {
  return (
    <LoginForm
      appName="ImpulsTabulator"
      accentColor="#16a34a"
      onSuccess={() => { window.location.href = '/' }}
    />
  )
}
