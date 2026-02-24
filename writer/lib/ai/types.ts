export interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

export interface AIOperationResult {
  success: boolean
  content: string
  error?: string
}

export type AIOperation =
  | 'correct'
  | 'grammar'
  | 'improve'
  | 'summarize'
  | 'translate'

export interface AIOperationOptions {
  operation: AIOperation
  text: string
  language?: string
}

export interface AIChatOptions {
  messages: AIMessage[]
  documentContent?: string
}

export interface AIProviderConfig {
  apiKey: string
  model?: string
  baseUrl?: string
  maxTokens?: number
}

export interface AIProvider {
  readonly name: string
  performOperation(options: AIOperationOptions): Promise<AIOperationResult>
  chat(options: AIChatOptions): Promise<AIOperationResult>
  testConnection(): Promise<boolean>
}

export interface AISettings {
  provider: 'openai'
  apiKey: string
  model: string
  baseUrl: string
  documentLanguage: string
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: 'openai',
  apiKey: '',
  model: 'gpt-4o-mini',
  baseUrl: 'https://api.openai.com/v1',
  documentLanguage: 'Deutsch',
}

export interface OCRImportResult {
  success: boolean
  html: string
  error?: string
  pageCount?: number
}

export const SUPPORTED_LANGUAGES = [
  { label: 'Deutsch', value: 'Deutsch' },
  { label: 'Englisch', value: 'Englisch' },
  { label: 'Französisch', value: 'Französisch' },
  { label: 'Italienisch', value: 'Italienisch' },
  { label: 'Spanisch', value: 'Spanisch' },
  { label: 'Portugiesisch', value: 'Portugiesisch' },
  { label: 'Niederländisch', value: 'Niederländisch' },
  { label: 'Polnisch', value: 'Polnisch' },
  { label: 'Türkisch', value: 'Türkisch' },
  { label: 'Russisch', value: 'Russisch' },
  { label: 'Japanisch', value: 'Japanisch' },
  { label: 'Chinesisch', value: 'Chinesisch' },
]
