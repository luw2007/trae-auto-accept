// Trae Auto Accept - 脚本压缩工具
const fs = require('fs');

function minimalCompress(code) {
    let compressed = code;

    // 保护字符串中的内容（避免误删注释）
    const stringMap = new Map();
    let stringCounter = 0;
    
    // 匹配并保护字符串
    compressed = compressed.replace(/(['"])(?:(?=(\\?))\2.)*?\1/g, (match) => {
        const key = `__STRING_${stringCounter++}__`;
        stringMap.set(key, match);
        return key;
    });

    // 移除多行注释（/* */）
    compressed = compressed.replace(/\/\*[\s\S]*?\*\//g, '');

    // 移除单行注释（// 到行尾）
    compressed = compressed.replace(/\/\/.*$/gm, '');

    // 恢复被保护的字符串
    stringMap.forEach((value, key) => {
        compressed = compressed.replace(new RegExp(key, 'g'), value);
    });

    // 移除多余空白
    compressed = compressed
        .replace(/\s+/g, ' ')           // 多个空白转为单个空格
        .replace(/>\s+</g, '><')        // HTML标签间空白
        .replace(/;\s*}/g, '}')          // 对象结尾分号后的空白
        .replace(/{\s+/g, '{')           // 对象开始后的空白
        .replace(/\s+}/g, '}')            // 对象结束前的空白
        .trim();

    // 确保文件完整性（检查IIFE结尾）
    if (!compressed.trim().endsWith('})();')) {
        console.log('⚠️ 警告: 压缩文件可能不完整，正在修复...');
        if (!compressed.trim().endsWith(')')) {
            compressed += '})()';
        }
        if (!compressed.trim().endsWith(');')) {
            compressed += ';';
        }
        if (!compressed.trim().endsWith('})();')) {
            compressed += '})();';
        }
    }

    return compressed;
}

// 执行压缩
try {
    const sourceCode = fs.readFileSync('trae-browser-script.js', 'utf8');
    const compressedCode = minimalCompress(sourceCode);

    fs.writeFileSync('trae-browser-script-min.js', compressedCode, 'utf8');

    const originalSize = fs.statSync('trae-browser-script.js').size;
    const compressedSize = fs.statSync('trae-browser-script-min.js').size;
    const ratio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

    console.log('✅ 脚本压缩完成');
    console.log('📊 原始大小:', originalSize, 'bytes');
    console.log('📊 压缩大小:', compressedSize, 'bytes');
    console.log('📊 压缩率:', ratio + '%');

} catch (error) {
    console.error('❌ 压缩失败:', error.message);
    process.exit(1);
}