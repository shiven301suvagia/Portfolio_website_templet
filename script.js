/**
 * Portfolio Builder — Universal Creative Platform
 * Flexible content system with asset management
 */

// ============================================================
// STATE
// ============================================================
const AppState = {
  currentStep: 'identity',
  previewOpen: false,
  generatedHTML: null,
  STORAGE_KEY: 'portfolio_pro_draft',
  
  data: {
    fullName: '',
    title: '',
    tagline: '',
    location: '',
    email: '',
    avatarEmoji: '🎨',
    aboutHeadline: '',
    aboutStory: '',
    aboutImage: '',
    experienceYears: '',
    projects: [],
    assets: [],
    skills: [],
    social: [],
    design: {
      theme: 'light',
      accentColor: '#d46a4a',
      typography: 'modern',
      heroLayout: 'left',
      borderRadius: 12
    },
    advanced: {
      customCSS: '',
      customJS: '',
      footerText: ''
    }
  },
  
  loadDraft() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach(key => {
          if (key === 'design' && parsed.design) {
            Object.assign(this.data.design, parsed.design);
          } else if (key === 'advanced' && parsed.advanced) {
            Object.assign(this.data.advanced, parsed.advanced);
          } else {
            this.data[key] = parsed[key];
          }
        });
        return true;
      }
    } catch (e) { console.warn('Could not load draft:', e); }
    return false;
  },
  
  saveDraft() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) { console.warn('Could not save draft:', e); }
  }
};

// ============================================================
// DOM REFS
// ============================================================
const DOM = {};

function cacheDOM() {
  DOM.sidebar = document.getElementById('sidebar');
  DOM.menuToggle = document.getElementById('menuToggle');
  DOM.stepTitle = document.getElementById('stepTitle');
  DOM.stepBadge = document.getElementById('stepBadge');
  DOM.previewToggle = document.getElementById('previewToggle');
  DOM.previewPanel = document.getElementById('previewPanel');
  DOM.closePreview = document.getElementById('closePreview');
  DOM.previewFrame = document.getElementById('previewFrame');
  DOM.successModal = document.getElementById('successModal');
  DOM.successClose = document.getElementById('successClose');
  DOM.outputContent = document.getElementById('outputContent');
  DOM.copyBtn = document.getElementById('copyBtn');
  DOM.showCodeBtn = document.getElementById('showCodeBtn');
  DOM.codeContainer = document.getElementById('codeContainer');
  DOM.generateBtn = document.getElementById('generateBtn');
  DOM.generateFinalBtn = document.getElementById('generateFinalBtn');
  DOM.downloadBtn = document.getElementById('downloadBtn');
  DOM.projectsList = document.getElementById('projectsList');
  DOM.addProjectBtn = document.getElementById('addProjectBtn');
  DOM.skillsList = document.getElementById('skillsList');
  DOM.skillInput = document.getElementById('skillInput');
  DOM.addSkillBtn = document.getElementById('addSkillBtn');
  DOM.socialLinks = document.getElementById('socialLinks');
  DOM.addSocialBtn = document.getElementById('addSocialBtn');
  DOM.themeSelector = document.getElementById('themeSelector');
  DOM.accentColor = document.getElementById('accentColor');
  DOM.accentColorHex = document.getElementById('accentColorHex');
  DOM.borderRadius = document.getElementById('borderRadius');
  DOM.radiusValue = document.getElementById('radiusValue');
  DOM.typography = document.getElementById('typography');
  DOM.heroLayout = document.getElementById('heroLayout');
  DOM.fullName = document.getElementById('fullName');
  DOM.title = document.getElementById('title');
  DOM.tagline = document.getElementById('tagline');
  DOM.location = document.getElementById('location');
  DOM.email = document.getElementById('email');
  DOM.avatarEmoji = document.getElementById('avatarEmoji');
  DOM.aboutHeadline = document.getElementById('aboutHeadline');
  DOM.aboutStory = document.getElementById('aboutStory');
  DOM.aboutImage = document.getElementById('aboutImage');
  DOM.experienceYears = document.getElementById('experienceYears');
  DOM.contactEmail = document.getElementById('contactEmail');
  DOM.contactNote = document.getElementById('contactNote');
  DOM.customCSS = document.getElementById('customCSS');
  DOM.customJS = document.getElementById('customJS');
  DOM.footerText = document.getElementById('footerText');
  DOM.assetGrid = document.getElementById('assetGrid');
  DOM.assetUpload = document.getElementById('assetUpload');
  DOM.assetDropArea = document.getElementById('assetDropArea');
  DOM.toastContainer = document.getElementById('toastContainer');
  
  // Profile upload elements
  DOM.profileUpload = document.getElementById('profileUpload');
  DOM.profilePreviewImg = document.getElementById('profilePreviewImg');
  DOM.profilePreview = document.getElementById('profilePreview');
  DOM.applyProfileUrl = document.getElementById('applyProfileUrl');
  DOM.removeProfileImage = document.getElementById('removeProfileImage');
}

// ============================================================
// STEPS
// ============================================================
const STEPS = ['identity', 'about', 'projects', 'assets', 'skills', 'contact', 'design', 'advanced'];
const STEP_TITLES = {
  identity: 'Identity', about: 'About', projects: 'Projects',
  assets: 'Assets', skills: 'Skills', contact: 'Contact',
  design: 'Design', advanced: 'Advanced'
};

// ============================================================
// NAVIGATION
// ============================================================
function navigateTo(step) {
  if (!STEPS.includes(step)) return;
  AppState.currentStep = step;
  
  document.querySelectorAll('.step').forEach(el => {
    el.classList.toggle('active', el.dataset.step === step);
  });
  
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.step === step);
  });
  
  DOM.stepTitle.textContent = STEP_TITLES[step];
  DOM.stepBadge.textContent = `${STEPS.indexOf(step) + 1} / ${STEPS.length}`;
  
  if (AppState.previewOpen) renderPreview();
  updateStatus();
}

