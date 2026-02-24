export interface StyleDefinition {
  name: string
  displayName: string
  basedOn?: string
  fontFamily?: string
  fontSize?: string
  fontWeight?: number
  fontStyle?: 'normal' | 'italic'
  color?: string
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  lineHeight?: string
  spaceBefore?: string
  spaceAfter?: string
  indent?: number
  isHeading?: boolean
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
}

export interface ThemeDefinition {
  name: string
  displayName: string
  headingFont: string
  bodyFont: string
  primaryColor: string
  accentColor: string
  headingColor: string
  bodyColor: string
}
