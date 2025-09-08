// TraeCN 自动操作 - 浏览器脚本
(function() {
    'use strict';
    
    const LOG_BUFFER_SIZE = 50;
    let isRunning = false, interval, isDarkMode = false;
    let isDragging = false, dragOffset = { x: 0, y: 0 };
    let clickLimit = 5, clickCount = 0;
    
    // 样式配置
    const STYLES = {
        light: 'white,#333,0 4px 6px rgba(0,0,0,0.1),1px solid #ddd,15px,8px|transparent,1px solid #ddd,#333|#333,#666,#666|#f8f9fa,none|white,#333,1px solid #ddd|#e74c3c,#27ae60,#e74c3c',
        dark: '#2c3e50,white,0 4px 6px rgba(0,0,0,0.3),none,15px,8px|transparent,1px solid #666,white|white,#bbb,#bbb|#34495e,1px solid #4a5f7a|#2c3e50,white,1px solid #4a5f7a|#e74c3c,#27ae60,#e74c3c'
    };
    
    // 应用主题
    function applyTheme() {
        const theme = STYLES[isDarkMode ? 'dark' : 'light'];
        const [panel, button, text, limitArea, input, special] = theme.split('|');
        const [pBg, pColor, pShadow, pBorder, pPad, pRadius] = panel.split(',');
        const [bBg, bBorder, bColor] = button.split(',');
        const [tPrimary, tSecondary, tLog] = text.split(',');
        const [lBg, lBorder] = limitArea.split(',');
        const [iBg, iColor, iBorder] = input.split(',');
        const [eBtn, sRunning, sStopped] = special.split(',');
        
        const panelEl = document.getElementById('trae-panel');
        if (panelEl) {
            // 保存当前的最小化状态
            const controls = document.getElementById('trae-controls');
            
            // 应用主题样式
            panelEl.style.background = pBg;
            panelEl.style.color = pColor;
            panelEl.style.boxShadow = pShadow;
            panelEl.style.border = pBorder;
            panelEl.style.borderRadius = pRadius;
            
        }
        
        setElStyle('trae-theme', `background:${bBg};border:${bBorder};color:${tPrimary};padding:8px 12px;margin:2px;border-radius:4px;cursor:pointer;font-weight:bold`);
        setElStyle('trae-exit', `background:${bBg};border:1px solid ${eBtn};color:${eBtn};padding:8px 12px;margin:2px;border-radius:4px;cursor:pointer;font-weight:bold`);
        const minimizeBtn = document.getElementById('trae-minimize');
        if (minimizeBtn) {
            minimizeBtn.style.cssText = `color:${tPrimary};padding:4px 8px;margin:2px;border-radius:3px;cursor:pointer;font-size:16px;background:transparent;border:none`;
        }
        setElStyle('trae-log', tLog);
        
        const limitEl = document.querySelector('#trae-controls div[style*="background: #f8f9fa"]');
        if (limitEl) limitEl.style.cssText = `background:${lBg};border:${lBorder}`;
        
        setElStyle('trae-click-limit', `background:${iBg};color:${iColor};border:${iBorder}`);
        setElStyle('trae-click-count', tSecondary);
        
        const statusIcon = document.getElementById('trae-status-icon');
        if (statusIcon) statusIcon.style.background = isRunning ? sRunning : sStopped;
        
        const toggleBtn = document.getElementById('trae-toggle');
        if (toggleBtn) {
            const color = isRunning ? sStopped : sRunning;
            toggleBtn.style.cssText = `background:${bBg};border:1px solid ${color};color:${color};padding:8px 12px;margin:2px;border-radius:4px;cursor:pointer;font-weight:bold`;
            toggleBtn.textContent = isRunning ? '停止' : '启动';
        }
    }
    
    // 切换主题
    function toggleTheme() {
        isDarkMode = !isDarkMode;
        applyTheme();
        log(`🎨 切换到${isDarkMode ? '深色' : '浅色'}模式`);
    }
    
    // 日志
    function log(msg) {
        const logDiv = document.getElementById('trae-log');
        if (!logDiv) return;
        
        const entry = document.createElement('div');
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        logDiv.appendChild(entry);
        
        // 清理旧日志
        if (logDiv.children.length > LOG_BUFFER_SIZE) {
            for (let i = 0; i < Math.floor(LOG_BUFFER_SIZE / 2); i++) {
                logDiv.removeChild(logDiv.children[i]);
            }
        }
        
        logDiv.scrollTop = logDiv.scrollHeight;
        console.log(`[TraeCN] ${msg}`);
    }
    
    // 验证按钮可见性
    function isButtonVisible(button) {
        try {
            const rect = button.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && 
                   window.getComputedStyle(button).display !== 'none' &&
                   window.getComputedStyle(button).visibility !== 'hidden';
        } catch (error) {
            return false;
        }
    }
    
    // 按钮配置表
    const BUTTON_CONFIGS = [
        {name: '继续', selector: 'div.agent-error-wrap div.icube-alert-action', validate: (b) => b.textContent.trim() === '继续'},
        {name: '运行', selector: 'div.icd-run-command-card-v2-actions button.icd-run-command-card-v2-actions-btn-run', validate: (b) => b.textContent.trim() === '运行'},
        {name: '全部接受', selector: 'div.chat-todolist-bar button.icd-btn-primary', validate: (b) => {
            const span = b.querySelector('span.icd-btn-content');
            return (span ? span.textContent.trim() : '') === '全部接受';
        }}
    ];
    
    // 查找按钮（通用方法）
    function findButton(config) {
        try {
            const button = document.querySelector(config.selector);
            return button && isButtonVisible(button) && config.validate(button) ? button : null;
        } catch (error) {
            log(`❌ 查找${config.name}按钮错误: ${error.message}`);
            return null;
        }
    }

    // 点击按钮
    function clickButton(button, buttonName) {
        try {
            const rect = button.getBoundingClientRect();
            const event = new MouseEvent('click', {
                view: window, bubbles: true, cancelable: true,
                clientX: rect.left + rect.width / 2,
                clientY: rect.top + rect.height / 2
            });
            
            button.dispatchEvent(event);
            clickCount++;
            updateClickCountDisplay();
            log(`✅ 成功点击"${buttonName}"按钮 (${clickCount}/${clickLimit})`);
            
            return checkClickLimitAfterClick();
        } catch (error) {
            log(`❌ 点击${buttonName}按钮错误: ${error.message}`);
            return false;
        }
    }

    // 查找并点击按钮
    function findAndClick() {
        try {
            // 按优先级查找按钮：继续 > 运行 > 接受
            for (const config of BUTTON_CONFIGS) {
                const button = findButton(config);
                if (button) {
                    return clickButton(button, config.name);
                }
            }
            
            return false;
        } catch (error) {
            log(`❌ 错误: ${error.message}`);
            return false;
        }
    }
    
    // 设置元素样式的辅助函数
    function setElStyle(id, style) {
        const el = document.getElementById(id);
        if (el) {
            if (style.includes(':')) {
                el.style.cssText = style;
            } else {
                el.style.color = style;
            }
        }
    }
    
    // 更新点击次数显示
    function updateClickCountDisplay() {
        const countDisplay = document.getElementById('trae-click-count');
        if (countDisplay) countDisplay.textContent = `${clickCount}/`;
    }
    
    // 点击后检查是否达到限制
    function checkClickLimitAfterClick() {
        if (clickLimit > 0 && clickCount >= clickLimit) {
            setTimeout(() => {
                clickCount = 0; // 重置计数为0
                updateClickCountDisplay();
                stop(true); // 停止操作
            }, 100); // 短暂延迟确保点击完成
            return true; // 达到限制
        }
        return false; // 未达到限制
    }
    
    // 更新点击次数限制
    function updateClickLimit(value) {
        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue < 0) {
            clickLimit = 0; // 0 表示无限制
        } else if (numValue > 99) {
            clickLimit = 99;
        } else {
            clickLimit = numValue;
        }
        
        const limitInput = document.getElementById('trae-click-limit');
        if (limitInput) limitInput.value = clickLimit;
        
        updateClickCountDisplay();
        log(`📊 点击次数限制已设置为: ${clickLimit === 0 ? '无限制' : clickLimit}`);
    }
    
    // 重置点击次数
    function resetClickCount() {
        clickCount = 0;
        updateClickCountDisplay();
        log('🔄 点击次数已重置');
    }
    
    // 启动/停止
    function toggle() {
        isRunning ? stop() : start();
    }
    
    function start() {
        if (isRunning) return;
        isRunning = true;
        applyTheme();
        log('🚀 启动自动操作 (支持继续、运行、接受按钮)');
        
        interval = setInterval(findAndClick, 5000);
        findAndClick();
        
        // 3秒后自动最小化
        setTimeout(minimize, 3000);
    }
    
    function stop(isLimitReached = false) {
        if (!isRunning) return;
        if (interval) clearInterval(interval);
        isRunning = false;
        applyTheme();
        
        if (isLimitReached) {
            log('⚠️ 已达到点击次数限制，自动停止操作');
        } else {
            log('⏹️ 停止自动操作');
        }
    }
    
    // 更新最小化按钮符号
    function updateMinimizeButton(isMinimized) {
        const minimizeBtn = document.getElementById('trae-minimize');
        if (minimizeBtn) {
            minimizeBtn.textContent = isMinimized ? '+' : '－';
            minimizeBtn.title = isMinimized ? '展开' : '收起';
        }
    }
    
    // 最小化/展开
    function minimize() {
        const controls = document.getElementById('trae-controls');
        const panel = document.getElementById('trae-panel');
        const title = document.getElementById('trae-title');
        const minimizedTitle = document.getElementById('trae-minimized-title');
        
        if (!controls || !panel || !title || !minimizedTitle) return;
        
        if (controls.style.display === 'none') {
            // 展开
            controls.style.display = 'block';
            panel.style.padding = '15px';
            panel.style.minWidth = '200px';
            title.style.display = 'block';
            minimizedTitle.style.display = 'none';
            panel.style.removeProperty('display');
            panel.style.removeProperty('align-items');
            panel.style.removeProperty('justify-content');
            updateMinimizeButton(false);
            applyTheme(); // 确保展开后应用主题样式
        } else {
            // 收起
            controls.style.display = 'none';
            panel.style.padding = '8px 12px';
            panel.style.minWidth = 'auto';
            title.style.display = 'none';
            minimizedTitle.style.display = 'block';
            panel.style.display = 'flex';
            panel.style.alignItems = 'center';
            panel.style.justifyContent = 'center';
            updateMinimizeButton(true);
        }
    }
    
    // 销毁
    function destroy() {
        if (!confirm('确定要退出 TraeCN 自动操作吗？')) return;
        
        stop();
        const panel = document.getElementById('trae-panel');
        if (panel) panel.remove();
        
        document.querySelectorAll('[id^="trae-"]').forEach(el => el.remove());
        delete window.traeAutoAccept;
        
        console.log('🔚 TraeCN 自动操作已完全退出');
    }
    
    // 创建面板
    function createPanel() {
        if (document.getElementById('trae-panel')) {
            console.log('控制面板已存在');
            return;
        }
        
        const panel = document.createElement('div');
        panel.id = 'trae-panel';
        
        panel.innerHTML = `
            <div id="trae-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="display: flex; align-items: center;">
                    <div id="trae-status-icon" style="width: 16px; height: 16px; border-radius: 50%; margin-right: 8px;"></div>
                    <div id="trae-title" style="font-weight: bold; user-select: none;">TraeCN 自动操作</div>
                    <div id="trae-minimized-title" style="font-weight: bold; user-select: none; display: none;">自动操作</div>
                </div>
                <button id="trae-minimize" title="收起">－</button>
            </div>
            <div id="trae-controls">
                <div style="display: flex; justify-content: center; margin-bottom: 10px;">
                    <button id="trae-toggle" style="background: transparent; padding: 8px 12px; margin: 2px; border-radius: 4px; cursor: pointer; font-weight: bold;">启动</button>
                    <div style="display: flex; align-items: center; margin: 2px; padding: 6px 8px; border-radius: 4px;">
                        <div id="trae-click-count" style="font-size: 12px; margin-right: 4px;">0/</div>
                        <input type="number" id="trae-click-limit" min="0" max="99" value="5" style="width: 20px; padding: 4px; border-radius: 3px; font-size: 12px;">
                    </div>
                    <button id="trae-theme" style="background: transparent; padding: 8px 12px; margin: 2px; border-radius: 4px; cursor: pointer; font-weight: bold;">主题</button>
                    <button id="trae-exit" style="background: transparent; padding: 8px 12px; margin: 2px; border-radius: 4px; cursor: pointer; font-weight: bold;">退出</button>
                </div>
                <div id="trae-log" style="margin-top: 10px; font-size: 10px; max-height: 100px; overflow-y: auto;"></div>
            </div>
        `;
        
        // 设置面板基础样式（确保立即可见）
        panel.style.cssText = 'position:fixed;top:20px;right:20px;background:white;color:#333;padding:15px;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);border:1px solid #ddd;z-index:999999;font-family:monospace;min-width:200px;max-width:300px;transition:all 0.3s ease;cursor:move;display:block';
        
        // 将面板添加到DOM
        document.body.appendChild(panel);
        
        // 初始化点击次数显示
        updateClickCountDisplay();
        
        // 绑定事件
        document.getElementById('trae-header').addEventListener('click', function(e) {
            if (!e.target.closest('button')) minimize();
        });
        
        document.getElementById('trae-minimize').addEventListener('click', function(e) {
            e.stopPropagation();
            minimize();
        });
        
        document.getElementById('trae-toggle').addEventListener('click', toggle);
        document.getElementById('trae-exit').addEventListener('click', e => {
            e.stopPropagation();
            destroy();
        });
        document.getElementById('trae-theme').addEventListener('click', e => {
            e.stopPropagation();
            toggleTheme();
        });
        
        // 绑定点击限制相关事件
        const limitInput = document.getElementById('trae-click-limit');
        if (limitInput) {
            limitInput.addEventListener('input', function(e) {
                e.stopPropagation();
                updateClickLimit(e.target.value);
            });
        }
        
        // 初始化最小化按钮状态
        updateMinimizeButton(false);
        
        // 应用主题
        applyTheme();
        
        // 拖拽
        panel.addEventListener('mousedown', function(e) {
            if (e.target.closest('button')) return;
            isDragging = true;
            dragOffset.x = e.clientX - panel.offsetLeft;
            dragOffset.y = e.clientY - panel.offsetTop;
            panel.style.cursor = 'grabbing';
        });
        
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            e.preventDefault();
            panel.style.left = (e.clientX - dragOffset.x) + 'px';
            panel.style.top = (e.clientY - dragOffset.y) + 'px';
            panel.style.right = 'auto';
        });
        
        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                panel.style.cursor = 'move';
            }
        });
        
        log('🎯 TraeCN 自动操作脚本已加载');
        log(`📝 日志缓冲区: ${LOG_BUFFER_SIZE} 条`);
        log('✨ 支持功能: 自动点击继续、运行、接受按钮');
    }
    
    // 暴露到全局
    window.traeAutoAccept = {
        start, stop, toggle,
        click: findAndClick, destroy, exit: destroy,
        toggleTheme, setTheme: (dark) => { isDarkMode = dark; applyTheme(); },
        setClickLimit: updateClickLimit,
        getClickCount: () => clickCount,
        getClickLimit: () => clickLimit
    };
    
    // 初始化
    createPanel();
    
    console.log('🎯 TraeCN 自动操作脚本已加载');
    console.log('💡 使用方法:');
    console.log('   - traeAutoAccept.toggle() // 启动/停止');
    console.log('   - traeAutoAccept.start()  // 启动');
    console.log('   - traeAutoAccept.stop()   // 停止');
    console.log('   - traeAutoAccept.toggleTheme() // 切换主题');
    console.log('   - traeAutoAccept.destroy() // 退出');
    console.log('   - traeAutoAccept.setClickLimit(n) // 设置点击限制 (0=无限制)');
    console.log('   - traeAutoAccept.getClickCount() // 获取当前点击次数');
    console.log('   - traeAutoAccept.getClickLimit() // 获取点击限制');
    console.log('');
    
    // 提示用户控制台将自动关闭
    console.log('💡 控制台将在10秒后关闭');
    
})();
