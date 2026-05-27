import { useCallback, useEffect, useRef } from 'react'

const STORAGE_KEY = 'bedroom_bathroom_door_x'
export const DOOR_W = 70
const ROOM_W = 460
const X_MIN = 293
const X_MAX = ROOM_W - 2 - DOOR_W

export function loadX(): number {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const x = Number(saved)
      if (!isNaN(x)) return Math.max(X_MIN, Math.min(X_MAX, x))
    }
  } catch {}
  return 350
}

interface Props { x: number; onXChange: (x: number) => void }

export default function BathroomDoor({ x, onXChange }: Props) {
  const xRef = useRef(x)
  xRef.current = x

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(x))
  }, [x])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startClientX = e.clientX
    const startX = xRef.current
    const onMove = (ev: MouseEvent) => {
      onXChange(Math.max(X_MIN, Math.min(X_MAX, startX + ev.clientX - startClientX)))
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [onXChange])

  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: x, width: DOOR_W, height: 4 }} className="bg-indigo-950/60" />
      <div
        style={{ position: 'absolute', top: 0, left: x, width: DOOR_W, height: DOOR_W, cursor: 'ew-resize' }}
        onMouseDown={onMouseDown}
      >
        <div
          style={{
            position: 'absolute', inset: 0,
            borderRight: '2px solid rgba(251,191,36,0.7)',
            borderLeft: '1.5px dashed rgba(251,191,36,0.45)',
            borderBottom: '1.5px dashed rgba(251,191,36,0.45)',
            borderBottomLeftRadius: '100%',
            pointerEvents: 'none',
          }}
        />
      </div>
    </>
  )
}
