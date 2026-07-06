import { useEffect, useState } from 'react'

/**
 * 与 localStorage 同步的 useState。
 *
 * 初始值由 load() 提供（各调用方自行处理解析与校验/归一化）;
 * 每当 state 变化时以 JSON 形式写回 key。读写异常都会被吞掉,
 * 以免 localStorage 不可用（隐私模式等）时导致崩溃。
 */
export function usePersistentState<T>(
  key: string,
  load: () => T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(load)

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch { /* localStorage 不可用时忽略写入 */ }
  }, [key, state])

  return [state, setState]
}
