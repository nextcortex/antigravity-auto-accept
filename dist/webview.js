(function () {
    const vscode = acquireVsCodeApi();
    let state = null;
    let _aaDraft = null;

    window.addEventListener('message', (event) => {
        const msg = event.data;
        if (msg.type === 'update') {
            state = msg.payload;
            if (state.autoAcceptConfig) {
                _aaDraft = JSON.parse(JSON.stringify(state.autoAcceptConfig));
            }
            render(state);
        }
    });

    function post(type, data) {
        vscode.postMessage({ type, ...(data || {}) });
    }

    document.addEventListener('click', (e) => {
        let el = e.target;
        while (el && el !== document.body) {
            if (el.dataset && el.dataset.action) {
                e.preventDefault();
                e.stopPropagation();
                handleAction(el.dataset.action, el.dataset);
                return;
            }
            el = el.parentElement;
        }
    });

    function handleAction(action, dataset) {
        switch (action) {
            case 'toggleAutoAccept':
                // Optimistic UI update — flip immediately
                if (state) {
                    state.autoAcceptEnabled = !state.autoAcceptEnabled;
                    render(state);
                }
                post('toggleAutoAccept');
                break;
            case 'saveAutoAcceptConfig':
                if (_aaDraft) {
                    post('updateAutoAcceptConfig', { config: _aaDraft });
                }
                break;
            case 'aaRemoveItem': {
                if (!_aaDraft) break;
                const list = dataset.list;
                const idx = parseInt(dataset.idx, 10);
                if (_aaDraft[list] && !isNaN(idx)) {
                    _aaDraft[list].splice(idx, 1);
                    render(state);
                }
                break;
            }
            case 'aaToggleSetting': {
                if (!_aaDraft) break;
                const key = dataset.key;
                const arr = _aaDraft.enabledSettings;
                const i = arr.indexOf(key);
                if (i >= 0) arr.splice(i, 1);
                else arr.push(key);
                render(state);
                break;
            }
        }
    }

    function render(s) {
        if (!s) return;
        const app = document.getElementById('agm-app');
        if (!app) return;

        let html = ``;

        html += `<div class="agm-toggle" data-action="toggleAutoAccept">
      <div class="agm-toggle-switch ${s.autoAcceptEnabled ? 'on' : ''}"></div>
      <span class="agm-toggle-label">🚀 Auto-Accept ${s.autoAcceptEnabled ? 'ON' : 'OFF'}</span>
      <span class="agm-shortcut-hint"><span class="agm-kbd">Ctrl+Shift+A</span></span>
    </div>`;

        if (s.autoAcceptConfig) {
            html += renderAutoAcceptEditor(s);
        }
        app.innerHTML = html;
    }

    function renderAutoAcceptEditor(s) {
        const cfg = _aaDraft || s.autoAcceptConfig;
        let html = `<div class="agm-section">`;
        html += `<div class="agm-section-header">
      <span>⚙️ Auto-Accept Config</span>
    </div>`;
        html += `<div class="agm-aa-editor">`;

        // Commands
        html += `<div class="agm-aa-group">`;
        html += `<div class="agm-aa-group-title">📋 Accept Commands <span class="agm-section-badge">${cfg.commands.length}</span></div>`;
        html += `<div class="agm-aa-chips">`;
        cfg.commands.forEach((cmd, i) => {
            const short = cmd.split('.').pop();
            html += `<span class="agm-aa-chip" title="${esc(cmd)}">${esc(short)} <span class="agm-aa-chip-x" data-action="aaRemoveItem" data-list="commands" data-idx="${i}">×</span></span>`;
        });
        html += `</div>`;
        html += `<div class="agm-aa-add-row">
      <input class="agm-aa-input" id="agm-aa-cmd-input" placeholder="command.id" />
      <button class="agm-aa-add-btn" id="agm-aa-cmd-add">+</button>
    </div>`;
        html += `</div>`;

        // Accept Keywords
        html += `<div class="agm-aa-group">`;
        html += `<div class="agm-aa-group-title">✅ Accept Keywords <span class="agm-section-badge">${cfg.acceptKeywords.length}</span></div>`;
        html += `<div class="agm-aa-chips">`;
        cfg.acceptKeywords.forEach((kw, i) => {
            html += `<span class="agm-aa-chip agm-aa-chip-accept">${esc(kw)} <span class="agm-aa-chip-x" data-action="aaRemoveItem" data-list="acceptKeywords" data-idx="${i}">×</span></span>`;
        });
        html += `</div>`;
        html += `<div class="agm-aa-add-row">
      <input class="agm-aa-input" id="agm-aa-akw-input" placeholder="keyword" />
      <button class="agm-aa-add-btn" id="agm-aa-akw-add">+</button>
    </div>`;
        html += `</div>`;

        // Reject Keywords
        html += `<div class="agm-aa-group">`;
        html += `<div class="agm-aa-group-title">🚫 Reject Keywords <span class="agm-section-badge">${cfg.rejectKeywords.length}</span></div>`;
        html += `<div class="agm-aa-chips">`;
        cfg.rejectKeywords.forEach((kw, i) => {
            html += `<span class="agm-aa-chip agm-aa-chip-reject">${esc(kw)} <span class="agm-aa-chip-x" data-action="aaRemoveItem" data-list="rejectKeywords" data-idx="${i}">×</span></span>`;
        });
        html += `</div>`;
        html += `<div class="agm-aa-add-row">
      <input class="agm-aa-input" id="agm-aa-rkw-input" placeholder="keyword" />
      <button class="agm-aa-add-btn" id="agm-aa-rkw-add">+</button>
    </div>`;
        html += `</div>`;

        // Auto-execution Settings
        html += `<div class="agm-aa-group">`;
        html += `<div class="agm-aa-group-title">⚡ Auto-Execution Settings</div>`;
        cfg.allSettings.forEach(s => {
            const checked = cfg.enabledSettings.includes(s.key);
            html += `<label class="agm-aa-check" data-action="aaToggleSetting" data-key="${esc(s.key)}" title="${esc(s.key)}">
        <span class="agm-aa-checkbox ${checked ? 'checked' : ''}">✓</span>
        <span>${esc(s.label)}</span>
      </label>`;
        });
        html += `</div>`;

        // Interval
        html += `<div class="agm-aa-group">`;
        html += `<div class="agm-aa-group-title">⏱ Interval (ms)</div>`;
        html += `<input class="agm-aa-input agm-aa-interval" id="agm-aa-interval" type="number" min="200" max="5000" step="100" value="${cfg.interval}" />`;
        html += `</div>`;

        html += `<div class="agm-aa-actions">`;
        html += `<button class="agm-aa-save-btn" data-action="saveAutoAcceptConfig">💾 Save Config</button>`;
        html += `</div>`;

        html += `<div style="text-align: center; margin-top: 15px; font-size: 11px; opacity: 0.7;">🚀 Try <b><a href="https://open-vsx.org/extension/nextcortex/nextcortex-antigravity-monitor" style="color: var(--agm-accent); text-decoration: none;">Antigravity Monitor</a></b> for Quota Tracking!</div>`;

        html += `</div></div>`;
        return html;
    }

    document.addEventListener('click', (e) => {
        const el = e.target;
        if (!el || !el.id) return;
        if (!_aaDraft) return;

        if (el.id === 'agm-aa-cmd-add') {
            const input = document.getElementById('agm-aa-cmd-input');
            const val = input && input.value.trim();
            if (val && !_aaDraft.commands.includes(val)) {
                _aaDraft.commands.push(val);
                input.value = '';
                render(state);
            }
        } else if (el.id === 'agm-aa-akw-add') {
            const input = document.getElementById('agm-aa-akw-input');
            const val = input && input.value.trim().toLowerCase();
            if (val && !_aaDraft.acceptKeywords.includes(val)) {
                _aaDraft.acceptKeywords.push(val);
                input.value = '';
                render(state);
            }
        } else if (el.id === 'agm-aa-rkw-add') {
            const input = document.getElementById('agm-aa-rkw-input');
            const val = input && input.value.trim().toLowerCase();
            if (val && !_aaDraft.rejectKeywords.includes(val)) {
                _aaDraft.rejectKeywords.push(val);
                input.value = '';
                render(state);
            }
        }
    });

    document.addEventListener('change', (e) => {
        const el = e.target;
        if (el && el.id === 'agm-aa-interval' && _aaDraft) {
            _aaDraft.interval = Math.max(200, Math.min(5000, parseInt(el.value, 10) || 800));
        }
    });

    function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

    post('webviewReady');
})();
