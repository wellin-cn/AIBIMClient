/** @type {import('jest').Config} */
module.exports = {
  // 测试环境
  testEnvironment: 'jsdom',

  // 根目录
  rootDir: '../',

  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/test/**/*.test.{ts,tsx}',
    '<rootDir>/src/**/*.test.{ts,tsx}'
  ],

  // 忽略的测试文件
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/test/e2e/'
  ],

  // 模块文件扩展名
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // 模块名映射（路径别名）
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@test/(.*)$': '<rootDir>/test/$1'
  },

  // TypeScript转换
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },

  // 设置文件
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],

  // 覆盖率配置
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // 模拟静态资源
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub'
  },

  // 全局变量
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json'
    }
  },

  // 测试超时
  testTimeout: 10000,

  // 详细输出
  verbose: true,

  // 清除模拟
  clearMocks: true,
  restoreMocks: true
}