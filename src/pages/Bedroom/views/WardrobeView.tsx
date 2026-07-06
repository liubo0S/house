import type { Furniture } from '../furniture'

interface Props {
  item: Furniture
}

/** 衣柜/自定义元素的视觉外观:柜体 + 若干柜门,可选名称标签。 */
export default function WardrobeView({ item }: Props) {
  // 柜门数量（每扇约 65px 宽）
  const doorCount = Math.max(2, Math.round(item.len / 65))

  return (
    <div className="relative size-full overflow-hidden rounded-lg border border-amber-200/30 bg-gradient-to-b from-slate-700/80 to-slate-800/70 shadow-lg shadow-black/40">
      {/* 顶部装饰线 */}
      <div className="absolute inset-x-0 top-0 h-2 rounded-t-lg bg-slate-600/60 border-b border-amber-100/10" />
      {/* 柜门分隔 */}
      <div className="absolute inset-x-2 bottom-2 top-3 flex gap-1">
        {Array.from({ length: doorCount }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm border border-slate-500/50 bg-slate-700/50 flex items-center justify-center"
          >
            <div className="h-3 w-1 rounded-full bg-amber-200/40" />
          </div>
        ))}
      </div>
      {item.name && (
        <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center px-2">
          <span className="max-w-full truncate rounded-full bg-slate-950/45 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-100 shadow-sm">
            {item.name}
          </span>
        </div>
      )}
    </div>
  )
}
