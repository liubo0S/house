import { ROOM_W, WALL_BUFFER, clamp } from './geometry'

const STORAGE_KEY = 'bedroom_bathroom_door_x'

/** 厕所门洞宽度 */
export const DOOR_W = 70
/** 门只能在东墙靠厕所一侧（房间右段）水平滑动，故左界固定为 293 */
export const DOOR_X_MIN = 293
export const DOOR_X_MAX = ROOM_W - WALL_BUFFER - DOOR_W

export function loadDoorX(): number {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const x = Number(saved)
      if (!Number.isNaN(x)) return clamp(x, DOOR_X_MIN, DOOR_X_MAX)
    }
  } catch { /* localStorage 不可用或数据损坏时回退默认值 */ }
  return 350
}

export function saveDoorX(x: number): void {
  localStorage.setItem(STORAGE_KEY, String(x))
}
