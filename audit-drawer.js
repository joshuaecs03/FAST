/**
 * FAST | Zendesk-Style High-Capacity Audit Drawer
 */

(function initAuditModule() {
    const style = document.createElement('style');
    style.innerHTML = `
        #audit-drawer {
            position: fixed; top: 0; right: -600px; width: 550px; height: 100vh;
            background: #fff; border-left: 1px solid #d8dcde; z-index: 2000;
            transition: 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: -15px 0 45px rgba(0,0,0,0.15);
            display: flex; flex-direction: column;
            font-family: 'Inter', -apple-system, sans-serif;
        }
        #audit-drawer.open { right: 0; }
        
        .drawer-header { 
            padding: 24px; border-bottom: 1px solid #d8dcde; 
            display: flex; justify-content: space-between; align-items: flex-start;
            background: #f8f9f9;
        }
        .header-main h3 { margin: 0; font-size: 18px; color: #2f3337; font-weight: 600; }
        .header-sub { font-size: 12px; color: #68737d; margin-top: 4px; display: block; }
        
        .status-pill {
            display: inline-block; padding: 2px 8px; border-radius: 12px; 
            font-size: 10px; font-weight: 700; text-transform: uppercase;
            background: #e4f0f6; color: #00608d; margin-top: 8px;
        }

        .drawer-content { flex: 1; overflow-y: auto; padding: 30px; background: #fff; }

        /* Timeline / Conversation Thread */
        .thread-item { margin-bottom: 40px; position: relative; }
        .thread-item::before {
            content: ''; position: absolute; left: -24px; top: 4px;
            width: 12px; height: 12px; border-radius: 50%;
            border: 2px solid #fff; box-shadow: 0 0 0 2px #d8dcde;
        }
        .thread-item.outbound::before { background: #D4631E; box-shadow: 0 0 0 2px #D4631E; }
        .thread-item.inbound::before { background: #2563eb; box-shadow: 0 0 0 2px #2563eb; }
        
        .msg-meta { font-size: 11px; color: #68737d; margin-bottom: 8px; font-weight: 500; }
        .msg-card { 
            border: 1px solid #d8dcde; border-radius: 4px; overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .msg-card-header { 
            padding: 10px 15px; background: #f8f9f9; border-bottom: 1px solid #d8dcde;
            font-weight: 600; font-size: 13px; color: #2f3337;
        }
        .msg-body { 
            padding: 15px; font-size: 13px; color: #49545c; line-height: 1.6; 
            white-space: pre-wrap; word-break: break-word; background: #fff;
        }

        .drawer-footer { 
            padding: 20px; border-top: 1px solid #d8dcde; background: #f8f9f9;
            display: flex; gap: 10px;
        }
        .btn-reply { 
            flex: 1; background: #D4631E; color: #fff; border: none; padding: 12px; 
            border-radius: 4px; font-weight: 600; cursor: pointer; font-size: 13px;
        }
        .btn-secondary {
            background: #fff; border: 1px solid #d8dcde; color: #2f3337; 
            padding: 12px; border-radius: 4px; cursor: pointer; font-size: 13px;
        }

        .drawer-overlay { 
            position: fixed; inset: 0; background: rgba(23, 26, 28, 0.4); 
            z-index: 1999; display: none; backdrop-filter: blur(4px);
        }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.id = 'audit-overlay'; overlay.className = 'drawer-overlay';
    
    const drawer = document.createElement('div');
    drawer.id = 'audit-drawer';
    drawer.innerHTML = `
        <div class="drawer-header">
            <div class="header-main">
                <h3 id="audit-title">Job History</h3>
                <span id="audit-subtitle" class="header-sub">File #: ---</span>
                <div id="audit-status" class="status-pill">Active Claim</div>
            </div>
            <button onclick="closeAuditDrawer()" style="background:none; border:none; font-size:28px; cursor:pointer; color:#68737d;">&times;</button>
        </div>
        <div class="drawer-content" id="audit-timeline"></div>
        <div class="drawer-footer">
            <button class="btn-secondary" onclick="location.reload()">Refresh</button>
            <button class="btn-reply" onclick="window.open('https://mail.google.com')">Reply via Gmail</button>
        </div>
    `;
    document.body.appendChild(overlay); document.body.appendChild(drawer);
    overlay.onclick = closeAuditDrawer;
})();

async function openAuditDrawer(fileNumber, fileName) {
    const drawer = document.getElementById('audit-drawer');
    const overlay = document.getElementById('audit-overlay');
    const timeline = document.getElementById('audit-timeline');
    
    document.getElementById('audit-title').innerText = fileName || 'Job History';
    document.getElementById('audit-subtitle').innerText = `TICKET #FT-${fileNumber}`;
    timeline.innerHTML = '<div style="text-align:center; margin-top:100px; color:#68737d;">Fetching ticket history...</div>';
    
    drawer.classList.add('open');
    overlay.style.display = 'block';

    try {
        const res = await fetch(`${SCRIPT_URL}?action=get_history&fileNumber=${encodeURIComponent(fileNumber)}`);
        const json = await res.json();
        
        if (json.result === "success" && json.history && json.history.length > 0) {
            timeline.innerHTML = '';
            json.history.forEach(row => {
                const date = new Date(row[0]).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'});
                const isOutbound = String(row[2]).toUpperCase() === 'OUTBOUND';
                
                const item = document.createElement('div');
                item.className = `thread-item ${isOutbound ? 'outbound' : 'inbound'}`;
                item.innerHTML = `
                    <div class="msg-meta">
                        <strong>${isOutbound ? 'You' : (row[7] || 'Customer')}</strong> 
                        <span style="margin: 0 5px;">&bull;</span> ${date}
                    </div>
                    <div class="msg-card">
                        <div class="msg-card-header">${row[5] || 'No Subject'}</div>
                        <div class="msg-body">${row[6] || 'No content provided.'}</div>
                    </div>
                `;
                timeline.appendChild(item);
            });
        } else {
            timeline.innerHTML = '<div style="text-align:center; margin-top:100px; color:#68737d; font-size:14px;">No messages found for this claim.</div>';
        }
    } catch (e) {
        timeline.innerHTML = '<div style="color:#d9393e; text-align:center; margin-top:100px;">Unable to load history. Verify script deployment.</div>';
    }
}

function closeAuditDrawer() {
    document.getElementById('audit-drawer').classList.remove('open');
    document.getElementById('audit-overlay').style.display = 'none';
}
