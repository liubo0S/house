/**
 * 房间平面图共享几何计算。
 *
 * 坐标系约定：所有 x/y 均为「房间本地坐标」，原点在房间左上角，
 * 单位为未缩放像素。房间外层可能被整体 scale/rotate，拖拽时需先
 * 用 {@link screenToRoom} 把屏幕位移换算回房间本地位移。
 */

/** 房间内壁宽度（含 2px 边框） */
export const ROOM_W = 460
/** 房间内壁高度（含 2px 边框） */
export const ROOM_H = 370
/** 贴墙缓冲，等于边框宽度，使四面裁剪边界对称 */
export const WALL_BUFFER = 2

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

/**
 * 将屏幕坐标增量换算为房间本地坐标增量。
 * 房间被整体 scale(scale) + rotate(roomRotation) 后，需反向抵消这两个变换。
 */
export function screenToRoom(dx: number, dy: number, roomRotation: number, scale: number) {
  const angle = -(roomRotation * Math.PI) / 180
  const sx = dx / scale
  const sy = dy / scale
  return {
    dx: sx * Math.cos(angle) - sy * Math.sin(angle),
    dy: sx * Math.sin(angle) + sy * Math.cos(angle),
  }
}

/**
 * 根据旋转角计算旋转后包围盒，把元素左上角坐标约束在房间内。
 *
 * CSS 的 left/top 指向未旋转坐标系下的左上角，而 `transform: rotate` 以中心为原点，
 * 因此中心 = (x + w/2, y + h/2)，据此计算旋转后包围盒并反推 left/top 的合法范围。
 *
 * @param w 元素未旋转时的宽度
 * @param h 元素未旋转时的高度
 */
export function clampToRoom(x: number, y: number, w: number, h: number, rotation: number) {
  const rad = (rotation * Math.PI) / 180
  const cosR = Math.abs(Math.cos(rad))
  const sinR = Math.abs(Math.sin(rad))
  const rw = w * cosR + h * sinR
  const rh = w * sinR + h * cosR
  const xMin = rw / 2 - w / 2 + WALL_BUFFER
  const xMax = ROOM_W - rw / 2 - w / 2 - WALL_BUFFER
  const yMin = rh / 2 - h / 2 + WALL_BUFFER
  const yMax = ROOM_H - rh / 2 - h / 2 - WALL_BUFFER
  return {
    x: clamp(x, xMin, Math.max(xMin, xMax)),
    y: clamp(y, yMin, Math.max(yMin, yMax)),
  }
}

/**
 * 固定一端、计算在房间内能放下的最大长度（用于衣柜两侧长度调整）。
 *
 * @param ex        固定端的房间本地 x
 * @param ey        固定端的房间本地 y
 * @param rotation  元素旋转角（度）
 * @param thickness 元素厚度（垂直于长度方向）
 * @param minLen    允许的最小长度
 * @param dir       生长方向：+1 表示固定左端向右生长，-1 表示固定右端向左生长
 */
export function maxLenFromEnd(
  ex: number,
  ey: number,
  rotation: number,
  thickness: number,
  minLen: number,
  dir: 1 | -1,
): number {
  const rad = (rotation * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const cosA = Math.abs(cos)
  const sinA = Math.abs(sin)
  const fits = (L: number) => {
    const cx = ex + dir * (L / 2) * cos
    const cy = ey + dir * (L / 2) * sin
    const rw = L * cosA + thickness * sinA
    const rh = L * sinA + thickness * cosA
    return cx - rw / 2 >= WALL_BUFFER && cx + rw / 2 <= ROOM_W - WALL_BUFFER
        && cy - rh / 2 >= WALL_BUFFER && cy + rh / 2 <= ROOM_H - WALL_BUFFER
  }
  if (!fits(minLen)) return minLen
  let lo = minLen
  let hi = ROOM_W
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2
    if (fits(mid)) lo = mid
    else hi = mid
  }
  return lo
}
