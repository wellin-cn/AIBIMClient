#!/usr/bin/env node

/**
 * API测试运行脚本
 * 
 * 自动检查服务器状态并运行API测试
 */

const { spawn } = require('child_process')
const { checkServerRunning, waitForServer } = require('./start-test-server')

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

function runTests(testPattern = 'test/api') {
  return new Promise((resolve, reject) => {
    log(`🧪 运行API测试: ${testPattern}`, 'blue')
    
    const testProcess = spawn('npx', ['jest', '--config=test/jest.config.js', testPattern, '--verbose'], {
      stdio: 'inherit'
    })
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        log('✅ 所有API测试通过！', 'green')
        resolve(true)
      } else {
        log(`❌ API测试失败 (退出码: ${code})`, 'red')
        reject(new Error(`Tests failed with code ${code}`))
      }
    })
    
    testProcess.on('error', (error) => {
      log(`❌ 运行测试出错: ${error.message}`, 'red')
      reject(error)
    })
  })
}

async function main() {
  const args = process.argv.slice(2)
  const testPattern = args[0] || 'test/api'
  
  log('🔬 API测试运行器', 'blue')
  log('=' * 50, 'blue')
  
  try {
    // 检查服务器状态
    log('🔍 检查服务器状态...', 'blue')
    const isServerRunning = await checkServerRunning(3001)
    
    if (!isServerRunning) {
      log('⚠️ 服务器未运行！', 'yellow')
      log('💡 请先启动服务器:', 'yellow')
      log('   方式1: npm run start:test-server', 'yellow')
      log('   方式2: 手动启动服务器项目', 'yellow')
      log('', 'reset')
      log('🔄 等待服务器启动...', 'blue')
      
      // 等待服务器启动（最多等待60秒）
      try {
        await waitForServer(3001, 30)
      } catch (error) {
        log('❌ 服务器启动超时，请手动启动服务器后重试', 'red')
        process.exit(1)
      }
    } else {
      log('✅ 服务器正在运行', 'green')
    }
    
    // 运行测试
    await runTests(testPattern)
    
    log('🎉 API测试完成！', 'green')
    
  } catch (error) {
    log(`❌ API测试失败: ${error.message}`, 'red')
    process.exit(1)
  }
}

// 如果作为脚本直接运行
if (require.main === module) {
  main().catch(console.error)
}