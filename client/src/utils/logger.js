// src/utils/logger.js
export function log(msg, type = 'info') {
    const icon = {
        info: '📦', // general
        action: '▶️', // function start
        end: '⏹️', // function end
        attach: '🔗', // listener attached
        click: '🖱️', // event triggered
        ui: '🎭', // UI change
        success: '✅', // element found
        error: '❌' // element missing / error
    }[type] || ' ';
    console.log(`${icon} ${msg}`);
}

log("logger.js loaded");