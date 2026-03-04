// google-mail.js - CLEAN ACCOUNT INDICATOR ONLY

(function init() {
    const timer = setInterval(() => {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            clearInterval(timer);
            injectGoogleStatusUI(sidebar);
        }
    }, 500);
})();

function injectGoogleStatusUI(sidebar) {
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="nav-label" style="margin-top: 20px; border-top: 1px solid #374151; padding-top: 15px;">Google Integration</div>
        <div id="google-module" style="margin: 10px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
            
            <div id="g-disconnected">
                <div style="font-size: 10px; color: #9CA3AF; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                    <div style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%;"></div>
                    No Google Account Linked
                </div>
                <button onclick="openGoogleAuthPopup()" style="width: 100%; background: #fff; color: #111; border: none; padding: 8px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
                    Connect Gmail
                </button>
            </div>

            <div id="g-connected" class="hidden">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 5px #10b981;"></div>
                    <div style="display: flex; flex-direction: column; overflow: hidden;">
                        <span id="g-user-email" style="font-size: 11px; color: #fff; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px;">
                            Checking...
                        </span>
                        <span style="font-size: 9px; color: #10b981;">Account Connected</span>
                    </div>
                </div>
                <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between;">
                    <button onclick="openGoogleAuthPopup()" style="background: none; border: none; color: #6B7280; font-size: 9px; cursor: pointer; padding: 0;">Switch Account</button>
                </div>
            </div>
        </div>
    `;

    const logout = sidebar.querySelector('div[style*="margin-top:auto"]');
    sidebar.insertBefore(container, logout);
    
    // Check status immediately on load
    checkAuthStatus();
}

async function checkAuthStatus() {
    try {
        const res = await fetch(`${SCRIPT_URL}?action=check_auth`);
        const data = await res.json();
        
        if (data.status === "authorized" && data.user) {
            document.getElementById('g-disconnected').classList.add('hidden');
            document.getElementById('g-connected').classList.remove('hidden');
            document.getElementById('g-user-email').innerText = data.user;
        } else {
            document.getElementById('g-disconnected').classList.remove('hidden');
            document.getElementById('g-connected').classList.add('hidden');
        }
    } catch (e) {
        console.log("Waiting for user authorization...");
    }
}

function openGoogleAuthPopup() {
    const authWin = window.open(SCRIPT_URL, 'GoogleAuth', 'width=500,height=600');
    
    // Watch for the popup to close
    const checkWin = setInterval(() => {
        if (authWin.closed) {
            clearInterval(checkWin);
            checkAuthStatus(); // Re-check and update the sidebar UI
        }
    }, 1000);
}
