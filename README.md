# House Web · 卧室平面布局设计器

一个可交互的卧室平面图工具：在缩放/旋转的房间视图中拖拽、缩放、旋转家具，并将布局持久化到浏览器本地存储。基于 React 19 + TypeScript + Vite + Tailwind CSS v4 构建，部署于 GitHub Pages。

## 功能

- **家具交互**：床、衣柜支持拖拽移动与点击旋转 90°；衣柜可通过两侧手柄调整长度。所有操作都被约束在房间边界内（含旋转后的包围盒计算）。
- **自定义元素**：可新增带名称的元素并放入房间，支持删除模式逐个移除。
- **房间视图控制**：整间房支持放大、缩小、旋转 90°，以及一键重置。
- **移动端适配**：布局自动缩放以适应屏幕，拖拽同时支持鼠标与触摸。
- **本地持久化**：床、衣柜、厕所门位置及自定义元素均保存在 `localStorage`，刷新后保留。

## 技术栈

| 技术 | 用途 |
| --- | --- |
| React 19 | 组件化 UI 与并发渲染 |
| TypeScript（strict） | 静态类型保障 |
| Vite 8 | 开发服务器与生产构建 |
| Tailwind CSS v4 | 原子化样式 |
| React Router v7 | 页面路由 |
| Vitest + Testing Library | 单元与组件测试 |

## 目录结构

```
src/
├── App.tsx              路由定义（含未知路径兜底）
├── main.tsx             应用入口（ErrorBoundary + GitHub Pages basename）
├── components/          全局组件：ErrorBoundary
├── hooks/               全局 hooks：usePersistentState / useLatestRef
└── pages/
    ├── Home/            首页
    └── Bedroom/         卧室页
        ├── index.tsx        页面容器：工具栏、房间渲染、弹窗
        ├── components/      交互 UI：RoomFloorPlan、DraggableFurniture、Toolbar、Modal、弹窗、图标
        ├── views/           家具外观（BedView / WardrobeView）+ 注册表
        ├── hooks/           useRoomDrag（拖拽）、useAutoScale（自适应缩放）
        └── model/           领域模型与工具：furniture、furnitureStore、geometry、roomLayout、doorPosition（含单元测试）
```

新增一种家具：加一个 `views/XxxView.tsx`，在 `views/registry.ts` 注册，并在 `model/furniture.ts` 的 `KIND_SPECS` 补一条规格即可。

## 本地开发

```bash
npm install
npm run dev        # 启动开发服务器（默认 http://localhost:5173）
```

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器（HMR） |
| `npm run build` | 类型检查 + 生产构建，输出到 `dist/` |
| `npm run lint` | 运行 ESLint |
| `npm test` | 运行 Vitest 单元/组件测试 |
| `npm run test:watch` | 以 watch 模式运行测试 |
| `npm run preview` | 本地预览生产构建产物 |

## 部署

推送到 `main` 分支后，`.github/workflows/deploy.yml` 会先执行 `lint` 与 `test`，通过后再构建并发布到 GitHub Pages；任一环节失败都会阻断部署。构建时通过 `GITHUB_ACTIONS` 环境变量将 `base` 设为 `/house/`，本地开发则为 `/`。
