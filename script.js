/**
 * PORTFOLIO STUDIO V2.0 - CORE APPLICATION ENGINE
 */

// 1. Security & Sanitization Module
const Security = {
    escapeHTML(str) {
        if (typeof str !== 'string') return str || '';
        return str.replace(/[&<>"']/g, (match) => {
            const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
            return map[match];
        });
    },

    sanitizeURL(url) {
        if (!url) return '';
        const trimmed = url.trim();
        if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(trimmed)) {
            return this.escapeHTML(trimmed);
        }
        return '#';
    }
};

// 2. Centralized Reactive State Store
class StateStore {
    constructor() {
        this.storageKey = 'v2_portfolio_studio_state';
        this.listeners = new Set();
        this.state = this.loadInitialState();
    }

    getDefaultState() {
        return {
            profile: {
                name: 'Alex Morgan',
                role: 'Senior Systems Architect & UX Designer',
                bio: 'Crafting resilient web applications, modern frontend systems, and seamless user experiences.',
                email: 'alex.morgan@example.com',
                location: 'San Francisco, CA',
                github: 'https://github.com',
                linkedin: 'https://linkedin.com'
            },
            theme: {
                layoutStyle: 'grid', // grid, split, sidebar, minimal
                primaryColor: '#6366f1',
                accentColor: '#10b981',
                backgroundColor: '#0f172a',
                textColor: '#f8fafc',
                fontFamily: 'Inter',
                borderRadius: 8,
                containerWidth: 1200
            },
            showcases: [
                {
                    id: 'sc_1',
                    type: 'Development',
                    title: 'Cloud Analytics Dashboard',
                    description: 'Real-time telemetry and metrics visualization platform with zero-latency updates.',
                    link: 'https://github.com'
                },
                {
                    id: 'sc_2',
                    type: 'Case Study',
                    title: 'Design System Architecture v3.0',
                    description: 'Standardized UI token library scaling across 15+ engineering teams.',
                    link: 'https://figma.com'
                }
            ],
            assets: [
                { id: 'ast_1', title: 'Header Banner', url: 'https://picsum.photos/800/400', type: 'image' }
            ],
            viewport: 'desktop'
        };
    }

    loadInitialState() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : this.getDefaultState();
        } catch (e) {
            return this.getDefaultState();
        }
    }

    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }

    set(path, value) {
        const keys = path.split('.');
        let current = this.state;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        this.saveAndNotify();
    }

    saveAndNotify() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        this.listeners.forEach(fn => fn(this.state));
    }

    subscribe(fn) {
        this.listeners.add(fn);
        fn(this.state); // Initial emission
        return () => this.listeners.delete(fn);
    }

    reset() {
        this.state = this.getDefaultState();
        this.saveAndNotify();
    }
}

const store = new StateStore();