function updateStatus() {
  STEPS.forEach(step => {
    const statusEl = document.querySelector(`.nav-status[data-status="${step}"]`);
    if (!statusEl) return;
    const isValid = validateStep(step, true);
    statusEl.className = 'nav-status' + (isValid ? ' complete' : '');
  });
}

// ============================================================
// VALIDATION
// ============================================================
function validateStep(step, silent = false) {
  if (step === 'identity') {
    const name = DOM.fullName.value.trim();
    const email = DOM.email.value.trim();
    if (!name) { if (!silent) showToast('Please enter your name'); return false; }
    if (!email || !email.includes('@')) { if (!silent) showToast('Please enter a valid email'); return false; }
    return true;
  }
  return true;
}

// ============================================================
// SANITIZATION
// ============================================================
function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function sanitizeString(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function sanitizeURL(url) {
  if (!url) return '';
  const safe = url.trim();
  if (safe.startsWith('http://') || safe.startsWith('https://') || 
      safe.startsWith('mailto:') || safe.startsWith('tel:')) {
    return escapeHTML(safe);
  }
  return '';
}

// ============================================================
// DATA COLLECTION
// ============================================================
function collectData() {
  AppState.data.fullName = sanitizeString(DOM.fullName.value.trim());
  AppState.data.title = sanitizeString(DOM.title.value.trim());
  AppState.data.tagline = sanitizeString(DOM.tagline.value.trim());
  AppState.data.location = sanitizeString(DOM.location.value.trim());
  AppState.data.email = sanitizeString(DOM.email.value.trim());
  AppState.data.avatarEmoji = DOM.avatarEmoji.value;
  AppState.data.aboutHeadline = sanitizeString(DOM.aboutHeadline.value.trim());
  AppState.data.aboutStory = sanitizeString(DOM.aboutStory.value.trim());
  AppState.data.aboutImage = sanitizeURL(DOM.aboutImage.value.trim());
  AppState.data.experienceYears = DOM.experienceYears.value.trim();
  AppState.data.contactEmail = sanitizeString(DOM.contactEmail.value.trim());
  AppState.data.contactNote = sanitizeString(DOM.contactNote.value.trim());
  
  // Projects
  AppState.data.projects = [];
  document.querySelectorAll('.project-card').forEach(card => {
    const blocks = [];
    card.querySelectorAll('.block-item').forEach(block => {
      const type = block.dataset.blockType;
      const content = block.querySelector('.block-content')?.value || '';
      blocks.push({ type, content });
    });
    
    AppState.data.projects.push({
      title: sanitizeString(card.querySelector('.project-title-input')?.value || ''),
      description: sanitizeString(card.querySelector('.project-desc-input')?.value || ''),
      category: sanitizeString(card.querySelector('.project-category-input')?.value || ''),
      year: sanitizeString(card.querySelector('.project-year-input')?.value || ''),
      blocks: blocks
    });
  });
  
  // Assets
  AppState.data.assets = [];
  document.querySelectorAll('.asset-item').forEach(item => {
    AppState.data.assets.push({
      name: item.dataset.assetName,
      type: item.dataset.assetType,
      data: item.dataset.assetData,
      size: item.dataset.assetSize
    });
  });
  
  // Skills
  AppState.data.skills = [];
  document.querySelectorAll('.skill-tag').forEach(tag => {
    AppState.data.skills.push(tag.dataset.skill);
  });
  
  // Social
  AppState.data.social = [];
  document.querySelectorAll('.social-input-row').forEach(row => {
    const platform = row.querySelector('.social-platform')?.value || '';
    const url = sanitizeURL(row.querySelector('.social-url')?.value || '');
    if (platform && url) AppState.data.social.push({ platform, url });
  });
  
  // Design
  const activeTheme = document.querySelector('.theme-option.active');
  AppState.data.design.theme = activeTheme?.dataset.theme || 'light';
  AppState.data.design.accentColor = DOM.accentColor.value;
  AppState.data.design.typography = DOM.typography.value;
  AppState.data.design.heroLayout = DOM.heroLayout.value;
  AppState.data.design.borderRadius = parseInt(DOM.borderRadius.value) || 12;
  
  // Advanced
  AppState.data.advanced.customCSS = DOM.customCSS.value;
  AppState.data.advanced.customJS = DOM.customJS.value;
  AppState.data.advanced.footerText = DOM.footerText.value;
  
  AppState.saveDraft();
}

// ============================================================
// PROJECTS WITH FLEXIBLE BLOCKS
// ============================================================
const BLOCK_TYPES = [
  { id: 'image', label: '🖼️ Image', icon: '🖼️' },
  { id: 'video', label: '🎬 Video', icon: '🎬' },
  { id: 'text', label: '📝 Rich Text', icon: '📝' },
  { id: 'embed', label: '🔗 Embed', icon: '🔗' },
  { id: 'gallery', label: '📸 Gallery', icon: '📸' },
  { id: 'pdf', label: '📄 PDF Viewer', icon: '📄' },
  { id: 'code', label: '💻 Code Snippet', icon: '💻' },
  { id: 'audio', label: '🎵 Audio Player', icon: '🎵' },
  { id: 'button', label: '🔘 Button', icon: '🔘' },
  { id: 'custom', label: '✨ Custom Embed', icon: '✨' }
];

function addProject(projectData = null) {
  const card = document.createElement('div');
  card.className = 'project-card';
  card.setAttribute('role', 'listitem');
  
  const p = projectData || { title: '', description: '', category: '', year: '', blocks: [] };
  
  let blocksHTML = '';
  if (p.blocks && p.blocks.length > 0) {
    p.blocks.forEach(block => {
      blocksHTML += createBlockHTML(block.type, block.content);
    });
  } else {
    // Add default blocks based on project type
    blocksHTML += createBlockHTML('text', 'Describe your project here...');
    blocksHTML += createBlockHTML('image', '');
  }
  
  card.innerHTML = `
    <button class="btn-remove-project" type="button">×</button>
    <div class="form-grid two-col">
      <div class="form-group">
        <label>Project Title</label>
        <input type="text" class="project-title-input" placeholder="Project title" value="${escapeHTML(p.title)}" />
      </div>
      <div class="form-group">
        <label>Category</label>
        <input type="text" class="project-category-input" placeholder="e.g., Photography" value="${escapeHTML(p.category)}" />
      </div>
    </div>
    <div class="form-group">
      <label>Description</label>
      <input type="text" class="project-desc-input" placeholder="Brief description" value="${escapeHTML(p.description)}" />
    </div>
    <div class="form-group">
      <label>Year</label>
      <input type="text" class="project-year-input" placeholder="e.g., 2024" value="${escapeHTML(p.year)}" />
    </div>
    <div class="form-group">
      <label>Content Blocks</label>
      <div class="blocks-container">
        ${blocksHTML}
      </div>
      <div class="add-block-wrapper">
        <select class="block-type-select">
          ${BLOCK_TYPES.map(b => `<option value="${b.id}">${b.label}</option>`).join('')}
        </select>
        <button class="btn-add-block">+ Add Block</button>
      </div>
    </div>
  `;
  
  // Add block functionality
  card.querySelector('.btn-add-block').addEventListener('click', function() {
    const select = card.querySelector('.block-type-select');
    const type = select.value;
    const container = card.querySelector('.blocks-container');
    const blockHTML = createBlockHTML(type, '');
    container.insertAdjacentHTML('beforeend', blockHTML);
    setupBlockEvents(container.lastElementChild);
    renderPreview();
  });
  
  // Setup existing blocks
  card.querySelectorAll('.block-item').forEach(block => setupBlockEvents(block));
  
  // Remove project
  card.querySelector('.btn-remove-project').addEventListener('click', () => {
    if (document.querySelectorAll('.project-card').length > 1) {
      card.remove();
      renderPreview();
    } else {
      showToast('You need at least one project');
    }
  });
  
  card.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => { renderPreview(); });
    input.addEventListener('change', () => { renderPreview(); });
  });
  
  DOM.projectsList.appendChild(card);
  renderPreview();
}

