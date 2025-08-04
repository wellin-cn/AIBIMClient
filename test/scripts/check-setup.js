#!/usr/bin/env node

/**
 * 测试环境配置检查脚本
 * 
 * 运行方式: node test/scripts/check-setup.js
 */

const fs = require('fs')
const path = require('path')

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath)
  log(
    `${exists ? '✅' : '❌'} ${description}: ${filePath}`,
    exists ? 'green' : 'red'
  )
  return exists
}

function checkPackageScripts() {
  const packagePath = path.join(process.cwd(), 'package.json')
  if (!fs.existsSync(packagePath)) {
    log('❌ package.json 文件不存在', 'red')
    return false
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  const requiredScripts = [
    'test',
    'test:unit',
    'test:integration',
    'test:e2e',
    'test:coverage'
  ]

  let allScriptsExist = true
  log('\n📋 检查 package.json 脚本:', 'blue')
  
  requiredScripts.forEach(script => {
    const exists = packageJson.scripts && packageJson.scripts[script]
    log(
      `  ${exists ? '✅' : '❌'} ${script}`,
      exists ? 'green' : 'red'
    )
    if (!exists) allScriptsExist = false
  })

  return allScriptsExist
}

function checkDependencies() {
  const packagePath = path.join(process.cwd(), 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  
  const requiredDeps = [
    '@testing-library/react',
    '@testing-library/jest-dom',
    'jest',
    'ts-jest',
    '@playwright/test'
  ]

  let allDepsExist = true
  log('\n📦 检查测试依赖:', 'blue')
  
  requiredDeps.forEach(dep => {
    const exists = (packageJson.devDependencies && packageJson.devDependencies[dep]) ||
                  (packageJson.dependencies && packageJson.dependencies[dep])
    log(
      `  ${exists ? '✅' : '❌'} ${dep}`,
      exists ? 'green' : 'red'
    )
    if (!exists) allDepsExist = false
  })

  return allDepsExist
}

function main() {
  log('🔍 检查测试环境配置...\n', 'blue')

  let allChecksPass = true

  // 检查测试目录结构
  log('📁 检查测试目录结构:', 'blue')
  const testDirs = [
    'test',
    'test/unit',
    'test/integration', 
    'test/e2e',
    'test/fixtures',
    'test/utils'
  ]

  testDirs.forEach(dir => {
    if (!checkFile(dir, '测试目录')) allChecksPass = false
  })

  // 检查配置文件
  log('\n⚙️ 检查配置文件:', 'blue')
  const configFiles = [
    ['test/jest.config.js', 'Jest 配置'],
    ['test/playwright.config.ts', 'Playwright 配置'],
    ['test/setup.ts', '测试环境设置'],
    ['test/README.md', '测试文档']
  ]

  configFiles.forEach(([file, desc]) => {
    if (!checkFile(file, desc)) allChecksPass = false
  })

  // 检查示例测试文件
  log('\n🧪 检查示例测试文件:', 'blue')
  const testFiles = [
    ['test/unit/components/Button.test.tsx', '组件单元测试示例'],
    ['test/unit/hooks/useSocket.test.ts', 'Hook 单元测试示例'],
    ['test/integration/chat.integration.test.ts', '集成测试示例'],
    ['test/e2e/chat-flow.e2e.test.ts', 'E2E 测试示例'],
    ['test/fixtures/mockData.ts', '模拟数据'],
    ['test/utils/testHelpers.ts', '测试工具函数']
  ]

  testFiles.forEach(([file, desc]) => {
    if (!checkFile(file, desc)) allChecksPass = false
  })

  // 检查 package.json 脚本
  if (!checkPackageScripts()) allChecksPass = false

  // 检查依赖
  if (!checkDependencies()) allChecksPass = false

  // 最终结果
  log('\n' + '='.repeat(50), 'blue')
  if (allChecksPass) {
    log('🎉 所有测试环境配置检查通过！', 'green')
    log('现在可以运行: npm run test', 'green')
  } else {
    log('❌ 测试环境配置存在问题，请修复后再试', 'red')
    process.exit(1)
  }
}

main()