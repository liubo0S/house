/** 床的视觉外观。填满父容器（由 DraggableFurniture 按尺寸定位）。 */
export default function BedView() {
  return (
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
  )
}
