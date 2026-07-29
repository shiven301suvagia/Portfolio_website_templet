/**
 * Creative Portfolio Studio - Main Application
 * Production-quality Vanilla JavaScript
 * Architecture: State-driven with immutability, event delegation, render batching
 * Version: 2.0
 */

'use strict';

// ============================================================
// 1. APPLICATION STATE (Immutable-style)
// ============================================================

const State = {
  wizard: {
    currentStep: 1,
    totalSteps: 9,
    isComplete: false,
  },
  portfolio: {
    type: 'website',
    designStyle: 'minimal',
    layout: 'grid',
    theme: {
      color: '#4a6cf7',
      typography: 'inter',
      spacing: 'normal',
      animations: true,
    },
    information: {
      name: 'Alex Rivera',
      title: 'Creative Director',
      bio: 'Designing experiences that matter.',
      email: 'alex@studio.com',
      social: '@alexrivera',
    },
    showcases: [
      { id: 's1', title: 'Brand Identity', type: 'image' },
      { id: 's2', title: 'Motion Reel', type: 'video' },
    ],
    assets: [
      { id: 'a1', name: 'hero.png', type: 'image', size: '2.4 MB' },
      { id: 'a2', name: 'logo.svg', type: 'image', size: '45 KB' },
      { id: 'a3', name: 'showreel.mp4', type: 'video', size: '18 MB' },
    ],
  },
  ui: {
    previewDevice: 'desktop',
    previewMode: 'website',
    darkMode: false,
    sidebarOpen: true,
  },
  generated: {
    website: null,
    notion: null,
    pdf: null,
    lastGenerated: null,
  },
  draft: {
    saved: null,
    timestamp: null,
  },
  _listeners: [],
};

// ============================================================
// 2. STATE UPDATE SYSTEM (Immutable updates)
// ============================================================

function updateState(path, value) {
  const parts = path.split('.');
  let current = State;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }
  const key = parts[parts.length - 1];
  if (current[key] !== value) {
    current[key] = value;
    notifyListeners(path, value);
    autosave();
  }
}

function getState(path) {
  const parts = path.split('.');
  let current = State;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
}

const listeners = [];

function subscribe(fn) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx > -1) listeners.splice(idx, 1);
  };
}

function notifyListeners(path, value) {
  for (const fn of listeners) {
    try { fn(path, value); } catch (e) { console.warn('Listener error:', e); }
  }
}

// ============================================================
// 3. DOM REFS (Cached)
// ============================================================

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const DOM = {
  header: $('#app-header'),
  deviceBtns: $$('.device-btn'),
  exportTrigger: $('#exportScreenTrigger'),
  generateTrigger: $('#generateScreenTrigger'),
  themePickerTrigger: $('#themePickerTrigger'),
  assetManagerTrigger: $('#assetManagerTrigger'),
  sidebar: $('#sidebar-wizard'),
  progressFill: $('#wizardProgressFill'),
  stepItems: $$('.step-item'),
  stepPanels: $$('.step-panel'),
  wizardPrev: $('#wizardPrev'),
  wizardNext: $('#wizardNext'),
  previewFrame: $('#previewFrame'),
  previewDeviceLabel: $('#deviceLabel'),
  refreshPreview: $('#refreshPreview'),
  expandPreview: $('#expandPreview'),
  modalContainer: $('#modalContainer'),
  modalOverlay: $('#modalOverlay'),
  modalClose: $('#modalClose'),
  modalCancel: $('#modalCancel'),
  modalConfirm: $('#modalConfirm'),
  assetModal: $('#assetManagerModal'),
  assetModalOverlay: $('#assetModalOverlay'),
  assetModalClose: $('#assetModalClose'),
  assetModalCloseBtn: $('#assetModalCloseBtn'),
  assetModalBody: $('#assetModalBody'),
  exportScreen: $('#exportScreen'),
  exportClose: $('#exportClose'),
  exportActionBtn: $('#exportActionBtn'),
  generateScreen: $('#generateScreen'),
  generateClose: $('#generateClose'),
  generateAllBtn: $('#generateAllBtn'),
  toastContainer: $('#toastContainer'),
  showcaseManager: $('#showcaseManager'),
  assetMini: $('#assetMini'),
  colorPicker: $('#colorPicker'),
  typographyPicker: $('#typographyPicker'),
  generateFinalBtn: $('#generateFinalBtn'),
  genStatusWebsite: $('#genStatusWebsite'),
  genStatusNotion: $('#genStatusNotion'),
  genStatusPdf: $('#genStatusPdf'),
  infoName: $('#info-name'),
  infoTitle: $('#info-title'),
  infoBio: $('#info-bio'),
  infoEmail: $('#info-email'),
  infoSocial: $('#info-social'),
};