function createBlockHTML(type, content) {
  const block = BLOCK_TYPES.find(b => b.id === type) || BLOCK_TYPES[0];
  
  let contentHTML = '';
  switch(type) {
    case 'text':
      contentHTML = `<textarea class="block-content" rows="3" placeholder="Write your content here...">${escapeHTML(content)}</textarea>`;
      break;
    case 'image':
    case 'video':
      contentHTML = `
        <div class="block-media-upload">
          <input type="url" class="block-content" placeholder="Enter URL or choose from assets..." value="${escapeHTML(content)}" />
          <button class="btn-block-asset">📁 From Assets</button>
        </div>
      `;
      break;
    case 'embed':
      contentHTML = `<input type="url" class="block-content" placeholder="YouTube, Vimeo, Figma, etc..." value="${escapeHTML(content)}" />`;
      break;
    case 'gallery':
      contentHTML = `<input type="text" class="block-content" placeholder="Comma-separated image URLs..." value="${escapeHTML(content)}" />`;
      break;
    case 'pdf':
    case 'code':
    case 'audio':
    case 'button':
    case 'custom':
    default:
      contentHTML = `<textarea class="block-content" rows="2" placeholder="Enter ${block.label.toLowerCase()} content...">${escapeHTML(content)}</textarea>`;
      break;
  }
  
  return `
    <div class="block-item" data-block-type="${type}">
      <div class="block-header">
        <span class="block-icon">${block.icon}</span>
        <span class="block-label">${block.label}</span>
        <button class="btn-remove-block" type="button">×</button>
        <button class="btn-move-block-up" type="button">↑</button>
        <button class="btn-move-block-down" type="button">↓</button>
      </div>
      <div class="block-body">
        ${contentHTML}
      </div>
    </div>
  `;
}

function setupBlockEvents(block) {
  // Remove block
  block.querySelector('.btn-remove-block')?.addEventListener('click', function(e) {
    e.stopPropagation();
    if (block.parentElement.children.length > 1) {
      block.remove();
      renderPreview();
    } else {
      showToast('You need at least one block per project');
    }
  });
  
  // Move block up
  block.querySelector('.btn-move-block-up')?.addEventListener('click', function(e) {
    e.stopPropagation();
    const prev = block.previousElementSibling;
    if (prev) {
      block.parentElement.insertBefore(block, prev);
      renderPreview();
    }
  });
  
  // Move block down
  block.querySelector('.btn-move-block-down')?.addEventListener('click', function(e) {
    e.stopPropagation();
    const next = block.nextElementSibling;
    if (next) {
      block.parentElement.insertBefore(next, block);
      renderPreview();
    }
  });
  
  // Asset selection
  block.querySelector('.btn-block-asset')?.addEventListener('click', function(e) {
    e.stopPropagation();
    const input = block.querySelector('.block-content');
    showAssetPicker(input);
  });
  
  // Input changes
  block.querySelector('.block-content')?.addEventListener('input', renderPreview);
  block.querySelector('.block-content')?.addEventListener('change', renderPreview);
}

