/**
 * Portfolio Builder Pro — Next Level Version
 * Enhanced with more customization options, templates, and advanced settings
 */

// ============================================================
// STATE MANAGEMENT
// ============================================================
const AppState = {
  currentStep: 'identity',
  previewDevice: 'desktop',
  previewOpen: false,
  generatedHTML: null,
  STORAGE_KEY: 'portfolio_builder_pro_draft',
  
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
    aboutImageAlt: '',
    experienceYears: '',
    projects: [],
    skills: [],
    skillCategory: '',
    skillLevel: 'none',
    contactEmail: '',
    contactNote: '',
    social: [],
    design: {
      theme: 'light',
      accentColor: '#d46a4a',
      typography: 'modern',
      heroLayout: 'left',
      navStyle: 'underline',
      cardStyle: 'elevated',
      borderRadius: 12,
      spacing: 50,
      animationLevel: 'moderate',
      containerWidth: 'medium'
    },
    template: 'minimal',
    advanced: {
      customCSS: '',
      customJS: '',
      metaTitle: '',
      metaDescription: '',
      footerText: '',
      showYearInFooter: true,
      enableAnalytics: false,
      analyticsId: ''
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
    } catch (e) {
      console.warn('Could not load draft:', e);
    }
    return false;
  },
  
  saveDraft() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Could not save draft:', e);
    }
  },
  
  clearDraft() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      console.warn('Could not clear draft:', e);
    }
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
  DOM.previewDevices = document.querySelectorAll('.preview-device');
  DOM.successModal = document.getElementById('successModal');
  DOM.successClose = document.getElementById('successClose');
  DOM.outputContent = document.getElementById('outputContent');
  DOM.copyBtn = document.getElementById('copyBtn');
  DOM.showCodeBtn = document.getElementById('showCodeBtn');
  DOM.codeContainer = document.getElementById('codeContainer');
  DOM.generateBtn = document.getElementById('generateBtn');
  DOM.exportBtn = document.getElementById('exportBtn');
  DOM.generateFinalBtn = document.getElementById('generateFinalBtn');
  DOM.downloadHtmlBtn = document.getElementById('downloadHtmlBtn');
  DOM.resetBtn = document.getElementById('resetBtn');
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
  DOM.spacing = document.getElementById('spacing');
  DOM.spacingValue = document.getElementById('spacingValue');
  DOM.typography = document.getElementById('typography');
  DOM.heroLayout = document.getElementById('heroLayout');
  DOM.navStyle = document.getElementById('navStyle');
  DOM.cardStyle = document.getElementById('cardStyle');
  DOM.animationLevel = document.getElementById('animationLevel');
  DOM.containerWidth = document.getElementById('containerWidth');
  DOM.fullName = document.getElementById('fullName');
  DOM.title = document.getElementById('title');
  DOM.tagline = document.getElementById('tagline');
  DOM.location = document.getElementById('location');
  DOM.email = document.getElementById('email');
  DOM.avatarEmoji = document.getElementById('avatarEmoji');
  DOM.aboutHeadline = document.getElementById('aboutHeadline');
  DOM.aboutStory = document.getElementById('aboutStory');
  DOM.aboutImage = document.getElementById('aboutImage');
  DOM.aboutImageAlt = document.getElementById('aboutImageAlt');
  DOM.experienceYears = document.getElementById('experienceYears');
  DOM.contactEmail = document.getElementById('contactEmail');
  DOM.contactNote = document.getElementById('contactNote');
  DOM.skillCategory = document.getElementById('skillCategory');
  DOM.skillLevel = document.getElementById('skillLevel');
  DOM.customCSS = document.getElementById('customCSS');
  DOM.customJS = document.getElementById('customJS');
  DOM.metaTitle = document.getElementById('metaTitle');
  DOM.metaDescription = document.getElementById('metaDescription');
  DOM.footerText = document.getElementById('footerText');
  DOM.showYearInFooter = document.getElementById('showYearInFooter');
  DOM.enableAnalytics = document.getElementById('enableAnalytics');
  DOM.analyticsId = document.getElementById('analyticsId');
  DOM.templateGrid = document.getElementById('templateGrid');
  DOM.templateCards = document.querySelectorAll('.template-card');
  DOM.toastContainer = document.getElementById('toastContainer');
}

