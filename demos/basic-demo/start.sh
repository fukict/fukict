#!/bin/bash

echo "🚀 启动 @fukict/core Basic Demo..."
echo ""
echo "📝 Demo 功能："
echo "  • 计数器组件"
echo "  • Todo 列表管理"
echo "  • 性能压力测试"
echo ""
echo "🌐 启动本地服务器..."

# 检查 serve 是否安装
if ! command -v serve &> /dev/null; then
    echo "📦 正在安装 serve..."
    pnpm install -g serve
fi

# 启动服务器
echo "🎯 访问地址: http://localhost:3000/demos/basic-demo"
echo "⚡ 按 Ctrl+C 停止服务器"
echo ""

serve ../.. -l 3000 