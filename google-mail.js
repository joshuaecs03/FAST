// google-mail.js

// 1. Inject UI into Sidebar
(function injectMailUI() {
    const sidebar = document.getElementById('sidebar');
    const mailSection = document.createElement('div');
    mailSection.innerHTML = `
        <div class="nav-label" style="margin-top: 20px; border-top: 1px solid #374151; padding-top: 15px;">Mail Actions</div>
        <div class="nav-item" style="flex-direction: column; align-items: flex-start; gap: 8px; background: rgba(255,255,255,0.03); margin: 10px; border-radius: 8px;">
            <input type="text" id="mail-to" placeholder="Recipient Email" style="font-size: 10px; padding: 5px; width: 100%; color: white; background: #374151; border: 1px solid #4B5563;">
            <button onclick="sendJobEmail()" id="send-mail-btn" style="width: 100%; background: var(--ecs-orange); color: white; border: none; padding: 6px; border-radius: 4px; font-size: 10px; font-weight: 700; cursor: pointer;">
                Send Job Update
            </button>
            <div id="mail-status" style="font-size: 9px; color: #9CA3AF;">Ready</div>
        </div>
    `;
    const logoutBtn = sidebar.querySelector('div[style*="margin-top:auto"]');
    sidebar.insertBefore(mailSection, logoutBtn);
})();

// 2. Logic to talk to your Apps Script
async function sendJobEmail() {
    const to = document.getElementById('mail-to').value;
    const btn = document.getElementById('send-mail-btn');
    const status = document.getElementById('mail-status');

    if(!to) return alert("Enter an email");

    btn.innerText = "Sending...";
    status.innerText = "Accessing Gmail API...";

    try {
        // We call your SCRIPT_URL with a new action: "send_email"
        const res = await fetch(`${SCRIPT_URL}?action=send_email&to=${encodeURIComponent(to)}&subject=Job Update&body=Test update from FAST system.`);
        const data = await res.json();
        
        if(data.result === "success") {
            status.innerText = "✅ Sent successfully!";
            btn.innerText = "Send Job Update";
        } else {
            status.innerText = "❌ Error: " + data.reason;
        }
    } catch (e) {
        status.innerText = "❌ Connection Failed";
        btn.innerText = "Send Job Update";
    }
}
