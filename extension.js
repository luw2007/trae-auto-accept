const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

let interval;
let isRunning = false;
let outputChannel;
let devToolsTimeout1, devToolsTimeout2;

function activate(context) {
    console.log('Trae Auto Accept 扩展已激活');

    // 创建输出通道
    outputChannel = vscode.window.createOutputChannel('Trae Auto Accept');

    // 启动自动脚本命令
    let startDisposable = vscode.commands.registerCommand('trae-auto-accept.start', () => {
        if (isRunning) {
            vscode.window.showInformationMessage('Trae 自动接受已经在运行中');
            return;
        }

        isRunning = true;
        outputChannel.appendLine(`[${new Date().toLocaleTimeString()}] 🚀 Trae 自动接受已启动`);

        // 复制浏览器脚本到剪贴板
        copyBrowserScriptToClipboard(context);

        // 每2秒检查一次按钮
        interval = setInterval(() => {
            try {
                findAndClickAcceptButton();
            } catch (error) {
                console.error('Trae 自动接受错误:', error);
                outputChannel.appendLine(`[${new Date().toLocaleTimeString()}] ❌ 错误: ${error.message}`);
                vscode.window.showErrorMessage(`Trae 自动接受错误: ${error.message}`);
            }
        }, 2000);
    });

    // 关闭自动脚本命令
    let stopDisposable = vscode.commands.registerCommand('trae-auto-accept.stop', () => {
        if (!isRunning) {
            vscode.window.showInformationMessage('Trae 自动接受未在运行');
            return;
        }

        if (interval) {
            clearInterval(interval);
            interval = null;
        }
        if (devToolsTimeout1) {
            clearTimeout(devToolsTimeout1);
            devToolsTimeout1 = null;
        }
        if (devToolsTimeout2) {
            clearTimeout(devToolsTimeout2);
            devToolsTimeout2 = null;
        }
        isRunning = false;
        outputChannel.appendLine(`[${new Date().toLocaleTimeString()}] ⏹️ Trae 自动接受已停止`);
        vscode.window.showInformationMessage('Trae 自动接受已停止');
    });

    // 注册命令
    context.subscriptions.push(startDisposable);
    context.subscriptions.push(stopDisposable);

    // 清理函数
    context.subscriptions.push({
        dispose: () => {
            if (interval) {
                clearInterval(interval);
            }
            if (devToolsTimeout1) {
                clearTimeout(devToolsTimeout1);
            }
            if (devToolsTimeout2) {
                clearTimeout(devToolsTimeout2);
            }
            isRunning = false;
            if (outputChannel) {
                outputChannel.dispose();
            }
        }
    });
}

function copyBrowserScriptToClipboard(context) {
    try {
        // 获取 trae-browser-script-min.js 文件路径
        const scriptPath = path.join(context.extensionPath, 'trae-browser-script-min.js');
        
        // 读取文件内容
        const scriptContent = fs.readFileSync(scriptPath, 'utf8');
        
        // 复制到剪贴板
        vscode.env.clipboard.writeText(scriptContent);
        
        vscode.window.showInformationMessage('📋 浏览器脚本（压缩版）已复制到剪贴板，请在浏览器控制台中运行');
        outputChannel.appendLine(`[${new Date().toLocaleTimeString()}] 📋 浏览器脚本（压缩版）已复制到剪贴板`);
        
        // 打开开发人员工具
        devToolsTimeout1 = setTimeout(() => {
            vscode.commands.executeCommand('workbench.action.toggleDevTools');

            // 15秒后自动关闭控制台
            devToolsTimeout2 = setTimeout(() => {
                vscode.commands.executeCommand('workbench.action.toggleDevTools');
                outputChannel.appendLine(`[${new Date().toLocaleTimeString()}] 🔧 控制台已自动关闭`);
            }, 15000);
        }, 500);
    } catch (error) {
        console.error('复制脚本到剪贴板失败:', error);
        outputChannel.appendLine(`[${new Date().toLocaleTimeString()}] ❌ 复制脚本（压缩版）到剪贴板失败: ${error.message}`);
        vscode.window.showErrorMessage(`复制脚本（压缩版）到剪贴板失败: ${error.message}`);
    }
}

function findAndClickAcceptButton() {
    outputChannel.appendLine(`[${new Date().toLocaleTimeString()}] 🔍 提示: 请在浏览器中运行 TraeCN 脚本`);
}

function deactivate() {
    if (interval) {
        clearInterval(interval);
    }
    if (devToolsTimeout1) {
        clearTimeout(devToolsTimeout1);
    }
    if (devToolsTimeout2) {
        clearTimeout(devToolsTimeout2);
    }
    isRunning = false;
    if (outputChannel) {
        outputChannel.dispose();
    }
    console.log('Trae Auto Accept 扩展已停用');
}

module.exports = {
    activate,
    deactivate
};
