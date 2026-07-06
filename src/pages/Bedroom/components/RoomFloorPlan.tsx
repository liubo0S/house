import BathroomDoor from './BathroomDoor'
import DraggableFurniture from './DraggableFurniture'
import { DOOR_W } from '../doorPosition'
import type { Furniture } from '../furniture'
import { ROOM_H, ROOM_W } from '../geometry'
import { ENTRY_DOOR, NORTH_WINDOW, WEST_WINDOW } from '../roomLayout'

interface Props {
  furniture: Furniture[]
  roomRotation: number
  effectiveScale: number
  deleteMode: boolean
  doorX: number
  onDoorXChange: (x: number) => void
  onFurnitureChange: (id: string, next: Furniture) => void
  onDeleteRequest: (id: string) => void
}

const dirLabel = 'select-none text-[11px] font-bold tracking-[0.25em] text-amber-200/80'
const tag = 'select-none flex items-center rounded-full border border-amber-200/25 bg-indigo-950/55 px-2.5 py-0.5 backdrop-blur-sm'

/** 房间平面图:四面墙方向标注、窗户、入户门口,以及可拖拽的家具与厕所门。 */
export default function RoomFloorPlan({
  furniture,
  roomRotation,
  effectiveScale,
  deleteMode,
  doorX,
  onDoorXChange,
  onFurnitureChange,
  onDeleteRequest,
}: Props) {
  return (
    <div className="inline-grid" style={{ gridTemplateColumns: `auto ${ROOM_W}px auto`, gridTemplateRows: `auto ${ROOM_H}px auto` }}>
      {/* 西 - 上方居中 */}
      <div className="col-start-2 row-start-1 flex flex-col items-center gap-1 pb-2">
        <span className={dirLabel}>西</span>
        <div className="h-3 w-px bg-amber-300/35" />
      </div>

      {/* 南 - 左侧居中 */}
      <div className="col-start-1 row-start-2 flex items-center gap-1 pr-2">
        <span className={dirLabel}>南</span>
        <div className="h-px w-3 bg-amber-300/35" />
      </div>

      {/* 房间区域:外层 relative 包裹,窗户放在墙外;内层 overflow-hidden 裁剪家具 */}
      <div className="relative col-start-2 row-start-2">
        {/* 厕所门 标注(墙外,随门位置移动) */}
        <div
          style={{ position: 'absolute', top: -22, left: doorX + DOOR_W / 2, transform: 'translateX(-50%)', pointerEvents: 'none', whiteSpace: 'nowrap' }}
          className={tag}
        >
          <span className="text-[9px] font-bold tracking-widest text-amber-200/65">厕所门</span>
        </div>

        {/* 西墙窗户(贴在上方墙外,居中) */}
        <div
          style={{ position: 'absolute', top: -WEST_WINDOW.thickness, left: WEST_WINDOW.left, width: WEST_WINDOW.width, height: WEST_WINDOW.thickness }}
          className="overflow-hidden rounded-t-sm"
        >
          <div className="flex h-full items-stretch gap-1 px-2">
            <div className="flex-1 rounded-t-sm bg-cyan-300/50" />
            <div className="flex-1 rounded-t-sm bg-cyan-100/30" />
            <div className="flex-1 rounded-t-sm bg-cyan-300/50" />
          </div>
        </div>

        {/* 北墙窗户(贴在右侧墙外,居中) */}
        <div
          style={{ position: 'absolute', right: -NORTH_WINDOW.thickness, top: NORTH_WINDOW.top, width: NORTH_WINDOW.thickness, height: NORTH_WINDOW.height }}
          className="overflow-hidden rounded-r-sm"
        >
          <div className="flex h-full flex-col items-stretch gap-1 py-2">
            <div className="flex-1 rounded-r-sm bg-cyan-300/50" />
            <div className="flex-1 rounded-r-sm bg-cyan-100/30" />
            <div className="flex-1 rounded-r-sm bg-cyan-300/50" />
          </div>
        </div>

        {/* 房间平面图容器(overflow-hidden 裁剪家具) */}
        <div className="isolate size-full overflow-hidden rounded-2xl border-2 border-dashed border-amber-300/40 bg-indigo-950/60">
          {furniture.map(item => (
            <DraggableFurniture
              key={item.id}
              item={item}
              roomRotation={roomRotation}
              effectiveScale={effectiveScale}
              deleteMode={deleteMode}
              onChange={next => onFurnitureChange(item.id, next)}
              onDeleteClick={() => onDeleteRequest(item.id)}
            />
          ))}
          <BathroomDoor x={doorX} onXChange={onDoorXChange} roomRotation={roomRotation} effectiveScale={effectiveScale} />

          {/* 东墙门口:门洞覆盖层遮住该段虚线边框 */}
          <div style={{ position: 'absolute', left: ENTRY_DOOR.left, bottom: 0, width: ENTRY_DOOR.width, height: 6 }} className="bg-indigo-950/80" />
          {/* 门扇 + 开合弧(圆心=铰链=左下角) */}
          <div
            style={{
              position: 'absolute', left: ENTRY_DOOR.left, bottom: 0, width: ENTRY_DOOR.width, height: ENTRY_DOOR.width,
              borderLeft: '2px solid rgba(251,191,36,0.7)',
              borderTop: '1.5px dashed rgba(251,191,36,0.45)',
              borderRight: '1.5px dashed rgba(251,191,36,0.45)',
              borderTopRightRadius: '100%',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* 房门 标注 */}
        <div style={{ position: 'absolute', bottom: 12, left: 14, pointerEvents: 'none' }} className={`${tag} gap-1`}>
          <span className="text-[9px] font-bold tracking-widest text-amber-200/65">房门</span>
        </div>
      </div>

      {/* 北 - 右侧居中 */}
      <div className="col-start-3 row-start-2 flex items-center gap-1 pl-2">
        <div className="h-px w-3 bg-amber-300/35" />
        <span className={dirLabel}>北</span>
      </div>

      {/* 东 - 下方居中 */}
      <div className="col-start-2 row-start-3 flex flex-col items-center gap-1 pt-2">
        <div className="h-3 w-px bg-amber-300/35" />
        <span className={dirLabel}>东</span>
      </div>
    </div>
  )
}
