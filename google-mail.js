// google-mail.js - THE CLEAN IDENTITY FEATURE

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
        <div class="nav-label" style="margin-top: 20px; border-top: 1px solid #374151; padding-top: 15px;">Connected Account</div>
        <div id="google-module" style="margin: 10px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
            
            <div id="g-disconnected">
                <button onclick="openGoogleAuthPopup()" style="width: 100%; background: #fff; color: #111; border: none; padding: 8px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
                    Connect Gmail
                </button>
            </div>

            <div id="g-connected" class="hidden">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 5px #10b981;"></div>
                    <div style="display: flex; flex-direction: column;">
                        <span id="g-user-email" style="font-size: 11px; color: #fff; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;">
                            loading...
                        </span>
                        <span style="font-size: 9px; color: #6B7280;">Verified Google Account</span>
                    </div>
                </div>
                <button onclick="openGoogleAuthPopup()" style="margin-top: 10px; background: none; border: 1px solid #374151; color: #9CA3AF; font-size: 9px; padding: 3px 8px; border-radius: 4px; cursor: pointer;">
                    Switch Account
                </button>
            </div>
        </div>
    `;

    const logout = sidebar.querySelector('div[style*="margin-top:auto"]');
    sidebar.insertBefore(container, logout);
    
    // Check if they are already authorized on load
    checkAuthStatus();
}

async function checkAuthStatus() {
    try {
        const res = await fetch(`${SCRIPT_URL}?action=check_auth`);
        const data = await res.json();
        
        if (data.status === "authorized" && data.user) {
            showConnectedState(data.user);
        }
    } catch (e) {
        console.log("Not yet authorized with Google.");
    }
}

function showConnectedState(email) {
    document.getElementById('g-disconnected').classList.add('hidden');
    document.getElementById('g-connected').classList.remove('hidden');
    document.getElementById('g-user-email').innerText = email;
}

function openGoogleAuthPopup() {
    const authWin = window.open(SCRIPT_URL, 'GoogleAuth', 'width=500,height=600');
    
    const checkWin = setInterval(() => {
        if (authWin.closed) {
            clearInterval(checkWin);
            checkAuthStatus(); // Refresh the email display
        }
    }, 1000);
}
