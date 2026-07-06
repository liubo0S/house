import { useCallback, useEffect, useRef } from 'react'
import { clamp, screenToRoom } from '../geometry'
import { DOOR_W, DOOR_X_MAX, DOOR_X_MIN, saveDoorX } from '../doorPosition'

interface Props { x: number; onXChange: (x: number) => void; roomRotation: number; effectiveScale: number }

export default function BathroomDoor({ x, onXChange, roomRotation, effectiveScale }: Props) {
  const xRef = useRef(x)

  useEffect(() => {
    xRef.current = x
    saveDoorX(x)
  }, [x])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startClientX = e.clientX
    const startClientY = e.clientY
    const startX = xRef.current
    const snapRoomRotation = roomRotation
    const snapScale = effectiveScale
    const onMove = (ev: MouseEvent) => {
      // 厕所门只在房间 X 轴（水平）方向滑动，取本地 dx
      const local = screenToRoom(ev.clientX - startClientX, ev.clientY - startClientY, snapRoomRotation, snapScale)
      onXChange(clamp(startX + local.dx, DOOR_X_MIN, DOOR_X_MAX))
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [onXChange, roomRotation, effectiveScale])

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
