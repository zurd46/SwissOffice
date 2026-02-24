import type { AIProvider, AIProviderConfig } from './types'
import { OpenAIProvider } from './providers/OpenAIProvider'

export function createAIProvider(
  type: 'openai',
  config: AIProviderConfig,
): AIProvider {
  switch (type) {
    case 'openai':
      return new OpenAIProvider(config)
    default:
      throw new Error(`Unbekannter AI-Provider: ${type}`)
  }
}
