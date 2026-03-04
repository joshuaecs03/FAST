// google-mail.js - THE OUTSIDE FEATURE

(function init() {
    // Wait for sidebar to load, then inject
    const timer = setInterval(() => {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            clearInterval(timer);
            injectGoogleAuthUI(sidebar);
        }
    }, 500);
})();

function injectGoogleAuthUI(sidebar) {
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="nav-label" style="margin-top: 20px; border-top: 1px solid #374151; padding-top: 15px;">Google Integration</div>
        <div id="google-module" style="margin: 10px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
            
            <div id="g-auth-section">
                <div style="font-size: 10px; color: #9CA3AF; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                    <div style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%;"></div>
                    Account Disconnected
                </div>
                <button onclick="openGoogleAuthPopup()" style="width: 100%; background: #fff; color: #111; border: none; padding: 8px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
                    Connect My Gmail
                </button>
            </div>

            <div id="g-email-section" class="hidden">
                <div style="font-size: 10px; color: #10b981; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                    <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></div>
                    Connected to Gmail
                </div>
                <input type="email" id="target-email" placeholder="Recipient Email" 
                    style="width: 100%; font-size: 11px; padding: 6px; background: #111827; border: 1px solid #4B5563; color: white; border-radius: 4px; margin-bottom: 8px; box-sizing: border-box;">
                <button onclick="sendUserMail()" id="send-btn" 
                    style="width: 100%; background: var(--ecs-orange); color: white; border: none; padding: 8px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
                    Send Job Update
                </button>
            </div>
            
            <div id="g-msg" style="font-size: 9px; color: #6B7280; margin-top: 8px; text-align: center;"></div>
        </div>
    `;

    const logout = sidebar.querySelector('div[style*="margin-top:auto"]');
    sidebar.insertBefore(container, logout);
}

function openGoogleAuthPopup() {
    // This opens the App Script URL. 
    // Because the script contains GmailApp calls, Google will automatically 
    // interrupt the popup with a "Permissions Required" screen.
    const authWin = window.open(SCRIPT_URL, 'GoogleAuth', 'width=500,height=600');
    
    const checkWin = setInterval(() => {
        if (authWin.closed) {
            clearInterval(checkWin);
            // After they close the window (meaning they allowed permissions), flip the UI
            document.getElementById('g-auth-section').classList.add('hidden');
            document.getElementById('g-email-section').classList.remove('hidden');
            document.getElementById('g-msg').innerText = "Account Linked Successfully";
        }
    }, 1000);
}

async function sendUserMail() {
    const to = document.getElementById('target-email').value;
    const btn = document.getElementById('send-btn');
    if (!to) return alert("Recipient required");

    btn.innerText = "Sending...";
    try {
        const res = await fetch(`${SCRIPT_URL}?action=send_email&to=${encodeURIComponent(to)}`);
        const data = await res.json();
        if (data.result === "success") {
            document.getElementById('g-msg').innerHTML = "<span style='color:#10b981'>✓ Sent!</span>";
        } else {
            alert("Error: " + data.reason);
        }
    } catch (e) {
        alert("Sync Error. Please re-connect.");
    }
    btn.innerText = "Send Job Update";
}
