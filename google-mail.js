// google-mail.js - THE "OUTSIDE HOUSE" SECURE IDENTITY MODULE

(function initGoogleModule() {
    // 1. Wait for the sidebar to exist, then inject the UI
    const checkSidebar = setInterval(() => {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            clearInterval(checkSidebar);
            renderGoogleUI(sidebar);
        }
    }, 500);

    // 2. LISTEN FOR THE POPUP: This is the "Magic" part.
    // When the popup finishes authorizing, it sends a message back to this window.
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'AUTH_SUCCESS') {
            const confirmedEmail = event.data.email;
            console.log("Identity Verified:", confirmedEmail);
            
            // Save to browser memory so it persists on refresh
            localStorage.setItem('fast_linked_email', confirmedEmail);
            updateToConnectedState(confirmedEmail);
        }
    });
})();

function renderGoogleUI(sidebar) {
    const container = document.createElement('div');
    container.setAttribute('id', 'google-auth-container');
    
    // Check if we already have a saved email in this browser session
    const savedEmail = localStorage.getItem('fast_linked_email');

    container.innerHTML = `
        <div class="nav-label" style="margin-top: 20px; border-top: 1px solid #374151; padding-top: 15px;">Google Services</div>
        <div id="g-module-card" style="margin: 10px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
            
            <div id="g-state-disconnected" class="${savedEmail ? 'hidden' : ''}">
                <div style="font-size: 10px; color: #9CA3AF; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                    <div style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%;"></div>
                    Gmail Not Linked
                </div>
                <button onclick="openSecureAuthPopup()" style="width: 100%; background: #fff; color: #111; border: none; padding: 8px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer; transition: 0.2s;">
                    Connect My Account
                </button>
            </div>

            <div id="g-state-connected" class="${savedEmail ? '' : 'hidden'}">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 5px #10b981;"></div>
                    <div style="display: flex; flex-direction: column; overflow: hidden;">
                        <span id="display-user-email" style="font-size: 11px; color: #fff; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px;">
                            ${savedEmail || ''}
                        </span>
                        <span style="font-size: 9px; color: #10b981;">Verified Identity</span>
                    </div>
                </div>
                <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.05);">
                    <button onclick="disconnectGoogle()" style="background: none; border: none; color: #6B7280; font-size: 9px; cursor: pointer; padding: 0; text-decoration: underline;">
                        Disconnect Account
                    </button>
                </div>
            </div>
        </div>
    `;

    // Insert into sidebar above Logout
    const logoutSection = sidebar.querySelector('div[style*="margin-top:auto"]');
    sidebar.insertBefore(container, logoutSection);
}

function openSecureAuthPopup() {
    // Open the App Script URL. In Incognito, this window will force a Google Login.
    const width = 500, height = 600;
    const left = (window.innerWidth / 2) - (width / 2);
    const top = (window.innerHeight / 2) - (height / 2);
    
    window.open(SCRIPT_URL, 'GoogleAuth', `width=${width},height=${height},top=${top},left=${left}`);
}

function updateToConnectedState(email) {
    document.getElementById('g-state-disconnected').classList.add('hidden');
    document.getElementById('g-state-connected').classList.remove('hidden');
    document.getElementById('display-user-email').innerText = email;
}

function disconnectGoogle() {
    if(confirm("Disconnect your Google account from this session?")) {
        localStorage.removeItem('fast_linked_email');
        document.getElementById('g-state-disconnected').classList.remove('hidden');
        document.getElementById('g-state-connected').classList.add('hidden');
    }
}
