'use client'

import { RegisterForm } from '@shared/components/RegisterForm'

export default function MeetRegisterPage() {
  return (
    <RegisterForm
      appName="ImpulsMeet"
      accentColor="#6264a7"
      onSuccess={() => { window.location.href = '/' }}
    />
  )
}
