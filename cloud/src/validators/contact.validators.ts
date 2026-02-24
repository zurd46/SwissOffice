import { z } from 'zod'

export const createContactSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  displayName: z.string().min(1),
  email: z.string().email().optional(),
  email2: z.string().email().optional(),
  phone: z.string().optional(),
  phone2: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  birthday: z.string().optional(),
})

export const updateContactSchema = createContactSchema.partial()

export const listContactsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(50),
  search: z.string().optional(),
  groupId: z.string().optional(),
})

export const autocompleteContactSchema = z.object({
  q: z.string().min(1),
  limit: z.coerce.number().min(1).max(20).default(10),
})

export const createContactGroupSchema = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
})

export const updateContactGroupSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().optional(),
})

export const addGroupMemberSchema = z.object({
  contactId: z.string().min(1),
})
