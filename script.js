/* ============================================================
   CREATIVE PORTFOLIO STUDIO - script.js
   Vanilla JS Application
   ============================================================ */

// ----- STATE -----
const state = {
    step: 'landing',
    selectedFormat: null,
    portfolio: {
        identity: {
            name: 'Alex Rivera',
            headline: 'Creative Director & Motion Designer',
            about: 'Crafting visual stories for forward-thinking brands. 8+ years of experience in design, animation, and creative direction.'
        },
        brand: {
            accent: '#7C3AED',
            darkMode: false
        },
        showcases: [{
            id: 'show1',
            title: 'Brand Identity for Lumen',
            type: 'Case Study',
            blocks: [
                { type: 'text', content: 'A bold visual system for a future-forward energy brand.' },
                { type: 'image', content: 'https://placehold.co/600x400/7C3AED/FFFFFF?text=Lumen+Brand' },
                { type: 'quote', content: 'Design is not just what it looks like, it\'s how it works.' }
            ]
        }],
        assets: [],
        seo: {
            title: 'Alex Rivera · Creative Portfolio',
            description: 'Design, Motion, and Creative Direction'
        }
    },
    ui: {
        activeSection: 'identity',
        device: 'desktop',
        selectedShowcase: 'show1',
        history: [],
        historyIndex: -1,
        isDirty: false
    }
};

// ----- DOM REFS -----
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const landingEl = $('#landing');
const workspaceEl = $('#workspace');
const formatGrid = $('#formatGrid');
const enterBtn = $('#enterStudioBtn');
const editorArea = $('#editorArea');
const sidebar = $('#sidebar');
const previewIframe = $('#previewIframe');
const previewFrame = $('#previewFrame');
const toastContainer = $('#toastContainer');
const navFormat = $('#navFormat');
const showcaseCount = $('#showcaseCount');
const assetCount = $('#assetCount');

// ----- FORMAT CONFIG -----
const formats = [
    { id: 'website', icon: '🌐', title: 'Website', desc: 'Interactive & responsive' },
    { id: 'notion', icon: '📓', title: 'Notion', desc: 'Minimal & clean' },
    { id: 'pdf', icon: '📄', title: 'PDF', desc: 'Print-ready' },
    { id: 'all', icon: '⚡', title: 'Decide Later', desc: 'Choose at publish' }
];

// ============================================================
// LANDING PAGE
// ============================================================

function renderLanding() {
    formatGrid.innerHTML = formats.map(f => `
        <div class="format-card" data-format="${f.id}">
            <span class="icon">${f.icon}</span>
            <h3>${f.title}</h3>
            <p>${f.desc}</p>
            <span class="check">✓</span>
        </div>
    `).join('');

    formatGrid.querySelectorAll('.format-card').forEach(el => {
        el.addEventListener('click', () => {
            formatGrid.querySelectorAll('.format-card').forEach(c => c.classList.remove('selected'));
            el.classList.add('selected');
            state.selectedFormat = el.dataset.format;
            enterBtn.disabled = false;

            // Update nav format label
            const f = formats.find(f => f.id === state.selectedFormat);
            if (f) navFormat.textContent = f.title;
        });
    });
}

// ----- ENTER WORKSPACE -----
enterBtn.addEventListener('click', () => {
    if (!state.selectedFormat) return;
    landingEl.style.display = 'none';
    workspaceEl.style.display = 'flex';
    state.step = 'workspace';
    renderWorkspace();
    updatePreview();
    showToast(`✨ Studio ready — building as ${formats.find(f => f.id === state.selectedFormat)?.title || 'portfolio'}`);
});

// ============================================================
// WORKSPACE RENDER
// ============================================================

function renderWorkspace() {
    renderSidebar();
    renderEditor();
    updateCounts();
}

function renderSidebar() {
    const items = sidebar.querySelectorAll('li');
    items.forEach(li => {
        li.classList.toggle('active', li.dataset.section === state.ui.activeSection);
        li.addEventListener('click', () => {
            state.ui.activeSection = li.dataset.section;
            renderSidebar();
            renderEditor();
        });
    });
}

function updateCounts() {
    showcaseCount.textContent = state.portfolio.showcases.length;
    assetCount.textContent = state.portfolio.assets.length;
}