// ============================================================
// STEPS
// ============================================================
const STEPS = ['identity', 'about', 'projects', 'skills', 'contact', 'design', 'templates', 'advanced'];
const STEP_TITLES = {
  identity: 'Identity',
  about: 'About',
  projects: 'Projects',
  skills: 'Skills',
  contact: 'Contact',
  design: 'Design',
  templates: 'Templates',
  advanced: 'Advanced'
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
    const isActive = el.dataset.step === step;
    el.classList.toggle('active', isActive);
    el.setAttribute('aria-selected', isActive);
  });
  
  DOM.stepTitle.textContent = STEP_TITLES[step];
  DOM.stepBadge.textContent = `${STEPS.indexOf(step) + 1} / ${STEPS.length}`;
  
  if (AppState.previewOpen) {
    renderPreview();
  }
  
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
  switch(step) {
    case 'identity':
      const name = DOM.fullName.value.trim();
      const email = DOM.email.value.trim();
      if (!name) {
        if (!silent) showToast('Please enter your name');
        return false;
      }
      if (!email || !email.includes('@')) {
        if (!silent) showToast('Please enter a valid email');
        return false;
      }
      return true;
    case 'contact':
      const contactEmail = DOM.contactEmail.value.trim();
      if (contactEmail && !contactEmail.includes('@')) {
        if (!silent) showToast('Please enter a valid email');
        return false;
      }
      return true;
    default:
      return true;
  }
}

// ============================================================
// SANITIZATION (XSS Prevention)
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
  AppState.data.aboutImageAlt = sanitizeString(DOM.aboutImageAlt.value.trim());
  AppState.data.experienceYears = DOM.experienceYears.value.trim();
  AppState.data.contactEmail = sanitizeString(DOM.contactEmail.value.trim());
  AppState.data.contactNote = sanitizeString(DOM.contactNote.value.trim());
  AppState.data.skillCategory = sanitizeString(DOM.skillCategory.value.trim());
  AppState.data.skillLevel = DOM.skillLevel.value;
  
  AppState.data.projects = [];
  document.querySelectorAll('.project-card').forEach(card => {
    const title = card.querySelector('.project-title-input')?.value || '';
    const image = card.querySelector('.project-image-input')?.value || '';
    AppState.data.projects.push({
      title: sanitizeString(title),
      description: sanitizeString(card.querySelector('.project-desc-input')?.value || ''),
      category: sanitizeString(card.querySelector('.project-category-input')?.value || ''),
      year: sanitizeString(card.querySelector('.project-year-input')?.value || ''),
      image: sanitizeURL(image),
      github: sanitizeURL(card.querySelector('.project-github-input')?.value || ''),
      live: sanitizeURL(card.querySelector('.project-live-input')?.value || ''),
      featured: card.querySelector('.project-featured-input')?.checked || false
    });
  });
  
  AppState.data.skills = [];
  document.querySelectorAll('.skill-tag').forEach(tag => {
    AppState.data.skills.push(tag.dataset.skill);
  });
  
  AppState.data.social = [];
  document.querySelectorAll('.social-input-row').forEach(row => {
    const platform = row.querySelector('.social-platform')?.value || '';
    const url = sanitizeURL(row.querySelector('.social-url')?.value || '');
    if (platform && url) {
      AppState.data.social.push({ platform, url });
    }
  });
  
  const activeTheme = document.querySelector('.theme-option.active');
  AppState.data.design.theme = activeTheme?.dataset.theme || 'light';
  AppState.data.design.accentColor = DOM.accentColor.value;
  AppState.data.design.typography = DOM.typography.value;
  AppState.data.design.heroLayout = DOM.heroLayout.value;
  AppState.data.design.navStyle = DOM.navStyle.value;
  AppState.data.design.cardStyle = DOM.cardStyle.value;
  AppState.data.design.borderRadius = parseInt(DOM.borderRadius.value) || 12;
  AppState.data.design.spacing = parseInt(DOM.spacing.value) || 50;
  AppState.data.design.animationLevel = DOM.animationLevel.value;
  AppState.data.design.containerWidth = DOM.containerWidth.value;
  
  const activeTemplate = document.querySelector('.template-card.active');
  AppState.data.template = activeTemplate?.dataset.template || 'minimal';
  
  AppState.data.advanced.customCSS = DOM.customCSS.value;
  AppState.data.advanced.customJS = DOM.customJS.value;
  AppState.data.advanced.metaTitle = DOM.metaTitle.value;
  AppState.data.advanced.metaDescription = DOM.metaDescription.value;
  AppState.data.advanced.footerText = DOM.footerText.value;
  AppState.data.advanced.showYearInFooter = DOM.showYearInFooter.checked;
  AppState.data.advanced.enableAnalytics = DOM.enableAnalytics.checked;
  AppState.data.advanced.analyticsId = DOM.analyticsId.value;
  
  AppState.saveDraft();
}

