import { useCallback, useEffect, useRef } from 'react'
import { clamp } from '../geometry'
import { DOOR_W, DOOR_X_MAX, DOOR_X_MIN, saveDoorX } from '../doorPosition'
import { type DragDelta, useRoomDrag } from '../useRoomDrag'

interface Props { x: number; onXChange: (x: number) => void; roomRotation: number; effectiveScale: number }

export default function BathroomDoor({ x, onXChange, roomRotation, effectiveScale }: Props) {
  const xRef = useRef(x)

  useEffect(() => {
    xRef.current = x
    saveDoorX(x)
  }, [x])

  const onDragStart = useCallback(() => xRef.current, [])
  const onDrag = useCallback(({ local }: DragDelta, startX: number) => {
    // 厕所门只在房间 X 轴（水平）方向滑动，取本地 dx
    onXChange(clamp(startX + local.dx, DOOR_X_MIN, DOOR_X_MAX))
  }, [onXChange])
  const onPointerDown = useRoomDrag({ roomRotation, effectiveScale, onStart: onDragStart, onDrag })

  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: x, width: DOOR_W, height: 4 }} className="bg-indigo-950/60" />
      <div
        style={{ position: 'absolute', top: 0, left: x, width: DOOR_W, height: DOOR_W, cursor: 'ew-resize', touchAction: 'none' }}
        onPointerDown={onPointerDown}
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
