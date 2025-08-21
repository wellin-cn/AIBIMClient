#!/bin/bash

# 多用户连接测试脚本
# 用于测试多个用户登录、发消息、收消息的流程

set -e

echo "🧪 IM服务器多用户连接测试"
echo "================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查依赖
check_dependencies() {
    echo -e "${BLUE}📦 检查依赖...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js 未安装${NC}"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ NPM 未安装${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 依赖检查通过${NC}"
}

# 停止现有服务器
stop_existing_servers() {
    echo -e "${BLUE}🛑 停止现有服务器进程...${NC}"
    
    # 查找占用3001端口的进程
    PIDS=$(lsof -ti:3001 2>/dev/null || true)
    
    if [ ! -z "$PIDS" ]; then
        echo -e "${YELLOW}发现运行中的服务器进程: $PIDS${NC}"
        echo "$PIDS" | xargs kill -9 2>/dev/null || true
        sleep 2
        echo -e "${GREEN}✅ 已停止现有服务器${NC}"
    else
        echo -e "${GREEN}✅ 没有运行中的服务器${NC}"
    fi
}

# 安装测试依赖
install_test_dependencies() {
    echo -e "${BLUE}📦 安装测试依赖...${NC}"
    
    # 安装测试依赖
    npm install --save-dev mocha chai socket.io-client
    
    echo -e "${GREEN}✅ 测试依赖安装完成${NC}"
}

# 启动服务器
start_server() {
    echo -e "${BLUE}🚀 启动测试服务器...${NC}"
    
    # 设置测试环境变量
    export NODE_ENV=test
    export PORT=3001
    export LOG_LEVEL=info
    
    # 后台启动服务器
    npm run dev > server.log 2>&1 &
    SERVER_PID=$!
    
    echo "服务器PID: $SERVER_PID"
    
    # 等待服务器启动
    echo -e "${YELLOW}等待服务器启动...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ 服务器启动成功${NC}"
            return 0
        fi
        sleep 1
        echo -n "."
    done
    
    echo -e "${RED}❌ 服务器启动超时${NC}"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
}

# 运行测试
run_tests() {
    echo -e "${BLUE}🧪 运行测试用例...${NC}"
    
    # 运行测试
    if npx mocha tests/multi-user-connection.test.js --reporter spec --timeout 10000; then
        echo -e "${GREEN}✅ 所有测试通过${NC}"
        return 0
    else
        echo -e "${RED}❌ 测试失败${NC}"
        return 1
    fi
}

# 清理资源
cleanup() {
    echo -e "${BLUE}🧹 清理资源...${NC}"
    
    # 停止服务器
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
    fi
    
    # 再次检查端口
    PIDS=$(lsof -ti:3001 2>/dev/null || true)
    if [ ! -z "$PIDS" ]; then
        echo "$PIDS" | xargs kill -9 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✅ 清理完成${NC}"
}

# 显示服务器日志
show_server_logs() {
    if [ -f "server.log" ]; then
        echo -e "${BLUE}📋 服务器日志（最后20行）:${NC}"
        echo "================================"
        tail -20 server.log
        echo "================================"
    fi
}

# 手动测试功能
manual_test() {
    echo -e "${BLUE}🔧 手动测试模式${NC}"
    echo "服务器已启动在 http://localhost:3001"
    echo "按 Ctrl+C 停止服务器"
    
    # 等待用户中断
    trap cleanup EXIT
    wait $SERVER_PID
}

# 主函数
main() {
    # 设置退出时清理
    trap cleanup EXIT
    
    case "${1:-auto}" in
        "auto")
            check_dependencies
            stop_existing_servers
            install_test_dependencies
            start_server
            sleep 3
            if run_tests; then
                echo -e "${GREEN}🎉 测试完成！${NC}"
                exit 0
            else
                echo -e "${RED}💥 测试失败！${NC}"
                show_server_logs
                exit 1
            fi
            ;;
        "manual")
            check_dependencies
            stop_existing_servers
            start_server
            manual_test
            ;;
        "clean")
            stop_existing_servers
            echo -e "${GREEN}✅ 清理完成${NC}"
            ;;
        "logs")
            show_server_logs
            ;;
        *)
            echo "用法: $0 [auto|manual|clean|logs]"
            echo "  auto   - 自动运行测试（默认）"
            echo "  manual - 手动测试模式"
            echo "  clean  - 清理进程"
            echo "  logs   - 显示服务器日志"
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"