// ============================================================
// PROJECTS
// ============================================================
function addProject(projectData = null) {
  const card = document.createElement('div');
  card.className = 'project-card';
  card.setAttribute('role', 'listitem');
  
  const p = projectData || { 
    title: '', description: '', category: '', year: '', 
    image: '', github: '', live: '', featured: false 
  };
  
  card.innerHTML = `
    <button class="btn-remove-project" type="button" aria-label="Remove project">×</button>
    <div class="form-grid two-col">
      <div class="form-group">
        <label>Project Title</label>
        <input type="text" class="project-title-input" placeholder="e.g., Silent Streets" value="${escapeHTML(p.title)}" />
      </div>
      <div class="form-group">
        <label>Category</label>
        <input type="text" class="project-category-input" placeholder="e.g., Photography" value="${escapeHTML(p.category)}" />
      </div>
    </div>
    <div class="form-group">
      <label>Description</label>
      <input type="text" class="project-desc-input" placeholder="What was this project about?" value="${escapeHTML(p.description)}" />
    </div>
    <div class="form-grid two-col">
      <div class="form-group">
        <label>Year</label>
        <input type="text" class="project-year-input" placeholder="e.g., 2024" value="${escapeHTML(p.year)}" />
      </div>
      <div class="form-group">
        <label>Image URL</label>
        <input type="url" class="project-image-input" placeholder="https://..." value="${escapeHTML(p.image)}" />
      </div>
    </div>
    <div class="form-grid two-col">
      <div class="form-group">
        <label>GitHub Link</label>
        <input type="url" class="project-github-input" placeholder="https://github.com/..." value="${escapeHTML(p.github)}" />
      </div>
      <div class="form-group">
        <label>Live Link</label>
        <input type="url" class="project-live-input" placeholder="https://..." value="${escapeHTML(p.live)}" />
      </div>
    </div>
    <div class="project-featured">
      <input type="checkbox" class="project-featured-input" ${p.featured ? 'checked' : ''} id="featured-${Date.now()}" />
      <label for="featured-${Date.now()}">Featured Project (spans 2 columns)</label>
    </div>
  `;
  
  card.querySelector('.btn-remove-project').addEventListener('click', () => {
    if (document.querySelectorAll('.project-card').length > 1) {
      card.remove();
      renderPreview();
      updateStatus();
    } else {
      showToast('You need at least one project');
    }
  });
  
  card.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
      renderPreview();
      updateStatus();
    });
    input.addEventListener('change', () => {
      renderPreview();
      updateStatus();
    });
  });
  
  DOM.projectsList.appendChild(card);
  renderPreview();
  updateStatus();
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
  tag.setAttribute('role', 'listitem');
  tag.innerHTML = `
    ${escapeHTML(trimmed)}
    <button class="btn-remove-skill" type="button" aria-label="Remove skill">×</button>
  `;
  
  tag.querySelector('.btn-remove-skill').addEventListener('click', () => {
    tag.remove();
    renderPreview();
    updateStatus();
  });
  
  DOM.skillsList.appendChild(tag);
  DOM.skillInput.value = '';
  DOM.skillInput.focus();
  renderPreview();
  updateStatus();
}

