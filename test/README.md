# 测试目录

此目录包含项目的所有测试文件。

## 目录结构

```
test/
├── unit/           # 单元测试
├── integration/    # 集成测试
├── e2e/           # 端到端测试
├── fixtures/      # 测试数据和模拟数据
├── utils/         # 测试工具和辅助函数
├── setup.ts       # 测试环境配置
└── README.md      # 本文件
```

## 测试类型说明

### 单元测试 (unit/)
- 测试单个组件、函数或模块的功能
- 使用 Jest + React Testing Library
- 文件命名: `*.test.ts` 或 `*.test.tsx`

### 集成测试 (integration/)
- 测试多个模块之间的交互
- 包括 API 调用、Socket 连接等
- 文件命名: `*.integration.test.ts`

### 端到端测试 (e2e/)
- 测试完整的用户流程
- 使用 Playwright 或 Cypress
- 文件命名: `*.e2e.test.ts`

### 测试数据 (fixtures/)
- 模拟数据
- 测试用例数据
- 文件命名: `*.mock.ts` 或 `*.fixture.ts`

### 测试工具 (utils/)
- 测试辅助函数
- 自定义 matchers
- 测试工具类

## 运行测试

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 运行端到端测试
npm run test:e2e

# 监视模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

## 测试规范

1. **文件命名**：测试文件应与被测试文件同名，加上 `.test` 后缀
2. **测试描述**：使用清晰的 `describe` 和 `it` 描述
3. **测试数据**：使用 fixtures 目录中的测试数据
4. **模拟依赖**：适当使用 mock 来隔离测试
5. **断言**：使用语义化的断言方法

## 示例

参考各子目录中的示例测试文件。