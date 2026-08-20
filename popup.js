document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['lastProxy'], (data) => {
        if (data.lastProxy) {
            document.getElementById('currentProxy').textContent = data.lastProxy;
        }
    });
});

document.getElementById('manualRotate').addEventListener('click', () => {
    const status = document.getElementById('status');
    status.style.color = '#80d8ff';
    status.textContent = 'Đang gọi API lấy Proxy...';

    chrome.runtime.sendMessage({ action: "ROTATE_KEY_ON_CAMP" }, (res) => {
        if (res && res.success) {
            document.getElementById('currentProxy').textContent = res.proxy;
            status.style.color = '#00ff88';
            status.textContent = 'Đã xoay thành công!';
        } else {
            status.style.color = '#ff5252';
            status.textContent = 'Lỗi kết nối API!';
        }
    });
});
