# Page snapshot

```yaml
- text: "[plugin:vite:import-analysis] Failed to resolve import \"@/components/ui/input\" from \"src/pages/BacklogPage.tsx\". Does the file exist? /app/task-flow-pro/src/pages/BacklogPage.tsx:17:22 30 | import { TaskModal } from \"@/components/task/TaskModal\"; 31 | import { Button } from \"@/components/ui/button\"; 32 | import { Input } from \"@/components/ui/input\"; | ^ 33 | import { 34 | Select, at TransformPluginContext._formatLog (file:///app/task-flow-pro/node_modules/vite/dist/node/chunks/dep-DBxKXgDP.js:42499:41) at TransformPluginContext.error (file:///app/task-flow-pro/node_modules/vite/dist/node/chunks/dep-DBxKXgDP.js:42496:16) at normalizeUrl (file:///app/task-flow-pro/node_modules/vite/dist/node/chunks/dep-DBxKXgDP.js:40475:23) at process.processTicksAndRejections (node:internal/process/task_queues:105:5) at async file:///app/task-flow-pro/node_modules/vite/dist/node/chunks/dep-DBxKXgDP.js:40594:37 at async Promise.all (index 13) at async TransformPluginContext.transform (file:///app/task-flow-pro/node_modules/vite/dist/node/chunks/dep-DBxKXgDP.js:40521:7) at async EnvironmentPluginContainer.transform (file:///app/task-flow-pro/node_modules/vite/dist/node/chunks/dep-DBxKXgDP.js:42294:18) at async loadAndTransform (file:///app/task-flow-pro/node_modules/vite/dist/node/chunks/dep-DBxKXgDP.js:35735:27) at async viteTransformMiddleware (file:///app/task-flow-pro/node_modules/vite/dist/node/chunks/dep-DBxKXgDP.js:37250:24 Click outside, press Esc key, or fix the code to dismiss. You can also disable this overlay by setting"
- code: server.hmr.overlay
- text: to
- code: "false"
- text: in
- code: vite.config.ts
- text: .
```