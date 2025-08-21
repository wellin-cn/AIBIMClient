#!/bin/bash

# 运行所有测试的脚本
# 使用方法: chmod +x tests/run-all-tests.sh && ./tests/run-all-tests.sh

echo "🚀 开始运行所有测试..."
echo "=============================="

# 检查服务器是否运行
echo "📍 检查服务器状态..."
if ! curl -s http://localhost:3001/api/health > /dev/null; then
    echo "❌ 服务器未运行，请先启动服务器："
    echo "   npx ts-node src/server.ts"
    exit 1
fi
echo "✅ 服务器运行正常"

# 测试计数器
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 运行测试的函数
run_test() {
    local test_file=$1
    local test_name=$2
    
    echo ""
    echo "📋 运行测试: $test_name"
    echo "   文件: $test_file"
    echo "   -------------------------"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if node "$test_file"; then
        echo "✅ $test_name - 通过"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo "❌ $test_name - 失败"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    # 测试之间等待一下，避免端口冲突
    sleep 2
}

# 运行核心测试
echo ""
echo "🎯 运行核心功能验证测试..."
echo "=============================="

run_test "tests/final-verification.test.js" "最终验证测试"
run_test "tests/complete-feature.test.js" "完整功能测试"

# 运行专项测试
echo ""
echo "🔍 运行专项调试测试..."
echo "=============================="

run_test "tests/user-sync-issue.test.js" "用户同步问题测试"
run_test "tests/debug-user-sync.test.js" "用户同步调试测试"

# 运行快速测试
echo ""
echo "⚡ 运行快速测试..."
echo "=============================="

run_test "tests/quick-test.js" "快速测试"
run_test "tests/simple-test.js" "简单测试"

# 输出总结
echo ""
echo "📊 测试总结"
echo "=============================="
echo "总测试数: $TOTAL_TESTS"
echo "通过: $PASSED_TESTS"
echo "失败: $FAILED_TESTS"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo "🎉 所有测试都通过了！用户信息同步问题已修复！"
    exit 0
else
    echo "⚠️  有 $FAILED_TESTS 个测试失败，需要进一步检查。"
    exit 1
fi