import { ROOM_H, ROOM_W, clampToRoom } from './geometry'

/** 家具种类。新增一种家具:在此加类型 + 补 KIND_SPECS + 注册视图。 */
export type FurnitureKind = 'bed' | 'wardrobe'

export interface Furniture {
  id: string
  kind: FurnitureKind
  /** 用户自定义元素的名称（内置家具无名称） */
  name?: string
  /** 是否可被用户删除（内置床/衣柜不可删） */
  removable?: boolean
  x: number
  y: number
  /** 长轴尺寸（未旋转时的宽度） */
  len: number
  rotation: number
}

export interface KindSpec {
  /** 短轴尺寸（未旋转时的高度） */
  thickness: number
  /** 是否可调整长度 */
  resizable: boolean
  defaultLen: number
  minLen: number
}

export const KIND_SPECS: Record<FurnitureKind, KindSpec> = {
  bed: { thickness: 220, resizable: false, defaultLen: 200, minLen: 200 },
  wardrobe: { thickness: 60, resizable: true, defaultLen: 260, minLen: 60 },
}

/** 归一化:按种类约束长度,并把位置夹在房间内。 */
export function normalizeFurniture(f: Furniture): Furniture {
  const spec = KIND_SPECS[f.kind]
  const len = spec.resizable ? Math.max(spec.minLen, f.len || spec.defaultLen) : spec.defaultLen
  const rotation = f.rotation || 0
  const clamped = clampToRoom(f.x, f.y, len, spec.thickness, rotation)
  return { ...f, ...clamped, len, rotation }
}

let manualSeq = 0

/** 创建一个用户自定义元素（外观为衣柜），按已有数量错开摆放位置。 */
export function createManualElement(name: string, existingCount: number): Furniture {
  const spec = KIND_SPECS.wardrobe
  const len = 100
  const offset = (existingCount % 6) * 14
  const x = Math.min(ROOM_W - len - 16, 24 + offset)
  const y = Math.min(ROOM_H - spec.thickness - 16, 24 + offset)
  const id = `${Date.now()}_${(manualSeq++).toString(36)}_${Math.random().toString(36).slice(2, 6)}`
  return normalizeFurniture({ id, kind: 'wardrobe', name, removable: true, x, y, len, rotation: 0 })
}