function showAssetPicker(input) {
  // Simple asset picker dialog
  const assets = AppState.data.assets;
  if (assets.length === 0) {
    showToast('No assets uploaded yet. Go to Assets tab to upload.');
    return;
  }
  
  // Navigate to assets tab
  navigateTo('assets');
  showToast('💡 Upload or select an asset, then copy its URL to paste here.');
}

// ============================================================
// ASSET MANAGER
// ============================================================
function setupAssetManager() {
  // File upload
  DOM.assetUpload.addEventListener('change', handleAssetUpload);
  
  // Drag and drop
  DOM.assetDropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    DOM.assetDropArea.classList.add('dragover');
  });
  
  DOM.assetDropArea.addEventListener('dragleave', () => {
    DOM.assetDropArea.classList.remove('dragover');
  });
  
  DOM.assetDropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    DOM.assetDropArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  });
  
  DOM.assetDropArea.addEventListener('click', () => {
    DOM.assetUpload.click();
  });
  
  // Load existing assets
  renderAssets();
}

function handleAssetUpload(e) {
  const files = e.target.files;
  if (files.length > 0) {
    handleFiles(files);
  }
  e.target.value = '';
}

function handleFiles(files) {
  const validTypes = ['image/', 'video/', 'application/pdf', 'text/plain'];
  const maxSize = 50 * 1024 * 1024; // 50MB
  
  Array.from(files).forEach(file => {
    // Validate type
    const isValid = validTypes.some(type => file.type.startsWith(type) || file.name.endsWith('.pdf'));
    if (!isValid) {
      showToast(`⚠️ ${file.name} is not supported`);
      return;
    }
    
    // Validate size
    if (file.size > maxSize) {
      showToast(`⚠️ ${file.name} is too large (max 50MB)`);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      const dataUrl = e.target.result;
      const asset = {
        name: file.name,
        type: file.type,
        data: dataUrl,
        size: file.size
      };
      
      AppState.data.assets.push(asset);
      renderAssets();
      AppState.saveDraft();
      showToast(`✅ ${file.name} uploaded!`);
    };
    reader.readAsDataURL(file);
  });
}