function renderEditor() {
    const section = state.ui.activeSection;
    const p = state.portfolio;
    const ui = state.ui;
    let html = '';

    switch (section) {
        case 'identity':
            html = `
                <div class="editor-section">
                    <h2>👤 Identity</h2>
                    <div class="field-group">
                        <label>Full Name</label>
                        <input type="text" id="idName" value="${escapeHtml(p.identity.name || '')}" placeholder="Your name" />
                    </div>
                    <div class="field-group">
                        <label>Headline</label>
                        <input type="text" id="idHeadline" value="${escapeHtml(p.identity.headline || '')}" placeholder="e.g. Creative Director" />
                    </div>
                    <div class="field-group">
                        <label>About</label>
                        <textarea id="idAbout" rows="4" placeholder="Tell your story...">${escapeHtml(p.identity.about || '')}</textarea>
                    </div>
                </div>
            `;
            break;

        case 'brand':
            html = `
                <div class="editor-section">
                    <h2>🎨 Brand</h2>
                    <div class="field-group">
                        <label>Accent Color</label>
                        <input type="color" id="brandAccent" value="${p.brand.accent || '#7C3AED'}" />
                    </div>
                    <div class="field-group">
                        <label>Appearance</label>
                        <select id="brandDark">
                            <option value="false" ${!p.brand.darkMode ? 'selected' : ''}>☀️ Light</option>
                            <option value="true" ${p.brand.darkMode ? 'selected' : ''}>🌙 Dark</option>
                        </select>
                    </div>
                    <div class="field-group" style="margin-top:1.5rem;padding:1rem;background:var(--bg-card);border-radius:var(--radius-sm);border:1px solid var(--border);">
                        <p style="font-size:0.8rem;color:var(--text-secondary);margin:0;">
                            💡 Changes update the preview in real-time.
                        </p>
                    </div>
                </div>
            `;
            break;

        case 'showcases': {
            const sc = p.showcases.find(s => s.id === ui.selectedShowcase) || p.showcases[0];
            html = `
                <div class="editor-section">
                    <h2>📁 Showcases</h2>
                    <div class="showcase-tabs">
                        ${p.showcases.map(s => `
                            <button class="showcase-tab ${ui.selectedShowcase === s.id ? 'active' : ''}" data-scid="${s.id}">
                                ${escapeHtml(s.title || 'Untitled')}
                            </button>
                        `).join('')}
                        <button class="showcase-tab add-tab" id="addShowcaseBtn">+ New</button>
                    </div>
                    ${sc ? `
                        <div class="field-group">
                            <label>Showcase Title</label>
                            <input type="text" id="scTitle" value="${escapeHtml(sc.title || '')}" placeholder="Project name" />
                        </div>
                        <div class="field-group">
                            <label>Type</label>
                            <input type="text" id="scType" value="${escapeHtml(sc.type || '')}" placeholder="e.g. Case Study, Gallery" />
                        </div>
                        <div class="field-group">
                            <label>Content Blocks <span style="font-weight:400;color:var(--text-muted);font-size:0.7rem;text-transform:none;">(drag to reorder)</span></label>
                            <div class="block-list" id="blockList">
                                ${sc.blocks.map((b, i) => `
                                    <div class="block-item" data-index="${i}">
                                        <span class="drag">⠿</span>
                                        <span class="block-type">${b.type}</span>
                                        <span class="block-content">${escapeHtml(b.content.substring(0, 50))}${b.content.length > 50 ? '…' : ''}</span>
                                        <button class="block-del" data-index="${i}" title="Delete block">✕</button>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="add-block-bar">
                                ${['text', 'image', 'quote', 'video', 'gallery'].map(t => 
                                    `<button data-blocktype="${t}">+ ${t}</button>`
                                ).join('')}
                            </div>
                        </div>
                    ` : `
                        <p style="color:var(--text-muted);padding:1rem 0;">No showcase selected. Create one to get started.</p>
                    `}
                </div>
            `;
            break;
        }

        case 'assets':
            html = `
                <div class="editor-section">
                    <h2>🖼️ Assets</h2>
                    <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:1rem;">
                        Upload once, reuse everywhere. Add external links to showcase your work.
                    </p>
                    <div class="field-group">
                        <label>Add External Link</label>
                        <div style="display:flex;gap:0.6rem;">
                            <input type="url" id="assetLink" placeholder="https://youtube.com/watch?v=..." style="flex:1;" />
                            <button id="addAssetBtn" style="background:var(--accent);border:none;color:#fff;padding:0.65rem 1.4rem;border-radius:var(--radius-sm);cursor:pointer;font-weight:600;white-space:nowrap;">Add</button>
                        </div>
                    </div>
                    <div class="asset-tags" id="assetTags">
                        ${p.assets.map(a => `
                            <span class="asset-tag">
                                🔗 ${escapeHtml(a)}
                                <button class="remove-asset" data-asset="${escapeHtml(a)}">✕</button>
                            </span>
                        `).join('')}
                    </div>
                    ${p.assets.length === 0 ? `<p style="color:var(--text-muted);font-size:0.85rem;margin-top:0.5rem;">No assets added yet.</p>` : ''}
                </div>
            `;
            break;

        case 'seo':
            html = `
                <div class="editor-section">
                    <h2>🔍 SEO</h2>
                    <div class="field-group">
                        <label>Page Title</label>
                        <input type="text" id="seoTitle" value="${escapeHtml(p.seo.title || '')}" placeholder="Your portfolio title" />
                    </div>
                    <div class="field-group">
                        <label>Meta Description</label>
                        <textarea id="seoDesc" rows="3" placeholder="Brief description for search engines">${escapeHtml(p.seo.description || '')}</textarea>
                    </div>
                    <div class="field-group" style="margin-top:1.5rem;padding:1rem;background:var(--bg-card);border-radius:var(--radius-sm);border:1px solid var(--border);">
                        <p style="font-size:0.8rem;color:var(--text-secondary);margin:0;">
                            🔍 These fields help search engines understand your portfolio.
                        </p>
                    </div>
                </div>
            `;
            break;
    }

    editorArea.innerHTML = html;
    attachEditorEvents();
}

// ============================================================
// EDITOR EVENTS
// ============================================================

function attachEditorEvents() {
    const p = state.portfolio;
    const ui = state.ui;

    // ----- Identity -----
    const idName = $('#idName');
    if (idName) idName.addEventListener('input', e => { p.identity.name = e.target.value; markDirty(); updatePreview(); });

    const idHeadline = $('#idHeadline');
    if (idHeadline) idHeadline.addEventListener('input', e => { p.identity.headline = e.target.value; markDirty(); updatePreview(); });

    const idAbout = $('#idAbout');
    if (idAbout) idAbout.addEventListener('input', e => { p.identity.about = e.target.value; markDirty(); updatePreview(); });

    // ----- Brand -----
    const brandAccent = $('#brandAccent');
    if (brandAccent) brandAccent.addEventListener('input', e => { p.brand.accent = e.target.value; markDirty(); updatePreview(); });

    const brandDark = $('#brandDark');
    if (brandDark) brandDark.addEventListener('change', e => { p.brand.darkMode = e.target.value === 'true'; markDirty(); updatePreview(); });

    // ----- Showcases -----
    // Tab switching
    $$('.showcase-tab[data-scid]').forEach(btn => {
        btn.addEventListener('click', () => {
            ui.selectedShowcase = btn.dataset.scid;
            renderEditor();
            updatePreview();
        });
    });

    // Add showcase
    const addBtn = $('#addShowcaseBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const newId = 'show_' + Date.now();
            p.showcases.push({
                id: newId,
                title: 'New Showcase',
                type: 'Custom',
                blocks: [{ type: 'text', content: 'Start creating your showcase content here.' }]
            });
            ui.selectedShowcase = newId;
            markDirty();
            renderEditor();
            updatePreview();
            updateCounts();
            showToast('✨ New showcase created');
        });
    }

    // Showcase title
    const scTitle = $('#scTitle');
    if (scTitle) {
        const sc = p.showcases.find(s => s.id === ui.selectedShowcase);
        scTitle.addEventListener('input', e => {
            if (sc) { sc.title = e.target.value; markDirty(); updatePreview(); renderSidebar(); updateCounts(); }
        });
    }

    // Showcase type
    const scType = $('#scType');
    if (scType) {
        const sc = p.showcases.find(s => s.id === ui.selectedShowcase);
        scType.addEventListener('input', e => {
            if (sc) { sc.type = e.target.value; markDirty(); updatePreview(); }
        });
    }

    // Block delete
    $$('.block-del').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.index);
            const sc = p.showcases.find(s => s.id === ui.selectedShowcase);
            if (sc && sc.blocks.length > 1) {
                sc.blocks.splice(idx, 1);
                markDirty();
                renderEditor();
                updatePreview();
                showToast('🗑️ Block removed');
            } else {
                showToast('Keep at least one block');
            }
        });
    });

    // Add block
    $$('[data-blocktype]').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.blocktype;
            const sc = p.showcases.find(s => s.id === ui.selectedShowcase);
            if (sc) {
                const contentMap = {
                    text: 'New text block — edit me!',
                    image: 'https://placehold.co/600x400/7C3AED/FFFFFF?text=Image',
                    quote: '“A great quote that inspires.”',
                    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                    gallery: 'Gallery placeholder — add your images'
                };
                sc.blocks.push({ type, content: contentMap[type] || 'New block' });
                markDirty();
                renderEditor();
                updatePreview();
                showToast(`➕ ${type} block added`);
            }
        });
    });

    // ----- Assets -----
    const addAssetBtn = $('#addAssetBtn');
    if (addAssetBtn) {
        addAssetBtn.addEventListener('click', () => {
            const link = $('#assetLink');
            if (link && link.value.trim()) {
                const url = link.value.trim();
                // Basic URL validation
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    showToast('⚠️ Please enter a valid URL (http:// or https://)');
                    return;
                }
                p.assets.push(url);
                link.value = '';
                markDirty();
                renderEditor();
                updatePreview();
                updateCounts();
                showToast('🔗 Asset added');
            } else {
                showToast('Please enter a URL');
            }
        });

        // Enter key support
        const assetLink = $('#assetLink');
        if (assetLink) {
            assetLink.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addAssetBtn.click();
                }
            });
        }
    }

    // Remove asset
    $$('.remove-asset').forEach(btn => {
        btn.addEventListener('click', () => {
            const asset = btn.dataset.asset;
            const idx = p.assets.indexOf(asset);
            if (idx > -1) {
                p.assets.splice(idx, 1);
                markDirty();
                renderEditor();
                updateCounts();
                showToast('🗑️ Asset removed');
            }
        });
    });

    // ----- SEO -----
    const seoTitle = $('#seoTitle');
    if (seoTitle) seoTitle.addEventListener('input', e => { p.seo.title = e.target.value; markDirty(); updatePreview(); });

    const seoDesc = $('#seoDesc');
    if (seoDesc) seoDesc.addEventListener('input', e => { p.seo.description = e.target.value; markDirty(); updatePreview(); });
}

// ============================================================
// PREVIEW
// ============================================================

function updatePreview() {
    const p = state.portfolio;
    const sc = p.showcases.find(s => s.id === state.ui.selectedShowcase) || p.showcases[0];
    const accent = p.brand.accent || '#7C3AED';
    const dark = p.brand.darkMode ?
        'background:#0A0A12;color:#EEEEF0;' :
        'background:#FAFAFC;color:#1A1A24;';

    let blocksHtml = '';
    if (sc && sc.blocks.length) {
        blocksHtml = sc.blocks.map(b => {
            const content = escapeHtml(b.content);
            switch (b.type) {
                case 'text':
                    return `<p style="margin:0.6rem 0;font-size:1rem;line-height:1.7;">${content}</p>`;
                case 'image':
                    return `<img src="${b.content}" style="max-width:100%;border-radius:8px;margin:0.6rem 0;border:1px solid #eee;" alt="Showcase image" />`;
                case 'quote':
                    return `<blockquote style="border-left:4px solid ${accent};padding-left:1.2rem;margin:0.8rem 0;font-style:italic;color:#666;">${content}</blockquote>`;
                case 'video':
                    return `<div style="background:#000;padding:0.8rem;border-radius:8px;text-align:center;margin:0.6rem 0;color:#fff;font-size:0.9rem;">▶️ ${content}</div>`;
                case 'gallery':
                    return `<div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin:0.6rem 0;"><span style="background:${accent}22;padding:0.2rem 1rem;border-radius:30px;font-size:0.8rem;">📸 Gallery item</span><span style="background:${accent}22;padding:0.2rem 1rem;border-radius:30px;font-size:0.8rem;">📸 Gallery item</span></div>`;
                default:
                    return `<div style="margin:0.4rem 0;">${content}</div>`;
            }
        }).join('');
    } else {
        blocksHtml = `<p style="color:#999;font-style:italic;">Add content blocks to build your showcase.</p>`;
    }

    const doc = `
<!DOCTYPE html>
<html>
<head>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            ${dark}
            padding: 2rem 1.5rem;
            line-height: 1.6;
            transition: background 0.2s, color 0.2s;
            min-height: 100%;
        }
        .container {
            max-width: 720px;
            margin: 0 auto;
        }
        .name {
            font-size: 2.2rem;
            font-weight: 700;
            letter-spacing: -0.02em;
            margin-bottom: 0.2rem;
        }
        .headline {
            font-size: 1.1rem;
            color: ${p.brand.darkMode ? '#A1A1B8' : '#666'};
            margin-bottom: 0.6rem;
        }
        .about {
            margin: 1rem 0 1.4rem;
            color: ${p.brand.darkMode ? '#C8C8D4' : '#444'};
        }
        .divider {
            border: none;
            border-top: 1px solid ${p.brand.darkMode ? '#2A2A3E' : '#E5E5EA'};
            margin: 1.4rem 0;
        }
        .showcase-title {
            font-size: 1.5rem;
            font-weight: 600;
            letter-spacing: -0.01em;
            margin-bottom: 0.2rem;
        }
        .showcase-type {
            color: ${p.brand.darkMode ? '#A1A1B8' : '#666'};
            font-size: 0.9rem;
            margin-bottom: 0.8rem;
        }
        .showcase-content {
            margin: 0.8rem 0;
        }
        .footer {
            margin-top: 2rem;
            padding-top: 1.2rem;
            border-top: 1px solid ${p.brand.darkMode ? '#2A2A3E' : '#E5E5EA'};
            font-size: 0.75rem;
            color: ${p.brand.darkMode ? '#6B6B85' : '#999'};
        }
        .accent-color { color: ${accent}; }
        img { max-width: 100%; height: auto; }
        a { color: ${accent}; }
    </style>
</head>
<body>
    <div class="container">
        <div class="name">${escapeHtml(p.identity.name || 'Your Name')}</div>
        <div class="headline">${escapeHtml(p.identity.headline || 'Creative Professional')}</div>
        <div class="about">${escapeHtml(p.identity.about || '')}</div>
        <hr class="divider" />
        <div class="showcase-title">${escapeHtml(sc?.title || 'Showcase')}</div>
        <div class="showcase-type">${escapeHtml(sc?.type || '')}</div>
        <div class="showcase-content">${blocksHtml}</div>
        <div class="footer">
            ${escapeHtml(p.seo.title || '')} · ${escapeHtml(p.seo.description || '')}
        </div>
    </div>
</body>
</html>`;

    previewIframe.srcdoc = doc;
}

