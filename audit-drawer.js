/* --- Update the styles in the top section of audit-drawer.js --- */
/* Add these to your existing style string */
.msg-identity {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 8px;
    margin-bottom: 10px;
    border-bottom: 1px solid #f0f0f0;
}
.name-pill {
    font-size: 11px;
    font-weight: 700;
    color: #2f3337;
}
.type-badge {
    font-size: 9px;
    padding: 2px 6px;
    border-radius: 4px;
    background: #f1f1f1;
    color: #68737d;
    text-transform: uppercase;
}

/* --- Replace your existing renderTimeline function with this --- */
function renderTimeline(history) {
    const timeline = document.getElementById('audit-timeline');
    timeline.innerHTML = '';
    
    if (!history || history.length === 0) {
        timeline.innerHTML = '<div style="text-align:center; margin-top:100px; color:#68737d;">No communication history found.</div>';
        return;
    }

    history.forEach(row => {
        // Mapping based on your 12-column layout:
        // row[0]:Timestamp, row[2]:Direction, row[3]:MsgType, row[4]:RecipientType
        // row[5]:Subject, row[6]:Body, row[7]:From, row[8]:To
        
        const isOutbound = String(row[2]).toLowerCase() === 'outbound';
        const date = new Date(row[0]).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        
        const div = document.createElement('div');
        div.style.marginBottom = "30px";
        div.innerHTML = `
            <div style="font-size:11px; color:#68737d; margin-bottom:8px; display:flex; justify-content:space-between;">
                <span>${isOutbound ? '📤 Sent via FAST' : '📥 Received'}</span>
                <span>${date}</span>
            </div>
            <div style="border:1px solid #d8dcde; border-radius:6px; overflow:hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <div style="background:#f8f9f9; padding:12px 15px; border-bottom:1px solid #d8dcde;">
                    <div class="msg-identity">
                        <span class="name-pill">${row[7] || 'Unknown Sender'}</span>
                        <span class="type-badge">${row[4] || 'General'}</span>
                    </div>
                    <div style="font-size:11px; color:#68737d;">
                        <strong>To:</strong> ${row[8] || '---'}
                    </div>
                </div>
                <div style="padding:15px; background:#fff;">
                    <strong style="display:block; font-size:13px; margin-bottom:10px; color:#111;">${row[5]}</strong>
                    <div style="font-size:13px; color:#444; line-height:1.5; white-space: pre-wrap;">${row[6]}</div>
                </div>
            </div>
        `;
        timeline.appendChild(div);
    });
}
