/**
 * FAST | Professional Zendesk Audit Drawer & Composer
 * Modular Module for Communication History
 */

(function initAuditModule() {
    // 1. INJECT HIGH-FIDELITY ZENDESK STYLES
    const style = document.createElement('style');
    style.innerHTML = `
        #audit-drawer {
            position: fixed !important; top: 0; right: -700px; 
            width: 600px !important; height: 100vh; 
            background: #fff; border-left: 1px solid #d8dcde; 
            z-index: 2000; transition: 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: -15px 0 45px rgba(0,0,0,0.15); display: flex; flex-direction: column;
            font-family: 'Inter', -apple-system, sans-serif;
        }
        #audit-drawer.open { right: 0 !important; }
        
        /* HEADER AREA */
        .drawer-header { padding: 20px 24px; border-bottom: 1px solid #d8dcde; background: #f8f9f9; flex-shrink: 0; }
        .header-main h3 { margin: 0; font-size: 18px; color: #2f3337; }
        
        /* TIMELINE AREA */
        .drawer-content { flex: 1; overflow-y: auto; padding: 30px; background: #fff; scroll-behavior: smooth; }

        /* BADGES & TAGS */
        .meta-badges { display: flex; gap: 6px; align-items: center; }
        .badge-recipient { font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; }
        .role-insurance { background: #efebe9; color: #5d4037; }
        .role-customer { background: #e8f5e9; color: #2e7d32; }
        .role-tpa { background: #f3e5f5; color: #7b1fa2; }
        
        .tag-msg { font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 10px; border: 1px solid rgba(0,0,0,0.05); }
        .type-1st { background: #D4631E; color: #fff; }
        .type-2nd { background: #ff9800; color: #fff; }
        .type-3rd { background: #f44336; color: #fff; }
        .type-manual { background: #f3f4f6; color: #374151; }

        /* COMPOSER (BOTTOM AREA) */
        #composer-container {
            border-top: 2px solid #d8dcde; background: #fff;
            position: relative; flex-shrink: 0; min-height: 250px; display: flex; flex-direction: column;
        }
        .composer-resizer { height: 6px; width: 100%; cursor: ns-resize; position: absolute; top: -3px; left: 0; z-index: 10; }
        .composer-tabs { display: flex; background: #f8f9f9; border-bottom: 1px solid #d8dcde; }
        .comp-tab { padding: 12px 20px; font-size: 13px; font-weight: 600; cursor: pointer; color: #68737d; }
        .comp-tab.active { background: #fff; color: #2f3337; border-top: 2px solid #D4631E; margin-top: -2px; }
        .comp-tab.active[data-mode="internal"] { border-top-color: #ffd43b; background: #fffbe6; }
        
        #email-body-input {
            flex: 1; width: 100%; border: none; padding: 20px; font-size: 14px;
            outline: none; resize: none; box-sizing: border-box; font-family: inherit;
        }
        .internal-mode { background: #fffbe6 !important; }

        .composer-toolbar {
            padding: 12px 20px; border-top: 1px solid #d8dcde;
            display: flex; justify-content: space-between; align-items: center; background: #f8f9f9;
        }
        .btn-submit { background: #D4631E; color: #fff; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: 600; }
        .btn-submit.internal { background: #ffd43b; color: #856404; }

        .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1999; display: none; backdrop-filter: blur(4px); }
    `;
    document.head.appendChild(style);

    // 2. CREATE HTML STRUCTURE
    const overlay = document.createElement('div');
    overlay.id = 'audit-overlay'; overlay.className = 'drawer-overlay';
    
    const drawer = document.createElement('div');
    drawer.id = 'audit-drawer';
    drawer.innerHTML = `
        <div class="drawer-header">
            <div><h3 id="audit-title">Conversation History</h3><span id="audit-subtitle" style="font-size:11px;color:#68737d;"></span></div>
            <button onclick="closeAuditDrawer()" style="background:none;border:none;font-size:24px;cursor:pointer;color:#68737d;">&times;</button>
        </div>
        <div class="drawer-content" id="audit-timeline"></div>
        <div id="composer-container">
            <div class="composer-resizer" id="comp-resizer"></div>
            <div class="composer-tabs">
                <div class="comp-tab active" data-mode="public" onclick="setComposerMode('public')">Public Reply</div>
                <div class="comp-tab" data-mode="internal" onclick="setComposerMode('internal')">Internal Note</div>
            </div>
            <textarea id="email-body-input" placeholder="Type your response here..."></textarea>
            <div class="composer-toolbar">
                <div style="font-size:18px; color:#68737d; display:flex; gap:15px; cursor:default;">
                    <span title="Bold">B</span><span title="Italic">/</span><span title="Attach">📎</span>
                </div>
                <button id="submit-btn" class="btn-submit" onclick="alert('Manual Sending via API coming in next update!')">Submit as Open</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay); document.body.appendChild(drawer);
    overlay.onclick = closeAuditDrawer;
    initResizer();
})();

// 3. LOGIC & HANDLERS
function setComposerMode(mode) {
    const input = document.getElementById('email-body-input');
    const btn = document.getElementById('submit-btn');
    const tabs = document.querySelectorAll('.comp-tab');
    tabs.forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');

    if(mode === 'internal') {
        input.classList.add('internal-mode');
        btn.classList.add('internal');
        btn.innerText = 'Submit Internal Note';
    } else {
        input.classList.remove('internal-mode');
        btn.classList.remove('internal');
        btn.innerText = 'Submit as Open';
    }
}

function initResizer() {
    const resizer = document.getElementById('comp-resizer');
    const container = document.getElementById('composer-container');
    let startY, startHeight;

    resizer.addEventListener('mousedown', (e) => {
        startY = e.clientY;
        startHeight = container.offsetHeight;
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', () => document.removeEventListener('mousemove', move));
    });

    function move(e) {
        const newHeight = startHeight - (e.clientY - startY);
        container.style.height = Math.max(150, Math.min(newHeight, 500)) + 'px';
    }
}

async function openAuditDrawer(fileNumber, fileName) {
    const drawer = document.getElementById('audit-drawer');
    const overlay = document.getElementById('audit-overlay');
    const timeline = document.getElementById('audit-timeline');
    
    document.getElementById('audit-subtitle').innerText = "TICKET #FT-" + fileNumber;
    document.getElementById('audit-title').innerText = fileName;
    timeline.innerHTML = '<div style="text-align:center; margin-top:100px; color:#68737d;">Fetching logs...</div>';
    
    drawer.classList.add('open');
    overlay.style.display = 'block';

    try {
        const res = await fetch(`${SCRIPT_URL}?action=get_history&fileNumber=${encodeURIComponent(fileNumber)}`);
        const json = await res.json();
        if(json.result === "success" && json.history) {
            renderTimeline(json.history);
        } else {
            timeline.innerHTML = '<div style="text-align:center; margin-top:100px; color:#68737d;">No history found.</div>';
        }
    } catch(e) {
        timeline.innerHTML = '<div style="color:red; text-align:center; margin-top:100px;">Error connecting to server.</div>';
    }
}

function renderTimeline(history) {
    const timeline = document.getElementById('audit-timeline');
    timeline.innerHTML = '';
    
    history.forEach(row => {
        // MAPPING: 0:Timestamp, 2:Direction, 3:MsgType, 4:RecipientType, 5:Subject, 6:Body, 7:From, 8:To
        const isOutbound = String(row[2]).toLowerCase() === 'outbound';
        const msgType = row[3] || 'Manual';
        const recipientType = row[4] || 'General';
        const date = new Date(row[0]).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        
        const typeClass = msgType.includes('1st') ? 'type-1st' : msgType.includes('2nd') ? 'type-2nd' : msgType.includes('3rd') ? 'type-3rd' : 'type-manual';
        const roleClass = recipientType.toLowerCase().includes('insurance') ? 'role-insurance' : recipientType.toLowerCase().includes('customer') ? 'role-customer' : 'role-tpa';

        const div = document.createElement('div');
        div.style.marginBottom = "30px";
        div.innerHTML = `
            <div style="font-size:11px; color:#68737d; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                <div class="meta-badges">
                    <span style="font-weight:700;">${isOutbound ? '📤 OUTBOUND' : '📥 INBOUND'}</span>
                    <span class="tag-msg ${typeClass}">${msgType.toUpperCase()}</span>
                </div>
                <span>${date}</span>
            </div>
            <div style="border:1px solid #d8dcde; border-radius:8px; overflow:hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <div style="background:#f8f9f9; padding:12px 16px; border-bottom:1px solid #d8dcde;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <span style="font-size:12px; font-weight:600; color:#2f3337;">${row[7]}</span>
                        <span class="badge-recipient ${roleClass}">${recipientType}</span>
                    </div>
                    <div style="font-size:11px; color:#68737d;">To: ${row[8]}</div>
                </div>
                <div style="padding:20px;">
                    <strong style="display:block; font-size:14px; margin-bottom:10px;">${row[5]}</strong>
                    <div style="font-size:13px; color:#444; line-height:1.6; white-space: pre-wrap;">${row[6]}</div>
                </div>
            </div>
        `;
        timeline.appendChild(div);
    });
    // Auto-scroll to bottom of conversation
    timeline.scrollTop = timeline.scrollHeight;
}

function closeAuditDrawer() {
    document.getElementById('audit-drawer').classList.remove('open');
    document.getElementById('audit-overlay').style.display = 'none';
}
