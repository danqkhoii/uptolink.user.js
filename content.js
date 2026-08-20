// 1. Chặn popup/chuyển hướng rác
const script = document.createElement('script');
script.textContent = `
    window.open = function() { console.log('[Dangkhoi] Đã chặn Popup.'); return null; };
    window.onbeforeunload = null;
`;
(document.head || document.documentElement).appendChild(script);

// 2. Tạo UI Dangkhoi giao diện Biển & Bo tròn
document.addEventListener('DOMContentLoaded', () => {
    const panel = document.createElement('div');
    panel.id = 'dangkhoi-helper-panel';
    panel.innerHTML = `
        <div style="font-weight: 700; font-size: 13px; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
            <span>🌊 Dangkhoi Helper</span>
            <span id="dk-status-dot" style="height: 10px; width: 10px; background-color: #00e5ff; border-radius: 50%; display: inline-block; box-shadow: 0 0 8px #00e5ff;"></span>
        </div>
        <div id="dk-msg" style="font-size: 11px; color: #e0f7fa; background: rgba(255, 255, 255, 0.15); padding: 8px 10px; border-radius: 12px; backdrop-filter: blur(4px);">
            Đang khởi chạy tiến trình...
        </div>
    `;

    // Style tone màu biển, bo tròn chữ nhật (Border-radius lớn)
    Object.assign(panel.style, {
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: '9999999',
        background: 'linear-gradient(135deg, #005c97 0%, #363795 100%)',
        color: '#ffffff',
        padding: '12px 16px',
        borderRadius: '20px',
        boxShadow: '0 8px 24px rgba(0, 92, 151, 0.4)',
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        minWidth: '200px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        pointerEvents: 'none',
        transition: 'all 0.3s ease'
    });

    document.body.appendChild(panel);

    function updateStatus(text, dotColor) {
        const msg = document.getElementById('dk-msg');
        const dot = document.getElementById('dk-status-dot');
        if (msg) msg.textContent = text;
        if (dot && dotColor) {
            dot.style.backgroundColor = dotColor;
            dot.style.boxShadow = `0 0 8px ${dotColor}`;
        }
    }

    // 3. Tự động đếm bước & Click chuyển trang (NEXT / SYNC / Link Gốc)
    let isClicking = false;

    setInterval(() => {
        if (isClicking) return;

        // Bỏ qua đếm ngược Client
        if (typeof window.counter !== 'undefined') window.counter = 0;

        // Phát hiện Captcha
        const captchaBox = document.querySelector('.captcha-container, .circle-captcha, [class*="captcha"]');
        const isCaptchaDone = document.querySelector('.captcha-success, .checked, [data-status="success"]') ||
                              Array.from(document.querySelectorAll('*')).some(el => el.textContent.includes('Xác thực thành công'));

        // Tìm nút bấm tiến trình
        const buttons = Array.from(document.querySelectorAll('button, a, div.btn, input[type="submit"]'));
        const nextBtn = buttons.find(el => {
            const txt = (el.textContent || el.value || '').trim().toUpperCase();
            const isVisible = el.offsetWidth > 0 && el.offsetHeight > 0;
            return isVisible && (txt === 'NEXT' || txt === 'SYNC' || txt.includes('LINK GỐC') || txt.includes('GET LINK') || txt.includes('CONTINUE'));
        });

        if (nextBtn) {
            updateStatus('⚡ Đã thấy nút! Đang tự động bấm...', '#00ff88');
            isClicking = true;
            nextBtn.click();
            setTimeout(() => { isClicking = false; }, 1800);
        } else if (captchaBox && !isCaptchaDone) {
            updateStatus('👉 Vui lòng giải Captcha thủ công...', '#ffea00');
        } else if (isCaptchaDone) {
            updateStatus('✅ Captcha xong! Đang chờ nút xuất hiện...', '#00e5ff');
        } else {
            updateStatus('🌊 Dangkhoi đang theo dõi đếm ngược...', '#80d8ff');
        }
    }, 500);

    // 4. Tự xoay Proxy từ API nếu bị Camp 24h
    function checkCampError() {
        const pageText = document.body ? document.body.innerText.toLowerCase() : '';
        if (pageText.includes('24h') || pageText.includes('giới hạn') || pageText.includes('limit reached')) {
            updateStatus('🔄 Phát hiện Camp 24h! Đang xoay IP...', '#ff5252');
            chrome.runtime.sendMessage({ action: "ROTATE_KEY_ON_CAMP" }, (res) => {
                if (res && res.success) {
                    alert(`[Dangkhoi] Đã tự động xoay Proxy mới: ${res.proxy}`);
                    location.reload();
                }
            });
        }
    }
    setTimeout(checkCampError, 2000);
});
