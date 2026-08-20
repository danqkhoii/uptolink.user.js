const API_URL = "http://proxy.androidmodvip.io.vn/proxies";

function setChromeProxy(host, port, scheme = "http") {
    const config = {
        mode: "fixed_servers",
        rules: {
            singleProxy: { scheme: scheme, host: host, port: parseInt(port) },
            bypassList: ["localhost"]
        }
    };
    chrome.proxy.settings.set({ value: config, scope: "regular" }, () => {
        console.log(`[Dangkhoi Helper] Đã áp dụng Proxy: ${host}:${port}`);
    });
}

async function fetchAndRotateProxy() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        let proxyList = Array.isArray(data) ? data : (data.proxies || [data]);
        if (proxyList.length === 0) throw new Error("Danh sách proxy trống.");

        const selected = proxyList[Math.floor(Math.random() * proxyList.length)];
        let host, port;

        if (typeof selected === 'string') {
            [host, port] = selected.split(':');
        } else if (selected.ip && selected.port) {
            host = selected.ip;
            port = selected.port;
        }

        if (host && port) {
            setChromeProxy(host, port);
            chrome.storage.local.set({ lastProxy: `${host}:${port}`, lastUpdated: new Date().toLocaleTimeString() });
            return { success: true, proxy: `${host}:${port}` };
        }
        throw new Error("Định dạng Proxy không hợp lệ.");
    } catch (err) {
        console.error("[Dangkhoi Helper] Lỗi Proxy API:", err);
        return { success: false, error: err.message };
    }
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.action === "ROTATE_KEY_ON_CAMP") {
        fetchAndRotateProxy().then(res => sendResponse(res));
        return true;
    }
});
