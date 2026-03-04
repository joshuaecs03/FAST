// google-mail.js - THE OUTSIDE FEATURE

(function initEmailFeature() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const mailPanel = document.createElement('div');
    mailPanel.innerHTML = `
        <div class="nav-label" style="margin-top: 20px; border-top: 1px solid #374151; padding-top: 15px;">Gmail Account</div>
        <div style="margin: 10px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
            <div id="auth-status" style="font-size: 10px; color: #9CA3AF; margin-bottom: 8px;">Checking Connection...</div>
            
            <button onclick="requestGmailAccess()" id="auth-btn" 
                style="width: 100%; background: #fff; color: #111; border: none; padding: 8px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer; display: none;">
                Connect My Gmail
            </button>
            
            <div id="mail-controls" style="display: none;">
                <input type="email" id="email-to" placeholder="Recipient" 
                    style="width: 100%; font-size: 11px; padding: 6px; background: #111827; border: 1px solid #4B5563; color: white; border-radius: 4px; margin-bottom: 8px; box-sizing: border-box;">
                <button onclick="sendUserEmail()" class="btn-apply" style="width: 100%; padding: 8px; font-size: 11px;">Send from My Account</button>
            </div>
        </div>
    `;

    const logoutSection = sidebar.querySelector('div[style*="margin-top:auto"]');
    sidebar.insertBefore(mailPanel, logoutSection);
    checkInitialAuth();
})();

async function checkInitialAuth() {
    try {
        // We call a simple "check" action in your script
        const res = await fetch(`${SCRIPT_URL}?action=check_auth`);
        const data = await res.json();
        
        if (data.status === "authorized") {
            document.getElementById('auth-status').innerText = "✅ Connected as " + data.user;
            document.getElementById('mail-controls').style.display = "block";
            document.getElementById('auth-btn').style.display = "none";
        } else {
            document.getElementById('auth-status').innerText = "Authorization Required";
            document.getElementById('auth-btn').style.display = "block";
        }
    } catch (e) {
        // If it fails with a CORS error or redirect, it means they need to log in
        document.getElementById('auth-status').innerText = "Sign-in Required";
        document.getElementById('auth-btn').style.display = "block";
    }
}

function requestGmailAccess() {
    // This opens the SCRIPT_URL in a popup to trigger the Google Permission Dialog
    window.open(SCRIPT_URL, 'GoogleAuth', 'width=500,height=600');
}
