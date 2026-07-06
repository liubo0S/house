import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * 顶层错误边界:捕获渲染期抛出的异常,渲染兜底 UI 而非整页白屏。
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('页面渲染出错:', error, info.componentStack)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.error) {
      return (
        <main className="grid min-h-screen place-items-center bg-slate-950 px-6 text-center text-slate-100">
          <div className="max-w-md">
            <h1 className="text-2xl font-bold text-amber-200">页面出错了</h1>
            <p className="mt-3 text-sm text-slate-400">
              抱歉，出现了一个意外错误。你可以尝试刷新页面。
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 rounded-full bg-amber-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
            >
              刷新页面
            </button>
          </div>
        </main>
      )
    }
    return this.props.children
  }
}
