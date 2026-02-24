// =============================================
// ImpulsTabulator — Dependency Graph
// =============================================

/** Verwaltet Zell-Abhängigkeiten für Neuberechnung */
export class DependencyGraph {
  // cell -> Set von Zellen, von denen sie abhängt
  private dependencies = new Map<string, Set<string>>()
  // cell -> Set von Zellen, die von ihr abhängen
  private dependents = new Map<string, Set<string>>()

  /** Setzt die Abhängigkeiten einer Zelle */
  setDependencies(cell: string, dependsOn: string[]): void {
    // Alte Abhängigkeiten entfernen
    this.removeDependencies(cell)

    // Neue Abhängigkeiten setzen
    const deps = new Set(dependsOn)
    this.dependencies.set(cell, deps)

    // Reverse-Mapping aktualisieren
    for (const dep of dependsOn) {
      if (!this.dependents.has(dep)) {
        this.dependents.set(dep, new Set())
      }
      this.dependents.get(dep)!.add(cell)
    }
  }

  /** Entfernt alle Abhängigkeiten einer Zelle */
  removeDependencies(cell: string): void {
    const oldDeps = this.dependencies.get(cell)
    if (oldDeps) {
      for (const dep of oldDeps) {
        this.dependents.get(dep)?.delete(cell)
      }
      this.dependencies.delete(cell)
    }
  }

  /** Gibt alle Zellen zurück, die von einer Zelle abhängen (direkt) */
  getDirectDependents(cell: string): Set<string> {
    return this.dependents.get(cell) || new Set()
  }

  /** Gibt alle Zellen zurück, die neu berechnet werden müssen (transitiv) */
  getAllDependents(changedCells: string[]): Set<string> {
    const result = new Set<string>()
    const queue = [...changedCells]

    while (queue.length > 0) {
      const cell = queue.shift()!
      const deps = this.dependents.get(cell)
      if (deps) {
        for (const dep of deps) {
          if (!result.has(dep)) {
            result.add(dep)
            queue.push(dep)
          }
        }
      }
    }

    return result
  }

  /** Topologische Sortierung für Neuberechnungs-Reihenfolge */
  getRecalcOrder(cells: Set<string>): string[] {
    const visited = new Set<string>()
    const result: string[] = []
    const inStack = new Set<string>()

    const visit = (cell: string): boolean => {
      if (inStack.has(cell)) return false // Zirkuläre Abhängigkeit
      if (visited.has(cell)) return true

      inStack.add(cell)
      const deps = this.dependencies.get(cell)
      if (deps) {
        for (const dep of deps) {
          if (cells.has(dep)) {
            if (!visit(dep)) return false
          }
        }
      }
      inStack.delete(cell)
      visited.add(cell)
      result.push(cell)
      return true
    }

    for (const cell of cells) {
      if (!visited.has(cell)) {
        if (!visit(cell)) {
          // Zirkuläre Abhängigkeit — trotzdem hinzufügen
          result.push(cell)
        }
      }
    }

    return result
  }

  /** Prüft auf zirkuläre Abhängigkeiten */
  hasCircularDependency(cell: string): boolean {
    const visited = new Set<string>()
    const check = (current: string): boolean => {
      if (current === cell && visited.size > 0) return true
      if (visited.has(current)) return false
      visited.add(current)
      const deps = this.dependencies.get(current)
      if (deps) {
        for (const dep of deps) {
          if (check(dep)) return true
        }
      }
      return false
    }
    return check(cell)
  }

  /** Leert den gesamten Graph */
  clear(): void {
    this.dependencies.clear()
    this.dependents.clear()
  }
}
