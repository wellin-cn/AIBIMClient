// Socket.io连接调试工具
export const testSocketConnection = async (serverUrl: string) => {
  console.log('🧪 Testing Socket.io connection to:', serverUrl)
  
  // 测试基础HTTP连接
  try {
    const response = await fetch(serverUrl)
    const data = await response.text()
    console.log('✅ HTTP connection test:', response.status, data)
  } catch (error) {
    console.error('❌ HTTP connection failed:', error)
    return false
  }
  
  // 测试Socket.io端点
  try {
    const socketResponse = await fetch(`${serverUrl}/socket.io/?EIO=4&transport=polling`)
    console.log('🔌 Socket.io polling test:', socketResponse.status)
    if (socketResponse.ok) {
      const socketData = await socketResponse.text()
      console.log('Socket.io response:', socketData.substring(0, 100) + '...')
    }
  } catch (error) {
    console.error('❌ Socket.io polling test failed:', error)
    return false
  }
  
  return true
}

export const logSocketEvents = (socket: any) => {
  if (!socket) return
  
  socket.on('connect', () => {
    console.log('📡 Socket connected')
    console.log('  - ID:', socket.id)
    console.log('  - Transport:', socket.io.engine.transport.name)
    console.log('  - URL:', socket.io.uri)
  })
  
  socket.on('connect_error', (error: any) => {
    console.error('💥 Socket connection error:', error)
  })
  
  socket.on('disconnect', (reason: string) => {
    console.log('🔌 Socket disconnected:', reason)
  })
  
  socket.io.on('error', (error: any) => {
    console.error('🚨 Socket.io error:', error)
  })
  
  socket.io.engine.on('upgrade', () => {
    console.log('⬆️ Transport upgraded to:', socket.io.engine.transport.name)
  })
  
  socket.io.engine.on('upgradeError', (error: any) => {
    console.error('⬆️❌ Transport upgrade error:', error)
  })
}