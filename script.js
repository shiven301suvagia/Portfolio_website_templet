/**
 * Portfolio Builder Pro — Complete Application
 * With image compression, video support, and file handling
 */

// ============================================================
// IMAGE COMPRESSION UTILITIES
// ============================================================

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const COMPRESSED_QUALITY = 0.7; // 70% quality for JPEG

/**
 * Compress an image file and return a data URL
 */
function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = COMPRESSED_QUALITY) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Not an image file'));
      return;
    }

    // If file is already small, just read it
    if (file.size < 500 * 1024) { // Under 500KB, no compression needed
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Create canvas and compress
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Determine output format
        const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const quality = format === 'image/png' ? 1 : COMPRESSED_QUALITY;
        
        const dataUrl = canvas.toDataURL(format, quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Get file size in human readable format
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

/**
 * Check if file is an image
 */
function isImageFile(file) {
  return file.type.startsWith('image/');
}

/**
 * Check if file is a video
 */
function isVideoFile(file) {
  return file.type.startsWith('video/');
}

// ============================================================
// PROFILE IMAGE UPLOAD WITH COMPRESSION
// ============================================================
function setupProfileUpload() {
  const uploadInput = document.getElementById('profileUpload');
  const previewImg = document.getElementById('profilePreviewImg');
  const previewPlaceholder = document.querySelector('.preview-placeholder');
  const imageUrlInput = document.getElementById('aboutImage');
  const applyUrlBtn = document.getElementById('applyProfileUrl');
  const removeBtn = document.getElementById('removeProfileImage');
  const fileInfo = document.getElementById('profileFileInfo');
  
  if (!uploadInput) return;
  
  // Handle file upload with compression
  uploadInput.addEventListener('change', async function(e) {
    const file = this.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file');
      this.value = '';
      return;
    }
    
    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      showToast(`Image too large (${formatFileSize(file.size)}). Maximum is ${formatFileSize(MAX_IMAGE_SIZE)}`);
      this.value = '';
      return;
    }
    
    // Show compression progress
    showCompressionProgress(true);
    updateCompressionProgress(0, 'Processing...');
    
    try {
      // Compress the image
      const compressedDataUrl = await compressImage(file);
      
      // Show the compressed image
      previewImg.src = compressedDataUrl;
      previewImg.style.display = 'block';
      if (previewPlaceholder) previewPlaceholder.style.display = 'none';
      
      // Update file info
      const compressedSize = Math.round((compressedDataUrl.length * 3) / 4);
      updateFileInfo(file.name, file.size, compressedSize);
      
      // Store the compressed data URL
      imageUrlInput.value = compressedDataUrl;
      
      collectData();
      renderPreview();
      showToast('✅ Image uploaded and optimized!');
    } catch (error) {
      console.error('Compression error:', error);
      showToast('Error processing image. Please try again.');
      // Fallback: use original file
      const reader = new FileReader();
      reader.onload = function(event) {
        previewImg.src = event.target.result;
        previewImg.style.display = 'block';
        if (previewPlaceholder) previewPlaceholder.style.display = 'none';
        imageUrlInput.value = event.target.result;
        collectData();
        renderPreview();
      };
      reader.readAsDataURL(file);
    } finally {
      showCompressionProgress(false);
    }
  });
  
  // Handle URL input
  applyUrlBtn.addEventListener('click', function() {
    const url = imageUrlInput.value.trim();
    if (!url) {
      showToast('Please enter an image URL');
      return;
    }
    previewImg.src = url;
    previewImg.onload = function() {
      previewImg.style.display = 'block';
      if (previewPlaceholder) previewPlaceholder.style.display = 'none';
      if (fileInfo) fileInfo.innerHTML = '';
      collectData();
      renderPreview();
    };
    previewImg.onerror = function() {
      showToast('Invalid image URL');
    };
  });
  
  // Handle URL input with Enter key
  imageUrlInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyUrlBtn.click();
    }
  });
  
  // Handle remove
  removeBtn.addEventListener('click', function() {
    previewImg.src = '';
    previewImg.style.display = 'none';
    if (previewPlaceholder) previewPlaceholder.style.display = 'flex';
    imageUrlInput.value = '';
    uploadInput.value = '';
    if (fileInfo) fileInfo.innerHTML = '';
    collectData();
    renderPreview();
  });
}

