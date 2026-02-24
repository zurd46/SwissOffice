export interface MailMergeDataSource {
  fields: string[]
  records: Record<string, string>[]
}

export function parseCSV(csvText: string): MailMergeDataSource {
  const lines = csvText.split('\n').filter(line => line.trim())
  if (lines.length === 0) {
    return { fields: [], records: [] }
  }

  // Simple CSV parser (handles quoted fields)
  const parseLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if ((char === ',' || char === ';') && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  const fields = parseLine(lines[0])
  const records = lines.slice(1).map(line => {
    const values = parseLine(line)
    const record: Record<string, string> = {}
    fields.forEach((field, i) => {
      record[field] = values[i] || ''
    })
    return record
  })

  return { fields, records }
}
