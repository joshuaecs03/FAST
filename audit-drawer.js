/**
 * FAST | Audit Drawer Module
 */

(function initAuditModule() {
    const style = document.createElement('style');
    style.innerHTML = `
        #audit-drawer {
            position: fixed; top: 0; right: -450px; width: 420px; height: 100vh;
            background: white; border-left: 1px solid #E5E7EB; z-index: 2000;
            transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: -10px 0 30px rgba(0,0,0,0.1);
            display: flex; flex-direction: column;
        }
        #audit-drawer.open { right: 0; }
        .drawer-header { padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .drawer-content { flex: 1; overflow-y: auto; padding: 20px; background: #F9FAFB; }
        .timeline-item { position: relative; padding-left: 30px; margin-bottom: 25px; }
        .timeline-item::before { 
            content: ''; position: absolute; left: 0; top: 5px; 
            width: 10px; height: 10px; border-radius: 50%; background: #D4631E; z-index: 2;
        }
        .timeline-item::after { 
            content: ''; position: absolute; left: 4px; top: 15px; 
            width: 2px; height: calc(100% + 15px); background: #E5E7EB; z-index: 1;
        }
        .timeline-item:last-child::after { display: none; }
        .msg-meta { font-size: 10px; color: #6B7280; margin-bottom: 6px; display: flex; justify-content: space-between; }
        .msg-bubble { 
            background: white; border: 1px solid #E5E7EB; padding: 12px; border-radius: 8px; font-size: 12px; line-height: 1.5; 
            box-shadow: 0 1px 2px rgba(0,0,0,0.05); max-height: 350px; overflow-y: auto;
        }
        .msg-bubble.inbound { border-left: 4px solid #2563eb; }
        .msg-bubble.outbound { border-left: 4px solid #D4631E; }
        .msg-subject { font-weight: 700; display: block; margin-bottom: 5px; color: #111827; }
        .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1999; display: none; backdrop-filter: blur(2px); }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.id = 'audit-overlay'; overlay.className = 'drawer-overlay';
    
    const drawer = document.createElement('div');
    drawer.id = 'audit-drawer';
    drawer.innerHTML = `
        <div class="drawer-header">
            <div><h3 id="audit-title" style="margin:0; font-size:16px;">Job History</h3><span id="audit-subtitle" style="font-size:11px; color:#6B7280;">File #: ---</span></div>
            <button onclick="closeAuditDrawer()" style="background:none; border:none; font-size:28px; cursor:pointer; color:#9CA3AF;">&times;</button>
        </div>
        <div class="drawer-content" id="audit-timeline"></div>
        <div style="padding:15px; border-top:1px solid #eee;"><button onclick="window.open('https://mail.google.com')" style="width:100%; background:#111827; color:white; border:none; padding:12px; border-radius:6px; cursor:pointer; font-size:12px; font-weight:600;">Open Gmail to Reply</button></div>
    `;
    document.body.appendChild(overlay); document.body.appendChild(drawer);
    overlay.onclick = closeAuditDrawer;
})();

async function openAuditDrawer(fileNumber, fileName) {
    const drawer = document.getElementById('audit-drawer');
    const overlay = document.getElementById('audit-overlay');
    const timeline = document.getElementById('audit-timeline');
    
    document.getElementById('audit-title').innerText = fileName || 'Job History';
    document.getElementById('audit-subtitle').innerText = `File #: ${fileNumber}`;
    timeline.innerHTML = '<div style="text-align:center; padding-top:40px; color:#9CA3AF; font-size:12px;">Loading records...</div>';
    
    drawer.classList.add('open');
    overlay.style.display = 'block';

    try {
        const res = await fetch(`${SCRIPT_URL}?action=get_history&fileNumber=${encodeURIComponent(fileNumber)}`);
        const json = await res.json();
        
        if (json.result === "success" && json.history && json.history.length > 0) {
            timeline.innerHTML = '';
            json.history.forEach(row => {
                // Column Data: 0:Timestamp, 2:Direction, 5:Subject, 6:Email Body
                const date = new Date(row[0]).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'});
                const isOutbound = String(row[2]).toUpperCase() === 'OUTBOUND';
                
                const item = document.createElement('div');
                item.className = 'timeline-item';
                item.innerHTML = `
                    <div class="msg-meta"><span>${isOutbound ? '📤 SENT' : '📥 RECEIVED'}</span><span>${date}</span></div>
                    <div class="msg-bubble ${isOutbound ? 'outbound' : 'inbound'}">
                        <span class="msg-subject">${row[5] || '(No Subject)'}</span>
                        <div style="white-space: pre-wrap;">${row[6] || '(No Content)'}</div>
                    </div>
                `;
                timeline.appendChild(item);
            });
        } else {
            timeline.innerHTML = '<div style="text-align:center; padding-top:40px; color:#9CA3AF; font-size:12px;">No email history found for this file.</div>';
        }
    } catch (e) {
        timeline.innerHTML = '<div style="color:#ef4444; font-size:12px; text-align:center;">Connection error. Please check Deployment.</div>';
    }
}

function closeAuditDrawer() {
    document.getElementById('audit-drawer').classList.remove('open');
    document.getElementById('audit-overlay').style.display = 'none';
}