function updateFileInfo(name, originalSize, compressedSize) {
  const fileInfo = document.getElementById('profileFileInfo');
  if (!fileInfo) return;
  
  const savings = Math.round((1 - compressedSize / originalSize) * 100);
  fileInfo.innerHTML = `
    <span class="file-name">${escapeHTML(name)}</span>
    <span class="file-size">${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)}</span>
    <span class="compression-info">↓ ${savings}% smaller</span>
  `;
}

function showCompressionProgress(show) {
  const progress = document.querySelector('.compression-progress') || createCompressionProgress();
  progress.classList.toggle('active', show);
}

function createCompressionProgress() {
  const container = document.querySelector('.upload-options');
  if (!container) return null;
  
  const existing = container.querySelector('.compression-progress');
  if (existing) return existing;
  
  const progress = document.createElement('div');
  progress.className = 'compression-progress';
  progress.innerHTML = `
    <span style="font-size:0.75rem;">🔄</span>
    <div class="progress-bar">
      <div class="progress-fill"></div>
    </div>
    <span class="progress-text">Processing...</span>
  `;
  container.appendChild(progress);
  return progress;
}

function updateCompressionProgress(percent, text) {
  const progress = document.querySelector('.compression-progress');
  if (!progress) return;
  const fill = progress.querySelector('.progress-fill');
  const textEl = progress.querySelector('.progress-text');
  if (fill) fill.style.width = Math.min(percent, 100) + '%';
  if (textEl) textEl.textContent = text || 'Processing...';
}

// ============================================================
// PROJECT IMAGE UPLOAD WITH MEDIA SUPPORT
// ============================================================
function setupProjectImageUpload(card) {
  const uploadInput = card.querySelector('.project-image-upload-input');
  const previewContainer = card.querySelector('.project-preview');
  const placeholder = card.querySelector('.project-preview-placeholder');
  const urlInput = card.querySelector('.project-image-url-input');
  const applyBtn = card.querySelector('.project-image-apply');
  const removeBtn = card.querySelector('.project-image-remove');
  const imageField = card.querySelector('.project-image-input');
  const fileInfo = card.querySelector('.file-info-small');
  
  if (!uploadInput) return;
  
  // Handle file upload with compression for images
  uploadInput.addEventListener('change', async function(e) {
    const file = this.files[0];
    if (!file) return;
    
    // Check if it's a video
    if (isVideoFile(file)) {
      if (file.size > MAX_VIDEO_SIZE) {
        showToast(`Video too large (${formatFileSize(file.size)}). Maximum is ${formatFileSize(MAX_VIDEO_SIZE)}`);
        this.value = '';
        return;
      }
      
      // For videos, just read as data URL (no compression)
      const reader = new FileReader();
      reader.onload = function(event) {
        const dataUrl = event.target.result;
        previewContainer.innerHTML = `
          <video src="${dataUrl}" muted></video>
          <span class="media-type-badge">🎬 Video</span>
        `;
        imageField.value = dataUrl;
        if (fileInfo) fileInfo.textContent = `📹 ${file.name} (${formatFileSize(file.size)})`;
        collectData();
        renderPreview();
      };
      reader.readAsDataURL(file);
      return;
    }
    
    // Handle image files with compression
    if (isImageFile(file)) {
      if (file.size > MAX_IMAGE_SIZE) {
        showToast(`Image too large (${formatFileSize(file.size)}). Maximum is ${formatFileSize(MAX_IMAGE_SIZE)}`);
        this.value = '';
        return;
      }
      
      try {
        const compressedDataUrl = await compressImage(file);
        previewContainer.innerHTML = `<img src="${compressedDataUrl}" alt="Project image" />`;
        imageField.value = compressedDataUrl;
        const compressedSize = Math.round((compressedDataUrl.length * 3) / 4);
        if (fileInfo) {
          fileInfo.textContent = `🖼️ ${file.name} (${formatFileSize(file.size)} → ${formatFileSize(compressedSize)})`;
        }
        collectData();
        renderPreview();
        showToast('✅ Image uploaded and optimized!');
      } catch (error) {
        console.error('Compression error:', error);
        // Fallback
        const reader = new FileReader();
        reader.onload = function(event) {
          previewContainer.innerHTML = `<img src="${event.target.result}" alt="Project image" />`;
          imageField.value = event.target.result;
          if (fileInfo) fileInfo.textContent = `🖼️ ${file.name} (${formatFileSize(file.size)})`;
          collectData();
          renderPreview();
        };
        reader.readAsDataURL(file);
      }
      return;
    }
    
    // Unsupported file type
    showToast('Please upload an image or video file');
    this.value = '';
  });
  
  // Handle URL input (supports both images and videos)
  applyBtn.addEventListener('click', function() {
    const url = urlInput.value.trim();
    if (!url) {
      showToast('Please enter a URL');
      return;
    }
    
    // Check if URL is a video (common video extensions)
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
    const isVideoUrl = videoExtensions.some(ext => url.toLowerCase().includes(ext));
    
    if (isVideoUrl) {
      previewContainer.innerHTML = `
        <video src="${url}" muted></video>
        <span class="media-type-badge">🎬 Video</span>
      `;
    } else {
      previewContainer.innerHTML = `<img src="${url}" alt="Project image" />`;
    }
    
    imageField.value = url;
    if (fileInfo) fileInfo.textContent = `🔗 ${url}`;
    collectData();
    renderPreview();
  });
  
  // Handle URL input with Enter key
  urlInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyBtn.click();
    }
  });
  
  // Handle remove
  removeBtn.addEventListener('click', function() {
    previewContainer.innerHTML = `<span class="placeholder">📷</span>`;
    urlInput.value = '';
    uploadInput.value = '';
    imageField.value = '';
    if (fileInfo) fileInfo.textContent = '';
    collectData();
    renderPreview();
  });
}

