// google-mail.js

(function init() {
    const timer = setInterval(() => {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) { clearInterval(timer); injectUI(sidebar); }
    }, 500);
})();

function injectUI(sidebar) {
    const div = document.createElement('div');
    div.innerHTML = `
        <div class="nav-label" style="margin-top:20px; border-top:1px solid #374151; padding-top:15px;">Integrations</div>
        <div class="nav-item" style="flex-direction:column; gap:8px; background:rgba(255,255,255,0.03); margin:10px; border-radius:8px; cursor:default;">
            <span id="g-status" style="font-size:10px; color:#9CA3AF;">Gmail: Not Linked</span>
            <button onclick="connectGmail()" id="g-btn" style="width:100%; background:#fff; color:#111; border:none; padding:6px; border-radius:4px; font-size:10px; font-weight:700; cursor:pointer;">Connect Gmail</button>
            <div id="g-controls" class="hidden">
                <input type="email" id="g-to" placeholder="Recipient" style="width:100%; font-size:10px; padding:4px; background:#111827; border:1px solid #4B5563; color:#fff; margin-bottom:5px;">
                <button onclick="sendMail()" style="width:100%; background:var(--ecs-orange); color:#fff; border:none; padding:5px; font-size:10px; cursor:pointer;">Send Update</button>
            </div>
        </div>
    `;
    const logout = sidebar.querySelector('div[style*="margin-top:auto"]');
    sidebar.insertBefore(div, logout);
}

function connectGmail() {
    // Open the Script URL in a popup. Google will detect the GmailApp call and prompt the user.
    const win = window.open(SCRIPT_URL, 'Auth', 'width=450,height=500');
    const check = setInterval(() => {
        if (win.closed) {
            clearInterval(check);
            document.getElementById('g-status').innerText = "Gmail: Linked ✅";
            document.getElementById('g-btn').style.display = 'none';
            document.getElementById('g-controls').classList.remove('hidden');
        }
    }, 1000);
}

async function sendMail() {
    const to = document.getElementById('g-to').value;
    const res = await fetch(`${SCRIPT_URL}?action=send_email&to=${encodeURIComponent(to)}`);
    const data = await res.json();
    if (data.result === "success") alert("Sent!");
    else if (data.result === "auth_required") connectGmail();
}
