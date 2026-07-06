import type { ComponentType } from 'react'
import type { Furniture, FurnitureKind } from '../furniture'
import BedView from './BedView'
import WardrobeView from './WardrobeView'

export interface FurnitureViewProps {
  item: Furniture
}

/** 种类 → 视觉组件。新增家具种类时在此注册对应视图。 */
export const FURNITURE_VIEWS: Record<FurnitureKind, ComponentType<FurnitureViewProps>> = {
  bed: BedView,
  wardrobe: WardrobeView,
}
