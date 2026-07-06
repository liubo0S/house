import { describe, expect, it } from 'vitest'
import { KIND_SPECS, createManualElement, normalizeFurniture } from './furniture'
import { ROOM_H, ROOM_W, WALL_BUFFER } from './geometry'

describe('normalizeFurniture', () => {
  it('不可缩放的家具（床）长度锁定为默认值', () => {
    const f = normalizeFurniture({ id: 'bed', kind: 'bed', x: 40, y: 40, len: 999, rotation: 0 })
    expect(f.len).toBe(KIND_SPECS.bed.defaultLen)
  })

  it('可缩放的家具长度不低于最小值', () => {
    const f = normalizeFurniture({ id: 'w', kind: 'wardrobe', x: 40, y: 40, len: 10, rotation: 0 })
    expect(f.len).toBe(KIND_SPECS.wardrobe.minLen)
  })

  it('越界位置会被夹回房间内', () => {
    const f = normalizeFurniture({ id: 'w', kind: 'wardrobe', x: 9999, y: 9999, len: 100, rotation: 0 })
    expect(f.x).toBeCloseTo(ROOM_W - 100 - WALL_BUFFER)
    expect(f.y).toBeCloseTo(ROOM_H - KIND_SPECS.wardrobe.thickness - WALL_BUFFER)
  })

  it('缺省 rotation 归零', () => {
    const f = normalizeFurniture({ id: 'w', kind: 'wardrobe', x: 40, y: 40, len: 100 } as never)
    expect(f.rotation).toBe(0)
  })
})

describe('createManualElement', () => {
  it('生成可删除的衣柜类元素并带名称', () => {
    const el = createManualElement('书桌', 0)
    expect(el.kind).toBe('wardrobe')
    expect(el.removable).toBe(true)
    expect(el.name).toBe('书桌')
    expect(el.id).toBeTruthy()
  })

  it('连续创建的元素 id 不重复', () => {
    const a = createManualElement('A', 0)
    const b = createManualElement('B', 1)
    expect(a.id).not.toBe(b.id)
  })

  it('按已有数量错开摆放位置', () => {
    const first = createManualElement('A', 0)
    const second = createManualElement('B', 1)
    expect(second.x).not.toBe(first.x)
  })
})