// ============================================================
// 4. UTILITY FUNCTIONS
// ============================================================

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function debounce(fn, delay = 250) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(c => Math.round(c).toString(16).padStart(2, '0')).join('');
}

function darkenColor(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(
    Math.max(0, r - amount * 255),
    Math.max(0, g - amount * 255),
    Math.max(0, b - amount * 255)
  );
}

function hexToRgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ============================================================
// 5. DRAFT SYSTEM
// ============================================================

function saveDraft() {
  try {
    const state = deepClone(State);
    state.draft.saved = state;
    state.draft.timestamp = new Date().toISOString();
    localStorage.setItem('creative-portfolio-studio-draft', JSON.stringify(state));
  } catch (e) {
    console.warn('Draft save failed:', e);
  }
}

function restoreDraft() {
  try {
    const raw = localStorage.getItem('creative-portfolio-studio-draft');
    if (!raw) return false;
    const saved = JSON.parse(raw);
    if (saved.draft && saved.draft.timestamp) {
      // Deep merge instead of Object.assign
      mergeDeep(State, saved);
      return true;
    }
    return false;
  } catch (e) {
    console.warn('Draft restore failed:', e);
    return false;
  }
}

function mergeDeep(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      mergeDeep(target[key], source[key]);
    } else {
      target[key] = deepClone(source[key]);
    }
  }
}

const autosave = debounce(saveDraft, 500);

// ============================================================
// 6. TOAST SYSTEM
// ============================================================

