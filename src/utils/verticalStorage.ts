import type { SelectableVertical } from '../components/VerticalSelectorModal'

// Opción B — Vertical-first UX.
// La vertical elegida por el usuario al inicio del flujo se persiste en
// localStorage para que todos los pasos siguientes (chat de discovery,
// recomendación, click final "Generar") la lean sin volver a pedirla.
export const SELECTED_VERTICAL_STORAGE_KEY = 'codly_selected_vertical'

const VALID_VERTICALS: ReadonlyArray<SelectableVertical> = [
  'fintech',
  'retail',
  'healthcare',
  'legal',
  'sales',
  'manufacturing',
  'hr',
  'logistics',
  'cybersecurity',
  'realestate',
  'insurance',
  'education',
  'energy',
  'public_sector',
  'agriculture',
  'general',
]

export function readSelectedVertical(): SelectableVertical | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SELECTED_VERTICAL_STORAGE_KEY)
    if (raw && VALID_VERTICALS.includes(raw as SelectableVertical)) {
      return raw as SelectableVertical
    }
  } catch {
    // localStorage may be disabled (private browsing, etc.)
  }
  return null
}

export function writeSelectedVertical(vertical: SelectableVertical): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SELECTED_VERTICAL_STORAGE_KEY, vertical)
  } catch {
    // ignore
  }
}

export function clearSelectedVertical(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(SELECTED_VERTICAL_STORAGE_KEY)
  } catch {
    // ignore
  }
}
