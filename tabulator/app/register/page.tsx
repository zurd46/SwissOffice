'use client'

import { RegisterForm } from '@shared/components/RegisterForm'

export default function TabulatorRegisterPage() {
  return (
    <RegisterForm
      appName="ImpulsTabulator"
      accentColor="#16a34a"
      onSuccess={() => { window.location.href = '/' }}
    />
  )
}
