import { Link } from 'react-router-dom'

const stackItems = [
  {
    name: 'React 19',
    description: '并发渲染、组件化架构与现代交互体验的核心框架。',
  },
  {
    name: 'TypeScript',
    description: '静态类型保障业务复杂度增长时仍具备高可维护性。',
  },
  {
    name: 'Vite',
    description: '极速开发服务器与现代 ESM 构建链路，开箱即用。',
  },
  {
    name: 'Tailwind CSS',
    description: '原子化样式体系，快速构建一致、响应式的产品界面。',
  },
]

const metrics = [
  ['< 1s', '冷启动体验'],
  ['100%', '类型化开发'],
  ['4K', '响应式适配'],
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
              Bedroom
            </Link>
            <a
              href="https://vite.dev"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-300/70 hover:text-white"
            >
              Vite Docs
            </a>
          </div>
        </nav>

        <div className="mx-auto grid max-w-7xl items-center gap-14 py-20 lg:grid-cols-[1.08fr_0.92fr] lg:py-28">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-200">
              Modern Frontend Starter
            </p>
            <h1 className="max-w-4xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
              面向生产环境的下一代前端项目模板
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
              基于 React 19、TypeScript、Vite 与 Tailwind CSS 搭建，兼顾开发效率、类型安全、构建性能与现代视觉体验。
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <a
                href="#stack"
                className="rounded-full bg-cyan-300 px-6 py-3 text-center font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-200"
              >
                查看技术栈
              </a>
              <Link
                to="/bedroom"
                className="rounded-full border border-white/15 px-6 py-3 text-center font-semibold text-white transition hover:border-white/35 hover:bg-white/10"
              >
                进入卧室页面
              </Link>
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
                <code>{`npm run dev

react + typescript
vite instant hmr
tailwind utility-first css
eslint quality gates`}</code>
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

      <section id="stack" className="px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Tech Stack</p>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">主流且先进的前端工程方案</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {stackItems.map((item) => (
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
