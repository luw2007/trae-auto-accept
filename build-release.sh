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

# 进入脚本目录
cd "$(dirname "$0")"

# 检查是否存在原始脚本文件
if [ ! -f "trae-browser-script.js" ]; then
    echo "❌ 找不到 trae-browser-script.js 文件"
    exit 1
fi

# 检查是否存在压缩脚本文件
if [ ! -f "trae-browser-script-min.js" ]; then
    echo "⚠️ 找不到 trae-browser-script-min.js 文件，正在创建压缩版本..."

    # 创建压缩版本
    echo "📦 正在压缩脚本文件..."

    echo "❌ 找不到压缩脚本文件，请确保 trae-browser-script-min.js 存在"
    exit 1
else
    echo "📦 压缩脚本文件已存在，继续打包..."
fi

# 打包扩展
echo "📦 正在打包 TraeCN 扩展..."
vsce package --out trae-auto-accept.vsix

# 检查结果
if [ -f "trae-auto-accept.vsix" ]; then
    echo "✅ Trae 自动接受扩展打包成功: trae-auto-accept.vsix"
    echo ""
    echo "📋 打包信息:"
    echo "  - 使用压缩版脚本 (trae-browser-script-min.js)"
    echo "  - 原始脚本已排除 (trae-browser-script.js)"
    echo "  - 文件大小已优化"
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