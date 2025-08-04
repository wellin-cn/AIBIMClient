/**
 * 聊天应用端到端测试
 * 
 * 使用 Playwright 测试完整的用户交互流程
 */

import { test, expect, Page } from '@playwright/test'

// 测试前置设置
test.beforeEach(async ({ page }) => {
  // 访问应用主页
  await page.goto('http://localhost:5173')
})

test.describe('聊天应用完整流程', () => {
  test('用户应该能够登录并发送消息', async ({ page }) => {
    // 1. 填写登录信息
    await page.fill('input[placeholder*="用户名"]', 'TestUser')
    await page.fill('input[placeholder*="服务器"]', 'ws://localhost:3001')
    
    // 2. 点击连接按钮
    await page.click('button:has-text("连接")')
    
    // 3. 等待连接成功
    await expect(page.locator('text=连接成功')).toBeVisible({ timeout: 10000 })
    
    // 4. 验证进入聊天页面
    await expect(page.locator('[data-testid="chat-window"]')).toBeVisible()
    
    // 5. 发送消息
    const messageInput = page.locator('input[placeholder*="输入消息"]')
    await messageInput.fill('Hello, this is a test message!')
    await page.click('button:has-text("发送")')
    
    // 6. 验证消息出现在聊天窗口
    await expect(page.locator('text=Hello, this is a test message!')).toBeVisible()
    
    // 7. 验证消息状态为已发送
    await expect(page.locator('[data-testid="message-status"]:has-text("已发送")')).toBeVisible()
  })

  test('用户应该能够看到其他用户加入', async ({ page, context }) => {
    // 在第一个页面登录第一个用户
    await loginUser(page, 'User1')
    
    // 打开第二个页面
    const page2 = await context.newPage()
    await page2.goto('http://localhost:5173')
    
    // 在第二个页面登录第二个用户
    await loginUser(page2, 'User2')
    
    // 验证第一个用户看到第二个用户加入
    await expect(page.locator('text=User2 加入了聊天室')).toBeVisible()
    
    // 验证用户列表更新
    await expect(page.locator('[data-testid="user-list"] >> text=User2')).toBeVisible()
    
    await page2.close()
  })

  test('用户应该能够接收其他用户的消息', async ({ page, context }) => {
    // 第一个用户登录
    await loginUser(page, 'User1')
    
    // 第二个用户登录
    const page2 = await context.newPage()
    await page2.goto('http://localhost:5173')
    await loginUser(page2, 'User2')
    
    // 第二个用户发送消息
    const messageInput2 = page2.locator('input[placeholder*="输入消息"]')
    await messageInput2.fill('Message from User2')
    await page2.click('button:has-text("发送")')
    
    // 第一个用户应该能看到消息
    await expect(page.locator('text=Message from User2')).toBeVisible()
    
    // 验证消息发送者显示正确
    await expect(page.locator('[data-testid="message-sender"]:has-text("User2")')).toBeVisible()
    
    await page2.close()
  })

  test('应该显示输入状态指示器', async ({ page, context }) => {
    // 两个用户登录
    await loginUser(page, 'User1')
    
    const page2 = await context.newPage()
    await page2.goto('http://localhost:5173')
    await loginUser(page2, 'User2')
    
    // 第二个用户开始输入
    const messageInput2 = page2.locator('input[placeholder*="输入消息"]')
    await messageInput2.focus()
    await messageInput2.type('User2 is typing...')
    
    // 第一个用户应该看到输入状态
    await expect(page.locator('text=User2 正在输入...')).toBeVisible()
    
    // 停止输入后状态应该消失
    await messageInput2.clear()
    await expect(page.locator('text=User2 正在输入...')).not.toBeVisible()
    
    await page2.close()
  })

  test('应该处理连接中断', async ({ page }) => {
    await loginUser(page, 'TestUser')
    
    // 模拟网络中断（可以通过关闭网络或模拟服务器断开）
    await page.evaluate(() => {
      // 模拟断开连接
      window.socketService?.disconnect()
    })
    
    // 应该显示连接中断提示
    await expect(page.locator('text=连接中断')).toBeVisible()
    
    // 应该显示重连按钮
    await expect(page.locator('button:has-text("重新连接")')).toBeVisible()
  })
})

// 辅助函数
async function loginUser(page: Page, username: string) {
  await page.fill('input[placeholder*="用户名"]', username)
  await page.fill('input[placeholder*="服务器"]', 'ws://localhost:3001')
  await page.click('button:has-text("连接")')
  await expect(page.locator('[data-testid="chat-window"]')).toBeVisible({ timeout: 10000 })
}