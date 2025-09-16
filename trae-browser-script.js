(function() {
    'use strict';

    const LOG_BUFFER_SIZE = 50;
    let isRunning = false, interval, isDarkMode = false;
    let isDragging = false, dragOffset = { x: 0, y: 0 };
    let clickLimit = 5, clickCount = 0;
    let enableDelete = false;

    const STYLES = {
        light: 'white,#333,0 4px 6px rgba(0,0,0,0.1),1px solid #ddd,15px,8px|transparent,1px solid #ddd,#333|#333,#666,#666|#f8f9fa,none|white,#333,1px solid #ddd|#e74c3c,#27ae60,#e74c3c',
        dark: '#2c3e50,white,0 4px 6px rgba(0,0,0,0.3),none,15px,8px|transparent,1px solid #666,white|white,#bbb,#bbb|#34495e,1px solid #4a5f7a|#2c3e50,white,1px solid #4a5f7a|#e74c3c,#27ae60,#e74c3c'
    };
    
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
            panelEl.style.background = pBg;
            panelEl.style.color = pColor;
            panelEl.style.boxShadow = pShadow;
            panelEl.style.border = pBorder;
            panelEl.style.borderRadius = pRadius;
        }
        
        setElStyle('trae-theme', `background:${bBg};border:${bBorder};color:${tPrimary};padding:8px 12px;margin:2px;border-radius:4px;cursor:pointer;font-weight:bold`);
        setElStyle('trae-exit', `background:${bBg};border:1px solid ${eBtn};color:${eBtn};padding:8px 12px;margin:2px;border-radius:4px;cursor:pointer;font-weight:bold`);

        const minimizeBtnStyle = `color:${tPrimary};width:24px;height:24px;border-radius:6px;cursor:pointer;font-size:16px;background:${bBg};border:none;display:flex;align-items:center;justify-content:center`;
        const minimizeBtn = document.getElementById('trae-minimize');
        const minimizeBtnMinimized = document.getElementById('trae-minimize-minimized');
        if (minimizeBtn) minimizeBtn.style.cssText = minimizeBtnStyle;
        if (minimizeBtnMinimized) minimizeBtnMinimized.style.cssText = minimizeBtnStyle;

        setElStyle('trae-log', tLog);

        const limitEl = document.querySelector('#trae-controls div[style*="background: #f8f9fa"]');
        if (limitEl) limitEl.style.cssText = `background:${lBg};border:${lBorder}`;

        setElStyle('trae-click-limit', `background:${iBg};color:${iColor};border:${iBorder}`);
        setElStyle('trae-click-count', tSecondary);

        const statusIcon = document.getElementById('trae-status-icon');
        const statusIconMinimized = document.getElementById('trae-status-icon-minimized');
        if (statusIcon) statusIcon.style.background = isRunning ? sRunning : sStopped;
        if (statusIconMinimized) statusIconMinimized.style.background = isRunning ? sRunning : sStopped;

        const toggleBtn = document.getElementById('trae-toggle');
        if (toggleBtn) {
            const color = isRunning ? sStopped : sRunning;
            toggleBtn.style.cssText = `background:${bBg};border:1px solid ${color};color:${color};padding:8px 12px;margin:2px;border-radius:4px;cursor:pointer;font-weight:bold`;
            toggleBtn.textContent = isRunning ? '停止' : '启动';
        }
    }
    
    function toggleTheme() {
        isDarkMode = !isDarkMode;
        applyTheme();
        log(`🎨 切换到${isDarkMode ? '深色' : '浅色'}模式`);
    }
    
    function log(msg) {
        const logDiv = document.getElementById('trae-log');
        if (!logDiv) return;

        const entry = document.createElement('div');
        entry.innerHTML = `[${new Date().toLocaleTimeString()}] ${msg}`;
        logDiv.appendChild(entry);

        if (logDiv.children.length > LOG_BUFFER_SIZE) {
            for (let i = 0; i < Math.floor(LOG_BUFFER_SIZE / 2); i++) {
                logDiv.removeChild(logDiv.children[i]);
            }
        }

        logDiv.scrollTop = logDiv.scrollHeight;
        console.log(`[TraeCN] ${msg}`);
    }
    
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
    
    const BUTTON_CONFIGS = [
        {name: '继续', selector: 'div.agent-error-wrap div.icube-alert-action', validate: (b) => b.textContent.trim() === '继续'},
        {name: '运行', selector: 'div.icd-run-command-card-v2-actions button.icd-run-command-card-v2-actions-btn-run', validate: (b) => b.textContent.trim() === '运行'},
        {name: '全部接受', selector: 'div.chat-todolist-bar button.icd-btn-primary', validate: (b) => {
            const span = b.querySelector('span.icd-btn-content');
            return (span ? span.textContent.trim() : '') === '全部接受';
        }},
        {name: '删除', selector: 'button.icd-delete-files-command-card-v2-actions-delete', validate: (b) => {
            const span = b.querySelector('span.icd-btn-content');
            return (span ? span.textContent.trim() : '') === '删除' && enableDelete;
        }}
    ];

    function findButton(config) {
        try {
            const button = document.querySelector(config.selector);
            return button && isButtonVisible(button) && config.validate(button) ? button : null;
        } catch (error) {
            log(`❌ 查找${config.name}按钮错误: ${error.message}`);
            return null;
        }
    }

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
            updateMinimizedTitle();
            const logMessage = buttonName === '删除' ?
                `✅ 成功点击<span style="color: #e74c3c; font-weight: bold;">"${buttonName}"</span>按钮 (${clickCount}/${clickLimit})` :
                `✅ 成功点击"${buttonName}"按钮 (${clickCount}/${clickLimit})`;
            log(logMessage);

            showClickAnimation();

            return checkClickLimitAfterClick();
        } catch (error) {
            log(`❌ 点击${buttonName}按钮错误: ${error.message}`);
            return false;
        }
    }

    function findAndClick() {
        try {
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

    
    function checkClickLimitAfterClick() {
        if (clickLimit > 0 && clickCount >= clickLimit) {
            setTimeout(() => {
                clickCount = 0;
                updateMinimizedTitle();
                stop(true);
            }, 100);
            return true;
        }
        return false;
    }
    
    function updateClickLimit(value) {
        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue < 0) {
            clickLimit = 0;
        } else if (numValue > 99) {
            clickLimit = 99;
        } else {
            clickLimit = numValue;
        }

        const limitInput = document.getElementById('trae-click-limit');
        if (limitInput) limitInput.value = clickLimit;

        updateMinimizedTitle();
        log(`📊 点击次数限制已设置为: ${clickLimit === 0 ? '无限制' : clickLimit}`);
    }

    function resetClickCount() {
        clickCount = 0;
        updateMinimizedTitle();
        log('🔄 点击次数已重置');
    }
    
    function toggle() {
        isRunning ? stop() : start();
    }

    function start() {
        if (isRunning) return;
        isRunning = true;
        applyTheme();
        log('🚀 启动自动操作 (支持继续、运行、接受按钮' + (enableDelete ? '、<span style="color: #e74c3c; font-weight: bold;">删除按钮</span>' : '') + ')');

        interval = setInterval(findAndClick, 5000);
        findAndClick();

        setTimeout(() => {
        if (controls && controls.style.display !== 'none') {
            minimize();
            log('📱 自动收起控制面板');
          }
        }, 3000);
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

        const controls = document.getElementById('trae-controls');
        if (controls && controls.style.display === 'none') {
            minimize();
            log('📱 自动展开控制面板');
        }
    }
    
    function updateMinimizeButton(isMinimized) {
        const minimizeBtn = document.getElementById('trae-minimize');
        const minimizeBtnMinimized = document.getElementById('trae-minimize-minimized');

        if (minimizeBtn) {
            minimizeBtn.textContent = isMinimized ? '+' : '－';
            minimizeBtn.title = isMinimized ? '展开' : '收起';
        }

        if (minimizeBtnMinimized) {
            minimizeBtnMinimized.textContent = isMinimized ? '+' : '－';
            minimizeBtnMinimized.title = isMinimized ? '展开' : '收起';
        }
    }

    function updateMinimizedTitle() {
        const title = document.getElementById('trae-title');
        const minimizedTitle = document.getElementById('trae-minimized-title');
        const clickLimitDisplay = clickLimit === 0 ? '∞' : clickLimit;
        const titleContent = `Auto <span class="trae-count-wrapper">${clickCount}</span>/${clickLimitDisplay} <span class="trae-plus-placeholder"></span>`;

        if (title) title.innerHTML = titleContent;
        if (minimizedTitle) minimizedTitle.innerHTML = titleContent;
    }

    function showClickAnimation(isSimulated = false) {
        if (isSimulated) {
            clickCount++;
            updateMinimizedTitle();
            log(`✅ 模拟点击成功 (${clickCount}/${clickLimit})`);

            if (checkClickLimitAfterClick()) {
                log('⚠️ 模拟点击达到限制，自动停止操作');
            }
        }

        const minimizedTitle = document.getElementById('trae-minimized-title');
        const title = document.getElementById('trae-title');
        if (!minimizedTitle && !title) return;

        const activeTitle = minimizedTitle?.style.display !== 'none' ? minimizedTitle : title;
        if (!activeTitle) return;

        let countWrapper = activeTitle.querySelector('.trae-count-wrapper');
        if (!countWrapper) {
            const text = activeTitle.textContent;
            const match = text.match(/Auto\s+(\d+)\/(.+?)(?:\s|$)/);
            if (match) {
                activeTitle.innerHTML = `Auto <span class="trae-count-wrapper">${match[1]}</span>/${match[2]} <span class="trae-plus-placeholder"></span>`;
                countWrapper = activeTitle.querySelector('.trae-count-wrapper');
            } else {
                return;
            }
        }
        if (!countWrapper) return;

        if (!document.getElementById('trae-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'trae-animation-styles';
            style.textContent = `
                @keyframes fadeUp {
                    0% { opacity: 0; transform: translateY(0); }
                    30% { opacity: 1; transform: translateY(-5px); }
                    100% { opacity: 0; transform: translateY(-30px); }
                }
                .trae-count-wrapper {
                    position: relative;
                    display: inline-block;
                }
            `;
            document.head.appendChild(style);
        }

        const plusOne = document.createElement('span');
        plusOne.textContent = '+1';
        plusOne.style.cssText = `
            position: absolute;
            left: -2px;
            top: 10px;
            color: ${isDarkMode ? '#2ecc71' : '#27ae60'};
            background: ${isDarkMode ? 'rgba(44, 62, 80, 0.6)' : 'rgba(255, 255, 255, 0.6)'};
            padding: 2px 4px;
            border-radius: 3px;
            font-weight: bold;
            font-size: 12px;
            animation: fadeUp 1s ease-out forwards;
            z-index: 1000;
        `;

        countWrapper.appendChild(plusOne);
        setTimeout(() => {
            if (plusOne && plusOne.parentNode) {
                plusOne.remove();
            }
        }, 1000);
    }

    function minimize() {
        const controls = document.getElementById('trae-controls');
        const panel = document.getElementById('trae-panel');
        const header = document.getElementById('trae-header');
        const minimizedContent = document.getElementById('trae-minimized-content');
        const title = document.getElementById('trae-title');
        const minimizedTitle = document.getElementById('trae-minimized-title');

        if (!controls || !panel || !header || !minimizedContent) return;

        if (controls.style.display === 'none') {
            controls.style.display = 'block';
            header.style.display = 'flex';
            minimizedContent.style.display = 'none';
            panel.style.padding = '15px';
            panel.style.minWidth = '320px';
            panel.style.width = 'auto';
            panel.style.maxWidth = '400px';
            title.style.display = 'block';
            minimizedTitle.style.display = 'none';
            panel.style.removeProperty('display');
            panel.style.removeProperty('align-items');
            panel.style.removeProperty('justify-content');
            updateMinimizeButton(false);
            applyTheme();
        } else {
            controls.style.display = 'none';
            header.style.display = 'none';
            minimizedContent.style.display = 'flex';
            panel.style.padding = '8px 12px';
            panel.style.minWidth = 'auto';
            title.style.display = 'none';
            minimizedTitle.style.display = 'block';
            panel.style.display = 'flex';
            panel.style.alignItems = 'center';
            panel.style.justifyContent = 'center';
            updateMinimizeButton(true);
            applyTheme();
        }
    }
    
    function destroy() {
        if (!confirm('确定要退出 TraeCN 自动操作吗？')) return;

        stop();
        const panel = document.getElementById('trae-panel');
        if (panel) panel.remove();

        document.querySelectorAll('[id^="trae-"]').forEach(el => el.remove());
        delete window.traeAutoAccept;

        console.log('🔚 TraeCN 自动操作已完全退出');
    }
    
    function createPanel() {
        if (document.getElementById('trae-panel')) {
            console.log('控制面板已存在');
            return;
        }

        const panel = document.createElement('div');
        panel.id = 'trae-panel';

        panel.innerHTML = `
            <div id="trae-minimized-content" style="display: none; justify-content: space-between; align-items: center; width: 100%;">
                <div style="display: flex; align-items: center;">
                    <div id="trae-status-icon-minimized" style="width: 16px; height: 16px; border-radius: 50%; margin-right: 8px;"></div>
                    <div id="trae-minimized-title" style="font-weight: bold; user-select: none;">Auto 0/∞<span class="trae-plus-placeholder"></span></div>
                </div>
                <button id="trae-minimize-minimized" title="收起">－</button>
            </div>
            <div id="trae-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="display: flex; align-items: center;">
                    <div id="trae-status-icon" style="width: 16px; height: 16px; border-radius: 50%; margin-right: 8px;"></div>
                    <div id="trae-title" style="font-weight: bold; user-select: none;">Auto 0/∞<span class="trae-plus-placeholder"></span></div>
                </div>
                <button id="trae-minimize" title="收起">－</button>
            </div>
            <div id="trae-controls">
                <div style="display: flex; justify-content: center; margin-bottom: 10px; gap: 8px;">
                    <button id="trae-toggle" style="background: transparent; padding: 8px 12px; margin: 2px; border-radius: 4px; cursor: pointer; font-weight: bold;">启动</button>
                    <button id="trae-theme" style="background: transparent; padding: 8px 12px; margin: 2px; border-radius: 4px; cursor: pointer; font-weight: bold;">主题</button>
                    <button id="trae-exit" style="background: transparent; padding: 8px 12px; margin: 2px; border-radius: 4px; cursor: pointer; font-weight: bold;">退出</button>
                </div>
                <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 15px;">
                    <div style="display: flex; align-items: center; margin: 2px; padding: 6px 8px; border-radius: 4px;">
                        <span style="font-size: 12px; margin-right: 4px;">限额:</span>
                        <input type="number" id="trae-click-limit" min="0" max="99" value="5" style="width: 30px; padding: 4px; border-radius: 3px; font-size: 12px;">
                    </div>
                    <div style="display: flex; align-items: center; margin: 2px; padding: 6px 8px; border-radius: 4px;">
                        <input type="checkbox" id="trae-enable-delete" style="margin-right: 4px;">
                        <span style="font-size: 12px; color: #e74c3c; font-weight: bold;">启用删除</span>
                    </div>
                </div>
                <div id="trae-log" style="margin-top: 10px; font-size: 10px; max-height: 100px; overflow-y: auto;"></div>
            </div>
        `;

        panel.style.cssText = 'position:fixed;top:20px;right:20px;background:white;color:#333;padding:15px;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);border:1px solid #ddd;z-index:999999;font-family:monospace;min-width:200px;max-width:300px;transition:all 0.3s ease;cursor:move;display:block';

        document.body.appendChild(panel);
        updateMinimizedTitle();

        const header = document.getElementById('trae-header');
        const minimizeBtn = document.getElementById('trae-minimize');
        const minimizeBtnMinimized = document.getElementById('trae-minimize-minimized');
        const toggleBtn = document.getElementById('trae-toggle');
        const exitBtn = document.getElementById('trae-exit');
        const themeBtn = document.getElementById('trae-theme');
        const limitInput = document.getElementById('trae-click-limit');
        const deleteCheckbox = document.getElementById('trae-enable-delete');

        header.addEventListener('click', e => !e.target.closest('button') && minimize());
        minimizeBtn.addEventListener('click', e => { e.stopPropagation(); minimize(); });
        minimizeBtnMinimized.addEventListener('click', e => { e.stopPropagation(); minimize(); });
        toggleBtn.addEventListener('click', toggle);
        exitBtn.addEventListener('click', e => { e.stopPropagation(); destroy(); });
        themeBtn.addEventListener('click', e => { e.stopPropagation(); toggleTheme(); });

        if (limitInput) {
            limitInput.addEventListener('input', e => { e.stopPropagation(); updateClickLimit(e.target.value); });
        }

        if (deleteCheckbox) {
            deleteCheckbox.addEventListener('change', e => { e.stopPropagation(); enableDelete = e.target.checked; log(`🗑️ 删除功能已<span style="color: #e74c3c; font-weight: bold;">${enableDelete ? '启用' : '禁用'}</span>`); });
        }

        updateMinimizeButton(false);
        applyTheme();
        updateMinimizedTitle();

        panel.addEventListener('mousedown', e => {
            if (e.target.closest('button')) return;
            isDragging = true;
            dragOffset.x = e.clientX - panel.offsetLeft;
            dragOffset.y = e.clientY - panel.offsetTop;
            panel.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', e => {
            if (!isDragging) return;
            e.preventDefault();

            const newLeft = e.clientX - dragOffset.x;
            const newTop = e.clientY - dragOffset.y;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const panelRect = panel.getBoundingClientRect();
            const margin = 20;

            panel.style.left = Math.max(margin, Math.min(newLeft, windowWidth - panelRect.width - margin)) + 'px';
            panel.style.top = Math.max(margin, Math.min(newTop, windowHeight - panelRect.height - margin)) + 'px';
            panel.style.right = 'auto';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                panel.style.cursor = 'move';
            }
        });

        log('🎯 TraeCN 自动操作脚本已加载');
        log(`📝 日志缓冲区: ${LOG_BUFFER_SIZE} 条`);
        log('✨ 支持功能: 自动点击继续、运行、接受按钮' + (enableDelete ? '、<span style="color: #e74c3c; font-weight: bold;">删除按钮</span>' : ''));
    }
    
    window.traeAutoAccept = {
        start, stop, toggle,
        click: findAndClick, destroy, exit: destroy,
        toggleTheme, setTheme: (dark) => { isDarkMode = dark; applyTheme(); },
        setClickLimit: updateClickLimit,
        getClickCount: () => clickCount,
        getClickLimit: () => clickLimit,
        simulateClickAnimation: () => showClickAnimation(true)
    };

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
    console.log('   - traeAutoAccept.simulateClickAnimation() // 模拟+1动画效果');
    console.log('');
    console.log('💡 控制台将在10秒后关闭');

})();
