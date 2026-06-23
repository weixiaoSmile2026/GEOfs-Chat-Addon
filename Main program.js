// ==UserScript==
// @name         GeoFS ACARS Controller - Security Edition (Fast Load)
// @version      3.2
// @match        http://*.geo-fs.com/geofs.php*
// @match        https://*.geo-fs.com/geofs.php*
// @grant        none
// ==/UserScript==
(function () {
    'use strict';
    const CHAT_URL = "https://geofs-chat-app.vercel.app/";
    let isOpen   = true;
    let savedPos = JSON.parse(localStorage.getItem('geofs_chat_pos')) || { x: 20, y: 20 };
    let savedRoom = localStorage.getItem('geofs_chat_room_persistent') || "20013";

    function buildChatURL() {
        return `${CHAT_URL}?room=${encodeURIComponent(savedRoom)}&geofs_logged_in=false&geofs_callsign=`;
    }

    // ── 建立 UI 外殼 ──
    let container = document.createElement('div');
    container.style.cssText = [
        `position: fixed`,
        `bottom: ${savedPos.y}px`,
        `right: ${savedPos.x}px`,
        `width: 340px`,
        `height: 540px`,
        `z-index: 10001`,
        `border-radius: 10px`,
        `overflow: hidden`,
        // 深海軍藍邊框帶輕微藍紫光暈
        `border: 1.5px solid #3a4a7a`,
        `background: #070b14`,
        // 藍色光暈陰影
        `box-shadow: 0 8px 32px rgba(0,0,0,0.85), 0 0 0 1px rgba(58,74,122,0.25), 0 0 24px rgba(60,100,255,0.15)`,
        `display: block`,
    ].join('; ');

    let dragHandle = document.createElement('div');
    dragHandle.style.cssText = [
        `width: 100%`,
        `height: 30px`,
        `background: rgba(13,18,40,0.88)`,          // 半透明深藍，有透視感
        `cursor: move`,
        `display: flex`,
        `align-items: center`,
        `padding: 0 11px`,
        `font-size: 10px`,
        // 冷白標題文字
        `color: #c8d8ff`,
        `font-family: 'Courier New', Courier, monospace`,
        `font-weight: bold`,
        // 藍紫色分隔線
        `border-bottom: 1px solid rgba(58,74,122,0.6)`,
        `user-select: none`,
        `justify-content: space-between`,
        `letter-spacing: 0.5px`,
        // 標題列本身也帶一點 backdrop-filter 毛玻璃感（若瀏覽器支援）
        `backdrop-filter: blur(4px)`,
    ].join('; ');

    let titleSpan = document.createElement('span');
    titleSpan.textContent = '> ACARS PANEL [T]';

    let geofsIndicator = document.createElement('span');
    geofsIndicator.style.cssText = [
        `font-size: 9px`,
        // 琥珀黃，像駕駛艙警示燈
        `color: #f5c842`,
        `letter-spacing: 0.5px`,
    ].join('; ');
    geofsIndicator.textContent = 'ACARS: READY';

    dragHandle.appendChild(titleSpan);
    dragHandle.appendChild(geofsIndicator);
    container.appendChild(dragHandle);

    // ── 建立 Iframe ──
    let iframe = document.createElement('iframe');
    iframe.style.cssText = 'width: 100%; height: calc(100% - 30px); border: none;';
    iframe.allow = "popups";
    iframe.src = buildChatURL();
    container.appendChild(iframe);
    document.body.appendChild(container);

    // ── T 鍵開關切換（修正了原本的 bug：.style.style） ──
    window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key.toLowerCase() === 't') {
            isOpen = !isOpen;
            container.style.display = isOpen ? 'block' : 'none';
        }
    });

    // ── 拖曳面板邏輯 ──
    let isDragging = false;
    let dragStart  = { x: 0, y: 0 };

    dragHandle.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragStart.x = e.clientX + parseInt(container.style.right  || 0);
        dragStart.y = e.clientY + parseInt(container.style.bottom || 0);
        iframe.style.pointerEvents = 'none';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const newX = Math.max(0, dragStart.x - e.clientX);
        const newY = Math.max(0, dragStart.y - e.clientY);
        container.style.right  = newX + 'px';
        container.style.bottom = newY + 'px';
        localStorage.setItem('geofs_chat_pos', JSON.stringify({ x: newX, y: newY }));
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            iframe.style.pointerEvents = 'auto';
        }
    });
})();
