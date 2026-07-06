import { ResetIcon, RotateIcon, ZoomInIcon, ZoomOutIcon } from './icons'

interface Props {
  onZoomIn: () => void
  onZoomOut: () => void
  onRotate: () => void
  onReset: () => void
}

const btnClass = 'grid size-9 place-items-center rounded-full text-slate-200 transition hover:bg-white/15 active:scale-90'

export default function Toolbar({ onZoomIn, onZoomOut, onRotate, onReset }: Props) {
  return (
    <div className="mb-4 inline-flex items-center gap-0.5 rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur shadow-lg shadow-black/20">
      <button type="button" onClick={onZoomIn} title="放大" aria-label="放大" className={btnClass}>
        <ZoomInIcon />
      </button>
      <button type="button" onClick={onZoomOut} title="缩小" aria-label="缩小" className={btnClass}>
        <ZoomOutIcon />
      </button>

      <div className="h-4 w-px bg-white/25 mx-0.5" />

      <button type="button" onClick={onRotate} title="旋转 90°" aria-label="旋转 90°" className={btnClass}>
        <RotateIcon size={16} />
      </button>

      <div className="h-4 w-px bg-white/25 mx-0.5" />

      <button
        type="button"
        onClick={onReset}
        title="重置"
        aria-label="重置缩放与旋转"
        className="grid size-9 place-items-center rounded-full text-slate-400 transition hover:bg-white/15 hover:text-slate-200 active:scale-90"
      >
        <ResetIcon />
      </button>
    </div>
  )
}