// ============================================================
// UPDATE PROJECT CARD HTML TO INCLUDE MEDIA SUPPORT
// ============================================================
function createProjectCardHTML(p) {
  // Determine what's in the preview
  let previewHTML = `<span class="placeholder">📷</span>`;
  if (p.image) {
    const isVideo = p.image.includes('.mp4') || p.image.includes('.webm') || 
                    p.image.includes('.mov') || p.image.includes('.avi');
    if (isVideo) {
      previewHTML = `<video src="${escapeHTML(p.image)}" muted></video><span class="media-type-badge">🎬 Video</span>`;
    } else {
      previewHTML = `<img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.title)}" />`;
    }
  }
  
  return `
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
        <label>Media (Image or Video)</label>
        <div class="project-image-upload">
          <div class="project-preview">
            ${previewHTML}
          </div>
          <div class="upload-actions">
            <label class="upload-btn-small">
              📁 Upload
              <input type="file" class="project-image-upload-input" accept="image/*,video/*" />
            </label>
            <input type="url" class="project-image-url-input" placeholder="Image or video URL..." value="${escapeHTML(p.image)}" />
            <button class="btn-apply-small">Apply</button>
            <button class="btn-remove-small">× Remove</button>
            <span class="file-info-small">${p.image ? '🔗 ' + escapeHTML(p.image.substring(0, 50)) + (p.image.length > 50 ? '...' : '') : ''}</span>
          </div>
        </div>
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
}

// Update the addProject function to use the new HTML
function addProject(projectData = null) {
  const card = document.createElement('div');
  card.className = 'project-card';
  card.setAttribute('role', 'listitem');
  
  const p = projectData || { 
    title: '', description: '', category: '', year: '', 
    image: '', github: '', live: '', featured: false 
  };
  
  card.innerHTML = createProjectCardHTML(p);
  
  // Setup project image upload
  setupProjectImageUpload(card);
  
  // Remove project
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
// UPDATE INIT FUNCTION TO SETUP PROFILE UPLOAD
// ============================================================
// Add this to the init function:
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
  
  // Setup profile upload with compression
  setupProfileUpload();
  
  // Set initial step
  navigateTo('identity');
  
  // Setup events
  setupEventListeners();
  
  // Set initial spacing value
  DOM.spacingValue.textContent = 'Medium';
  
  console.log('✨ Portfolio Builder Pro initialized successfully!');
  console.log('📝 Fill in your details and generate your portfolio.');
  console.log('💡 Tip: Press Ctrl+S to save your draft');
  console.log('📸 Images are automatically compressed for smaller file size.');
  console.log('🎬 Videos up to 50MB are supported.');
}
