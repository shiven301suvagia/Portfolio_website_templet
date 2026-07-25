/* ============================================================
   PORTFOLIO BUILDER — Main Application
   ============================================================ */

// ============================================================
// STATE MANAGEMENT
// ============================================================
const state = {
  currentStep: 'identity',
  data: {
    fullName: '',
    title: '',
    tagline: '',
    location: '',
    email: '',
    aboutHeadline: '',
    aboutStory: '',
    aboutImage: '',
    projects: [],
    skills: [],
    skillCategory: '',
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
      animationLevel: 'moderate'
    }
  },
  previewOpen: false
};

// ============================================================
// DOM REFERENCES
// ============================================================
const DOM = {
  sidebar: document.getElementById('sidebar'),
  menuToggle: document.getElementById('menuToggle'),
  stepTitle: document.getElementById('stepTitle'),
  stepCounter: document.getElementById('stepCounter'),
  previewToggle: document.getElementById('previewToggle'),
  previewPanel: document.getElementById('previewPanel'),
  closePreview: document.getElementById('closePreview'),
  previewFrame: document.getElementById('previewFrame'),
  outputModal: document.getElementById('outputModal'),
  modalClose: document.getElementById('modalClose'),
  outputContent: document.getElementById('outputContent'),
  downloadBtn: document.getElementById('downloadBtn'),
  copyBtn: document.getElementById('copyBtn'),
  generateBtn: document.getElementById('generateBtn'),
  exportBtn: document.getElementById('exportBtn'),
  generateFinalBtn: document.getElementById('generateFinalBtn'),
  projectsList: document.getElementById('projectsList'),
  addProjectBtn: document.getElementById('addProjectBtn'),
  skillsList: document.getElementById('skillsList'),
  skillInput: document.getElementById('skillInput'),
  addSkillBtn: document.getElementById('addSkillBtn'),
  socialLinks: document.getElementById('socialLinks'),
  addSocialBtn: document.getElementById('addSocialBtn'),
  themeSelector: document.getElementById('themeSelector'),
  accentColor: document.getElementById('accentColor'),
  accentColorHex: document.getElementById('accentColorHex'),
  borderRadius: document.getElementById('borderRadius'),
  radiusValue: document.getElementById('radiusValue')
};

// ============================================================
// NAVIGATION
// ============================================================
const steps = ['identity', 'about', 'projects', 'skills', 'contact', 'design'];
const stepTitles = {
  identity: 'Identity',
  about: 'About',
  projects: 'Projects',
  skills: 'Skills',
  contact: 'Contact',
  design: 'Design'
};

function navigateTo(step) {
  if (!steps.includes(step)) return;
  
  state.currentStep = step;
  
  // Update steps
  document.querySelectorAll('.step').forEach(el => {
    el.classList.toggle('active', el.dataset.step === step);
  });
  
  // Update nav
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.step === step);
  });
  
  // Update header
  DOM.stepTitle.textContent = stepTitles[step];
  DOM.stepCounter.textContent = `${steps.indexOf(step) + 1} / ${steps.length}`;
  
  // Update preview
  if (state.previewOpen) {
    updatePreview();
  }
}

// ============================================================
// NAVIGATION EVENTS
// ============================================================
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    navigateTo(item.dataset.step);
  });
});

