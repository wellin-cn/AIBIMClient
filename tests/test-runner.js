/**
 * 测试运行器
 * 用于启动服务器并运行测试
 */

const { spawn } = require('child_process');
const path = require('path');

let serverProcess = null;

// 启动服务器
function startServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 启动测试服务器...');
    
    const serverPath = path.join(__dirname, '../src/server.ts');
    serverProcess = spawn('npx', ['ts-node', serverPath], {
      env: { ...process.env, NODE_ENV: 'test' },
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[服务器] ${output}`);
      
      if (output.includes('Server is running on port 3001')) {
        console.log('✅ 服务器启动成功');
        resolve();
      }
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error(`[服务器错误] ${data}`);
    });
    
    serverProcess.on('error', (error) => {
      console.error('❌ 服务器启动失败:', error);
      reject(error);
    });
    
    // 5秒超时
    setTimeout(() => {
      reject(new Error('服务器启动超时'));
    }, 5000);
  });
}

// 停止服务器
function stopServer() {
  if (serverProcess) {
    console.log('🛑 停止测试服务器...');
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
}

// 运行测试
async function runTests() {
  try {
    await startServer();
    
    // 等待服务器完全启动
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('🧪 开始运行测试...');
    
    // 运行测试
    const testProcess = spawn('npx', ['mocha', 'tests/multi-user-connection.test.js', '--reporter', 'spec'], {
      stdio: 'inherit'
    });
    
    testProcess.on('close', (code) => {
      console.log(`\n📊 测试完成，退出码: ${code}`);
      stopServer();
      process.exit(code);
    });
    
  } catch (error) {
    console.error('❌ 测试运行失败:', error);
    stopServer();
    process.exit(1);
  }
}

// 处理退出信号
process.on('SIGINT', () => {
  console.log('\n⚠️  收到中断信号，正在清理...');
  stopServer();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  收到终止信号，正在清理...');
  stopServer();
  process.exit(0);
});

// 运行测试
runTests();