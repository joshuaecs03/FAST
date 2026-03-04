// google-mail.js - INJECTS INTO NAVIGATION PANEL

(function initGoogleIntegration() {
    // This runs as soon as the script loads
    const checkSidebar = setInterval(() => {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            clearInterval(checkSidebar);
            injectGoogleUI(sidebar);
        }
    }, 500); // Check every half second until sidebar exists
})();

function injectGoogleUI(sidebar) {
    const googleDiv = document.createElement('div');
    googleDiv.innerHTML = `
        <div class="nav-label" style="margin-top: 20px; border-top: 1px solid #374151; padding-top: 15px;">Google Account</div>
        <div id="google-panel" class="nav-item" style="flex-direction: column; align-items: flex-start; gap: 8px; background: rgba(255,255,255,0.03); margin: 10px; border-radius: 8px; border-left: none; cursor: default;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div id="g-status-dot" style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%;"></div>
                <span id="g-status-text" style="font-size: 11px; color: #9CA3AF;">Gmail Disconnected</span>
            </div>
            <button onclick="triggerGoogleAuth()" id="g-connect-btn" style="width: 100%; background: #fff; color: #111; border: none; padding: 6px; border-radius: 4px; font-size: 10px; font-weight: 700; cursor: pointer;">
                Connect Gmail
            </button>
            <div id="g-controls" class="hidden" style="width: 100%;">
                <input type="email" id="quick-to" placeholder="Recipient" style="width: 100%; font-size: 10px; padding: 5px; background: #111827; border: 1px solid #4B5563; color: white; margin-bottom: 5px; border-radius: 4px;">
                <button onclick="sendUserEmail()" style="width: 100%; background: var(--ecs-orange); color: white; border: none; padding: 6px; border-radius: 4px; font-size: 10px; font-weight: 700; cursor: pointer;">
                    Send Job Email
                </button>
            </div>
        </div>
    `;

    // Insert above the logout button
    const logoutBtn = sidebar.querySelector('div[style*="margin-top:auto"]');
    sidebar.insertBefore(googleDiv, logoutBtn);
    
    // Check if already authorized
    verifyGmailLink();
}

async function verifyGmailLink() {
    try {
        const res = await fetch(`${SCRIPT_URL}?action=check_auth`);
        const data = await res.json();
        if (data.status === "authorized") {
            updateGlowUI(true, data.user);
        }
    } catch (e) { /* Not yet authorized */ }
}

function triggerGoogleAuth() {
    // Opens the App Script URL in a popup to trigger Google's permission dialog
    const authWindow = window.open(SCRIPT_URL, 'GoogleAuth', 'width=500,height=600');
    
    // Check every second if the window is closed, then refresh UI
    const timer = setInterval(() => {
        if (authWindow.closed) {
            clearInterval(timer);
            verifyGmailLink();
        }
    }, 1000);
}

function updateGlowUI(isConnected, userEmail) {
    const dot = document.getElementById('g-status-dot');
    const text = document.getElementById('g-status-text');
    const btn = document.getElementById('g-connect-btn');
    const controls = document.getElementById('g-controls');

    if (isConnected) {
        dot.style.background = "#10b981";
        text.innerText = userEmail;
        text.style.color = "#fff";
        btn.classList.add('hidden');
        controls.classList.remove('hidden');
    }
}

async function sendUserEmail() {
    const to = document.getElementById('quick-to').value;
    if (!to) return alert("Enter recipient");
    
    const res = await fetch(`${SCRIPT_URL}?action=send_email&to=${encodeURIComponent(to)}`);
    const data = await res.json();
    if (data.result === "success") alert("Email sent from your Gmail!");
}
