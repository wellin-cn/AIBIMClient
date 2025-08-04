# 测试快速开始指南

## 🚀 快速开始

### 1. 安装测试依赖

```bash
# 安装所有依赖（包括测试依赖）
npm install

# 安装 Playwright 浏览器（仅 E2E 测试需要）
npx playwright install
```

### 2. 检查测试环境

```bash
# 运行环境检查脚本
node test/scripts/check-setup.js
```

### 3. 运行测试

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试  
npm run test:integration

# 运行 E2E 测试
npm run test:e2e

# 监视模式（开发时使用）
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

## 📝 编写测试

### 单元测试示例

```typescript
// test/unit/components/MyComponent.test.tsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MyComponent } from '../../../src/components/MyComponent'

describe('MyComponent', () => {
  it('应该渲染正确的内容', () => {
    render(<MyComponent title="测试标题" />)
    
    expect(screen.getByText('测试标题')).toBeInTheDocument()
  })

  it('应该处理点击事件', () => {
    const handleClick = jest.fn()
    render(<MyComponent onClick={handleClick} />)
    
    fireEvent.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### Hook 测试示例

```typescript
// test/unit/hooks/useMyHook.test.ts
import { renderHook, act } from '@testing-library/react'
import { useMyHook } from '../../../src/hooks/useMyHook'

describe('useMyHook', () => {
  it('应该返回正确的初始值', () => {
    const { result } = renderHook(() => useMyHook())
    
    expect(result.current.value).toBe(0)
  })

  it('应该正确更新值', () => {
    const { result } = renderHook(() => useMyHook())
    
    act(() => {
      result.current.increment()
    })
    
    expect(result.current.value).toBe(1)
  })
})
```

### 集成测试示例

```typescript
// test/integration/feature.integration.test.ts
import { socketService } from '../../src/services/socketService'
import { useChatStore } from '../../src/store/chatStore'

describe('聊天功能集成测试', () => {
  beforeEach(() => {
    // 重置状态
    useChatStore.getState().clearMessages()
  })

  it('应该完成完整的消息发送流程', async () => {
    // 1. 连接
    await socketService.connect('ws://localhost:3001', 'testuser')
    
    // 2. 发送消息
    const message = await socketService.sendMessage('Hello')
    
    // 3. 验证结果
    expect(message.content).toBe('Hello')
  })
})
```

### E2E 测试示例

```typescript
// test/e2e/login.e2e.test.ts
import { test, expect } from '@playwright/test'

test('用户登录流程', async ({ page }) => {
  // 访问应用
  await page.goto('/')
  
  // 填写登录信息
  await page.fill('input[name="username"]', 'testuser')
  await page.fill('input[name="server"]', 'ws://localhost:3001')
  
  // 点击登录
  await page.click('button[type="submit"]')
  
  // 验证登录成功
  await expect(page.locator('[data-testid="chat-window"]')).toBeVisible()
})
```

## 🛠️ 测试工具和技巧

### 使用模拟数据

```typescript
import { mockUsers, mockMessages } from '@test/fixtures/mockData'

// 使用预定义的模拟数据
const user = mockUsers[0]
const message = mockMessages[0]
```

### 使用测试工具函数

```typescript
import { createMockSocketService, waitFor } from '@test/utils/testHelpers'

// 创建模拟服务
const mockSocket = createMockSocketService()

// 等待异步操作
await waitFor(100)
```

### 调试测试

```bash
# 调试单元测试
npm run test:watch -- --verbose

# 调试 E2E 测试
npm run test:e2e:debug

# 查看 E2E 测试界面
npm run test:e2e:ui
```

### 生成覆盖率报告

```bash
npm run test:coverage
```

报告将生成在 `coverage/` 目录中，打开 `coverage/lcov-report/index.html` 查看详细报告。

## 📋 最佳实践

### 1. 测试命名
- 使用描述性的测试名称
- 中文描述更清晰易懂
- 遵循 "应该做什么" 的格式

### 2. 测试结构
- 使用 `describe` 分组相关测试
- 每个测试文件对应一个模块
- 将测试分为 Arrange、Act、Assert 三个部分

### 3. 模拟和隔离
- 使用 `jest.mock()` 模拟外部依赖
- 在 `beforeEach` 中重置状态
- 使用 fixtures 提供一致的测试数据

### 4. 异步测试
- 使用 `async/await` 处理异步操作
- 设置合适的超时时间
- 使用 `waitFor` 等待状态变化

### 5. E2E 测试
- 测试用户关键路径
- 使用 `data-testid` 定位元素
- 模拟真实用户行为

## 🔧 常见问题

### Q: 测试运行很慢怎么办？
A: 
- 使用 `--watchAll=false` 选项
- 只运行相关测试文件
- 考虑使用并行测试

### Q: 模拟 Socket 连接？
A: 参考 `test/fixtures/mockData.ts` 中的示例

### Q: 测试异步操作？
A: 使用 `async/await` 和 `waitFor` 工具函数

### Q: E2E 测试失败？
A: 
- 确保开发服务器正在运行
- 检查元素选择器是否正确
- 增加等待时间

## 📚 更多资源

- [Jest 文档](https://jestjs.io/docs/getting-started)
- [React Testing Library 文档](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright 文档](https://playwright.dev/docs/intro)
- [测试最佳实践](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)