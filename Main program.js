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

    // ── 移除所有 GeoFS 偵測，直接固定為預設 URL ──
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
        `border-radius: 8px`,
        `overflow: hidden`,
        `border: 2px solid #2a2a2a`,
        `background: #000`,
        `box-shadow: 0 10px 40px rgba(0,0,0,0.9)`,
        `display: block`,
    ].join('; ');

    let dragHandle = document.createElement('div');
    dragHandle.style.cssText = [
        `width: 100%`,
        `height: 28px`,
        `background: #0d0d0d`,
        `cursor: move`,
        `display: flex`,
        `align-items: center`,
        `padding: 0 10px`,
        `font-size: 10px`,
        `color: #00e5ff`,
        `font-family: monospace`,
        `font-weight: bold`,
        `border-bottom: 1px solid #1a1a1a`,
        `user-select: none`,
        `justify-content: space-between`,
    ].join('; ');

    let titleSpan = document.createElement('span');
    titleSpan.textContent = '> ACARS PANEL [T]';

    let geofsIndicator = document.createElement('span');
    geofsIndicator.style.cssText = 'font-size: 9px; color: #888;';
    geofsIndicator.textContent   = 'ACARS: READY';

    dragHandle.appendChild(titleSpan);
    dragHandle.appendChild(geofsIndicator);
    container.appendChild(dragHandle);

    // ── 建立 Iframe 並「立刻」載入網址 ──
    let iframe = document.createElement('iframe');
    iframe.style.cssText = 'width: 100%; height: calc(100% - 28px); border: none;';
    iframe.allow = "popups";

    // 這裡直接設定網址，完全不需要等待任何計時器
    iframe.src = buildChatURL();

    container.appendChild(iframe);
    document.body.appendChild(container);

    // ── T 鍵開關切換 ──
    window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key.toLowerCase() === 't') {
            isOpen = !isOpen;
            container.style.style.display = isOpen ? 'block' : 'none';
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
