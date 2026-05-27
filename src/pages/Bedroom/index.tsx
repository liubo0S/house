import { useState } from 'react'
import { Link } from 'react-router-dom'
import BathroomDoor, { DOOR_W, loadX } from './components/BathroomDoor'
import Bed from './components/Bed'
import Wardrobe from './components/Wardrobe'

export default function BedroomPage() {
  const [doorX, setDoorX] = useState(loadX)
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.2),transparent_28%),linear-gradient(135deg,#111827_0%,#312e81_52%,#0f172a_100%)] px-6 py-8 text-slate-100 sm:px-10 lg:px-16">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-white/10 px-5 py-3 backdrop-blur">
        <Link to="/" className="flex items-center gap-3 text-sm font-semibold tracking-wide">
          <span className="grid size-9 place-items-center rounded-full bg-amber-300 text-slate-950">B</span>
          Bedroom
        </Link>
        <Link
          to="/"
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:border-amber-200/70 hover:bg-white/10"
        >
          返回首页
        </Link>
      </nav>

      <section className="mx-auto grid max-w-6xl items-center gap-10 py-20 lg:grid-cols-[0.95fr_1.05fr] lg:py-28">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-amber-200/40 bg-amber-200/10 px-4 py-2 text-sm font-medium text-amber-100">
            Room Route · /bedroom
          </p>
          <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl">智能卧室空间</h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-indigo-100/80">
            这是 bedroom 路由下的新页面，用于展示卧室场景、空间状态与舒适度信息，可继续扩展为真实业务模块。
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
          <div className="rounded-[1.5rem] bg-slate-950/60 p-6">
            {/* 房间平面图：grid 布局，方向标注完全在房间外 */}
            <div
              className="inline-grid"
              style={{ gridTemplateColumns: 'auto 460px auto', gridTemplateRows: 'auto 370px auto' }}
            >
              {/* 西 - 上方居中 */}
              <div className="col-start-2 row-start-1 flex flex-col items-center gap-1 pb-2">
                <span className="select-none text-[11px] font-bold tracking-[0.25em] text-amber-200/80">西</span>
                <div className="h-3 w-px bg-amber-300/35" />
              </div>

              {/* 南 - 左侧居中 */}
              <div className="col-start-1 row-start-2 flex items-center gap-1 pr-2">
                <span className="select-none text-[11px] font-bold tracking-[0.25em] text-amber-200/80">南</span>
                <div className="h-px w-3 bg-amber-300/35" />
              </div>

              {/* 房间区域：外层 relative 包裹，窗户放在墙外；内层 overflow-hidden 裁剪床 */}
              <div className="relative col-start-2 row-start-2">
                {/* 厕所门 标注（墙外，随门位置移动） */}
                <div
                  style={{ position: 'absolute', top: -22, left: doorX + DOOR_W / 2, transform: 'translateX(-50%)', pointerEvents: 'none', whiteSpace: 'nowrap' }}
                  className="select-none flex items-center rounded-full border border-amber-200/25 bg-indigo-950/55 px-2.5 py-0.5 backdrop-blur-sm"
                >
                  <span className="text-[9px] font-bold tracking-widest text-amber-200/65">厕所门</span>
                </div>
                {/* 西墙窗户（贴在上方墙外，宽130，居中） */}
                <div
                  style={{ position: 'absolute', top: -8, left: 163, width: 130, height: 8 }}
                  className="overflow-hidden rounded-t-sm"
                >
                  <div className="flex h-full items-stretch gap-1 px-2">
                    <div className="flex-1 rounded-t-sm bg-cyan-300/50" />
                    <div className="flex-1 rounded-t-sm bg-cyan-100/30" />
                    <div className="flex-1 rounded-t-sm bg-cyan-300/50" />
                  </div>
                </div>

                {/* 北墙窗户（贴在右侧墙外，高150，居中） */}
                <div
                  style={{ position: 'absolute', right: -8, top: 108, width: 8, height: 150 }}
                  className="overflow-hidden rounded-r-sm"
                >
                  <div className="flex h-full flex-col items-stretch gap-1 py-2">
                    <div className="flex-1 rounded-r-sm bg-cyan-300/50" />
                    <div className="flex-1 rounded-r-sm bg-cyan-100/30" />
                    <div className="flex-1 rounded-r-sm bg-cyan-300/50" />
                  </div>
                </div>

                {/* 房间平面图容器（overflow-hidden 裁剪床） */}
                <div className="isolate size-full overflow-hidden rounded-2xl border-2 border-dashed border-amber-300/40 bg-indigo-950/60">
                  <Bed />
                  <Wardrobe />
                  <BathroomDoor x={doorX} onXChange={setDoorX} />

                  {/* 东墙门口（下方，左侧，宽85）铰链在左端（靠南墙），门扇向室内逆时针展开，开后靠南墙 */}
                  {/* 门洞覆盖层：遮住该段虚线边框 */}
                  <div style={{ position: 'absolute', left: 30, bottom: 0, width: 85, height: 6 }} className="bg-indigo-950/80" />
                  {/* 门扇（左侧竖线，开启位置靠南墙）+ 开合弧（圆心=铰链=左下角，从左上逆时针扫到右下） */}
                  <div
                    style={{
                      position: 'absolute', left: 30, bottom: 0, width: 85, height: 85,
                      borderLeft: '2px solid rgba(251,191,36,0.7)',
                      borderTop: '1.5px dashed rgba(251,191,36,0.45)',
                      borderRight: '1.5px dashed rgba(251,191,36,0.45)',
                      borderTopRightRadius: '100%',
                      pointerEvents: 'none',
                    }}
                  />
                </div>

                {/* 房门 标注 */}
                <div
                  style={{ position: 'absolute', bottom: 12, left: 14, pointerEvents: 'none' }}
                  className="select-none flex items-center gap-1 rounded-full border border-amber-200/25 bg-indigo-950/55 px-2.5 py-0.5 backdrop-blur-sm"
                >
                  <span className="text-[9px] font-bold tracking-widest text-amber-200/65">房门</span>
                </div>
              </div>

              {/* 北 - 右侧居中 */}
              <div className="col-start-3 row-start-2 flex items-center gap-1 pl-2">
                <div className="h-px w-3 bg-amber-300/35" />
                <span className="select-none text-[11px] font-bold tracking-[0.25em] text-amber-200/80">北</span>
              </div>

              {/* 东 - 下方居中 */}
              <div className="col-start-2 row-start-3 flex flex-col items-center gap-1 pt-2">
                <div className="h-3 w-px bg-amber-300/35" />
                <span className="select-none text-[11px] font-bold tracking-[0.25em] text-amber-200/80">东</span>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                ['23°C', '室内温度'],
                ['42%', '空气湿度'],
                ['柔和', '灯光模式'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-2xl font-bold text-amber-100">{value}</div>
                  <div className="mt-1 text-sm text-slate-300">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