function renderAssets() {
  const assets = AppState.data.assets || [];
  DOM.assetGrid.innerHTML = '';
  
  if (assets.length === 0) {
    DOM.assetGrid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;padding:40px;text-align:center;color:var(--color-text-muted);">
        <span style="font-size:2rem;display:block;margin-bottom:8px;">📁</span>
        <p>No assets uploaded yet</p>
        <p style="font-size:0.85rem;">Upload images, videos, or documents above</p>
      </div>
    `;
    return;
  }
  
  assets.forEach((asset, index) => {
    const item = document.createElement('div');
    item.className = 'asset-item';
    item.dataset.assetName = asset.name;
    item.dataset.assetType = asset.type;
    item.dataset.assetData = asset.data;
    item.dataset.assetSize = asset.size;
    
    let previewHTML = '';
    if (asset.type.startsWith('image/')) {
      previewHTML = `<img src="${asset.data}" alt="${asset.name}" />`;
    } else if (asset.type.startsWith('video/')) {
      previewHTML = `<video src="${asset.data}" muted></video>`;
    } else {
      previewHTML = `<span class="asset-icon">📄</span>`;
    }
    
    item.innerHTML = `
      <div class="asset-preview">${previewHTML}</div>
      <div class="asset-name" title="${asset.name}">${asset.name.length > 15 ? asset.name.substring(0, 15) + '...' : asset.name}</div>
      <div class="asset-size">${formatFileSize(asset.size)}</div>
      <button class="btn-remove-asset" data-index="${index}" title="Remove asset">×</button>
    `;
    
    item.querySelector('.btn-remove-asset').addEventListener('click', function(e) {
      e.stopPropagation();
      AppState.data.assets.splice(index, 1);
      renderAssets();
      AppState.saveDraft();
      showToast('🗑️ Asset removed');
    });
    
    // Click to copy URL to clipboard
    item.addEventListener('click', function() {
      navigator.clipboard.writeText(asset.data).then(() => {
        showToast('📋 Asset URL copied to clipboard!');
      }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = asset.data;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('📋 Asset URL copied to clipboard!');
      });
    });
    
    DOM.assetGrid.appendChild(item);
  });
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

// ============================================================
// SKILLS
// ============================================================
function addSkill(skill) {
  if (!skill || !skill.trim()) return;
  const trimmed = skill.trim();
  if (document.querySelector(`.skill-tag[data-skill="${escapeHTML(trimmed)}"]`)) {
    showToast('Skill already exists');
    return;
  }
  
  const tag = document.createElement('span');
  tag.className = 'skill-tag';
  tag.dataset.skill = trimmed;
  tag.innerHTML = `${escapeHTML(trimmed)} <button class="btn-remove-skill" type="button">×</button>`;
  tag.querySelector('.btn-remove-skill').addEventListener('click', () => {
    tag.remove();
    renderPreview();
  });
  
  DOM.skillsList.appendChild(tag);
  DOM.skillInput.value = '';
  DOM.skillInput.focus();
  renderPreview();
}

// ============================================================
// SOCIAL LINKS
// ============================================================
function addSocialRow(platform = 'instagram', url = '') {
  const row = document.createElement('div');
  row.className = 'social-input-row';
  row.innerHTML = `
    <select class="social-platform">
      <option value="instagram" ${platform === 'instagram' ? 'selected' : ''}>Instagram</option>
      <option value="twitter" ${platform === 'twitter' ? 'selected' : ''}>Twitter</option>
      <option value="linkedin" ${platform === 'linkedin' ? 'selected' : ''}>LinkedIn</option>
      <option value="github" ${platform === 'github' ? 'selected' : ''}>GitHub</option>
      <option value="youtube" ${platform === 'youtube' ? 'selected' : ''}>YouTube</option>
      <option value="vimeo" ${platform === 'vimeo' ? 'selected' : ''}>Vimeo</option>
      <option value="behance" ${platform === 'behance' ? 'selected' : ''}>Behance</option>
      <option value="dribbble" ${platform === 'dribbble' ? 'selected' : ''}>Dribbble</option>
    </select>
    <input type="url" class="social-url" placeholder="https://..." value="${escapeHTML(url)}" />
    <button class="btn-remove-social" type="button">×</button>
  `;
  row.querySelector('.btn-remove-social').addEventListener('click', () => {
    if (document.querySelectorAll('.social-input-row').length > 1) {
      row.remove();
      renderPreview();
    } else {
      showToast('You need at least one social link');
    }
  });
  row.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', renderPreview);
    el.addEventListener('change', renderPreview);
  });
  DOM.socialLinks.appendChild(row);
  renderPreview();
}

// ============================================================
// PROFILE UPLOAD
// ============================================================
function setupProfileUpload() {
  DOM.profileUpload.addEventListener('change', function(e) {
    const file = this.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = function(event) {
      const dataUrl = event.target.result;
      DOM.profilePreviewImg.src = dataUrl;
      DOM.profilePreviewImg.style.display = 'block';
      const placeholder = DOM.profilePreview.querySelector('.preview-placeholder');
      if (placeholder) placeholder.style.display = 'none';
      DOM.aboutImage.value = dataUrl;
      collectData();
      renderPreview();
    };
    reader.readAsDataURL(file);
  });
  
  DOM.applyProfileUrl.addEventListener('click', function() {
    const url = DOM.aboutImage.value.trim();
    if (!url) { showToast('Please enter an image URL'); return; }
    DOM.profilePreviewImg.src = url;
    DOM.profilePreviewImg.onload = function() {
      DOM.profilePreviewImg.style.display = 'block';
      const placeholder = DOM.profilePreview.querySelector('.preview-placeholder');
      if (placeholder) placeholder.style.display = 'none';
      collectData();
      renderPreview();
    };
    DOM.profilePreviewImg.onerror = function() {
      showToast('Invalid image URL');
    };
  });
  
  DOM.removeProfileImage.addEventListener('click', function() {
    DOM.profilePreviewImg.src = '';
    DOM.profilePreviewImg.style.display = 'none';
    const placeholder = DOM.profilePreview.querySelector('.preview-placeholder');
    if (placeholder) placeholder.style.display = 'flex';
    DOM.aboutImage.value = '';
    DOM.profileUpload.value = '';
    collectData();
    renderPreview();
  });
}

// ============================================================
// PREVIEW
// ============================================================
function renderPreview() {
  if (!AppState.previewOpen) return;
  collectData();
  const html = generatePortfolioHTML();
  DOM.previewFrame.innerHTML = html;
}

function togglePreview() {
  AppState.previewOpen = !AppState.previewOpen;
  DOM.previewPanel.classList.toggle('open', AppState.previewOpen);
  if (AppState.previewOpen) {
    collectData();
    renderPreview();
  }
}

// ============================================================
// PORTFOLIO GENERATOR
// ============================================================
function generatePortfolioHTML() {
  collectData();
  const d = AppState.data;
  const design = d.design;
  
  const themeColors = {
    light: { bg: '#f8f6f2', text: '#1a1a1a', card: '#ffffff', border: '#e8e0d8' },
    dark: { bg: '#1a1a1a', text: '#f8f6f2', card: '#2a2a2a', border: '#3a3a3a' },
    warm: { bg: '#fcf6f0', text: '#2c1a10', card: '#fffaf5', border: '#ead8c8' },
    forest: { bg: '#f0f5ee', text: '#1a2a1a', card: '#ffffff', border: '#d0ddd0' },
    ocean: { bg: '#f0f5f8', text: '#0a1a2a', card: '#ffffff', border: '#c8d8e0' }
  };
  
  const colors = themeColors[design.theme] || themeColors.light;
  
  const fonts = {
    modern: { display: "'DM Serif Display', Georgia, serif", body: "'Inter', sans-serif" },
    classic: { display: "'Playfair Display', Georgia, serif", body: "'Inter', sans-serif" },
    minimal: { display: "'Inter', sans-serif", body: "'Inter', sans-serif" },
    playful: { display: "'DM Serif Display', Georgia, serif", body: "'Inter', sans-serif" }
  };
  
  const font = fonts[design.typography] || fonts.modern;
  
  const heroAlign = design.heroLayout === 'center' ? 'center' : design.heroLayout === 'split' ? 'space-between' : 'flex-start';
  const heroTextAlign = design.heroLayout === 'center' ? 'center' : 'left';
  
  // Generate projects with blocks
  let projectsHTML = '';
  d.projects.forEach(p => {
    let blocksHTML = '';
    (p.blocks || []).forEach(block => {
      const content = block.content || '';
      switch(block.type) {
        case 'image':
          blocksHTML += `<div class="block-image"><img src="${escapeHTML(content)}" alt="Project image" /></div>`;
          break;
        case 'video':
          blocksHTML += `<div class="block-video"><video src="${escapeHTML(content)}" controls></video></div>`;
          break;
        case 'text':
          blocksHTML += `<div class="block-text">${escapeHTML(content)}</div>`;
          break;
        case 'embed':
          blocksHTML += `<div class="block-embed"><iframe src="${escapeHTML(content)}" allowfullscreen></iframe></div>`;
          break;
        case 'gallery':
          const images = content.split(',').map(s => s.trim()).filter(Boolean);
          blocksHTML += `<div class="block-gallery">${images.map(img => `<img src="${escapeHTML(img)}" />`).join('')}</div>`;
          break;
        case 'pdf':
          blocksHTML += `<div class="block-pdf"><iframe src="${escapeHTML(content)}" style="width:100%;height:400px;"></iframe></div>`;
          break;
        case 'code':
          blocksHTML += `<div class="block-code"><pre><code>${escapeHTML(content)}</code></pre></div>`;
          break;
        case 'audio':
          blocksHTML += `<div class="block-audio"><audio controls src="${escapeHTML(content)}"></audio></div>`;
          break;
        case 'button':
          blocksHTML += `<div class="block-button"><a href="#" class="btn">${escapeHTML(content)}</a></div>`;
          break;
        case 'custom':
          blocksHTML += `<div class="block-custom">${escapeHTML(content)}</div>`;
          break;
        default:
          blocksHTML += `<div class="block-text">${escapeHTML(content)}</div>`;
      }
    });
    
    projectsHTML += `
      <div class="project-card">
        <div class="project-header">
          <h3 class="project-title">${escapeHTML(p.title)}</h3>
          <span class="project-meta">${escapeHTML(p.category)} ${p.year ? '· ' + escapeHTML(p.year) : ''}</span>
          <p class="project-desc">${escapeHTML(p.description)}</p>
        </div>
        <div class="project-blocks">
          ${blocksHTML}
        </div>
      </div>
    `;
  });
  
  // Skills
  const skillsHTML = d.skills.map(s => `<span class="skill-tag">${escapeHTML(s)}</span>`).join('');
  
  // Social
  const socialHTML = d.social.map(s => 
    `<a href="${escapeHTML(s.url)}" target="_blank" rel="noopener">${s.platform.charAt(0).toUpperCase() + s.platform.slice(1)}</a>`
  ).join('');
  
  const email = d.contactEmail || d.email;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHTML(d.fullName)} — Portfolio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg: ${colors.bg};
      --text: ${colors.text};
      --card: ${colors.card};
      --border: ${colors.border};
      --accent: ${design.accentColor};
      --radius: ${design.borderRadius}px;
      --font-display: ${font.display};
      --font-body: ${font.body};
      --accent-light: color-mix(in srgb, var(--accent) 10%, transparent);
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: var(--font-body); background: var(--bg); color: var(--text); line-height: 1.7; padding-top: 70px; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
    
    .site-header {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      background: rgba(255,255,255,0.85); backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
      padding: 16px 24px; display: flex; justify-content: space-between; align-items: center;
      max-width: 1100px; margin: 0 auto;
    }
    .logo { font-family: var(--font-display); font-size: 1.4rem; font-weight: 600; color: var(--text); text-decoration: none; }
    .logo span { color: var(--accent); }
    .nav-list { display: flex; gap: 24px; list-style: none; }
    .nav-list a { color: var(--text); text-decoration: none; font-size: 0.85rem; font-weight: 500; border-bottom: 2px solid transparent; transition: border-color 0.3s; }
    .nav-list a:hover { border-color: var(--accent); }
    
    .hero { min-height: 60vh; display: flex; align-items: center; padding: 60px 0; text-align: ${heroTextAlign}; }
    .hero-content { max-width: 720px; ${heroAlign === 'center' ? 'margin: 0 auto;' : ''} }
    .hero-name { font-family: var(--font-display); font-size: clamp(3rem, 8vw, 5rem); font-weight: 600; line-height: 1.05; margin-bottom: 8px; }
    .hero-title { font-size: 1.4rem; color: var(--accent); font-weight: 400; margin-bottom: 8px; }
    .hero-tagline { font-size: 1.1rem; color: var(--text-secondary); max-width: 520px; ${heroAlign === 'center' ? 'margin: 0 auto;' : ''} }
    .hero-meta { display: flex; gap: 16px 32px; flex-wrap: wrap; margin-top: 20px; font-size: 0.9rem; color: var(--text-secondary); justify-content: ${heroAlign === 'center' ? 'center' : 'flex-start'}; }
    
    section { padding: 60px 0; }
    .section-header { margin-bottom: 32px; ${heroAlign === 'center' ? 'text-align: center;' : ''} }
    .section-number { font-size: 0.75rem; font-weight: 600; color: var(--accent); text-transform: uppercase; letter-spacing: 0.08em; }
    .section-title { font-family: var(--font-display); font-size: 2.2rem; font-weight: 400; margin-top: 4px; }
    
    .project-card {
      background: var(--card);
      border-radius: var(--radius);
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      transition: transform 0.3s;
    }
    .project-card:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
    .project-title { font-family: var(--font-display); font-size: 1.4rem; font-weight: 600; }
    .project-meta { font-size: 0.85rem; color: var(--text-secondary); display: block; }
    .project-desc { font-size: 1rem; color: var(--text-secondary); margin-top: 8px; }
    .project-blocks { margin-top: 16px; display: flex; flex-direction: column; gap: 16px; }
    .project-blocks img { max-width: 100%; border-radius: var(--radius); }
    .project-blocks video { max-width: 100%; border-radius: var(--radius); }
    .project-blocks iframe { width: 100%; border-radius: var(--radius); min-height: 400px; }
    .block-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
    .block-gallery img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: var(--radius); }
    .block-code pre { background: var(--bg); padding: 16px; border-radius: var(--radius); overflow: auto; font-size: 0.85rem; }
    .block-button .btn { display: inline-block; padding: 10px 24px; background: var(--accent); color: white; border-radius: var(--radius); text-decoration: none; transition: background 0.3s; }
    .block-button .btn:hover { background: var(--accent-hover); }
    
    .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
    .about-text p { font-size: 1.05rem; font-weight: 300; line-height: 1.8; margin-bottom: 16px; }
    .about-image { border-radius: var(--radius); overflow: hidden; background: var(--border); aspect-ratio: 3/4; }
    .about-image img { width: 100%; height: 100%; object-fit: cover; }
    .about-image .placeholder { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 4rem; color: var(--text-secondary); }
    .skills-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .skill-tag { padding: 6px 14px; background: var(--accent-light); color: var(--accent); border-radius: 100px; font-size: 0.85rem; font-weight: 500; }
    
    .contact-section { text-align: center; }
    .contact-email { font-family: var(--font-display); font-size: clamp(1.8rem, 4vw, 3rem); color: var(--accent); text-decoration: none; display: inline-block; border-bottom: 2px solid transparent; transition: border-color 0.3s; }
    .contact-email:hover { border-color: var(--accent); }
    .contact-note { color: var(--text-secondary); margin-top: 8px; }
    
    .footer { padding: 32px 0 20px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .footer-copy { color: var(--text-secondary); font-size: 0.85rem; }
    .footer-social { display: flex; gap: 16px; }
    .footer-social a { color: var(--text-secondary); text-decoration: none; font-size: 0.85rem; transition: color 0.3s; }
    .footer-social a:hover { color: var(--accent); }
    
    ${d.advanced.customCSS}
    
    @media (max-width: 768px) {
      .about-grid { grid-template-columns: 1fr; }
      .site-header { flex-wrap: wrap; gap: 12px; }
      .nav-list { gap: 16px; flex-wrap: wrap; }
      .hero { padding: 40px 0; min-height: auto; }
      section { padding: 40px 0; }
      .contact-email { font-size: 1.6rem; }
      .project-blocks iframe { min-height: 250px; }
    }
    @media (max-width: 480px) {
      .container { padding: 0 16px; }
      .nav-list { gap: 12px; }
      .nav-list a { font-size: 0.75rem; }
      .hero-name { font-size: 2.4rem; }
      .section-title { font-size: 1.6rem; }
    }
  </style>
</head>
<body>
  <header class="site-header">
    <a href="#" class="logo">${escapeHTML(d.fullName.split(' ').map(n => n[0]).join(''))}<span>.</span></a>
    <nav>
      <ul class="nav-list">
        <li><a href="#work">Work</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <div style="font-size:3rem;margin-bottom:8px;">${d.avatarEmoji || '🎨'}</div>
          <h1 class="hero-name">${escapeHTML(d.fullName)}</h1>
          <p class="hero-title">${escapeHTML(d.title || 'Creative Professional')}</p>
          <p class="hero-tagline">${escapeHTML(d.tagline || '')}</p>
          <div class="hero-meta">
            ${d.location ? `<span>📍 ${escapeHTML(d.location)}</span>` : ''}
            ${d.experienceYears ? `<span>📅 ${escapeHTML(d.experienceYears)} years</span>` : ''}
            <span>✉️ ${escapeHTML(email)}</span>
          </div>
        </div>
      </div>
    </section>
    <section id="work">
      <div class="container">
        <div class="section-header">
          <span class="section-number">01</span>
          <h2 class="section-title">Work</h2>
        </div>
        ${projectsHTML || '<p style="text-align:center;color:var(--text-secondary);">No projects added yet.</p>'}
      </div>
    </section>
    <section id="about">
      <div class="container">
        <div class="section-header">
          <span class="section-number">02</span>
          <h2 class="section-title">About</h2>
        </div>
        <div class="about-grid">
          <div class="about-text">
            ${d.aboutHeadline ? `<h3 style="font-family:var(--font-display);font-weight:400;font-size:1.4rem;margin-bottom:8px;">${escapeHTML(d.aboutHeadline)}</h3>` : ''}
            ${d.aboutStory ? d.aboutStory.split('\n').filter(p => p.trim()).map(p => `<p>${escapeHTML(p)}</p>`).join('') : '<p>Add your story in the builder.</p>'}
            ${skillsHTML ? `<div style="margin-top:24px;"><h4 style="font-weight:600;font-size:0.85rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-secondary);">Skills</h4><div class="skills-tags">${skillsHTML}</div></div>` : ''}
          </div>
          <div class="about-image">
            ${d.aboutImage ? `<img src="${escapeHTML(d.aboutImage)}" alt="${escapeHTML(d.fullName)}" />` : `<div class="placeholder">${d.avatarEmoji || '📸'}</div>`}
          </div>
        </div>
      </div>
    </section>
    <section id="contact" class="contact-section">
      <div class="container">
        <div class="section-header">
          <span class="section-number">03</span>
          <h2 class="section-title">Let's Connect</h2>
        </div>
        <a href="mailto:${escapeHTML(email)}" class="contact-email">${escapeHTML(email)}</a>
        <p class="contact-note">${escapeHTML(d.contactNote || 'Available for collaborations.')}</p>
      </div>
    </section>
  </main>
  <footer>
    <div class="container">
      <div class="footer">
        <span class="footer-copy">${escapeHTML(d.advanced.footerText || '© ' + new Date().getFullYear() + ' ' + d.fullName)}</span>
        <div class="footer-social">${socialHTML}</div>
      </div>
    </div>
  </footer>
  ${d.advanced.customJS ? `<script>${d.advanced.customJS}<\/script>` : ''}
</body>
</html>`;
}

// ============================================================
// GENERATE & DOWNLOAD
// ============================================================
function generatePortfolio() {
  collectData();
  
  if (!AppState.data.fullName) {
    showToast('Please enter your name first');
    return;
  }
  if (!AppState.data.email && !AppState.data.contactEmail) {
    showToast('Please enter an email address');
    return;
  }
  
  const html = generatePortfolioHTML();
  AppState.generatedHTML = html;
  DOM.outputContent.textContent = html;
  DOM.successModal.classList.add('open');
}

function downloadPortfolio() {
  if (!AppState.generatedHTML) {
    showToast('Please generate a portfolio first');
    return;
  }
  
  const blob = new Blob([AppState.generatedHTML], { type: 'text/html' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'portfolio.html';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
  showToast('📄 Portfolio downloaded!');
}

// ============================================================
// TOAST
// ============================================================
function showToast(message) {
  const container = DOM.toastContainer;
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ============================================================
// COPY CODE
// ============================================================
function copyCode() {
  const code = DOM.outputContent.textContent;
  navigator.clipboard.writeText(code).then(() => {
    showToast('📋 Code copied to clipboard!');
  }).catch(() => {
    const textarea = document.createElement('textarea');
    textarea.value = code;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('📋 Code copied to clipboard!');
  });
}

// ============================================================
// EVENT LISTENERS
// ============================================================
function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.step));
  });
  
  document.querySelectorAll('.btn-next').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.next;
      if (next && validateStep(AppState.currentStep)) {
        navigateTo(next);
      }
    });
  });
  
  document.querySelectorAll('.btn-prev').forEach(btn => {
    btn.addEventListener('click', () => {
      const prev = btn.dataset.prev;
      if (prev) navigateTo(prev);
    });
  });
  
  // Theme
  DOM.themeSelector.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.themeSelector.querySelectorAll('.theme-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPreview();
    });
  });
  
  // Accent color
  DOM.accentColor.addEventListener('input', () => {
    DOM.accentColorHex.value = DOM.accentColor.value;
    renderPreview();
  });
  
  DOM.accentColorHex.addEventListener('input', () => {
    if (/^#[0-9a-f]{6}$/i.test(DOM.accentColorHex.value)) {
      DOM.accentColor.value = DOM.accentColorHex.value;
      renderPreview();
    }
  });
  
  // Border radius
  DOM.borderRadius.addEventListener('input', () => {
    DOM.radiusValue.textContent = `${DOM.borderRadius.value}px`;
    renderPreview();
  });
  
  // Design selects
  [DOM.typography, DOM.heroLayout].forEach(el => {
    el.addEventListener('change', renderPreview);
  });
  
  // Preview
  DOM.previewToggle.addEventListener('click', togglePreview);
  DOM.closePreview.addEventListener('click', togglePreview);
  
  // Generate
  DOM.generateBtn.addEventListener('click', generatePortfolio);
  DOM.generateFinalBtn.addEventListener('click', generatePortfolio);
  
  // Download
  DOM.downloadBtn.addEventListener('click', downloadPortfolio);
  
  // Modal
  DOM.successClose.addEventListener('click', () => {
    DOM.successModal.classList.remove('open');
  });
  
  DOM.successModal.addEventListener('click', (e) => {
    if (e.target === DOM.successModal) {
      DOM.successModal.classList.remove('open');
    }
  });
  
  // Copy
  DOM.copyBtn.addEventListener('click', copyCode);
  
  // Show code
  DOM.showCodeBtn.addEventListener('click', () => {
    const isVisible = DOM.codeContainer.style.display !== 'none';
    DOM.codeContainer.style.display = isVisible ? 'none' : 'block';
    DOM.showCodeBtn.textContent = isVisible ? 'View Source Code' : 'Hide Source Code';
  });
  
  // Add project
  DOM.addProjectBtn.addEventListener('click', () => addProject());
  
  // Add skill
  DOM.addSkillBtn.addEventListener('click', () => addSkill(DOM.skillInput.value));
  DOM.skillInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(DOM.skillInput.value);
    }
  });
  
  // Add social
  DOM.addSocialBtn.addEventListener('click', () => addSocialRow());
  
  // Mobile menu
  DOM.menuToggle.addEventListener('click', () => {
    const expanded = DOM.menuToggle.getAttribute('aria-expanded') === 'true' ? false : true;
    DOM.menuToggle.setAttribute('aria-expanded', expanded);
    DOM.sidebar.classList.toggle('open', expanded);
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (DOM.successModal.classList.contains('open')) {
        DOM.successModal.classList.remove('open');
      }
      if (AppState.previewOpen) {
        togglePreview();
      }
    }
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      togglePreview();
    }
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      collectData();
      showToast('💾 Draft saved');
    }
  });
  
  // Auto-save
  document.querySelectorAll('input, textarea, select').forEach(el => {
    el.addEventListener('input', collectData);
    el.addEventListener('change', collectData);
  });
}

