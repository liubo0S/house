import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'bedroom_bed_state'
const BED_W = 200
const BED_H = 220
const ROOM_W = 460  // 外层 relative div 宽度（含 2px 边框）
const ROOM_H = 370  // 外层 relative div 高度（含 2px 边框）
const WALL_BUFFER = 2  // 等于边框宽度，使四面 clip 边界对称

interface BedState {
  x: number
  y: number
  rotation: number
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

/** 根据旋转角计算旋转后包围盒，返回合法的 x/y 范围并约束 */
function clampToRoom(x: number, y: number, rotation: number) {
  const rad = (rotation * Math.PI) / 180
  const cosR = Math.abs(Math.cos(rad))
  const sinR = Math.abs(Math.sin(rad))
  // 旋转后包围盒尺寸
  const rw = BED_W * cosR + BED_H * sinR
  const rh = BED_W * sinR + BED_H * cosR
  // CSS left/top 指向元素左上角（未旋转坐标系），旋转以中心为原点
  // 因此中心 = (x + BED_W/2, y + BED_H/2)
  // 约束：中心 ± rw/2 在 [0, ROOM_W] 内
  const xMin = rw / 2 - BED_W / 2 + WALL_BUFFER
  const xMax = ROOM_W - rw / 2 - BED_W / 2 - WALL_BUFFER
  const yMin = rh / 2 - BED_H / 2 + WALL_BUFFER
  const yMax = ROOM_H - rh / 2 - BED_H / 2 - WALL_BUFFER
  return {
    x: clamp(x, xMin, Math.max(xMin, xMax)),
    y: clamp(y, yMin, Math.max(yMin, yMax)),
  }
}

function loadState(): BedState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed: BedState = JSON.parse(saved)
      // 清除旧版本中可能存在的越界位置
      return { ...parsed, ...clampToRoom(parsed.x, parsed.y, parsed.rotation) }
    }
  } catch {}
  return { x: 20, y: 80, rotation: 0 }
}

export default function Bed() {
  const [state, setState] = useState<BedState>(loadState)
  const stateRef = useRef(state)
  stateRef.current = state

  const bedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const onDragMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-rotate-handle]')) return
    e.preventDefault()

    const startX = e.clientX
    const startY = e.clientY
    const origX = stateRef.current.x
    const origY = stateRef.current.y

    const onMove = (ev: MouseEvent) => {
      const { rotation } = stateRef.current
      const clamped = clampToRoom(origX + ev.clientX - startX, origY + ev.clientY - startY, rotation)
      setState(prev => ({ ...prev, ...clamped }))
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  const onDragTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('[data-rotate-handle]')) return
    e.preventDefault()

    const touch = e.touches[0]
    const startX = touch.clientX
    const startY = touch.clientY
    const origX = stateRef.current.x
    const origY = stateRef.current.y

    const onMove = (ev: TouchEvent) => {
      ev.preventDefault()
      const t = ev.touches[0]
      const { rotation } = stateRef.current
      const clamped = clampToRoom(origX + t.clientX - startX, origY + t.clientY - startY, rotation)
      setState(prev => ({ ...prev, ...clamped }))
    }
    const onUp = () => {
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
  }, [])

  const onRotateClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setState(prev => {
      const newRotation = prev.rotation + 90
      const clamped = clampToRoom(prev.x, prev.y, newRotation)
      return { ...clamped, rotation: newRotation }
    })
  }, [])

  return (
    <div
      ref={bedRef}
      style={{
        position: 'absolute',
        left: state.x,
        top: state.y,
        width: BED_W,
        height: BED_H,
        transform: `rotate(${state.rotation}deg)`,
        transformOrigin: 'center',
        cursor: 'grab',
        userSelect: 'none',
      }}
      onMouseDown={onDragMouseDown}
      onTouchStart={onDragTouchStart}
    >
      {/* 床主体 */}
      <div className="relative size-full overflow-hidden rounded-2xl border border-amber-200/25 bg-gradient-to-b from-amber-950/70 to-amber-900/40 shadow-lg shadow-black/30">
        {/* 床头板 */}
        <div className="absolute inset-x-0 top-0 flex h-11 items-center justify-around rounded-t-2xl border-b border-amber-100/15 bg-amber-800/60 px-7">
          <div className="h-6 w-12 rounded-full border border-amber-100/25 bg-amber-100/15 shadow-inner" />
          <div className="h-6 w-12 rounded-full border border-amber-100/25 bg-amber-100/15 shadow-inner" />
        </div>

        {/* 被褥 */}
        <div className="absolute inset-x-3 bottom-3 top-14 rounded-xl border border-indigo-300/20 bg-indigo-500/20">
          <div className="absolute inset-x-4 top-3 h-px rounded-full bg-indigo-200/15" />
          <div className="absolute inset-x-4 top-6 h-px rounded-full bg-indigo-200/10" />
          <div className="absolute inset-x-4 top-9 h-px rounded-full bg-indigo-200/[0.08]" />
        </div>

        {/* 床尾板 */}
        <div className="absolute inset-x-0 bottom-0 h-4 rounded-b-2xl border-t border-amber-100/15 bg-amber-800/40" />
      </div>

      {/* 旋转按钮：点击旋转 90° */}
      <div
        data-rotate-handle
        title="点击旋转 90°"
        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}
        className="grid size-7 cursor-pointer place-items-center rounded-full border border-amber-100/40 bg-amber-300 shadow-md shadow-black/30 transition-transform hover:scale-110 active:scale-95"
        onClick={onRotateClick}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900">
          <path d="M21 2v6h-6" />
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
        </svg>
      </div>
    </div>
  )
}
