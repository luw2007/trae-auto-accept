# Trae Auto Accept - Makefile
# 用于管理项目的构建、压缩和发布流程

# 项目配置
PROJECT_NAME := trae-auto-accept
VERSION := $(shell node -p "require('./package.json').version")
SRC_SCRIPT := trae-browser-script.js
MIN_SCRIPT := trae-browser-script-min.js
EXTENSION_FILE := $(PROJECT_NAME).vsix
MINIFY_TOOL := minify-script.js

# Node.js 和工具检查
NODE := $(shell command -v node 2> /dev/null)
NPM := $(shell command -v npm 2> /dev/null)
VSCE := $(shell command -v vsce 2> /dev/null)

# 默认目标
.PHONY: help
help:
	@echo "🚀 Trae Auto Accept - 构建管理系统"
	@echo ""
	@echo "可用命令："
	@echo "  make help           - 显示此帮助信息"
	@echo "  make minify         - 压缩浏览器脚本"
	@echo "  make build          - 构建扩展包"
	@echo "  make clean          - 清理构建文件"
	@echo "  make install-deps   - 安装依赖"
	@echo "  make test           - 运行测试"
	@echo "  make release        - 发布到 GitHub Release"
	@echo "  make all            - 完整构建流程"
	@echo ""
	@echo "📦 版本信息: $(VERSION)"
	@echo "🔧 检查环境..."

# 检查依赖
check-deps:
ifndef NODE
	$(error ❌ Node.js 未安装，请访问 https://nodejs.org/)
endif
ifndef NPM
	$(error ❌ npm 未安装)
endif
	@echo "✅ Node.js 和 npm 已就绪"

# 安装 vsce
install-vsce:
ifndef VSCE
	@echo "📦 正在安装 vsce 打包工具..."
	npm install -g @vscode/vsce
else
	@echo "✅ vsce 已安装"
endif

# 压缩浏览器脚本
.PHONY: minify
minify: check-deps
	@echo "📦 正在压缩浏览器脚本..."
	@if [ ! -f "$(SRC_SCRIPT)" ]; then \
		echo "❌ 找不到源脚本文件: $(SRC_SCRIPT)"; \
		exit 1; \
	fi
	@if [ ! -f "$(MINIFY_TOOL)" ]; then \
		echo "❌ 找不到压缩工具: $(MINIFY_TOOL)"; \
		exit 1; \
	fi
	@echo "🔧 使用压缩工具..."
	@node $(MINIFY_TOOL)

# 构建扩展包
.PHONY: build
build: check-deps install-vsce minify
	@echo "📦 正在构建扩展包..."
	@echo "📦 正在打包 TraeCN 扩展..."
	@vsce package --out $(EXTENSION_FILE)
	@echo "✅ 扩展包构建完成: $(EXTENSION_FILE)"

# 清理构建文件
.PHONY: clean
clean:
	@echo "🧹 正在清理构建文件..."
	@rm -f $(MIN_SCRIPT) $(EXTENSION_FILE)
	@rm -rf node_modules/.cache
	@echo "✅ 清理完成"

# 安装依赖
.PHONY: install-deps
install-deps: check-deps install-vsce
	@echo "📦 正在安装项目依赖..."
	@if [ -f "package.json" ]; then \
		npm install; \
	fi
	@echo "✅ 依赖安装完成"

# 运行测试
.PHONY: test
test: check-deps
	@echo "🧪 正在运行测试..."
	@if [ -f "$(MIN_SCRIPT)" ]; then \
		echo "✅ 压缩脚本文件存在"; \
		echo "📊 文件大小: $$(wc -c < $(MIN_SCRIPT)) bytes"; \
	else \
		echo "⚠️ 压缩脚本文件不存在，请先运行 make minify"; \
	fi
	@if [ -f "$(SRC_SCRIPT)" ]; then \
		echo "✅ 源脚本文件存在"; \
		echo "📊 文件大小: $$(wc -c < $(SRC_SCRIPT)) bytes"; \
	fi
	@echo "✅ 测试完成"

# 发布到 GitHub Release
.PHONY: release
release: build
	@echo "🚀 正在准备发布..."
	@if [ ! -f "$(EXTENSION_FILE)" ]; then \
		echo "❌ 扩展包文件不存在，请先运行 make build"; \
		exit 1; \
	fi
	@echo "📋 发布信息:"
	@echo "  - 版本: $(VERSION)"
	@echo "  - 文件: $(EXTENSION_FILE)"
	@echo "  - 大小: $$(wc -c < $(EXTENSION_FILE)) bytes"
	@echo ""
	@echo "🌐 请手动执行以下命令发布到 GitHub:"
	@echo "gh release create v$(VERSION) $(EXTENSION_FILE) --title \"Trae Auto Accept v$(VERSION)\" --notes \"Release v$(VERSION)\""

# 完整构建流程
.PHONY: all
all: clean install-deps test build
	@echo "🎉 完整构建流程完成！"
	@echo "📦 扩展包: $(EXTENSION_FILE)"
	@echo "🚀 版本: $(VERSION)"

# 显示项目状态
.PHONY: status
status:
	@echo "📊 项目状态:"
	@echo "  - 项目名称: $(PROJECT_NAME)"
	@echo "  - 版本: $(VERSION)"
	@echo "  - 源脚本: $(SRC_SCRIPT) $$(test -f $(SRC_SCRIPT) && echo '✅' || echo '❌')"
	@echo "  - 压缩脚本: $(MIN_SCRIPT) $$(test -f $(MIN_SCRIPT) && echo '✅' || echo '❌')"
	@echo "  - 扩展包: $(EXTENSION_FILE) $$(test -f $(EXTENSION_FILE) && echo '✅' || echo '❌')"
	@echo "  - 压缩工具: $(MINIFY_TOOL) $$(test -f $(MINIFY_TOOL) && echo '✅' || echo '❌')"

# 开发模式 - 只压缩不构建
.PHONY: dev
dev: minify
	@echo "🛠️ 开发模式完成 - 脚本已压缩"

# 快速构建 - 跳过依赖检查
.PHONY: quick-build
quick-build: minify
	@echo "🚀 快速构建模式..."
	@echo "📦 正在打包 TraeCN 扩展..."
	@vsce package --out $(EXTENSION_FILE)
	@echo "✅ 快速构建完成: $(EXTENSION_FILE)"

# 版本信息
.PHONY: version
version:
	@echo "📦 版本信息:"
	@echo "  - 项目: $(PROJECT_NAME)"
	@echo "  - 版本: $(VERSION)"
	@echo "  - Node.js: $(NODE)"
	@echo "  - npm: $(NPM)"
	@echo "  - vsce: $(VSCE)"

# 检查压缩脚本差异
.PHONY: diff
diff:
	@if [ -f "$(SRC_SCRIPT)" ] && [ -f "$(MIN_SCRIPT)" ]; then \
		echo "📊 压缩差异分析:"; \
		original_size=$$(wc -c < $(SRC_SCRIPT)); \
		compressed_size=$$(wc -c < $(MIN_SCRIPT)); \
		ratio=$$(( (original_size - compressed_size) * 100 / original_size )); \
		echo "  - 原始大小: $$original_size bytes"; \
		echo "  - 压缩大小: $$compressed_size bytes"; \
		echo "  - 压缩率: $$ratio%"; \
	else \
		echo "❌ 无法比较 - 文件不存在"; \
	fi