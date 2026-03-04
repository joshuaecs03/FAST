// google-auth.js

// 1. Inject the UI into the sidebar automatically
(function injectGoogleUI() {
    const sidebar = document.getElementById('sidebar');
    const googleSection = document.createElement('div');
    
    googleSection.innerHTML = `
        <div class="nav-label" style="margin-top: 20px; border-top: 1px solid #374151; pt: 15px;">Google Integration</div>
        <div id="google-user-card" class="nav-item" style="cursor: default; background: rgba(255,255,255,0.05); margin: 10px; border-radius: 8px; border-left: none;">
            <div id="g-status" style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%;"></div>
                <span style="font-size: 11px;">Not Connected</span>
            </div>
            <button onclick="handleGoogleSignIn()" id="g-auth-btn" style="background: white; color: #1f2937; border: none; padding: 5px 10px; border-radius: 4px; font-size: 10px; font-weight: 700; cursor: pointer; margin-top: 10px;">
                Connect Google
            </button>
        </div>
    `;
    
    // Insert before the Logout button
    const logoutBtn = sidebar.querySelector('div[style*="margin-top:auto"]');
    sidebar.insertBefore(googleSection, logoutBtn);
})();

// 2. The logic for signing in
async function handleGoogleSignIn() {
    const btn = document.getElementById('g-auth-btn');
    const statusDot = document.querySelector('#g-status div');
    const statusText = document.querySelector('#g-status span');

    btn.innerText = "Connecting...";

    try {
        // This is where you'll later link to your Google OAuth client
        // For now, we simulate the connection
        setTimeout(() => {
            statusDot.style.background = "#10b981"; // Green
            statusText.innerHTML = "<strong>Connected:</strong> ecs-user@gmail.com";
            btn.innerText = "Disconnect";
            btn.style.background = "#fee2e2";
            btn.style.color = "#b91c1c";
            btn.onclick = handleGoogleSignOut;
            console.log("Google Account Linked for Email Feature.");
        }, 1500);
    } catch (error) {
        alert("Google Authentication Failed");
        btn.innerText = "Connect Google";
    }
}

function handleGoogleSignOut() {
    location.reload(); // Simplest way to reset state for now
}
