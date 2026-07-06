import { type Furniture, KIND_SPECS, normalizeFurniture } from './furniture'

const STORAGE_KEY = 'bedroom_furniture_v1'

// 旧版本(按家具分散存储)的键,用于一次性迁移
const LEGACY_BED_KEY = 'bedroom_bed_state'
const LEGACY_WARDROBE_KEY = 'bedroom_wardrobe_state'
const LEGACY_MANUAL_KEY = 'bedroom_manual_wardrobes_state'

function parse<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/** 内置床与衣柜的出厂默认位置 */
function defaultFurniture(): Furniture[] {
  const bedSpec = KIND_SPECS.bed
  const wSpec = KIND_SPECS.wardrobe
  return [
    normalizeFurniture({ id: 'bed', kind: 'bed', x: 20, y: 80, len: bedSpec.defaultLen, rotation: 0 }),
    normalizeFurniture({
      id: 'wardrobe',
      kind: 'wardrobe',
      x: (460 - wSpec.defaultLen) / 2,
      y: 370 - wSpec.thickness - 20,
      len: wSpec.defaultLen,
      rotation: 0,
    }),
  ]
}

/** 从旧版本分散的 localStorage 键迁移出家具列表;无旧数据时返回 null。 */
function migrateLegacy(): Furniture[] | null {
  const bed = parse<{ x: number; y: number; rotation: number }>(localStorage.getItem(LEGACY_BED_KEY))
  const wardrobe = parse<{ x: number; y: number; len: number; rotation: number }>(localStorage.getItem(LEGACY_WARDROBE_KEY))
  const manual = parse<Array<{ id: string; name: string; x: number; y: number; len: number; rotation: number }>>(
    localStorage.getItem(LEGACY_MANUAL_KEY),
  )
  if (!bed && !wardrobe && !manual) return null

  const bedSpec = KIND_SPECS.bed
  const wSpec = KIND_SPECS.wardrobe
  const list: Furniture[] = [
    normalizeFurniture({ id: 'bed', kind: 'bed', x: bed?.x ?? 20, y: bed?.y ?? 80, len: bedSpec.defaultLen, rotation: bed?.rotation ?? 0 }),
    normalizeFurniture({
      id: 'wardrobe',
      kind: 'wardrobe',
      x: wardrobe?.x ?? (460 - wSpec.defaultLen) / 2,
      y: wardrobe?.y ?? 370 - wSpec.thickness - 20,
      len: wardrobe?.len ?? wSpec.defaultLen,
      rotation: wardrobe?.rotation ?? 0,
    }),
  ]
  if (Array.isArray(manual)) {
    for (const m of manual) {
      if (typeof m?.id === 'string' && typeof m?.name === 'string') {
        list.push(normalizeFurniture({ ...m, kind: 'wardrobe', removable: true }))
      }
    }
  }
  return list
}

export function loadFurniture(): Furniture[] {
  try {
    const saved = parse<Furniture[]>(localStorage.getItem(STORAGE_KEY))
    if (Array.isArray(saved) && saved.length > 0) {
      return saved.map(normalizeFurniture)
    }
    const migrated = migrateLegacy()
    if (migrated) return migrated
  } catch { /* localStorage 不可用时回退默认布局 */ }
  return defaultFurniture()
}

export const FURNITURE_STORAGE_KEY = STORAGE_KEY
