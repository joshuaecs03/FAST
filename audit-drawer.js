/**
 * FAST | Zendesk-Style High-Capacity Audit Drawer with Composer
 */

(function initAuditModule() {
    const style = document.createElement('style');
    style.innerHTML = `
        #audit-drawer {
            position: fixed; top: 0; right: -650px; width: 600px; height: 100vh;
            background: #fff; border-left: 1px solid #d8dcde; z-index: 2000;
            transition: 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: -15px 0 45px rgba(0,0,0,0.15);
            display: flex; flex-direction: column;
            font-family: 'Inter', -apple-system, sans-serif;
        }
        #audit-drawer.open { right: 0; }
        
        .drawer-header { 
            padding: 20px 24px; border-bottom: 1px solid #d8dcde; 
            display: flex; justify-content: space-between; align-items: flex-start;
            background: #f8f9f9; flex-shrink: 0;
        }

        .drawer-content { flex: 1; overflow-y: auto; padding: 30px; background: #fff; }

        /* --- THE COMPOSER --- */
        #composer-container {
            border-top: 2px solid #d8dcde; background: #fff;
            position: relative; flex-shrink: 0; min-height: 200px; display: flex; flex-direction: column;
        }
        .composer-resizer {
            height: 6px; width: 100%; cursor: ns-resize;
            position: absolute; top: -3px; left: 0; z-index: 10;
        }
        .composer-tabs {
            display: flex; background: #f8f9f9; border-bottom: 1px solid #d8dcde;
        }
        .comp-tab {
            padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer;
            color: #68737d; border-bottom: 2px solid transparent;
        }
        .comp-tab.active[data-mode="public"] { color: #2f3337; border-bottom-color: #D4631E; background: #fff; }
        .comp-tab.active[data-mode="internal"] { color: #2f3337; border-bottom-color: #ffd43b; background: #fffbe6; }
        
        #email-body-input {
            flex: 1; width: 100%; border: none; padding: 15px; font-size: 14px;
            outline: none; resize: none; font-family: inherit;
        }
        #email-body-input.internal-mode { background: #fffbe6; }

        .composer-toolbar {
            padding: 10px 15px; border-top: 1px solid #d8dcde;
            display: flex; justify-content: space-between; align-items: center; background: #f8f9f9;
        }
        .tool-group { display: flex; gap: 15px; align-items: center; }
        .tool-icon { font-size: 16px; color: #68737d; cursor: pointer; transition: 0.2s; }
        .tool-icon:hover { color: #2f3337; }

        .btn-submit {
            background: #D4631E; color: white; border: none; padding: 8px 16px;
            border-radius: 4px; font-weight: 600; font-size: 13px; cursor: pointer;
        }
        .btn-submit.internal { background: #ffd43b; color: #856404; }

        /* Timeline Items */
        .thread-item { margin-bottom: 30px; position: relative; }
        .msg-card { border: 1px solid #d8dcde; border-radius: 4px; background: #fff; }
        .msg-card.internal { background: #fffbe6; border-color: #ffe58f; }
    `;
    document.head.appendChild(style);

    const drawer = document.createElement('div');
    drawer.id = 'audit-drawer';
    drawer.innerHTML = `
        <div class="drawer-header">
            <div class="header-main">
                <h3 id="audit-title">Ticket Conversation</h3>
                <span id="audit-subtitle" style="font-size:11px; color:#68737d;">File #: ---</span>
            </div>
            <button onclick="closeAuditDrawer()" style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
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
                <div class="tool-group">
                    <span class="tool-icon" title="Bold">B</span>
                    <span class="tool-icon" title="Italic">/</span>
                    <span class="tool-icon" title="Attachment">📎</span>
                    <select id="macro-select" style="font-size:11px; border:1px solid #d8dcde; padding:2px;">
                        <option value="">Apply Macro...</option>
                        <option value="followup1">Follow-up 1</option>
                        <option value="estimate_approved">Estimate Approved</option>
                    </select>
                </div>
                <button id="submit-btn" class="btn-submit" onclick="sendCommunication()">Submit as Open</button>
            </div>
        </div>
    `;

    document.body.appendChild(drawer);
    initResizer();
})();

let currentMode = 'public';

function setComposerMode(mode) {
    currentMode = mode;
    const input = document.getElementById('email-body-input');
    const btn = document.getElementById('submit-btn');
    const tabs = document.querySelectorAll('.comp-tab');
    
    tabs.forEach(t => t.classList.remove('active'));
    document.querySelector(`.comp-tab[data-mode="${mode}"]`).classList.add('active');

    if (mode === 'internal') {
        input.classList.add('internal-mode');
        btn.classList.add('internal');
        btn.innerText = 'Submit as Internal Note';
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
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', () => document.removeEventListener('mousemove', handleMouseMove));
    });

    function handleMouseMove(e) {
        const newHeight = startHeight - (e.clientY - startY);
        container.style.height = Math.max(150, Math.min(newHeight, 500)) + 'px';
    }
}

// Update the render logic in openAuditDrawer to handle Internal Notes
function renderHistory(history) {
    const timeline = document.getElementById('audit-timeline');
    timeline.innerHTML = '';
    history.forEach(row => {
        const isInternal = row[3] === 'Internal Note';
        const item = document.createElement('div');
        item.className = `thread-item ${isInternal ? 'internal' : ''}`;
        item.innerHTML = `
            <div class="msg-card ${isInternal ? 'internal' : ''}">
                <div class="msg-card-header" style="font-size:11px; display:flex; justify-content:space-between;">
                    <span>${row[7] || 'System'}</span>
                    <span>${new Date(row[0]).toLocaleString()}</span>
                </div>
                <div class="msg-body">${row[6]}</div>
            </div>
        `;
        timeline.appendChild(item);
    });
}