// ============================================================
// INIT
// ============================================================
function init() {
  cacheDOM();
  
  // Load draft
  AppState.loadDraft();
  
  // Add default project with blocks
  addProject({
    title: 'Featured Project',
    description: 'A showcase of your best work.',
    category: 'Design',
    year: '2024',
    blocks: [
      { type: 'text', content: 'This is a featured project that demonstrates the flexible block system. You can add images, videos, embeds, and more.' },
      { type: 'image', content: '' }
    ]
  });
  
  addProject({
    title: 'Second Project',
    description: 'Another great project worth sharing.',
    category: 'Development',
    year: '2024',
    blocks: [
      { type: 'text', content: 'Every project can have multiple content blocks in any order.' }
    ]
  });
  
  // Add default social links
  addSocialRow('instagram', '');
  addSocialRow('github', '');
  
  // Setup profile upload
  setupProfileUpload();
  
  // Setup asset manager
  setupAssetManager();
  
  // Set initial step
  navigateTo('identity');
  
  // Setup events
  setupEventListeners();
  
  console.log('✨ Portfolio Builder Universal Platform initialized!');
  console.log('📝 Build your portfolio with flexible content blocks.');
  console.log('🖼️ Upload assets and use them across projects.');
  console.log('💡 Tip: Press Ctrl+S to save your draft');
}

// Start
document.addEventListener('DOMContentLoaded', init);
