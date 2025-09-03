#!/bin/bash

echo "正在安装 VS Code 自动脚本扩展..."

# 检查是否安装了 Node.js
if ! command -v node &> /dev/null; then
    echo "请先安装 Node.js"
    exit 1
fi

# 检查是否安装了 vsce
if ! command -v vsce &> /dev/null; then
    echo "正在安装 vsce (VS Code Extension CLI)..."
    npm install -g vsce
fi

# 打包扩展
echo "正在打包扩展..."
vsce package

# 检查是否生成了 VSIX 文件
if [ -f "*.vsix" ]; then
    VSIX_FILE=$(ls *.vsix | head -n 1)
    echo "扩展已打包完成: $VSIX_FILE"
    echo ""
    echo "安装步骤:"
    echo "1. 在 VS Code 中按 Ctrl+Shift+P"
    echo "2. 输入并选择 'Extensions: Install from VSIX...'"
    echo "3. 选择文件: $VSIX_FILE"
    echo ""
    echo "或者使用命令行安装:"
    echo "code --install-extension $VSIX_FILE"
else
    echo "打包失败，请检查错误信息"
    exit 1
fi