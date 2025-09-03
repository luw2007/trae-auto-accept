#!/bin/bash

echo "🔧 正在构建 TraeCN 自动接受扩展..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 请先安装 Node.js"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

# 安装 vsce（如果未安装）
if ! command -v vsce &> /dev/null; then
    echo "📦 正在安装 vsce 打包工具..."
    npm install -g @vscode/vsce
fi

# 打包扩展
echo "📦 正在打包 TraeCN 扩展..."
cd "$(dirname "$0")"
vsce package --out trae-auto-accept.vsix

# 检查结果
if [ -f "trae-auto-accept.vsix" ]; then
    echo "✅ Trae 自动接受扩展打包成功: trae-auto-accept.vsix"
    echo ""
    echo "🚀 安装方法:"
    echo "1. 在 VS Code 中按 Ctrl+Shift+P"
    echo "2. 输入: Extensions: Install from VSIX..."
    echo "3. 选择: trae-auto-accept.vsix"
    echo ""
    echo "💡 或者使用命令行:"
    echo "code --install-extension trae-auto-accept.vsix"
else
    echo "❌ 打包失败"
    exit 1
fi