// 3. Live Preview Frame Engine
const LivePreviewEngine = {
    init() {
        this.iframe = document.getElementById('preview-frame');
        store.subscribe((state) => this.render(state));
    },

    render(state) {
        if (!this.iframe) return;
        const doc = this.iframe.contentDocument || this.iframe.contentWindow.document;

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <style>
                    :root {
                        --p-primary: ${state.theme.primaryColor};
                        --p-accent: ${state.theme.accentColor};
                        --p-bg: ${state.theme.backgroundColor};
                        --p-text: ${state.theme.textColor};
                        --p-font: '${state.theme.fontFamily}', sans-serif;
                        --p-radius: ${state.theme.borderRadius}px;
                        --p-max-width: ${state.theme.containerWidth}px;
                    }

                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body {
                        background-color: var(--p-bg);
                        color: var(--p-text);
                        font-family: var(--p-font);
                        line-height: 1.6;
                        padding: 2rem;
                    }

                    .container {
                        max-width: var(--p-max-width);
                        margin: 0 auto;
                    }

                    header.hero {
                        text-align: ${state.theme.layoutStyle === 'minimal' ? 'center' : 'left'};
                        padding: 3rem 0;
                        border-bottom: 1px solid rgba(255,255,255,0.1);
                        margin-bottom: 2rem;
                    }

                    .hero-title {
                        font-size: 2.5rem;
                        font-weight: 700;
                        margin-bottom: 0.5rem;
                        color: var(--p-text);
                    }

                    .hero-role {
                        font-size: 1.2rem;
                        color: var(--p-primary);
                        font-weight: 500;
                        margin-bottom: 1rem;
                    }

                    .hero-bio {
                        font-size: 1rem;
                        opacity: 0.85;
                        max-width: 600px;
                        ${state.theme.layoutStyle === 'minimal' ? 'margin: 0 auto;' : ''}
                    }

                    .social-links {
                        display: flex;
                        gap: 1rem;
                        margin-top: 1rem;
                    }

                    .social-links a {
                        color: var(--p-accent);
                        text-decoration: none;
                        font-size: 0.9rem;
                    }

                    .section-title {
                        font-size: 1.5rem;
                        margin-bottom: 1.5rem;
                    }

                    .showcase-grid {
                        display: grid;
                        grid-template-columns: ${state.theme.layoutStyle === 'sidebar' ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))'};
                        gap: 1.5rem;
                    }

                    .card {
                        background: rgba(255, 255, 255, 0.03);
                        border: 1px solid rgba(255, 255, 255, 0.08);
                        border-radius: var(--p-radius);
                        padding: 1.5rem;
                        transition: transform 0.2s ease;
                    }

                    .card-badge {
                        display: inline-block;
                        font-size: 0.7rem;
                        text-transform: uppercase;
                        background: var(--p-primary);
                        color: #fff;
                        padding: 0.2rem 0.5rem;
                        border-radius: 4px;
                        margin-bottom: 0.75rem;
                    }

                    .card h3 {
                        font-size: 1.2rem;
                        margin-bottom: 0.5rem;
                    }

                    .card p {
                        font-size: 0.9rem;
                        opacity: 0.75;
                        margin-bottom: 1rem;
                    }

                    .card a {
                        color: var(--p-accent);
                        text-decoration: none;
                        font-size: 0.85rem;
                        font-weight: 600;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <header class="hero">
                        <h1 class="hero-title">${Security.escapeHTML(state.profile.name)}</h1>
                        <p class="hero-role">${Security.escapeHTML(state.profile.role)}</p>
                        <p class="hero-bio">${Security.escapeHTML(state.profile.bio)}</p>
                        <div class="social-links">
                            ${state.profile.github ? `<a href="${Security.sanitizeURL(state.profile.github)}" target="_blank">GitHub</a>` : ''}
                            ${state.profile.linkedin ? `<a href="${Security.sanitizeURL(state.profile.linkedin)}" target="_blank">LinkedIn</a>` : ''}
                            ${state.profile.email ? `<a href="mailto:${Security.escapeHTML(state.profile.email)}">Email</a>` : ''}
                        </div>
                    </header>

                    <main>
                        <h2 class="section-title">Featured Showcases</h2>
                        <div class="showcase-grid">
                            ${state.showcases.map(item => `
                                <article class="card">
                                    <span class="card-badge">${Security.escapeHTML(item.type)}</span>
                                    <h3>${Security.escapeHTML(item.title)}</h3>
                                    <p>${Security.escapeHTML(item.description)}</p>
                                    ${item.link ? `<a href="${Security.sanitizeURL(item.link)}" target="_blank">View Project &rarr;</a>` : ''}
                                </article>
                            `).join('')}
                        </div>
                    </main>
                </div>
            </body>
            </html>
        `;

        doc.open();
        doc.write(htmlContent);
        doc.close();
    }
};

// 4. Interactive Wizard UI Controller
const WizardController = {
    init() {
        this.bindSteps();
        this.bindProfileInputs();
        this.bindThemeInputs();
        this.bindShowcaseActions();
        this.bindAssetActions();
        this.bindExportModal();
        this.bindViewportControls();

        // Subscribe UI elements to state updates
        store.subscribe(state => this.syncFormFields(state));
    },

    bindSteps() {
        const buttons = document.querySelectorAll('.step-btn');
        const panes = document.querySelectorAll('.wizard-pane');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const step = btn.dataset.step;
                buttons.forEach(b => b.classList.remove('active'));
                panes.forEach(p => p.classList.remove('active'));

                btn.classList.add('active');
                document.getElementById(`pane-step-${step}`).classList.add('active');
            });
        });
    },

    bindProfileInputs() {
        const fields = ['name', 'role', 'bio', 'email', 'location', 'github', 'linkedin'];
        fields.forEach(field => {
            const input = document.getElementById(`input-${field}`);
            if (input) {
                input.addEventListener('input', (e) => {
                    store.set(`profile.${field}`, e.target.value);
                });
            }
        });
    },

    bindThemeInputs() {
        // Layout Presets
        document.querySelectorAll('.preset-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                store.set('theme.layoutStyle', card.dataset.layout);
            });
        });

        // Color Pickers
        const colors = ['primary', 'accent', 'bg', 'text'];
        colors.forEach(c => {
            const el = document.getElementById(`color-${c}`);
            if (el) {
                el.addEventListener('input', (e) => {
                    const keyMap = { primary: 'primaryColor', accent: 'accentColor', bg: 'backgroundColor', text: 'textColor' };
                    store.set(`theme.${keyMap[c]}`, e.target.value);
                });
            }
        });

        // Font Family
        const fontSelect = document.getElementById('select-font');
        if (fontSelect) {
            fontSelect.addEventListener('change', (e) => {
                store.set('theme.fontFamily', e.target.value);
            });
        }

        // Sliders
        const radiusSlider = document.getElementById('range-radius');
        if (radiusSlider) {
            radiusSlider.addEventListener('input', (e) => {
                document.getElementById('val-radius').textContent = e.target.value;
                store.set('theme.borderRadius', parseInt(e.target.value, 10));
            });
        }

        const widthSlider = document.getElementById('range-width');
        if (widthSlider) {
            widthSlider.addEventListener('input', (e) => {
                document.getElementById('val-width').textContent = e.target.value;
                store.set('theme.containerWidth', parseInt(e.target.value, 10));
            });
        }
    },

    bindShowcaseActions() {
        const addBtn = document.getElementById('btn-add-showcase');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const current = store.getState().showcases;
                const newItem = {
                    id: 'sc_' + Date.now(),
                    type: 'Case Study',
                    title: 'New Showcase Project',
                    description: 'Description of the newly created showcase item.',
                    link: 'https://example.com'
                };
                store.set('showcases', [...current, newItem]);
            });
        }
    },

    bindAssetActions() {
        const saveBtn = document.getElementById('btn-save-asset');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const title = document.getElementById('asset-title').value;
                const url = document.getElementById('asset-url').value;
                const type = document.getElementById('asset-type').value;

                if (!title || !url) return;

                const current = store.getState().assets;
                const newAsset = { id: 'ast_' + Date.now(), title, url, type };
                store.set('assets', [...current, newAsset]);

                // Reset Inputs
                document.getElementById('asset-title').value = '';
                document.getElementById('asset-url').value = '';
            });
        }
    },

    bindViewportControls() {
        const buttons = document.querySelectorAll('.btn-viewport');
        const container = document.getElementById('preview-container');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                container.dataset.device = btn.dataset.device;
            });
        });

        // Reset Button
        document.getElementById('btn-reset-state').addEventListener('click', () => {
            if (confirm('Reset portfolio to initial factory defaults?')) {
                store.reset();
            }
        });
    },

    bindExportModal() {
        const modal = document.getElementById('export-modal');
        const openBtn = document.getElementById('btn-export-code');
        const closeBtn = document.getElementById('btn-close-modal');

        openBtn.addEventListener('click', () => {
            const state = store.getState();
            document.getElementById('export-code-html').value = `<header><h1>${state.profile.name}</h1></header>`;
            document.getElementById('export-code-css').value = `:root { --primary: ${state.theme.primaryColor}; }`;
            modal.classList.add('active');
        });

        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    },

    syncFormFields(state) {
        // Sync profile text inputs
        Object.keys(state.profile).forEach(key => {
            const el = document.getElementById(`input-${key}`);
            if (el && el !== document.activeElement) {
                el.value = state.profile[key] || '';
            }
        });

        // Sync Showcase Cards UI
        const showcaseList = document.getElementById('showcase-list');
        if (showcaseList) {
            showcaseList.innerHTML = state.showcases.map(item => `
                <div class="showcase-item-card">
                    <div class="showcase-item-header">
                        <span class="showcase-item-title">${Security.escapeHTML(item.title)}</span>
                        <button type="button" class="btn-remove" onclick="WizardController.removeShowcase('${item.id}')">Delete</button>
                    </div>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">${Security.escapeHTML(item.description)}</p>
                </div>
            `).join('');
        }

        // Sync Assets UI
        const assetGrid = document.getElementById('asset-grid');
        if (assetGrid) {
            assetGrid.innerHTML = state.assets.map(ast => `
                <div class="asset-card">
                    <span class="asset-badge">${Security.escapeHTML(ast.type)}</span>
                    <span class="asset-card-title">${Security.escapeHTML(ast.title)}</span>
                </div>
            `).join('');
        }
    },

    removeShowcase(id) {
        const current = store.getState().showcases;
        store.set('showcases', current.filter(item => item.id !== id));
    }
};

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    LivePreviewEngine.init();
    WizardController.init();
});
