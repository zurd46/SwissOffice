import type {
  AIProvider,
  AIProviderConfig,
  AIOperationOptions,
  AIChatOptions,
  AIOperationResult,
} from '../types'
import { SYSTEM_PROMPTS } from '../prompts'

export class OpenAIProvider implements AIProvider {
  readonly name = 'OpenAI'
  private config: Required<AIProviderConfig>

  constructor(config: AIProviderConfig) {
    this.config = {
      model: config.model || 'gpt-4o-mini',
      baseUrl: config.baseUrl || 'https://api.openai.com/v1',
      maxTokens: config.maxTokens || 4096,
      apiKey: config.apiKey,
    }
  }

  async performOperation(options: AIOperationOptions): Promise<AIOperationResult> {
    const systemPrompt = this.getSystemPrompt(options)
    try {
      const response = await this.callAPI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: options.text },
      ])
      return { success: true, content: response }
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
      }
    }
  }

  async chat(options: AIChatOptions): Promise<AIOperationResult> {
    const systemMessage = SYSTEM_PROMPTS.chat(options.documentContent)
    const messages = [
      { role: 'system' as const, content: systemMessage },
      ...options.messages.map((m) => ({ role: m.role, content: m.content })),
    ]
    try {
      const response = await this.callAPI(messages)
      return { success: true, content: response }
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
      }
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.callAPI([{ role: 'user', content: 'Antworte mit OK.' }])
      return true
    } catch {
      return false
    }
  }

  private getSystemPrompt(options: AIOperationOptions): string {
    const lang = options.language || 'Deutsch'
    switch (options.operation) {
      case 'correct':
        return SYSTEM_PROMPTS.correct(lang)
      case 'grammar':
        return SYSTEM_PROMPTS.grammar(lang)
      case 'improve':
        return SYSTEM_PROMPTS.improve(lang)
      case 'summarize':
        return SYSTEM_PROMPTS.summarize(lang)
      case 'translate':
        return SYSTEM_PROMPTS.translate(options.language || 'Englisch')
    }
  }

  private async callAPI(
    messages: { role: string; content: string }[],
  ): Promise<string> {
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        max_tokens: this.config.maxTokens,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const message =
        (errorData as { error?: { message?: string } })?.error?.message ||
        `API-Fehler: ${response.status}`
      throw new Error(message)
    }

    const data = await response.json()
    return (
      (data as { choices?: { message?: { content?: string } }[] })?.choices?.[0]
        ?.message?.content?.trim() || ''
    )
  }
}