document.querySelectorAll('.btn-next').forEach(btn => {
  btn.addEventListener('click', () => {
    const next = btn.dataset.next;
    if (next && validateStep(state.currentStep)) {
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

// ============================================================
// VALIDATION
// ============================================================
function validateStep(step) {
  switch(step) {
    case 'identity':
      const name = document.getElementById('fullName').value.trim();
      const email = document.getElementById('email').value.trim();
      if (!name) { showToast('Please enter your name'); return false; }
      if (!email || !email.includes('@')) { showToast('Please enter a valid email'); return false; }
      return true;
    case 'contact':
      const contactEmail = document.getElementById('contactEmail').value.trim();
      if (contactEmail && !contactEmail.includes('@')) {
        showToast('Please enter a valid email');
        return false;
      }
      return true;
    default:
      return true;
  }
}

// ============================================================
// DATA COLLECTION
// ============================================================
function collectData() {
  state.data.fullName = document.getElementById('fullName').value.trim();
  state.data.title = document.getElementById('title').value.trim();
  state.data.tagline = document.getElementById('tagline').value.trim();
  state.data.location = document.getElementById('location').value.trim();
  state.data.email = document.getElementById('email').value.trim();
  state.data.aboutHeadline = document.getElementById('aboutHeadline').value.trim();
  state.data.aboutStory = document.getElementById('aboutStory').value.trim();
  state.data.aboutImage = document.getElementById('aboutImage').value.trim();
  state.data.contactEmail = document.getElementById('contactEmail').value.trim();
  state.data.contactNote = document.getElementById('contactNote').value.trim();
  state.data.skillCategory = document.getElementById('skillCategory').value.trim();
  
  // Collect projects from DOM
  state.data.projects = [];
  document.querySelectorAll('.project-card').forEach(card => {
    state.data.projects.push({
      title: card.querySelector('.project-title-input')?.value || '',
      description: card.querySelector('.project-desc-input')?.value || '',
      category: card.querySelector('.project-category-input')?.value || '',
      year: card.querySelector('.project-year-input')?.value || '',
      image: card.querySelector('.project-image-input')?.value || '',
      github: card.querySelector('.project-github-input')?.value || '',
      live: card.querySelector('.project-live-input')?.value || '',
      featured: card.querySelector('.project-featured-input')?.checked || false
    });
  });
  
  // Collect skills
  state.data.skills = [];
  document.querySelectorAll('.skill-tag').forEach(tag => {
    state.data.skills.push(tag.dataset.skill);
  });
  
  // Collect social links
  state.data.social = [];
  document.querySelectorAll('.social-input-row').forEach(row => {
    const platform = row.querySelector('.social-platform')?.value || '';
    const url = row.querySelector('.social-url')?.value || '';
    if (platform && url) {
      state.data.social.push({ platform, url });
    }
  });
  
  // Collect design settings
  state.data.design.theme = document.querySelector('.theme-option.active')?.dataset.theme || 'light';
  state.data.design.accentColor = DOM.accentColor.value;
  state.data.design.typography = document.getElementById('typography').value;
  state.data.design.heroLayout = document.getElementById('heroLayout').value;
  state.data.design.navStyle = document.getElementById('navStyle').value;
  state.data.design.cardStyle = document.getElementById('cardStyle').value;
  state.data.design.borderRadius = parseInt(DOM.borderRadius.value);
  state.data.design.animationLevel = document.getElementById('animationLevel').value;
}

// ============================================================
// PROJECTS
// ============================================================
function addProject(projectData = null) {
  const card = document.createElement('div');
  card.className = 'project-card';
  
  const project = projectData || { title: '', description: '', category: '', year: '', image: '', github: '', live: '', featured: false };
  
  card.innerHTML = `
    <button class="btn-remove-project" type="button">×</button>
    <div class="form-grid two-col">
      <div class="form-group">
        <label>Project Title</label>
        <input type="text" class="project-title-input" placeholder="e.g., Silent Streets" value="${project.title}" />
      </div>
      <div class="form-group">
        <label>Category</label>
        <input type="text" class="project-category-input" placeholder="e.g., Photography" value="${project.category}" />
      </div>
    </div>
    <div class="form-group">
      <label>Description</label>
      <input type="text" class="project-desc-input" placeholder="What was this project about?" value="${project.description}" />
    </div>
    <div class="form-grid two-col">
      <div class="form-group">
        <label>Year</label>
        <input type="text" class="project-year-input" placeholder="e.g., 2024" value="${project.year}" />
      </div>
      <div class="form-group">
        <label>Image URL</label>
        <input type="url" class="project-image-input" placeholder="https://..." value="${project.image}" />
      </div>
    </div>
    <div class="form-grid two-col">
      <div class="form-group">
        <label>GitHub Link</label>
        <input type="url" class="project-github-input" placeholder="https://github.com/..." value="${project.github}" />
      </div>
      <div class="form-group">
        <label>Live Link</label>
        <input type="url" class="project-live-input" placeholder="https://..." value="${project.live}" />
      </div>
    </div>
    <div class="project-featured">
      <input type="checkbox" class="project-featured-input" ${project.featured ? 'checked' : ''} />
      <label>Featured Project (spans 2 columns)</label>
    </div>
  `;
  
  // Remove project
  card.querySelector('.btn-remove-project').addEventListener('click', () => {
    if (document.querySelectorAll('.project-card').length > 1) {
      card.remove();
      updatePreview();
    } else {
      showToast('You need at least one project');
    }
  });
  
  // Update preview on change
  card.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', updatePreview);
    input.addEventListener('change', updatePreview);
  });
  
  DOM.projectsList.appendChild(card);
  updatePreview();
}

// ============================================================
// SKILLS
// ============================================================
function addSkill(skill) {
  if (!skill || !skill.trim()) return;
  
  // Check if skill already exists
  if (document.querySelector(`.skill-tag[data-skill="${skill.trim()}"]`)) {
    showToast('Skill already exists');
    return;
  }
  
  const tag = document.createElement('span');
  tag.className = 'skill-tag';
  tag.dataset.skill = skill.trim();
  tag.innerHTML = `
    ${skill.trim()}
    <button class="btn-remove-skill" type="button">×</button>
  `;
  
  tag.querySelector('.btn-remove-skill').addEventListener('click', () => {
    tag.remove();
    updatePreview();
  });
  
  DOM.skillsList.appendChild(tag);
  DOM.skillInput.value = '';
  DOM.skillInput.focus();
  updatePreview();
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
    <input type="url" class="social-url" placeholder="https://..." value="${url}" />
    <button class="btn-remove-social" type="button">×</button>
  `;
  
  row.querySelector('.btn-remove-social').addEventListener('click', () => {
    if (document.querySelectorAll('.social-input-row').length > 1) {
      row.remove();
      updatePreview();
    } else {
      showToast('You need at least one social link');
    }
  });
  
  row.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', updatePreview);
    el.addEventListener('change', updatePreview);
  });
  
  DOM.socialLinks.appendChild(row);
  updatePreview();
}

// ============================================================
// PREVIEW
// ============================================================
function updatePreview() {
  if (!state.previewOpen) return;
  
  collectData();
  const html = generatePortfolioHTML();
  DOM.previewFrame.innerHTML = html;
}

function togglePreview() {
  state.previewOpen = !state.previewOpen;
  DOM.previewPanel.classList.toggle('open', state.previewOpen);
  
  if (state.previewOpen) {
    collectData();
    updatePreview();
  }
}

// ============================================================
// PORTFOLIO GENERATOR
// ============================================================
function generatePortfolioHTML() {
  collectData();
  const d = state.data;
  const design = d.design;
  
  // Theme colors
  const themeColors = {
    light: { bg: '#f8f6f2', text: '#1a1a1a', card: '#ffffff', border: '#e8e0d8' },
    dark: { bg: '#1a1a1a', text: '#f8f6f2', card: '#2a2a2a', border: '#3a3a3a' },
    warm: { bg: '#fcf6f0', text: '#2c1a10', card: '#fffaf5', border: '#ead8c8' },
    forest: { bg: '#f0f5ee', text: '#1a2a1a', card: '#ffffff', border: '#d0ddd0' },
    ocean: { bg: '#f0f5f8', text: '#0a1a2a', card: '#ffffff', border: '#c8d8e0' }
  };
  
  const colors = themeColors[design.theme] || themeColors.light;
  
  // Typography fonts
  const fonts = {
    modern: { display: "'DM Serif Display', Georgia, serif", body: "'Inter', -apple-system, sans-serif" },
    classic: { display: "'Playfair Display', Georgia, serif", body: "'Inter', -apple-system, sans-serif" },
    minimal: { display: "'Inter', -apple-system, sans-serif", body: "'Inter', -apple-system, sans-serif" },
    playful: { display: "'DM Serif Display', Georgia, serif", body: "'Inter', -apple-system, sans-serif" }
  };
  
  const font = fonts[design.typography] || fonts.modern;
  
  // Hero alignment
  const heroAlign = design.heroLayout === 'center' ? 'center' : design.heroLayout === 'split' ? 'space-between' : 'flex-start';
  const heroTextAlign = design.heroLayout === 'center' ? 'center' : 'left';
  
  // Navigation style
  const navStyles = {
    underline: 'border-bottom: 2px solid transparent; transition: border-color 0.3s;',
    pill: 'padding: 8px 16px; border-radius: 100px; background: transparent; transition: background 0.3s;',
    minimal: 'font-weight: 400; opacity: 0.7; transition: opacity 0.3s;'
  };
  
  const navStyle = navStyles[design.navStyle] || navStyles.underline;
  
  // Card style
  const cardStyles = {
    elevated: 'box-shadow: 0 8px 30px rgba(0,0,0,0.08);',
    flat: 'box-shadow: none; border: 1px solid var(--border);',
    border: 'border: 2px solid var(--border); box-shadow: none;'
  };
  
  const cardStyle = cardStyles[design.cardStyle] || cardStyles.elevated;
  
  // Animation level
  const animLevels = {
    subtle: 'transition: all 0.3s ease;',
    moderate: 'transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);',
    dynamic: 'transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);'
  };
  
  const anim = animLevels[design.animationLevel] || animLevels.moderate;
  
  // Build projects HTML
  let projectsHTML = '';
  d.projects.forEach(p => {
    const featuredClass = p.featured ? 'featured' : '';
    const imageHTML = p.image ? `<img src="${p.image}" alt="${p.title}" />` : `<span class="placeholder-label">📷 ${p.title}</span>`;
    
    projectsHTML += `
      <div class="project-card ${featuredClass}">
        <div class="project-thumb">${imageHTML}</div>
        <div class="project-info">
          <h3 class="project-title">${p.title}</h3>
          <span class="project-meta">${p.category} ${p.year ? '· ' + p.year : ''}</span>
          <p class="project-note">${p.description}</p>
          <div class="project-links">
            ${p.github ? `<a href="${p.github}" target="_blank">GitHub</a>` : ''}
            ${p.live ? `<a href="${p.live}" target="_blank">Live Demo</a>` : ''}
          </div>
        </div>
      </div>
    `;
  });
  
  // Build skills HTML
  const skillsHTML = d.skills.map(s => `<span class="skill-tag">${s}</span>`).join('');
  
  // Build social HTML
  const socialHTML = d.social.map(s => 
    `<a href="${s.url}" target="_blank" rel="noopener">${s.platform.charAt(0).toUpperCase() + s.platform.slice(1)}</a>`
  ).join('');
  
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${d.fullName} — Portfolio</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
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
      }
      
      * { margin: 0; padding: 0; box-sizing: border-box; }
      
      body {
        font-family: var(--font-body);
        background: var(--bg);
        color: var(--text);
        line-height: 1.6;
        padding-top: 70px;
      }
      
      .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
      
      /* HEADER */
      .site-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 100;
        background: rgba(var(--bg-rgb), 0.85);
        backdrop-filter: blur(16px);
        border-bottom: 1px solid var(--border);
        padding: 16px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1100px;
        margin: 0 auto;
      }
      
      .logo {
        font-family: var(--font-display);
        font-size: 1.4rem;
        font-weight: 600;
        color: var(--text);
        text-decoration: none;
      }
      
      .logo span { color: var(--accent); }
      
      .nav-list {
        display: flex;
        gap: 24px;
        list-style: none;
      }
      
      .nav-list a {
        color: var(--text);
        text-decoration: none;
        font-size: 0.85rem;
        font-weight: 500;
        ${navStyle}
      }
      
      .nav-list a:hover {
        color: var(--accent);
        ${design.navStyle === 'underline' ? 'border-color: var(--accent);' : ''}
        ${design.navStyle === 'pill' ? 'background: var(--accent-light);' : ''}
        ${design.navStyle === 'minimal' ? 'opacity: 1;' : ''}
      }
      
      /* HERO */
      .hero {
        min-height: 70vh;
        display: flex;
        align-items: center;
        padding: 60px 0;
        text-align: ${heroTextAlign};
      }
      
      .hero-content {
        max-width: 720px;
        ${heroAlign === 'center' ? 'margin: 0 auto;' : ''}
      }
      
      .hero-name {
        font-family: var(--font-display);
        font-size: clamp(3rem, 8vw, 5rem);
        font-weight: 600;
        line-height: 1.05;
        margin-bottom: 8px;
      }
      
      .hero-title {
        font-size: 1.4rem;
        color: var(--accent);
        font-weight: 400;
        margin-bottom: 8px;
      }
      
      .hero-tagline {
        font-size: 1.1rem;
        color: var(--text-secondary);
        max-width: 520px;
        ${heroAlign === 'center' ? 'margin: 0 auto;' : ''}
      }
      
      .hero-meta {
        display: flex;
        gap: 16px 32px;
        flex-wrap: wrap;
        margin-top: 20px;
        font-size: 0.9rem;
        color: var(--text-secondary);
        justify-content: ${heroAlign === 'center' ? 'center' : 'flex-start'};
      }
      
      /* SECTIONS */
      section { padding: 80px 0; }
      
      .section-header {
        margin-bottom: 40px;
        ${heroAlign === 'center' ? 'text-align: center;' : ''}
      }
      
      .section-number {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--accent);
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      
      .section-title {
        font-family: var(--font-display);
        font-size: 2.4rem;
        font-weight: 400;
        margin-top: 4px;
      }
      
      /* WORK GRID */
      .work-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
      }
      
      .project-card {
        background: var(--card);
        border-radius: var(--radius);
        overflow: hidden;
        ${cardStyle}
        ${anim}
        cursor: default;
      }
      
      .project-card:hover {
        transform: translateY(-4px);
        ${design.cardStyle === 'elevated' ? 'box-shadow: 0 12px 40px rgba(0,0,0,0.12);' : ''}
        ${design.cardStyle === 'border' ? 'border-color: var(--accent);' : ''}
      }
      
      .project-card.featured {
        grid-column: span 2;
      }
      
      .project-thumb {
        aspect-ratio: 4/3;
        background: var(--border);
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.85rem;
        color: var(--text-secondary);
      }
      
      .project-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .project-info { padding: 16px 20px; }
      
      .project-title {
        font-family: var(--font-display);
        font-size: 1.2rem;
        font-weight: 600;
      }
      
      .project-meta {
        font-size: 0.8rem;
        color: var(--text-secondary);
        display: block;
      }
      
      .project-note {
        font-size: 0.9rem;
        color: var(--text-secondary);
        margin-top: 4px;
      }
      
      .project-links {
        display: flex;
        gap: 12px;
        margin-top: 8px;
      }
      
      .project-links a {
        font-size: 0.8rem;
        color: var(--accent);
        text-decoration: none;
        font-weight: 500;
      }
      
      .project-links a:hover { text-decoration: underline; }
      
      /* ABOUT */
      .about-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 48px;
        align-items: start;
      }
      
      .about-text p {
        font-size: 1.05rem;
        font-weight: 300;
        line-height: 1.8;
        margin-bottom: 16px;
      }
      
      .about-image {
        border-radius: var(--radius);
        overflow: hidden;
        background: var(--border);
        aspect-ratio: 3/4;
      }
      
      .about-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .about-image .placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        font-size: 3rem;
        color: var(--text-secondary);
      }
      
      .skills-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
      }
      
      .skill-tag {
        padding: 6px 14px;
        background: var(--accent-light);
        color: var(--accent);
        border-radius: 100px;
        font-size: 0.85rem;
        font-weight: 500;
      }
      
      /* CONTACT */
      .contact-section {
        text-align: center;
      }
      
      .contact-email {
        font-family: var(--font-display);
        font-size: clamp(1.8rem, 4vw, 3rem);
        color: var(--accent);
        text-decoration: none;
        display: inline-block;
        border-bottom: 2px solid transparent;
        transition: border-color 0.3s;
      }
      
      .contact-email:hover { border-color: var(--accent); }
      
      .contact-note {
        color: var(--text-secondary);
        margin-top: 8px;
      }
      
      /* FOOTER */
      .footer {
        padding: 40px 0 24px;
        border-top: 1px solid var(--border);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
      }
      
      .footer-copy { color: var(--text-secondary); font-size: 0.85rem; }
      
      .footer-social {
        display: flex;
        gap: 16px;
      }
      
      .footer-social a {
        color: var(--text-secondary);
        text-decoration: none;
        font-size: 0.85rem;
        transition: color 0.3s;
      }
      
      .footer-social a:hover { color: var(--accent); }
      
      /* RESPONSIVE */
      @media (max-width: 768px) {
        .work-grid {
          grid-template-columns: 1fr;
        }
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
  <body>
    <header class="site-header">
      <a href="#" class="logo">${d.fullName.split(' ').map(n => n[0]).join('')}<span>.</span></a>
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
            <h1 class="hero-name">${d.fullName}</h1>
            <p class="hero-title">${d.title || 'Creative Professional'}</p>
            <p class="hero-tagline">${d.tagline || ''}</p>
            <div class="hero-meta">
              ${d.location ? `<span>📍 ${d.location}</span>` : ''}
              <span>✉️ ${d.email}</span>
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
          <div class="work-grid">
            ${projectsHTML || '<p style="grid-column:span 3;text-align:center;color:var(--text-secondary);">No projects added yet.</p>'}
          </div>
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
              ${d.aboutHeadline ? `<h3 style="font-family:var(--font-display);font-weight:400;font-size:1.4rem;margin-bottom:8px;">${d.aboutHeadline}</h3>` : ''}
              ${d.aboutStory ? d.aboutStory.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('') : '<p>Add your story in the builder.</p>'}
              ${skillsHTML ? `
                <div style="margin-top:24px;">
                  <h4 style="font-weight:600;font-size:0.85rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-secondary);">Skills</h4>
                  <div class="skills-tags">${skillsHTML}</div>
                </div>
              ` : ''}
            </div>
            <div class="about-image">
              ${d.aboutImage ? `<img src="${d.aboutImage}" alt="${d.fullName}" />` : `<div class="placeholder">📸</div>`}
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
          <a href="mailto:${d.contactEmail || d.email}" class="contact-email">${d.contactEmail || d.email}</a>
          <p class="contact-note">${d.contactNote || 'Available for collaborations, commissions, and conversations.'}</p>
        </div>
      </section>
    </main>

    <footer>
      <div class="container">
        <div class="footer">
          <span class="footer-copy">&copy; ${new Date().getFullYear()} ${d.fullName}</span>
          <div class="footer-social">
            ${socialHTML}
          </div>
        </div>
      </div>
    </footer>
  </body>
  </html>
  `;
}

// ============================================================
// GENERATE & EXPORT
// ============================================================
function generatePortfolio() {
  collectData();
  
  // Validate required fields
  if (!state.data.fullName) {
    showToast('Please enter your name first');
    return;
  }
  if (!state.data.email && !state.data.contactEmail) {
    showToast('Please enter an email address');
    return;
  }
  
  // Show modal with generated code
  const html = generatePortfolioHTML();
  const css = extractCSS(html);
  const js = extractJS(html);
  
  DOM.outputContent.textContent = html;
  DOM.outputModal.classList.add('open');
  
  // Store generated files for download
  window._generatedFiles = { html, css, js };
}

function extractCSS(html) {
  const match = html.match(/<style>([\s\S]*?)<\/style>/);
  return match ? match[1] : '';
}

function extractJS(html) {
  const match = html.match(/<script>([\s\S]*?)<\/script>/);
  return match ? match[1] : '';
}

// ============================================================
// DOWNLOAD
// ============================================================
function downloadPortfolio() {
  const files = window._generatedFiles;
  if (!files) {
    showToast('Please generate a portfolio first');
    return;
  }
  
  const zip = new Blob([
    `/* ============================================================
       index.html
       ============================================================ */\n${files.html}\n\n`,
    `/* ============================================================
       style.css
       ============================================================ */\n${files.css}\n\n`,
    `/* ============================================================
       script.js
       ============================================================ */\n${files.js}`
  ], { type: 'text/plain' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(zip);
  link.download = 'portfolio.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// ============================================================
// COPY CODE
// ============================================================
function copyCode() {
  const code = DOM.outputContent.textContent;
  navigator.clipboard.writeText(code).then(() => {
    showToast('Code copied to clipboard!');
  }).catch(() => {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = code;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Code copied to clipboard!');
  });
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ============================================================
// EVENT LISTENERS
// ============================================================
// Theme selector
DOM.themeSelector.querySelectorAll('.theme-option').forEach(btn => {
  btn.addEventListener('click', () => {
    DOM.themeSelector.querySelectorAll('.theme-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updatePreview();
  });
});

// Accent color
DOM.accentColor.addEventListener('input', () => {
  DOM.accentColorHex.value = DOM.accentColor.value;
  updatePreview();
});

DOM.accentColorHex.addEventListener('input', () => {
  if (/^#[0-9a-f]{6}$/i.test(DOM.accentColorHex.value)) {
    DOM.accentColor.value = DOM.accentColorHex.value;
    updatePreview();
  }
});

// Border radius
DOM.borderRadius.addEventListener('input', () => {
  DOM.radiusValue.textContent = `${DOM.borderRadius.value}px`;
  updatePreview();
});

// Design selects
document.querySelectorAll('#typography, #heroLayout, #navStyle, #cardStyle, #animationLevel').forEach(el => {
  el.addEventListener('change', updatePreview);
});

// Preview toggle
DOM.previewToggle.addEventListener('click', togglePreview);
DOM.closePreview.addEventListener('click', togglePreview);

// Generate
DOM.generateBtn.addEventListener('click', generatePortfolio);
DOM.generateFinalBtn.addEventListener('click', generatePortfolio);

// Export
DOM.exportBtn.addEventListener('click', downloadPortfolio);

// Modal
DOM.modalClose.addEventListener('click', () => {
  DOM.outputModal.classList.remove('open');
});

DOM.outputModal.addEventListener('click', (e) => {
  if (e.target === DOM.outputModal) {
    DOM.outputModal.classList.remove('open');
  }
});

// Download & Copy
DOM.downloadBtn.addEventListener('click', downloadPortfolio);
DOM.copyBtn.addEventListener('click', copyCode);

// Add project
DOM.addProjectBtn.addEventListener('click', () => addProject());

// Add skill
DOM.addSkillBtn.addEventListener('click', () => {
  addSkill(DOM.skillInput.value);
});
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
    if (DOM.outputModal.classList.contains('open')) {
      DOM.outputModal.classList.remove('open');
    }
    if (state.previewOpen) {
      togglePreview();
    }
  }
  if (e.ctrlKey && e.key === 'p') {
    e.preventDefault();
    togglePreview();
  }
});

// ============================================================
// INITIALIZATION
// ============================================================
function init() {
  // Add default project
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
  
  // Add default social
  addSocialRow('instagram', '');
  addSocialRow('github', '');
  
  // Set initial step
  navigateTo('identity');
  
  console.log('✨ Portfolio Builder initialized successfully!');
  console.log('📝 Fill in your details and generate your portfolio.');
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
