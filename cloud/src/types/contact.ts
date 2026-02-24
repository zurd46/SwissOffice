export interface Contact {
  id: string
  userId: string
  firstName?: string
  lastName?: string
  displayName: string
  email?: string
  email2?: string
  phone?: string
  phone2?: string
  company?: string
  jobTitle?: string
  street?: string
  city?: string
  zip?: string
  country?: string
  notes?: string
  avatarUrl?: string
  website?: string
  birthday?: string
  microsoftContactId?: string
  createdAt: Date
  updatedAt: Date
}

export interface ContactGroup {
  id: string
  userId: string
  name: string
  color?: string
  memberCount?: number
  createdAt: Date
  updatedAt: Date
}

export interface ContactAutocompleteResult {
  id: string
  displayName: string
  email?: string
  company?: string
}
