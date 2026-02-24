export interface BibEntry {
  id: string
  type: 'book' | 'article' | 'website' | 'thesis' | 'conference' | 'other'
  authors: string[]
  title: string
  year: string
  publisher?: string
  journal?: string
  volume?: string
  issue?: string
  pages?: string
  url?: string
  accessDate?: string
  doi?: string
  edition?: string
  city?: string
}

export type CitationStyle = 'apa' | 'mla' | 'chicago'

export function generateBibId(): string {
  return `bib-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function formatCitation(entry: BibEntry, style: CitationStyle): string {
  const authorStr = entry.authors.join(', ')
  switch (style) {
    case 'apa':
      return `(${authorStr}, ${entry.year})`
    case 'mla':
      return `(${entry.authors[0]?.split(' ').pop() || ''} ${entry.pages || ''})`
    case 'chicago':
      return `(${authorStr} ${entry.year}, ${entry.pages || ''})`
    default:
      return `(${authorStr}, ${entry.year})`
  }
}

export function formatBibliographyEntry(entry: BibEntry, style: CitationStyle): string {
  const authorStr = entry.authors.join(', ')
  switch (style) {
    case 'apa':
      if (entry.type === 'book') {
        return `${authorStr} (${entry.year}). *${entry.title}*${entry.edition ? ` (${entry.edition} Aufl.)` : ''}. ${entry.publisher || ''}.`
      }
      if (entry.type === 'article') {
        return `${authorStr} (${entry.year}). ${entry.title}. *${entry.journal || ''}*${entry.volume ? `, ${entry.volume}` : ''}${entry.issue ? `(${entry.issue})` : ''}${entry.pages ? `, ${entry.pages}` : ''}.`
      }
      if (entry.type === 'website') {
        return `${authorStr} (${entry.year}). ${entry.title}. ${entry.url || ''}`
      }
      return `${authorStr} (${entry.year}). ${entry.title}.`

    case 'mla':
      if (entry.type === 'book') {
        return `${authorStr}. *${entry.title}*. ${entry.publisher || ''}, ${entry.year}.`
      }
      if (entry.type === 'article') {
        return `${authorStr}. "${entry.title}." *${entry.journal || ''}* ${entry.volume || ''}${entry.issue ? `.${entry.issue}` : ''} (${entry.year})${entry.pages ? `: ${entry.pages}` : ''}.`
      }
      return `${authorStr}. "${entry.title}." ${entry.year}.`

    case 'chicago':
      if (entry.type === 'book') {
        return `${authorStr}. *${entry.title}*. ${entry.city ? `${entry.city}: ` : ''}${entry.publisher || ''}, ${entry.year}.`
      }
      if (entry.type === 'article') {
        return `${authorStr}. "${entry.title}." *${entry.journal || ''}* ${entry.volume || ''}${entry.issue ? `, no. ${entry.issue}` : ''} (${entry.year})${entry.pages ? `: ${entry.pages}` : ''}.`
      }
      return `${authorStr}. "${entry.title}." ${entry.year}.`

    default:
      return `${authorStr}. ${entry.title}. ${entry.year}.`
  }
}
