import Modal from './Modal'

interface Props {
  name?: string
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmDeleteDialog({ name, onConfirm, onClose }: Props) {
  return (
    <Modal titleId="confirm-delete-title" onClose={onClose}>
      <h2 id="confirm-delete-title" className="text-lg font-semibold text-red-100">确认删除</h2>
      <p className="mt-2 text-sm text-slate-300">确认删除「{name}」吗？该操作不可恢复。</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
        >
          取消
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
        >
          确认
        </button>
      </div>
    </Modal>
  )
}
