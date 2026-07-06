import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// 每个测试后卸载渲染的组件,避免相互干扰
afterEach(() => {
  cleanup()
})
