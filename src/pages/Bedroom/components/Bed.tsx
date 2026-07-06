import { useCallback, useEffect, useRef, useState } from 'react'
import { clampToRoom } from '../geometry'
import { type DragDelta, useRoomDrag } from '../useRoomDrag'

const STORAGE_KEY = 'bedroom_bed_state'
const BED_W = 200
const BED_H = 220

interface BedState {
  x: number
  y: number
  rotation: number
}

interface Props {
  roomRotation: number
  effectiveScale: number
}

function loadState(): BedState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed: BedState = JSON.parse(saved)
      // 清除旧版本中可能存在的越界位置
      return { ...parsed, ...clampToRoom(parsed.x, parsed.y, BED_W, BED_H, parsed.rotation) }
    }
  } catch { /* localStorage 不可用或数据损坏时回退默认值 */ }
  return { x: 20, y: 80, rotation: 0 }
}

export default function Bed({ roomRotation, effectiveScale }: Props) {
  const [state, setState] = useState<BedState>(loadState)
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const onDragStart = useCallback(() => ({ ...stateRef.current }), [])
  const onDrag = useCallback(({ local }: DragDelta, start: BedState) => {
    const clamped = clampToRoom(start.x + local.dx, start.y + local.dy, BED_W, BED_H, start.rotation)
    setState(prev => ({ ...prev, ...clamped }))
  }, [])
  const onPointerDown = useRoomDrag({
    roomRotation,
    effectiveScale,
    ignoreSelector: '[data-rotate-handle]',
    onStart: onDragStart,
    onDrag,
  })

  const onRotateClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setState(prev => {
      const newRotation = prev.rotation + 90
      const clamped = clampToRoom(prev.x, prev.y, BED_W, BED_H, newRotation)
      return { ...clamped, rotation: newRotation }
    })
  }, [])

  return (
    <div
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
        touchAction: 'none',
      }}
      onPointerDown={onPointerDown}
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
