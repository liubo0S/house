/**
 * 房间内固定装饰元素（窗户、入户门口）的布局常量。
 * 坐标均相对房间区域左上角,单位为未缩放像素。集中在此,方便统一调整平面图。
 */

/** 西墙窗户:贴在房间上方墙外,水平居中 */
export const WEST_WINDOW = { left: 163, width: 130, thickness: 8 }

/** 北墙窗户:贴在房间右侧墙外,垂直居中 */
export const NORTH_WINDOW = { top: 108, height: 150, thickness: 8 }

/** 东墙入户门口:位于下方靠南墙一侧,铰链在左端 */
export const ENTRY_DOOR = { left: 30, width: 85 }