// ============================================================
// DEVICE TOGGLE
// ============================================================

$$('[data-device]').forEach(btn => {
    btn.addEventListener('click', () => {
        $$('[data-device]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const device = btn.dataset.device;
        if (device === 'desktop') {
            previewFrame.style.maxWidth = '100%';
            previewFrame.style.margin = '0 auto';
        } else if (device === 'tablet') {
            previewFrame.style.maxWidth = '768px';
            previewFrame.style.margin = '0 auto';
        } else if (device === 'mobile') {
            previewFrame.style.maxWidth = '375px';
            previewFrame.style.margin = '0 auto';
        }
    });
});

// Refresh preview
$('#refreshPreview')?.addEventListener('click', updatePreview);

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function markDirty() {
    state.ui.isDirty = true;
}

function showToast(msg) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        toast.style.transition = '0.2s ease';
        setTimeout(() => toast.remove(), 250);
    }, 2200);
}

// ============================================================
// NAV BUTTONS
// ============================================================

// Undo / Redo (simulated)
$('#undoBtn')?.addEventListener('click', () => showToast('↩ Undo (simulated)'));
$('#redoBtn')?.addEventListener('click', () => showToast('↪ Redo (simulated)'));

// Save
$('#saveBtn')?.addEventListener('click', () => {
    state.ui.isDirty = false;
    showToast('💾 Draft saved');
});

// Publish
$('#publishBtn')?.addEventListener('click', () => {
    let format = state.selectedFormat || 'website';
    if (format === 'all') {
        showToast('✨ Published as Website + Notion + PDF (simulated)');
    } else {
        showToast(`✨ Published as ${format.charAt(0).toUpperCase() + format.slice(1)} (simulated)`);
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + S
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        $('#saveBtn')?.click();
    }
    // Cmd/Ctrl + Z
    if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        $('#undoBtn')?.click();
    }
    // Cmd/Ctrl + Shift + Z
    if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        $('#redoBtn')?.click();
    }
});

// ============================================================
// INITIALIZATION
// ============================================================

renderLanding();
updatePreview();

console.log('🚀 Creative Portfolio Studio v2.0 ready');
console.log('📦 Built with vanilla JS — premium SaaS experience');
