import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E 测试配置
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // 测试目录
  testDir: './e2e',

  // 测试文件模式
  testMatch: '**/*.e2e.test.ts',

  // 并发运行测试
  fullyParallel: true,

  // 失败时禁止重试
  forbidOnly: !!process.env.CI,

  // CI环境下重试失败的测试
  retries: process.env.CI ? 2 : 0,

  // 并发工作进程数
  workers: process.env.CI ? 1 : undefined,

  // 报告器
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],

  // 全局设置
  use: {
    // 基础URL
    baseURL: 'http://localhost:5173',

    // 浏览器追踪
    trace: 'on-first-retry',

    // 截图
    screenshot: 'only-on-failure',

    // 视频录制
    video: 'retain-on-failure',

    // 视口大小
    viewport: { width: 1280, height: 720 }
  },

  // 测试项目配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // 移动端测试
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // 开发服务器配置
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // 输出目录
  outputDir: 'test-results/',

  // 超时设置
  timeout: 30000,
  expect: {
    timeout: 10000
  }
})