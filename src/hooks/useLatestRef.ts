import { useEffect, useRef } from 'react'

/**
 * 返回一个始终指向最新 value 的 ref。
 *
 * 用于在事件处理器（如拖拽的 pointermove）里读取最新的 state,
 * 而不必把它加入 useCallback 依赖、反复重建监听器。
 */
export function useLatestRef<T>(value: T): React.RefObject<T> {
  const ref = useRef(value)
  useEffect(() => {
    ref.current = value
  })
  return ref
}
