#!/usr/bin/env node

/**
 * 测试服务器启动脚本
 * 
 * 用于在运行API测试前启动开发服务器
 */

const { spawn } = require('child_process')
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

function checkServerRunning(port = 3001) {
  return new Promise((resolve) => {
    const http = require('http')
    const req = http.request({
      hostname: 'localhost',
      port: port,
      method: 'HEAD',
      timeout: 1000
    }, (res) => {
      resolve(true)
    })
    
    req.on('error', () => resolve(false))
    req.on('timeout', () => resolve(false))
    req.end()
  })
}

function waitForServer(port = 3001, maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0
    
    const check = async () => {
      attempts++
      log(`🔍 检查服务器状态... (尝试 ${attempts}/${maxAttempts})`, 'blue')
      
      const isRunning = await checkServerRunning(port)
      
      if (isRunning) {
        log('✅ 服务器已启动！', 'green')
        resolve(true)
      } else if (attempts >= maxAttempts) {
        log('❌ 等待服务器启动超时', 'red')
        reject(new Error('Server start timeout'))
      } else {
        setTimeout(check, 2000) // 每2秒检查一次
      }
    }
    
    check()
  })
}

async function findServerProject() {
  // 可能的服务器项目路径
  const possiblePaths = [
    '../server',
    '../../server', 
    '../backend',
    '../../backend',
    '../im-chat-server',
    '../../im-chat-server'
  ]
  
  for (const relativePath of possiblePaths) {
    const serverPath = path.resolve(process.cwd(), relativePath)
    const packageJsonPath = path.join(serverPath, 'package.json')
    
    if (fs.existsSync(packageJsonPath)) {
      log(`📁 找到服务器项目: ${serverPath}`, 'green')
      return serverPath
    }
  }
  
  return null
}

async function startDevServer() {
  log('🚀 启动开发服务器进程...', 'blue')
  
  const serverPath = await findServerProject()
  
  if (!serverPath) {
    log('⚠️ 未找到服务器项目，请手动启动服务器', 'yellow')
    log('💡 请确保服务器运行在 http://localhost:3001', 'yellow')
    return null
  }
  
  log(`📂 切换到服务器目录: ${serverPath}`, 'blue')
  
  const serverProcess = spawn('npm', ['run', 'dev'], {
    cwd: serverPath,
    stdio: ['ignore', 'pipe', 'pipe']
  })
  
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString().trim()
    if (output) {
      log(`[服务器] ${output}`, 'blue')
    }
  })
  
  serverProcess.stderr.on('data', (data) => {
    const output = data.toString().trim()
    if (output && !output.includes('warning')) {
      log(`[服务器错误] ${output}`, 'red')
    }
  })
  
  serverProcess.on('error', (error) => {
    log(`❌ 启动服务器失败: ${error.message}`, 'red')
  })
  
  return serverProcess
}

async function main() {
  log('🔧 测试服务器启动器', 'blue')
  log('=' * 50, 'blue')
  
  // 首先检查服务器是否已经在运行
  log('🔍 检查服务器是否已经运行...', 'blue')
  const isAlreadyRunning = await checkServerRunning()
  
  if (isAlreadyRunning) {
    log('✅ 服务器已经在运行！', 'green')
    log('🎯 可以开始运行API测试了', 'green')
    return
  }
  
  log('📡 服务器未运行，尝试启动...', 'yellow')
  
  try {
    // 启动开发服务器
    const serverProcess = await startDevServer()
    
    if (serverProcess) {
      // 等待服务器启动
      await waitForServer()
      
      log('🎉 服务器启动成功！', 'green')
      log('🚀 现在可以运行API测试: npm run test:api', 'green')
      
      // 注册进程清理
      process.on('SIGINT', () => {
        log('🛑 停止服务器...', 'yellow')
        serverProcess.kill('SIGTERM')
        process.exit(0)
      })
      
      // 保持脚本运行
      log('⏹️ 按 Ctrl+C 停止服务器', 'yellow')
      
    } else {
      log('⚠️ 无法自动启动服务器', 'yellow')
      log('📝 请手动启动服务器后运行测试', 'yellow')
    }
    
  } catch (error) {
    log(`❌ 启动服务器出错: ${error.message}`, 'red')
    log('💡 请手动启动服务器:', 'yellow')
    log('   1. cd ../server (或你的服务器目录)', 'yellow')
    log('   2. npm run dev', 'yellow')
    log('   3. 确保服务器运行在 localhost:3001', 'yellow')
    process.exit(1)
  }
}

// 如果作为脚本直接运行
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  checkServerRunning,
  waitForServer,
  startDevServer
}