const ToastManager = {
  show(message, type = 'info', duration = 3500) {
    const container = DOM.toastContainer;
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <span>${escapeHtml(message)}</span>
      <button class="toast-dismiss" aria-label="Dismiss notification">
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    `;

    container.appendChild(toast);

    const dismiss = () => {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => {
          if (toast.parentNode) toast.remove();
        }, 300);
      }
    };

    toast.querySelector('.toast-dismiss')?.addEventListener('click', dismiss);

    const timer = setTimeout(dismiss, duration);

    // Pause timer on hover
    toast.addEventListener('mouseenter', () => clearTimeout(timer));
    toast.addEventListener('mouseleave', () => {
      setTimeout(dismiss, duration);
    });
  },
};

// ============================================================
// 7. WIZARD CONTROLLER
// ============================================================

const WizardController = {
  goToStep(step) {
    if (step < 1 || step > State.wizard.totalSteps) return;
    if (!this.validateStep(step - 1) && step > State.wizard.currentStep) {
      ToastManager.show('Please complete the current step first.', 'warning');
      return;
    }
    updateState('wizard.currentStep', step);
    this.render();
  },

  validateStep(step) {
    // Step validation logic
    if (step === 5) {
      const name = DOM.infoName?.value?.trim();
      if (!name) {
        ToastManager.show('Please enter your name.', 'warning');
        return false;
      }
    }
    return true;
  },

  next() {
    if (State.wizard.currentStep < State.wizard.totalSteps) {
      this.goToStep(State.wizard.currentStep + 1);
    } else {
      this.complete();
    }
  },

  back() {
    if (State.wizard.currentStep > 1) {
      this.goToStep(State.wizard.currentStep - 1);
    }
  },

  complete() {
    updateState('wizard.isComplete', true);
    ToastManager.show('🎉 Portfolio wizard complete! Generate your portfolio.', 'success');
  },

  render() {
    const current = State.wizard.currentStep;

    DOM.stepItems.forEach((item) => {
      const stepNum = parseInt(item.dataset.step);
      item.classList.toggle('active', stepNum === current);
      if (stepNum < current) item.classList.add('completed');
      else item.classList.remove('completed');
      item.setAttribute('aria-current', stepNum === current ? 'step' : 'false');
    });

    DOM.stepPanels.forEach((panel) => {
      const step = parseInt(panel.dataset.step);
      panel.style.display = step === current ? 'flex' : 'none';
      panel.setAttribute('aria-hidden', step !== current);
    });

    DOM.wizardPrev.style.visibility = current > 1 ? 'visible' : 'hidden';
    DOM.wizardPrev.style.opacity = current > 1 ? '1' : '0';
    DOM.wizardNext.textContent = current === State.wizard.totalSteps ? '✨ Generate' : 'Next →';

    const pct = ((current - 1) / (State.wizard.totalSteps - 1)) * 100;
    DOM.progressFill.style.width = Math.min(pct, 100) + '%';
    DOM.progressFill.parentElement?.setAttribute('aria-valuenow', Math.round(pct));
    DOM.progressFill.parentElement?.setAttribute('aria-valuemax', 100);
    DOM.progressFill.parentElement?.setAttribute('aria-valuemin', 0);

    const indicator = document.querySelector('.step-indicator');
    if (indicator) {
      indicator.textContent = `Step ${current} of ${State.wizard.totalSteps}`;
    }
  },
};

// ============================================================
// 8. THEME ENGINE
// ============================================================

const ThemeEngine = {
  apply() {
    const theme = State.portfolio.theme;
    const root = document.documentElement;

    root.style.setProperty('--accent', theme.color);
    root.style.setProperty('--accent-hover', darkenColor(theme.color, 0.15));
    root.style.setProperty('--accent-glow', hexToRgba(theme.color, 0.25));

    const fonts = {
      inter: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      'sf-pro': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      playfair: "'Playfair Display', 'Times New Roman', serif",
      mono: "'SF Mono', 'Menlo', 'Monaco', monospace",
    };
    root.style.setProperty('--font-sans', fonts[theme.typography] || fonts.inter);

    if (State.ui.darkMode) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }

    root.style.setProperty('--transition-base', theme.animations ? '0.25s' : '0s');

    this.updateColorPicker();
    this.updateTypographyPicker();
    PreviewController.render();
  },

  updateColorPicker() {
    const swatches = DOM.colorPicker?.querySelectorAll('.color-swatch') || [];
    swatches.forEach((el) => {
      const color = el.dataset.color;
      el.classList.toggle('active', color === State.portfolio.theme.color);
      el.setAttribute('aria-checked', color === State.portfolio.theme.color ? 'true' : 'false');
    });
  },

  updateTypographyPicker() {
    const options = DOM.typographyPicker?.querySelectorAll('.type-option') || [];
    options.forEach((el) => {
      const value = el.dataset.value;
      el.classList.toggle('active', value === State.portfolio.theme.typography);
      el.setAttribute('aria-checked', value === State.portfolio.theme.typography ? 'true' : 'false');
    });
  },

  toggleDarkMode() {
    updateState('ui.darkMode', !State.ui.darkMode);
    this.apply();
  },
};

// ============================================================
// 9. PREVIEW CONTROLLER
// ============================================================

const PreviewController = {
  render() {
    const frame = DOM.previewFrame;
    const info = State.portfolio.information;
    const showcases = State.portfolio.showcases;
    const theme = State.portfolio.theme;

    let html = `
      <div class="portfolio-mock">
        <div class="mock-header">
          <div class="mock-avatar" style="background:${theme.color}33; border-color:${theme.color};"></div>
          <div class="mock-name" style="color:${theme.color};">${escapeHtml(info.name)}</div>
          <div class="mock-title">${escapeHtml(info.title)}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(info.bio)}</div>
        </div>
        <div class="mock-grid">
    `;

    if (showcases.length > 0) {
      showcases.forEach((item) => {
        html += `
          <div class="mock-card" style="border-color:${theme.color}33;">
            <div style="display:flex; align-items:center; justify-content:center; height:100%; color:var(--text-muted); font-size:0.7rem; text-align:center; padding:4px;">
              ${escapeHtml(item.title)}
            </div>
          </div>
        `;
      });
    } else {
      for (let i = 0; i < 4; i++) {
        html += `<div class="mock-card"></div>`;
      }
    }

    const typeLabels = {
      website: '🌐 Website',
      notion: '📄 Notion',
      pdf: '📑 PDF',
      'decide-later': '✨ Portfolio'
    };

    html += `
        </div>
        <div style="text-align:center; font-size:0.7rem; color:var(--text-muted); margin-top:8px;">
          ${typeLabels[State.portfolio.type] || '✨ Portfolio'}
        </div>
      </div>
    `;

    frame.innerHTML = html;
    this.applyDeviceClass();
  },

  applyDeviceClass() {
    const frame = DOM.previewFrame;
    const device = State.ui.previewDevice;
    frame.classList.remove('device-tablet', 'device-mobile');
    if (device === 'tablet') frame.classList.add('device-tablet');
    if (device === 'mobile') frame.classList.add('device-mobile');

    const labels = { desktop: 'Desktop', tablet: 'Tablet', mobile: 'Mobile' };
    if (DOM.previewDeviceLabel) {
      DOM.previewDeviceLabel.textContent = labels[device] || 'Desktop';
    }

    DOM.deviceBtns.forEach((btn) => {
      const btnDevice = btn.dataset.device;
      btn.classList.toggle('active', btnDevice === device);
      btn.setAttribute('aria-pressed', btnDevice === device ? 'true' : 'false');
    });
  },

  setDevice(device) {
    updateState('ui.previewDevice', device);
    this.applyDeviceClass();
  },

  refresh() {
    this.render();
    ToastManager.show('Preview refreshed', 'info');
  },

  toggleExpand() {
    const frame = DOM.previewFrame;
    frame.classList.toggle('expanded');
    const isExpanded = frame.classList.contains('expanded');
    DOM.expandPreview?.setAttribute('aria-label', isExpanded ? 'Collapse preview' : 'Expand preview');
    DOM.expandPreview?.querySelector('i')?.classList?.toggle('fa-expand', !isExpanded);
    DOM.expandPreview?.querySelector('i')?.classList?.toggle('fa-compress', isExpanded);
  },
};

// ============================================================
// 10. SHOWCASE MANAGER
// ============================================================

const ShowcaseManager = {
  add(title = 'New Showcase') {
    const newItem = {
      id: generateId(),
      title: title.trim() || 'Untitled',
      type: 'image',
    };
    const showcases = [...State.portfolio.showcases, newItem];
    updateState('portfolio.showcases', showcases);
    this.render();
    ToastManager.show(`Added showcase: ${escapeHtml(newItem.title)}`, 'success');
  },

  delete(id) {
    const showcases = State.portfolio.showcases.filter(s => s.id !== id);
    updateState('portfolio.showcases', showcases);
    this.render();
    ToastManager.show('Showcase deleted', 'info');
  },

  edit(id, newTitle) {
    const showcases = State.portfolio.showcases.map(s =>
      s.id === id ? { ...s, title: newTitle.trim() || s.title } : s
    );
    updateState('portfolio.showcases', showcases);
    this.render();
  },

  duplicate(id) {
    const original = State.portfolio.showcases.find(s => s.id === id);
    if (original) {
      const copy = { ...original, id: generateId(), title: original.title + ' (copy)' };
      const showcases = [...State.portfolio.showcases, copy];
      updateState('portfolio.showcases', showcases);
      this.render();
      ToastManager.show('Showcase duplicated', 'info');
    }
  },

  render() {
    const container = DOM.showcaseManager;
    if (!container) return;

    const showcases = State.portfolio.showcases;
    let html = '';

    showcases.forEach((item) => {
      html += `
        <div class="showcase-item" role="listitem" data-id="${escapeHtml(item.id)}">
          <span class="showcase-thumb"><i class="fas fa-${item.type === 'video' ? 'video' : 'image'}" aria-hidden="true"></i></span>
          <span class="showcase-title">${escapeHtml(item.title)}</span>
          <button class="showcase-edit" data-action="edit-showcase" data-id="${escapeHtml(item.id)}" aria-label="Edit showcase">
            <i class="fas fa-edit" aria-hidden="true"></i>
          </button>
          <button class="showcase-delete" data-action="delete-showcase" data-id="${escapeHtml(item.id)}" aria-label="Delete showcase">
            <i class="fas fa-trash" aria-hidden="true"></i>
          </button>
          <button class="showcase-edit" data-action="duplicate-showcase" data-id="${escapeHtml(item.id)}" aria-label="Duplicate showcase" style="color:var(--text-muted);">
            <i class="fas fa-copy" aria-hidden="true"></i>
          </button>
        </div>
      `;
    });

    html += `
      <button class="add-showcase-btn" data-action="add-showcase" aria-label="Add new showcase">
        <i class="fas fa-plus-circle" aria-hidden="true"></i> Add Showcase
      </button>
    `;

    container.innerHTML = html;
    PreviewController.render();
  },
};

// ============================================================
// 11. ASSET MANAGER
// ============================================================

const AssetManager = {
  add(name, type = 'image', size = '0 B') {
    const newAsset = {
      id: generateId(),
      name: name.trim() || 'Untitled',
      type: type,
      size: size,
    };
    const assets = [...State.portfolio.assets, newAsset];
    updateState('portfolio.assets', assets);
    this.render();
    ToastManager.show(`Added asset: ${escapeHtml(newAsset.name)}`, 'success');
  },

  delete(id) {
    const assets = State.portfolio.assets.filter(a => a.id !== id);
    updateState('portfolio.assets', assets);
    this.render();
    ToastManager.show('Asset deleted', 'info');
  },

  render() {
    const container = DOM.assetMini;
    if (!container) return;

    const assets = State.portfolio.assets;
    const iconMap = {
      image: 'fa-file-image',
      video: 'fa-file-video',
      pdf: 'fa-file-pdf',
      audio: 'fa-file-audio',
      document: 'fa-file-alt',
    };

    let html = '';
    assets.forEach((asset) => {
      const icon = iconMap[asset.type] || 'fa-file';
      html += `
        <div class="asset-item" role="listitem" data-id="${escapeHtml(asset.id)}">
          <i class="fas ${icon}" aria-hidden="true"></i> ${escapeHtml(asset.name)}
          <span style="margin-left:auto; font-size:0.7rem; color:var(--text-muted);">${escapeHtml(asset.size)}</span>
          <button class="asset-delete-btn" data-action="delete-asset" data-id="${escapeHtml(asset.id)}" aria-label="Delete asset">
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
      `;
    });

    html += `
      <button class="add-asset-btn" data-action="add-asset" aria-label="Upload new asset">
        <i class="fas fa-upload" aria-hidden="true"></i> Upload asset
      </button>
    `;

    container.innerHTML = html;
  },

  openModal() {
    const modal = DOM.assetModal;
    if (!modal) return;
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const body = DOM.assetModalBody;
    if (body) {
      let html = '<div class="asset-grid-full">';
      State.portfolio.assets.forEach((asset) => {
        html += `
          <div class="asset-full-item">
            <span><i class="fas fa-file" aria-hidden="true"></i> ${escapeHtml(asset.name)}</span>
            <span>${escapeHtml(asset.size)}</span>
          </div>
        `;
      });
      html += '</div>';
      html += `<button class="upload-asset-btn" id="modalUploadAsset"><i class="fas fa-cloud-upload-alt" aria-hidden="true"></i> Upload new asset</button>`;
      body.innerHTML = html;

      body.querySelector('#modalUploadAsset')?.addEventListener('click', () => {
        const name = prompt('Enter asset name:');
        if (name) {
          AssetManager.add(name, 'image', '0 B');
          AssetManager.openModal(); // Refresh modal
        }
      });
    }

    // Focus trap
    const closeBtn = DOM.assetModalClose || DOM.assetModalCloseBtn;
    if (closeBtn) {
      setTimeout(() => closeBtn.focus(), 100);
    }
  },

  closeModal() {
    const modal = DOM.assetModal;
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    DOM.assetManagerTrigger?.focus();
  },
};

// ============================================================
// 12. EXPORT CONTROLLER
// ============================================================

const ExportController = {
  open() {
    const screen = DOM.exportScreen;
    if (!screen) return;
    screen.style.display = 'flex';
    screen.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => DOM.exportClose?.focus(), 100);

    // Reset selection
    const cards = screen.querySelectorAll('.export-format-card');
    cards.forEach(c => c.classList.remove('selected'));
  },

  close() {
    const screen = DOM.exportScreen;
    if (!screen) return;
    screen.style.display = 'none';
    screen.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    DOM.exportTrigger?.focus();
  },

  exportFormat(format) {
    ToastManager.show(`Exporting ${format}... (simulated)`, 'info');
    return new Promise((resolve) => {
      setTimeout(() => {
        ToastManager.show(`✅ ${format} exported successfully!`, 'success');
        resolve(true);
      }, 1200);
    });
  },

  async exportAll() {
    const formats = ['Website', 'Notion', 'PDF'];
    let success = 0;
    for (const fmt of formats) {
      await this.exportFormat(fmt);
      success++;
    }
    if (success === formats.length) {
      ToastManager.show('🎉 All formats exported successfully!', 'success');
      this.close();
    }
  },
};

// ============================================================
// 13. GENERATE CONTROLLER
// ============================================================

const GenerateController = {
  open() {
    const screen = DOM.generateScreen;
    if (!screen) return;
    screen.style.display = 'flex';
    screen.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => DOM.generateClose?.focus(), 100);
    this.updateStatus('ready');
  },

  close() {
    const screen = DOM.generateScreen;
    if (!screen) return;
    screen.style.display = 'none';
    screen.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    DOM.generateTrigger?.focus();
  },

  updateStatus(status = 'ready') {
    const statusMap = {
      ready: { text: 'Ready', color: '#22c55e', bg: '#dcfce7' },
      generating: { text: 'Generating...', color: '#f9a826', bg: '#fef3c7' },
      done: { text: '✅ Done', color: '#22c55e', bg: '#dcfce7' },
      error: { text: '❌ Error', color: '#e94f4f', bg: '#fee2e2' },
    };

    const statuses = [
      DOM.genStatusWebsite,
      DOM.genStatusNotion,
      DOM.genStatusPdf,
    ];

    const style = statusMap[status] || statusMap.ready;
    statuses.forEach(el => {
      if (el) {
        el.textContent = style.text;
        el.style.color = style.color;
        el.style.background = style.bg;
      }
    });
  },

  async generateAll() {
    ToastManager.show('🚀 Generating all formats...', 'info');
    this.updateStatus('generating');
    DOM.generateAllBtn.textContent = '⏳ Generating...';
    DOM.generateAllBtn.disabled = true;

    const formats = ['Website', 'Notion', 'PDF'];
    let completed = 0;

    for (const fmt of formats) {
      await new Promise(resolve => {
        setTimeout(() => {
          completed++;
          ToastManager.show(`✅ ${fmt} generated`, 'success');
          if (completed === formats.length) {
            ToastManager.show('🎉 All formats generated successfully!', 'success');
            updateState('generated.lastGenerated', new Date().toISOString());
            this.updateStatus('done');
            setTimeout(() => this.close(), 1500);
          }
          resolve();
        }, 1000 + Math.random() * 500);
      });
    }

    DOM.generateAllBtn.textContent = 'Generate all formats';
    DOM.generateAllBtn.disabled = false;
  },
};

// ============================================================
// 14. EVENT HANDLERS
// ============================================================

function initEventListeners() {
  // Wizard navigation
  DOM.wizardNext?.addEventListener('click', () => WizardController.next());
  DOM.wizardPrev?.addEventListener('click', () => WizardController.back());

  DOM.stepItems.forEach((item) => {
    item.addEventListener('click', () => {
      const step = parseInt(item.dataset.step);
      WizardController.goToStep(step);
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const step = parseInt(item.dataset.step);
        WizardController.goToStep(step);
      }
    });
  });

  // Device preview
  DOM.deviceBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      PreviewController.setDevice(btn.dataset.device);
    });
  });

  // Preview actions
  DOM.refreshPreview?.addEventListener('click', () => PreviewController.refresh());
  DOM.expandPreview?.addEventListener('click', () => PreviewController.toggleExpand());

  // Theme controls
  DOM.colorPicker?.addEventListener('click', (e) => {
    const swatch = e.target.closest('.color-swatch');
    if (!swatch) return;
    const color = swatch.dataset.color;
    if (color) {
      updateState('portfolio.theme.color', color);
      ThemeEngine.apply();
      PreviewController.render();
      autosave();
    }
  });

  DOM.typographyPicker?.addEventListener('click', (e) => {
    const option = e.target.closest('.type-option');
    if (!option) return;
    const value = option.dataset.value;
    if (value) {
      updateState('portfolio.theme.typography', value);
      ThemeEngine.apply();
      autosave();
    }
  });

  // Showcase manager (event delegation)
  DOM.showcaseManager?.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    const id = target.dataset.id;

    switch (action) {
      case 'add-showcase': {
        const title = prompt('Enter showcase title:');
        if (title !== null) ShowcaseManager.add(title);
        break;
      }
      case 'delete-showcase':
        if (confirm('Delete this showcase?')) ShowcaseManager.delete(id);
        break;
      case 'edit-showcase': {
        const item = State.portfolio.showcases.find(s => s.id === id);
        if (item) {
          const newTitle = prompt('Edit title:', item.title);
          if (newTitle !== null) ShowcaseManager.edit(id, newTitle);
        }
        break;
      }
      case 'duplicate-showcase':
        ShowcaseManager.duplicate(id);
        break;
    }
  });

  // Asset manager (event delegation)
  DOM.assetMini?.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    const id = target.dataset.id;

    switch (action) {
      case 'add-asset': {
        const name = prompt('Enter asset name:');
        if (name !== null) AssetManager.add(name, 'image', '0 B');
        break;
      }
      case 'delete-asset':
        if (confirm('Delete this asset?')) AssetManager.delete(id);
        break;
    }
  });

  // Asset manager modal
  DOM.assetManagerTrigger?.addEventListener('click', () => AssetManager.openModal());
  DOM.assetModalClose?.addEventListener('click', () => AssetManager.closeModal());
  DOM.assetModalCloseBtn?.addEventListener('click', () => AssetManager.closeModal());
  DOM.assetModalOverlay?.addEventListener('click', () => AssetManager.closeModal());

  // Export screen
  DOM.exportTrigger?.addEventListener('click', () => ExportController.open());
  DOM.exportClose?.addEventListener('click', () => ExportController.close());
  DOM.exportScreen?.addEventListener('click', (e) => {
    if (e.target === DOM.exportScreen) ExportController.close();
  });

  DOM.exportScreen?.addEventListener('click', (e) => {
    const card = e.target.closest('.export-format-card');
    if (card) {
      const format = card.dataset.format;
      const cards = DOM.exportScreen.querySelectorAll('.export-format-card');
      cards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      card.setAttribute('aria-checked', 'true');
    }
    const btn = e.target.closest('.export-action-btn');
    if (btn) {
      const selected = DOM.exportScreen.querySelector('.export-format-card.selected');
      if (selected) {
        ExportController.exportFormat(selected.dataset.format);
      } else {
        ToastManager.show('Please select a format first.', 'warning');
      }
    }
  });

  // Generate screen
  DOM.generateTrigger?.addEventListener('click', () => GenerateController.open());
  DOM.generateClose?.addEventListener('click', () => GenerateController.close());
  DOM.generateScreen?.addEventListener('click', (e) => {
    if (e.target === DOM.generateScreen) GenerateController.close();
  });

  DOM.generateFinalBtn?.addEventListener('click', () => {
    GenerateController.generateAll();
  });

  DOM.generateAllBtn?.addEventListener('click', () => {
    GenerateController.generateAll();
  });

  // Theme picker trigger
  DOM.themePickerTrigger?.addEventListener('click', () => {
    WizardController.goToStep(4);
  });

  // Modal controls
  const closeModal = () => {
    DOM.modalContainer.style.display = 'none';
    DOM.modalContainer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  DOM.modalClose?.addEventListener('click', closeModal);
  DOM.modalOverlay?.addEventListener('click', closeModal);
  DOM.modalCancel?.addEventListener('click', closeModal);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      AssetManager.closeModal();
      ExportController.close();
      GenerateController.close();
      closeModal();
    }
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveDraft();
      ToastManager.show('Draft saved', 'success');
    }
  });

  // Dark mode toggle (double-click logo)
  document.querySelector('.logo-icon')?.addEventListener('dblclick', () => {
    ThemeEngine.toggleDarkMode();
    ToastManager.show(State.ui.darkMode ? '🌙 Dark mode' : '☀️ Light mode', 'info');
  });

  // Info form updates
  const infoFields = [
    { id: 'infoName', path: 'portfolio.information.name' },
    { id: 'infoTitle', path: 'portfolio.information.title' },
    { id: 'infoBio', path: 'portfolio.information.bio' },
    { id: 'infoEmail', path: 'portfolio.information.email' },
    { id: 'infoSocial', path: 'portfolio.information.social' },
  ];

  infoFields.forEach(({ id, path }) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', debounce(() => {
        updateState(path, el.value);
        PreviewController.render();
        autosave();
      }, 300));
    }
  });

  // Type cards
  document.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.option-card').forEach(c => {
        c.classList.remove('selected');
        c.setAttribute('aria-checked', 'false');
      });
      card.classList.add('selected');
      card.setAttribute('aria-checked', 'true');
      updateState('portfolio.type', card.dataset.value);
      PreviewController.render();
      autosave();
    });
  });

  // Style cards
  document.querySelectorAll('.style-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.style-card').forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-checked', 'false');
      });
      card.classList.add('active');
      card.setAttribute('aria-checked', 'true');
      updateState('portfolio.designStyle', card.dataset.value);
      autosave();
    });
  });

  // Layout cards
  document.querySelectorAll('.layout-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.layout-card').forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-checked', 'false');
      });
      card.classList.add('active');
      card.setAttribute('aria-checked', 'true');
      updateState('portfolio.layout', card.dataset.value);
      PreviewController.render();
      autosave();
    });
  });

  // Export format cards in export screen
  DOM.exportScreen?.querySelectorAll('.export-format-card').forEach(card => {
    card.addEventListener('click', () => {
      DOM.exportScreen.querySelectorAll('.export-format-card').forEach(c => {
        c.classList.remove('selected');
        c.setAttribute('aria-checked', 'false');
      });
      card.classList.add('selected');
      card.setAttribute('aria-checked', 'true');
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // Export action button
  DOM.exportActionBtn?.addEventListener('click', () => {
    const selected = DOM.exportScreen?.querySelector('.export-format-card.selected');
    if (selected && selected.dataset.format) {
      ExportController.exportFormat(selected.dataset.format);
    } else {
      ToastManager.show('Please select a format first.', 'warning');
    }
  });
}

// ============================================================
// 15. STATE SUBSCRIPTIONS
// ============================================================

function initStateSubscriptions() {
  subscribe((path) => {
    if (path === 'ui.darkMode') {
      ThemeEngine.apply();
    }
    if (path === 'portfolio.theme.color' || path === 'portfolio.theme.typography') {
      ThemeEngine.apply();
    }
    if (path === 'portfolio.showcases' || path === 'portfolio.information') {
      PreviewController.render();
    }
    if (path === 'portfolio.assets') {
      AssetManager.render();
    }
  });
}

// ============================================================
// 16. INITIALIZATION
// ============================================================

function initApp() {
  // Restore draft
  const hasDraft = restoreDraft();

  // Initialize state subscriptions
  initStateSubscriptions();

  // Apply theme
  ThemeEngine.apply();

  // Render all components
  WizardController.render();
  PreviewController.render();
  ShowcaseManager.render();
  AssetManager.render();

  // Set initial device
  PreviewController.setDevice('desktop');

  // Bind events
  initEventListeners();

  // Sync info form with state
  const infoMap = {
    'infoName': State.portfolio.information.name,
    'infoTitle': State.portfolio.information.title,
    'infoBio': State.portfolio.information.bio,
    'infoEmail': State.portfolio.information.email,
    'infoSocial': State.portfolio.information.social,
  };
  Object.entries(infoMap).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
  });

  // Show welcome
  if (hasDraft) {
    ToastManager.show('📂 Draft restored', 'info');
  } else {
    ToastManager.show('👋 Welcome to Creative Portfolio Studio', 'info');
  }

  // Save on unload
  window.addEventListener('beforeunload', saveDraft);

  console.log('🚀 Creative Portfolio Studio initialized');
  console.log('📊 State:', State);
}

// Start app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}