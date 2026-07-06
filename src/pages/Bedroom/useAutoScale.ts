import { useEffect, useRef, useState } from 'react'

/** main px-6 左右内边距合计 */
const HORIZONTAL_PADDING = 48
/** 为导航栏、工具栏与上下留白预留的垂直空间 */
const VERTICAL_RESERVED = 200

export interface AutoScale {
  /** 挂到需要自动缩放的容器上 */
  cardRef: React.RefObject<HTMLDivElement | null>
  /** 容器未缩放时的自然尺寸 */
  naturalSize: { w: number; h: number }
  /** 使容器适配视口的缩放系数（≤1） */
  autoScale: number
}

/**
 * 测量容器自然尺寸并计算适配当前视口的缩放系数,窗口尺寸变化时自动重算。
 */
export function useAutoScale(): AutoScale {
  const cardRef = useRef<HTMLDivElement>(null)
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 })
  const [autoScale, setAutoScale] = useState(1)

  useEffect(() => {
    const update = () => {
      const card = cardRef.current
      if (!card) return
      const nw = card.scrollWidth
      const nh = card.scrollHeight
      setNaturalSize({ w: nw, h: nh })
      const availW = window.innerWidth - HORIZONTAL_PADDING
      const availH = window.innerHeight - VERTICAL_RESERVED
      setAutoScale(Math.min(1, availW / nw, availH / nh))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return { cardRef, naturalSize, autoScale }
}
