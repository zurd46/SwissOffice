'use client'

import { RegisterForm } from '@shared/components/RegisterForm'

export default function WriterRegisterPage() {
  return (
    <RegisterForm
      appName="ImpulsWriter"
      accentColor="#2563eb"
      onSuccess={() => { window.location.href = '/' }}
    />
  )
}