// ============================================================
// SOCIAL LINKS
// ============================================================
function addSocialRow(platform = 'instagram', url = '') {
  const row = document.createElement('div');
  row.className = 'social-input-row';
  row.setAttribute('role', 'listitem');
  row.innerHTML = `
    <select class="social-platform" aria-label="Social platform">
      <option value="instagram" ${platform === 'instagram' ? 'selected' : ''}>Instagram</option>
      <option value="twitter" ${platform === 'twitter' ? 'selected' : ''}>Twitter</option>
      <option value="linkedin" ${platform === 'linkedin' ? 'selected' : ''}>LinkedIn</option>
      <option value="github" ${platform === 'github' ? 'selected' : ''}>GitHub</option>
      <option value="youtube" ${platform === 'youtube' ? 'selected' : ''}>YouTube</option>
      <option value="vimeo" ${platform === 'vimeo' ? 'selected' : ''}>Vimeo</option>
      <option value="behance" ${platform === 'behance' ? 'selected' : ''}>Behance</option>
      <option value="dribbble" ${platform === 'dribbble' ? 'selected' : ''}>Dribbble</option>
      <option value="facebook" ${platform === 'facebook' ? 'selected' : ''}>Facebook</option>
    </select>
    <input type="url" class="social-url" placeholder="https://..." value="${escapeHTML(url)}" aria-label="Social link URL" />
    <button class="btn-remove-social" type="button" aria-label="Remove social link">×</button>
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

function setDevice(device) {
  AppState.previewDevice = device;
  DOM.previewDevices.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.device === device);
  });
  DOM.previewFrame.className = 'preview-frame' + (device !== 'desktop' ? ` device-${device}` : '');
}

// ============================================================
// PORTFOLIO GENERATOR
// ============================================================
function generatePortfolioHTML() {
  collectData();
  const d = AppState.data;
  const design = d.design;
  
  // Theme colors with more options
  const themeColors = {
    light: { bg: '#f8f6f2', text: '#1a1a1a', card: '#ffffff', border: '#e8e0d8' },
    dark: { bg: '#1a1a1a', text: '#f8f6f2', card: '#2a2a2a', border: '#3a3a3a' },
    warm: { bg: '#fcf6f0', text: '#2c1a10', card: '#fffaf5', border: '#ead8c8' },
    forest: { bg: '#f0f5ee', text: '#1a2a1a', card: '#ffffff', border: '#d0ddd0' },
    ocean: { bg: '#f0f5f8', text: '#0a1a2a', card: '#ffffff', border: '#c8d8e0' },
    sunset: { bg: '#fdf6f0', text: '#2a1a0a', card: '#fffaf5', border: '#f0d8c8' },
    monochrome: { bg: '#f5f5f5', text: '#1a1a1a', card: '#ffffff', border: '#d0d0d0' }
  };
  
  const colors = themeColors[design.theme] || themeColors.light;
  
  // Typography options
  const fonts = {
    modern: { display: "'DM Serif Display', Georgia, serif", body: "'Inter', sans-serif" },
    classic: { display: "'Playfair Display', Georgia, serif", body: "'Inter', sans-serif" },
    minimal: { display: "'Inter', sans-serif", body: "'Inter', sans-serif" },
    playful: { display: "'DM Serif Display', Georgia, serif", body: "'Inter', sans-serif" },
    editorial: { display: "'Cormorant Garamond', Georgia, serif", body: "'Inter', sans-serif" },
    tech: { display: "'Space Grotesk', sans-serif", body: "'Inter', sans-serif" }
  };
  
  const font = fonts[design.typography] || fonts.modern;
  
  // Navigation styles
  const navStyles = {
    underline: 'border-bottom: 2px solid transparent; transition: border-color 0.3s;',
    pill: 'padding: 8px 16px; border-radius: 100px; background: transparent; transition: background 0.3s;',
    minimal: 'font-weight: 400; opacity: 0.7; transition: opacity 0.3s;',
    bold: 'font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;'
  };
  
  const navStyle = navStyles[design.navStyle] || navStyles.underline;
  
  // Card styles
  const cardStyles = {
    elevated: 'box-shadow: 0 8px 30px rgba(0,0,0,0.08);',
    flat: 'box-shadow: none; border: 1px solid var(--border);',
    border: 'border: 2px solid var(--border); box-shadow: none;',
    glass: 'background: rgba(255,255,255,0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.3);',
    minimal: 'box-shadow: none; border: none; background: transparent;'
  };
  
  const cardStyle = cardStyles[design.cardStyle] || cardStyles.elevated;
  
  // Container width
  const containerWidths = {
    narrow: '800px',
    medium: '1100px',
    wide: '1300px',
    full: '100%'
  };
  
  const containerWidth = containerWidths[design.containerWidth] || '1100px';
  
  // Spacing
  const spacing = Math.round(20 + (design.spacing / 100) * 60);
  
  // Hero layout
  const heroAlign = design.heroLayout === 'center' ? 'center' : design.heroLayout === 'split' ? 'space-between' : 'flex-start';
  const heroTextAlign = design.heroLayout === 'center' ? 'center' : design.heroLayout === 'split' ? 'left' : 'left';
  
  // Animation level
  const animLevels = {
    none: 'transition: none;',
    subtle: 'transition: all 0.3s ease;',
    moderate: 'transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);',
    dynamic: 'transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);'
  };
  
  const anim = animLevels[design.animationLevel] || animLevels.moderate;
  
  // Build projects HTML
  let projectsHTML = '';
  d.projects.forEach(p => {
    const featuredClass = p.featured ? 'featured' : '';
    const imageHTML = p.image ? `<img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.title)}" />` : `<span class="placeholder-label">📷 ${escapeHTML(p.title)}</span>`;
    
    projectsHTML += `
      <div class="project-card ${featuredClass}">
        <div class="project-thumb">${imageHTML}</div>
        <div class="project-info">
          <h3 class="project-title">${escapeHTML(p.title)}</h3>
          <span class="project-meta">${escapeHTML(p.category)} ${p.year ? '· ' + escapeHTML(p.year) : ''}</span>
          <p class="project-note">${escapeHTML(p.description)}</p>
          <div class="project-links">
            ${p.github ? `<a href="${escapeHTML(p.github)}" target="_blank" rel="noopener">GitHub</a>` : ''}
            ${p.live ? `<a href="${escapeHTML(p.live)}" target="_blank" rel="noopener">Live Demo</a>` : ''}
          </div>
        </div>
      </div>
    `;
  });
  
  // Build skills HTML
  let skillsHTML = '';
  if (d.skills.length > 0) {
    if (d.skillLevel === 'bars') {
      skillsHTML = d.skills.map(s => `
        <div class="skill-bar">
          <span class="skill-name">${escapeHTML(s)}</span>
          <div class="skill-bar-track">
            <div class="skill-bar-fill" style="width: ${Math.floor(Math.random() * 40 + 60)}%"></div>
          </div>
        </div>
      `).join('');
    } else {
      skillsHTML = d.skills.map(s => `<span class="skill-tag">${escapeHTML(s)}</span>`).join('');
    }
  }
  
  // Build social HTML
  const socialHTML = d.social.map(s => 
    `<a href="${escapeHTML(s.url)}" target="_blank" rel="noopener">${s.platform.charAt(0).toUpperCase() + s.platform.slice(1)}</a>`
  ).join('');
  
  const email = d.contactEmail || d.email;
  
  // Template specific classes
  const templateClass = d.template || 'minimal';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHTML(d.advanced.metaTitle || d.fullName + ' — Portfolio')}</title>
  <meta name="description" content="${escapeHTML(d.advanced.metaDescription || 'Explore my creative work and projects.')}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Space+Grotesk:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&display=swap" rel="stylesheet" />
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
      --container-max: ${containerWidth};
      --spacing: ${spacing}px;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: var(--font-body); background: var(--bg); color: var(--text); line-height: 1.7; padding-top: 70px; ${anim} }
    .container { max-width: var(--container-max); margin: 0 auto; padding: 0 24px; }
    
    /* Template: ${templateClass} */
    .template-${templateClass} .hero-name { 
      ${templateClass === 'bold' ? 'font-size: clamp(4rem, 10vw, 6.5rem); font-weight: 700;' : ''}
      ${templateClass === 'elegant' ? 'font-style: italic;' : ''}
      ${templateClass === 'creative' ? 'letter-spacing: -0.04em;' : ''}
      ${templateClass === 'professional' ? 'font-weight: 600; letter-spacing: -0.02em;' : ''}
    }
    
    .site-header {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      background: rgba(255,255,255,0.85); backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
      padding: 16px 24px; display: flex; justify-content: space-between; align-items: center;
      max-width: var(--container-max); margin: 0 auto;
    }
    .logo { font-family: var(--font-display); font-size: 1.4rem; font-weight: 600; color: var(--text); text-decoration: none; }
    .logo span { color: var(--accent); }
    .nav-list { display: flex; gap: 24px; list-style: none; }
    .nav-list a { color: var(--text); text-decoration: none; font-size: 0.85rem; font-weight: 500; ${navStyle} }
    .nav-list a:hover { color: var(--accent); ${design.navStyle === 'underline' ? 'border-color: var(--accent);' : ''} ${design.navStyle === 'pill' ? 'background: var(--accent-light);' : ''} ${design.navStyle === 'minimal' ? 'opacity: 1;' : ''} ${design.navStyle === 'bold' ? 'opacity: 1;' : ''} }
    
    .hero { min-height: 70vh; display: flex; align-items: center; padding: 60px 0; text-align: ${heroTextAlign}; }
    .hero-content { max-width: 720px; ${heroAlign === 'center' ? 'margin: 0 auto;' : ''} }
    .hero-name { font-family: var(--font-display); font-size: clamp(3rem, 8vw, 5rem); font-weight: 600; line-height: 1.05; margin-bottom: 8px; }
    .hero-title { font-size: 1.4rem; color: var(--accent); font-weight: 400; margin-bottom: 8px; }
    .hero-tagline { font-size: 1.1rem; color: var(--text-secondary); max-width: 520px; ${heroAlign === 'center' ? 'margin: 0 auto;' : ''} }
    .hero-meta { display: flex; gap: 16px 32px; flex-wrap: wrap; margin-top: 20px; font-size: 0.9rem; color: var(--text-secondary); justify-content: ${heroAlign === 'center' ? 'center' : 'flex-start'}; }
    
    section { padding: 80px 0; }
    .section-header { margin-bottom: 40px; ${heroAlign === 'center' ? 'text-align: center;' : ''} }
    .section-number { font-size: 0.75rem; font-weight: 600; color: var(--accent); text-transform: uppercase; letter-spacing: 0.08em; }
    .section-title { font-family: var(--font-display); font-size: 2.4rem; font-weight: 400; margin-top: 4px; }
    
    .work-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .project-card { background: var(--card); border-radius: var(--radius); overflow: hidden; ${cardStyle} ${anim} }
    .project-card:hover { transform: translateY(-4px); ${design.cardStyle === 'elevated' ? 'box-shadow: 0 12px 40px rgba(0,0,0,0.12);' : ''} ${design.cardStyle === 'border' ? 'border-color: var(--accent);' : ''} ${design.cardStyle === 'glass' ? 'background: rgba(255,255,255,0.8);' : ''} }
    .project-card.featured { grid-column: span 2; }
    .project-thumb { aspect-ratio: 4/3; background: var(--border); overflow: hidden; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; color: var(--text-secondary); }
    .project-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
    .project-card:hover .project-thumb img { transform: scale(1.03); }
    .project-info { padding: 16px 20px; }
    .project-title { font-family: var(--font-display); font-size: 1.2rem; font-weight: 600; }
    .project-meta { font-size: 0.8rem; color: var(--text-secondary); display: block; }
    .project-note { font-size: 0.9rem; color: var(--text-secondary); margin-top: 4px; }
    .project-links { display: flex; gap: 12px; margin-top: 8px; }
    .project-links a { font-size: 0.8rem; color: var(--accent); text-decoration: none; font-weight: 500; }
    .project-links a:hover { text-decoration: underline; }
    
    .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
    .about-text p { font-size: 1.05rem; font-weight: 300; line-height: 1.8; margin-bottom: 16px; }
    .about-image { border-radius: var(--radius); overflow: hidden; background: var(--border); aspect-ratio: 3/4; }
    .about-image img { width: 100%; height: 100%; object-fit: cover; }
    .about-image .placeholder { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 4rem; color: var(--text-secondary); }
    .skills-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .skill-tag { padding: 6px 14px; background: var(--accent-light); color: var(--accent); border-radius: 100px; font-size: 0.85rem; font-weight: 500; }
    .skill-bar { margin-bottom: 8px; }
    .skill-bar .skill-name { display: block; font-size: 0.85rem; font-weight: 500; margin-bottom: 2px; }
    .skill-bar-track { height: 6px; background: var(--border); border-radius: 10px; overflow: hidden; }
    .skill-bar-fill { height: 100%; background: var(--accent); border-radius: 10px; }
    
    .contact-section { text-align: center; }
    .contact-email { font-family: var(--font-display); font-size: clamp(1.8rem, 4vw, 3rem); color: var(--accent); text-decoration: none; display: inline-block; border-bottom: 2px solid transparent; transition: border-color 0.3s; }
    .contact-email:hover { border-color: var(--accent); }
    .contact-note { color: var(--text-secondary); margin-top: 8px; }
    
    .footer { padding: 40px 0 24px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .footer-copy { color: var(--text-secondary); font-size: 0.85rem; }
    .footer-social { display: flex; gap: 16px; }
    .footer-social a { color: var(--text-secondary); text-decoration: none; font-size: 0.85rem; transition: color 0.3s; }
    .footer-social a:hover { color: var(--accent); }
    
    ${d.advanced.customCSS}
    
    @media (max-width: 768px) {
      .work-grid { grid-template-columns: 1fr; }
      .project-card.featured { grid-column: span 1; }
      .about-grid { grid-template-columns: 1fr; }
      .site-header { flex-wrap: wrap; gap: 12px; }
      .nav-list { gap: 16px; flex-wrap: wrap; }
      .hero { padding: 40px 0; min-height: auto; }
      section { padding: 60px 0; }
      .contact-email { font-size: 1.6rem; }
    }
    @media (max-width: 480px) {
      .container { padding: 0 16px; }
      .nav-list { gap: 12px; }
      .nav-list a { font-size: 0.75rem; }
      .hero-name { font-size: 2.4rem; }
      .hero-title { font-size: 1.1rem; }
      .section-title { font-size: 1.8rem; }
    }
  </style>
</head>
<body class="template-${templateClass}">
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
            ${d.experienceYears ? `<span>📅 ${escapeHTML(d.experienceYears)} years experience</span>` : ''}
            <span>✉️ ${escapeHTML(email)}</span>
          </div>
        </div>
      </div>
    </section>
    <section id="work">
      <div class="container">
        <div class="section-header">
          <span class="section-number">01</span>
          <h2 class="section-title">Selected Work</h2>
        </div>
        <div class="work-grid">${projectsHTML || '<p style="grid-column:span 3;text-align:center;color:var(--text-secondary);">No projects added yet.</p>'}</div>
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
            ${skillsHTML ? `<div style="margin-top:24px;"><h4 style="font-weight:600;font-size:0.85rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-secondary);">${d.skillCategory || 'Skills'}</h4><div class="skills-tags">${skillsHTML}</div></div>` : ''}
          </div>
          <div class="about-image">
            ${d.aboutImage ? `<img src="${escapeHTML(d.aboutImage)}" alt="${escapeHTML(d.aboutImageAlt || d.fullName)}" />` : `<div class="placeholder">${d.avatarEmoji || '📸'}</div>`}
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
        <p class="contact-note">${escapeHTML(d.contactNote || 'Available for collaborations, commissions, and conversations.')}</p>
      </div>
    </section>
  </main>
  <footer>
    <div class="container">
      <div class="footer">
        <span class="footer-copy">${escapeHTML(d.advanced.footerText || '© ' + (d.advanced.showYearInFooter ? new Date().getFullYear() + ' ' : '') + d.fullName)}</span>
        <div class="footer-social">${socialHTML}</div>
      </div>
    </div>
  </footer>
  ${d.advanced.enableAnalytics ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${escapeHTML(d.advanced.analyticsId)}"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${escapeHTML(d.advanced.analyticsId)}');</script>` : ''}
  ${d.advanced.customJS ? `<script>${d.advanced.customJS}</script>` : ''}
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

function downloadHTML() {
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
// RESET
// ============================================================
function resetAll() {
  if (confirm('Are you sure you want to reset all settings?')) {
    AppState.clearDraft();
    location.reload();
  }
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
  
  // Theme selector
  DOM.themeSelector.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.themeSelector.querySelectorAll('.theme-option').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
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
  
  // Spacing
  DOM.spacing.addEventListener('input', () => {
    const val = parseInt(DOM.spacing.value);
    const labels = ['Very Compact', 'Compact', 'Medium', 'Spacious', 'Very Spacious'];
    const label = labels[Math.floor(val / 25)] || 'Medium';
    DOM.spacingValue.textContent = label;
    renderPreview();
  });
  
  // Design selects
  [DOM.typography, DOM.heroLayout, DOM.navStyle, DOM.cardStyle, DOM.animationLevel, DOM.containerWidth].forEach(el => {
    el.addEventListener('change', renderPreview);
  });
  
  // Templates
  DOM.templateCards.forEach(card => {
    card.addEventListener('click', () => {
      DOM.templateCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      renderPreview();
    });
  });
  
  // Preview
  DOM.previewToggle.addEventListener('click', togglePreview);
  DOM.closePreview.addEventListener('click', togglePreview);
  
  // Preview devices
  DOM.previewDevices.forEach(btn => {
    btn.addEventListener('click', () => setDevice(btn.dataset.device));
  });
  
  // Generate
  DOM.generateBtn.addEventListener('click', generatePortfolio);
  DOM.generateFinalBtn.addEventListener('click', generatePortfolio);
  
  // Download HTML
  DOM.downloadHtmlBtn.addEventListener('click', downloadHTML);
  
  // Reset
  DOM.resetBtn.addEventListener('click', resetAll);
  
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
    DOM.showCodeBtn.setAttribute('aria-expanded', !isVisible);
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
  
  // Analytics toggle
  DOM.enableAnalytics.addEventListener('change', () => {
    DOM.analyticsId.style.display = DOM.enableAnalytics.checked ? 'block' : 'none';
  });
  
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
  
  // Auto-save on any input change
  document.querySelectorAll('input, textarea, select').forEach(el => {
    el.addEventListener('input', collectData);
    el.addEventListener('change', collectData);
  });
}

// ============================================================
// INITIALIZATION
// ============================================================
function init() {
  cacheDOM();
  
  // Load draft
  AppState.loadDraft();
  
  // Add default projects
  addProject({
    title: 'Featured Project',
    description: 'A showcase of your best work.',
    category: 'Design',
    year: '2024',
    featured: true
  });
  addProject({
    title: 'Second Project',
    description: 'Another great project worth sharing.',
    category: 'Development',
    year: '2024',
    featured: false
  });
  
  // Add default social links
  addSocialRow('instagram', '');
  addSocialRow('github', '');
  
  // Set initial step
  navigateTo('identity');
  
  // Setup events
  setupEventListeners();
  
  // Set initial spacing value
  DOM.spacingValue.textContent = 'Medium';
  
  console.log('✨ Portfolio Builder Pro initialized successfully!');
  console.log('📝 Fill in your details and generate your portfolio.');
  console.log('💡 Tip: Press Ctrl+S to save your draft');
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
