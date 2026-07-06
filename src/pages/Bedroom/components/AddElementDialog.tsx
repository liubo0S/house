import { useState } from 'react'
import Modal from './Modal'

interface Props {
  onSubmit: (name: string) => void
  onClose: () => void
}

export default function AddElementDialog({ onSubmit, onClose }: Props) {
  const [name, setName] = useState('')
  const trimmed = name.trim()

  return (
    <Modal titleId="add-element-title" onClose={onClose}>
      <form
        onSubmit={e => {
          e.preventDefault()
          if (trimmed) onSubmit(trimmed)
        }}
      >
        <h2 id="add-element-title" className="text-lg font-semibold text-amber-100">新增元素</h2>
        <p className="mt-2 text-sm text-slate-300">请输入元素名称，确认后会添加到房间中。</p>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="请输入名称"
          aria-label="元素名称"
          className="mt-5 w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-200/70"
        />
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={!trimmed}
            className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            确认
          </button>
        </div>
      </form>
    </Modal>
  )
}
