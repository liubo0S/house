import { describe, expect, it } from 'vitest'
import {
  ROOM_H,
  ROOM_W,
  WALL_BUFFER,
  clamp,
  clampToRoom,
  maxLenFromEnd,
  screenToRoom,
} from './geometry'

describe('clamp', () => {
  it('返回区间内的原值', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })
  it('低于下界时取下界', () => {
    expect(clamp(-3, 0, 10)).toBe(0)
  })
  it('高于上界时取上界', () => {
    expect(clamp(42, 0, 10)).toBe(10)
  })
})

describe('screenToRoom', () => {
  it('无旋转无缩放时为恒等映射', () => {
    const r = screenToRoom(10, 20, 0, 1)
    expect(r.dx).toBeCloseTo(10)
    expect(r.dy).toBeCloseTo(20)
  })

  it('先除以缩放系数', () => {
    const r = screenToRoom(10, 20, 0, 2)
    expect(r.dx).toBeCloseTo(5)
    expect(r.dy).toBeCloseTo(10)
  })

  it('抵消房间旋转：房间转 90° 时屏幕向右映射为房间向上', () => {
    // 房间顺时针转 90° 后，屏幕 +x 位移在房间本地坐标里应变为 -y 方向
    const r = screenToRoom(10, 0, 90, 1)
    expect(r.dx).toBeCloseTo(0)
    expect(r.dy).toBeCloseTo(-10)
  })

  it('旋转与缩放叠加', () => {
    const r = screenToRoom(0, 10, 90, 2)
    expect(r.dx).toBeCloseTo(5)
    expect(r.dy).toBeCloseTo(0)
  })
})

describe('clampToRoom', () => {
  it('房间中心附近的位置不被改动', () => {
    const c = clampToRoom(200, 150, 100, 60, 0)
    expect(c.x).toBeCloseTo(200)
    expect(c.y).toBeCloseTo(150)
  })

  it('把越过左/上墙的元素拉回房间内', () => {
    const c = clampToRoom(-100, -100, 100, 60, 0)
    expect(c.x).toBe(WALL_BUFFER)
    expect(c.y).toBe(WALL_BUFFER)
  })

  it('把越过右/下墙的元素拉回房间内', () => {
    const c = clampToRoom(9999, 9999, 100, 60, 0)
    expect(c.x).toBeCloseTo(ROOM_W - 100 - WALL_BUFFER)
    expect(c.y).toBeCloseTo(ROOM_H - 60 - WALL_BUFFER)
  })

  it('旋转 90° 后按交换宽高的包围盒约束', () => {
    // 100x60 的元素转 90° 后包围盒变为 60x100，left/top 仍指未旋转左上角
    const c = clampToRoom(9999, 9999, 100, 60, 90)
    // 旋转后包围盒宽=60，右界 = ROOM_W - 60/2 - 100/2 - buffer
    expect(c.x).toBeCloseTo(ROOM_W - 60 / 2 - 100 / 2 - WALL_BUFFER)
    expect(c.y).toBeCloseTo(ROOM_H - 100 / 2 - 60 / 2 - WALL_BUFFER)
  })
})

describe('maxLenFromEnd', () => {
  const THICKNESS = 60
  const MIN_LEN = 60

  it('固定左端向右生长，不超过右墙', () => {
    const leftX = WALL_BUFFER + THICKNESS / 2
    const cy = ROOM_H / 2
    const max = maxLenFromEnd(leftX, cy, 0, THICKNESS, MIN_LEN, 1)
    // 左端已贴左墙，最大长度约等于房间可用宽度
    expect(max).toBeGreaterThan(MIN_LEN)
    expect(max).toBeLessThanOrEqual(ROOM_W)
    // 验证结果确实贴合右墙：右端中心 + 半厚不越界
    const rightEdge = leftX + max
    expect(rightEdge).toBeLessThanOrEqual(ROOM_W - WALL_BUFFER + 0.5)
  })

  it('固定右端向左生长，与镜像的左端生长结果一致', () => {
    const cy = ROOM_H / 2
    const leftX = WALL_BUFFER + THICKNESS / 2
    const rightX = ROOM_W - WALL_BUFFER - THICKNESS / 2
    const fromLeft = maxLenFromEnd(leftX, cy, 0, THICKNESS, MIN_LEN, 1)
    const fromRight = maxLenFromEnd(rightX, cy, 0, THICKNESS, MIN_LEN, -1)
    expect(fromRight).toBeCloseTo(fromLeft, 1)
  })

  it('空间不足时退回最小长度', () => {
    // 固定端贴着右墙、还要向右生长，放不下
    const max = maxLenFromEnd(ROOM_W - WALL_BUFFER, ROOM_H / 2, 0, THICKNESS, MIN_LEN, 1)
    expect(max).toBe(MIN_LEN)
  })
})
