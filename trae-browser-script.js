// TraeCN 自动接受 - 浏览器脚本
(function() {
    'use strict';
    
    const LOG_BUFFER_SIZE = 50;
    let isRunning = false, interval, isDarkMode = false;
    let isDragging = false, dragOffset = { x: 0, y: 0 };
    
    // 应用主题
    function applyTheme() {
        const panel = document.getElementById('trae-panel');
        if (!panel) return;
        
        // 面板样式
        if (isDarkMode) {
            panel.style.background = '#2c3e50';
            panel.style.color = 'white';
            panel.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
            panel.style.border = 'none';
        } else {
            panel.style.background = 'white';
            panel.style.color = '#333';
            panel.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            panel.style.border = '1px solid #ddd';
        }
        
        // 按钮样式
        const themeBtn = document.getElementById('trae-theme');
        const exitBtn = document.getElementById('trae-exit');
        const minimizeBtn = document.getElementById('trae-minimize');
        
        if (themeBtn) {
            if (isDarkMode) {
                themeBtn.style.background = 'transparent';
                themeBtn.style.color = 'white';
                themeBtn.style.border = '1px solid #666';
            } else {
                themeBtn.style.background = 'transparent';
                themeBtn.style.color = '#333';
                themeBtn.style.border = '1px solid #ddd';
            }
        }
        
        if (exitBtn) {
            exitBtn.style.background = 'transparent';
            exitBtn.style.color = '#e74c3c';
            exitBtn.style.border = '1px solid #e74c3c';
        }
        
        if (minimizeBtn) {
            minimizeBtn.style.color = isDarkMode ? 'white' : '#333';
        }
        
        // 日志颜色
        const logDiv = document.getElementById('trae-log');
        if (logDiv) {
            logDiv.style.color = isDarkMode ? '#bbb' : '#666';
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
    
    // 查找并点击按钮
    function findAndClick() {
        try {
            const button = document.querySelector('div.chat-todolist-bar button.icd-btn-primary');
            if (!button) {
                log('⏳ 未找到目标按钮');
                return false;
            }
            
            const rect = button.getBoundingClientRect();
            const isVisible = rect.width > 0 && rect.height > 0 && 
                            window.getComputedStyle(button).display !== 'none' &&
                            window.getComputedStyle(button).visibility !== 'hidden';
            
            if (!isVisible) {
                log('⚠️ 按钮不可见');
                return false;
            }
            
            const span = button.querySelector('span.icd-btn-content');
            const text = span ? span.textContent.trim() : '';
            
            if (text !== '全部接受') {
                log(`⚠️ 文本不匹配: "${text}"`);
                return false;
            }
            
            const event = new MouseEvent('click', {
                view: window, bubbles: true, cancelable: true,
                clientX: rect.left + rect.width / 2,
                clientY: rect.top + rect.height / 2
            });
            
            button.dispatchEvent(event);
            log('✅ 成功点击"全部接受"按钮');
            return true;
        } catch (error) {
            log(`❌ 错误: ${error.message}`);
            return false;
        }
    }
    
    // 更新UI
    function updateUI() {
        const toggle = document.getElementById('trae-toggle');
        const statusIcon = document.getElementById('trae-status-icon');
        
        if (isRunning) {
            toggle.style.background = 'transparent';
            toggle.style.color = '#e74c3c';
            toggle.style.border = '1px solid #e74c3c';
            toggle.textContent = '停止';
            statusIcon.style.background = '#27ae60';
        } else {
            toggle.style.background = 'transparent';
            toggle.style.color = '#27ae60';
            toggle.style.border = '1px solid #27ae60';
            toggle.textContent = '启动';
            statusIcon.style.background = '#e74c3c';
        }
    }
    
    // 启动/停止
    function toggle() {
        isRunning ? stop() : start();
    }
    
    function start() {
        if (isRunning) return;
        isRunning = true;
        updateUI();
        log('🚀 启动自动接受');
        
        interval = setInterval(findAndClick, 5000);
        findAndClick();
        
        // 3秒后自动最小化
        setTimeout(minimize, 3000);
    }
    
    function stop() {
        if (!isRunning) return;
        if (interval) clearInterval(interval);
        isRunning = false;
        updateUI();
        log('⏹️ 停止自动接受');
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
        if (!confirm('确定要退出 TraeCN 自动接受吗？')) return;
        
        stop();
        const panel = document.getElementById('trae-panel');
        if (panel) panel.remove();
        
        document.querySelectorAll('[id^="trae-"]').forEach(el => el.remove());
        delete window.traeAutoAccept;
        
        console.log('🔚 TraeCN 自动接受已完全退出');
    }
    
    // 创建面板
    function createPanel() {
        if (document.getElementById('trae-panel')) {
            console.log('控制面板已存在');
            return;
        }
        
        const panel = document.createElement('div');
        panel.id = 'trae-panel';
        
        // 初始样式
        panel.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            background: white; color: #333;
            padding: 15px; border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 999999; font-family: monospace;
            min-width: 200px; transition: all 0.3s ease;
            cursor: move;
        `;
        
        // 初始化主题
        applyTheme();
        
        panel.innerHTML = `
            <div id="trae-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="display: flex; align-items: center;">
                    <div id="trae-status-icon" style="width: 16px; height: 16px; border-radius: 50%; background: #e74c3c; margin-right: 8px;"></div>
                    <div id="trae-title" style="font-weight: bold; user-select: none;">TraeCN 自动接受</div>
                    <div id="trae-minimized-title" style="font-weight: bold; user-select: none; display: none;">自动接受</div>
                </div>
                <button id="trae-minimize" style="background: transparent; color: #333; border: none; padding: 4px 8px; cursor: pointer; font-size: 16px; border-radius: 3px;" title="收起">－</button>
            </div>
            <div id="trae-controls">
                <div style="display: flex; justify-content: center; margin-bottom: 10px;">
                    <button id="trae-toggle" style="background: transparent; color: #27ae60; border: 1px solid #27ae60; padding: 8px 16px; margin: 2px; border-radius: 4px; cursor: pointer; font-weight: bold;">启动</button>
                    <button id="trae-theme" style="background: transparent; color: #333; border: 1px solid #ddd; padding: 8px 16px; margin: 2px; border-radius: 4px; cursor: pointer; font-weight: bold;">主题</button>
                    <button id="trae-exit" style="background: transparent; color: #e74c3c; border: 1px solid #e74c3c; padding: 8px 16px; margin: 2px; border-radius: 4px; cursor: pointer; font-weight: bold;">退出</button>
                </div>
                <div id="trae-log" style="margin-top: 10px; font-size: 10px; color: #666; max-height: 100px; overflow-y: auto;"></div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
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
        
        // 初始化最小化按钮状态
        updateMinimizeButton(false);
        
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
        
        log('🎯 TraeCN 自动接受脚本已加载');
        log(`📝 日志缓冲区: ${LOG_BUFFER_SIZE} 条`);
    }
    
    // 暴露到全局
    window.traeAutoAccept = {
        start, stop, toggle,
        click: findAndClick, destroy, exit: destroy,
        toggleTheme, setTheme: (dark) => { isDarkMode = dark; applyTheme(); }
    };
    
    // 初始化
    createPanel();
    
    console.log('🎯 TraeCN 自动接受脚本已加载');
    console.log('💡 使用方法:');
    console.log('   - traeAutoAccept.toggle() // 启动/停止');
    console.log('   - traeAutoAccept.start()  // 启动');
    console.log('   - traeAutoAccept.stop()   // 停止');
    console.log('   - traeAutoAccept.toggleTheme() // 切换主题');
    console.log('   - traeAutoAccept.destroy() // 退出');
    console.log('');
    
    // 提示用户控制台将自动关闭
    console.log('💡 控制台将在10秒后关闭');
    
})();
