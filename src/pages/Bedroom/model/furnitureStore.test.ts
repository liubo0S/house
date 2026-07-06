import { beforeEach, describe, expect, it } from 'vitest'
import { FURNITURE_STORAGE_KEY, loadFurniture } from './furnitureStore'
import { KIND_SPECS } from './furniture'

const LEGACY_BED_KEY = 'bedroom_bed_state'
const LEGACY_WARDROBE_KEY = 'bedroom_wardrobe_state'
const LEGACY_MANUAL_KEY = 'bedroom_manual_wardrobes_state'

describe('loadFurniture', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('无任何数据时返回内置床 + 衣柜的默认布局', () => {
    const list = loadFurniture()
    expect(list.map(f => f.id).sort()).toEqual(['bed', 'wardrobe'])
    expect(list.every(f => !f.removable)).toBe(true)
  })

  it('优先读取新版单一 blob', () => {
    localStorage.setItem(FURNITURE_STORAGE_KEY, JSON.stringify([
      { id: 'bed', kind: 'bed', x: 10, y: 10, len: 200, rotation: 0 },
    ]))
    const list = loadFurniture()
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe('bed')
  })

  it('从旧版分散 key 迁移床、衣柜与自定义元素', () => {
    localStorage.setItem(LEGACY_BED_KEY, JSON.stringify({ x: 40, y: 100, rotation: 90 }))
    localStorage.setItem(LEGACY_WARDROBE_KEY, JSON.stringify({ x: 100, y: 300, len: 200, rotation: 0 }))
    localStorage.setItem(LEGACY_MANUAL_KEY, JSON.stringify([
      { id: 'm1', name: '书桌', x: 24, y: 24, len: 100, rotation: 0 },
    ]))

    const list = loadFurniture()
    const bed = list.find(f => f.id === 'bed')
    const wardrobe = list.find(f => f.id === 'wardrobe')
    const desk = list.find(f => f.id === 'm1')

    expect(bed?.rotation).toBe(90)
    expect(wardrobe?.len).toBe(200)
    expect(desk?.name).toBe('书桌')
    expect(desk?.kind).toBe('wardrobe')
    expect(desk?.removable).toBe(true)
  })

  it('迁移时过滤掉缺少 id/name 的非法自定义元素', () => {
    localStorage.setItem(LEGACY_MANUAL_KEY, JSON.stringify([
      { id: 'ok', name: '有效', x: 24, y: 24, len: 100, rotation: 0 },
      { name: '缺 id', x: 24, y: 24, len: 100, rotation: 0 },
      { id: 'no-name', x: 24, y: 24, len: 100, rotation: 0 },
    ]))
    const list = loadFurniture()
    const manual = list.filter(f => f.removable)
    expect(manual).toHaveLength(1)
    expect(manual[0].id).toBe('ok')
  })

  it('损坏的 JSON 回退到默认布局', () => {
    localStorage.setItem(FURNITURE_STORAGE_KEY, '{ not valid json')
    const list = loadFurniture()
    expect(list.map(f => f.id).sort()).toEqual(['bed', 'wardrobe'])
  })

  it('迁移出的家具会被归一化到房间内', () => {
    localStorage.setItem(LEGACY_WARDROBE_KEY, JSON.stringify({ x: 9999, y: 9999, len: 200, rotation: 0 }))
    const wardrobe = loadFurniture().find(f => f.id === 'wardrobe')!
    expect(wardrobe.x).toBeLessThan(460)
    expect(wardrobe.y).toBeLessThan(370 - KIND_SPECS.wardrobe.thickness)
  })
})
