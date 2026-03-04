/**
 * FAST | Final Zendesk Composer Layout
 */

(function initAuditModule() {
    const style = document.createElement('style');
    style.innerHTML = `
        #audit-drawer {
            position: fixed !important; top: 0; right: -700px; 
            width: 600px !important; /* THE BIGGER WIDTH */
            height: 100vh; background: #fff; border-left: 1px solid #d8dcde; 
            z-index: 2000; transition: 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: -15px 0 45px rgba(0,0,0,0.15); display: flex; flex-direction: column;
        }
        #audit-drawer.open { right: 0 !important; }
        
        .drawer-header { padding: 20px 24px; border-bottom: 1px solid #d8dcde; background: #f8f9f9; flex-shrink: 0; }
        .drawer-content { flex: 1; overflow-y: auto; padding: 30px; background: #fff; }

        /* COMPOSER SECTION */
        #composer-container {
            border-top: 2px solid #d8dcde; background: #fff;
            position: relative; flex-shrink: 0; min-height: 250px; display: flex; flex-direction: column;
        }
        .composer-tabs { display: flex; background: #f8f9f9; border-bottom: 1px solid #d8dcde; }
        .comp-tab {
            padding: 12px 20px; font-size: 13px; font-weight: 600; cursor: pointer; color: #68737d;
        }
        .comp-tab.active { background: #fff; color: #2f3337; border-top: 2px solid #D4631E; margin-top: -2px; }
        .comp-tab.active[data-mode="internal"] { border-top-color: #ffd43b; background: #fffbe6; }
        
        #email-body-input {
            flex: 1; width: 100%; border: none; padding: 20px; font-size: 14px;
            outline: none; resize: none; box-sizing: border-box;
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

    const overlay = document.createElement('div');
    overlay.id = 'audit-overlay'; overlay.className = 'drawer-overlay';
    
    const drawer = document.createElement('div');
    drawer.id = 'audit-drawer';
    drawer.innerHTML = `
        <div class="drawer-header">
            <div><h3 id="audit-title" style="margin:0;">Ticket Conversation</h3><span id="audit-subtitle" style="font-size:11px;color:#68737d;"></span></div>
            <button onclick="closeAuditDrawer()" style="background:none;border:none;font-size:24px;cursor:pointer;">&times;</button>
        </div>
        <div class="drawer-content" id="audit-timeline"></div>
        <div id="composer-container">
            <div class="composer-tabs">
                <div class="comp-tab active" data-mode="public" onclick="setComposerMode('public')">Public Reply</div>
                <div class="comp-tab" data-mode="internal" onclick="setComposerMode('internal')">Internal Note</div>
            </div>
            <textarea id="email-body-input" placeholder="Type your response here..."></textarea>
            <div class="composer-toolbar">
                <div style="font-size:18px; color:#68737d; display:flex; gap:15px;"><span>B</span><span>/</span><span>📎</span></div>
                <button id="submit-btn" class="btn-submit" onclick="alert('Sending Feature Active Soon')">Submit as Open</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay); document.body.appendChild(drawer);
    overlay.onclick = closeAuditDrawer;
})();

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

async function openAuditDrawer(fileNumber, fileName) {
    document.getElementById('audit-drawer').classList.add('open');
    document.getElementById('audit-overlay').style.display = 'block';
    document.getElementById('audit-subtitle').innerText = "FILE #: " + fileNumber;
    document.getElementById('audit-title').innerText = fileName;
    
    // Trigger the GAS fetch
    const timeline = document.getElementById('audit-timeline');
    timeline.innerHTML = 'Loading history...';
    
    try {
        const res = await fetch(`${SCRIPT_URL}?action=get_history&fileNumber=${encodeURIComponent(fileNumber)}`);
        const json = await res.json();
        if(json.history) renderTimeline(json.history);
    } catch(e) { timeline.innerHTML = "Error loading history."; }
}

function renderTimeline(history) {
    const timeline = document.getElementById('audit-timeline');
    timeline.innerHTML = '';
    history.forEach(row => {
        const div = document.createElement('div');
        div.style.marginBottom = "20px";
        div.innerHTML = `
            <div style="font-size:11px; color:#68737d; margin-bottom:5px;">${new Date(row[0]).toLocaleString()}</div>
            <div style="border:1px solid #d8dcde; border-radius:4px; padding:15px; background:${row[2] === 'Inbound' ? '#fff' : '#f8f9f9'}">
                <strong style="display:block;margin-bottom:5px;">${row[5]}</strong>
                <div style="font-size:13px; color:#444;">${row[6]}</div>
            </div>
        `;
        timeline.appendChild(div);
    });
}

function closeAuditDrawer() {
    document.getElementById('audit-drawer').classList.remove('open');
    document.getElementById('audit-overlay').style.display = 'none';
}
