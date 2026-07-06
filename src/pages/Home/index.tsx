import { Link } from 'react-router-dom'

const features = [
  {
    name: '拖拽摆放',
    description: '按住家具即可在房间内自由移动，实时贴合墙面边界，所见即所得。',
  },
  {
    name: '旋转与缩放',
    description: '一键旋转家具或整间房，工具栏支持放大缩小，适配任意屏幕查看细节。',
  },
  {
    name: '自定义元素',
    description: '为房间添加任意命名的元素并随意布置，不需要的元素随时删除。',
  },
  {
    name: '本地保存',
    description: '布局自动保存在浏览器本地，刷新或下次打开都会保留上次的方案。',
  },
]

const metrics = [
  ['拖拽', '自由摆放家具'],
  ['旋转', '90° 快速调整'],
  ['自动', '布局本地保存'],
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#070b16] text-slate-100">
      <section className="relative isolate overflow-hidden px-6 py-8 sm:px-10 lg:px-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.22),transparent_32%),radial-gradient(circle_at_75%_20%,rgba(99,102,241,0.22),transparent_28%),linear-gradient(135deg,#070b16_0%,#0f172a_52%,#111827_100%)]" />
        <div className="absolute left-1/2 top-0 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl" />

        <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur">
          <Link to="/" className="flex items-center gap-3 text-sm font-semibold tracking-wide">
            <span className="grid size-9 place-items-center rounded-full bg-cyan-400 text-slate-950">H</span>
            House Web
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/bedroom"
              className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100 transition hover:border-cyan-300/70 hover:bg-cyan-300/15"
            >
              进入设计器
            </Link>
          </div>
        </nav>

        <div className="mx-auto grid max-w-7xl items-center gap-14 py-20 lg:grid-cols-[1.08fr_0.92fr] lg:py-28">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-200">
              Bedroom Layout Designer
            </p>
            <h1 className="max-w-4xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
              在浏览器里规划你的卧室布局
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
              拖拽摆放床与衣柜、旋转和缩放家具、添加自定义元素，实时贴合房间边界，布局自动保存在本地。
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/bedroom"
                className="rounded-full bg-cyan-300 px-6 py-3 text-center font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-200"
              >
                开始设计
              </Link>
              <a
                href="#features"
                className="rounded-full border border-white/15 px-6 py-3 text-center font-semibold text-white transition hover:border-white/35 hover:bg-white/10"
              >
                了解功能
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-slate-950/50 backdrop-blur-xl">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-6">
              <div className="mb-6 flex gap-2">
                <span className="size-3 rounded-full bg-red-400" />
                <span className="size-3 rounded-full bg-amber-300" />
                <span className="size-3 rounded-full bg-emerald-400" />
              </div>
              <pre className="overflow-hidden text-sm leading-7 text-slate-300">
                <code>{`拖拽移动家具
点击旋转 90°
两侧手柄调整长度
新增 / 删除自定义元素
布局自动本地保存`}</code>
              </pre>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {metrics.map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-2xl font-bold text-cyan-200">{value}</div>
                    <div className="mt-1 text-xs text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Features</p>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">规划房间需要的一切</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {features.map((item) => (
              <article
                key={item.name}
                className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 transition hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-white/[0.09]"
              >
                <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                <p className="mt-4 leading-7 text-slate-300">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
