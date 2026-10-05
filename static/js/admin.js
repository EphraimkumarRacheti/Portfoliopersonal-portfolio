/**
 * Portfolio Admin Panel JavaScript Module
 * Developer: Ephraim Kumar
 * Handles Auth sign-in, Modals, Responsive drawer, Scroll position reset, and CRUD APIs
 */

document.addEventListener('DOMContentLoaded', () => {
    initAdminSidebar();
    initAdminLoginForm();
    initProjectForm();
    initSkillForm();
    initAchievementForm();
    initGlobalModalHandlers();
});

// -----------------------------------------------------------------------------
// 1. SIDEBAR RESPONSIVE TOGGLE
// -----------------------------------------------------------------------------
function initAdminSidebar() {
    const toggleBtn = document.getElementById('sidebar-toggle');
    const closeBtn = document.getElementById('sidebar-close');
    const sidebar = document.getElementById('admin-sidebar');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
        });
    }

    if (closeBtn && sidebar) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }
}

// -----------------------------------------------------------------------------
// 2. GLOBAL MODAL UX & SCROLL POSITION MANAGERS
// -----------------------------------------------------------------------------
function openModal(modalId, focusInputId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Lock background page scroll
    document.body.classList.add('modal-open');

    // Reset internal modal body scroll to top
    const modalBody = modal.querySelector('.modal-body') || modal.querySelector('.modal-card');
    if (modalBody) {
        modalBody.scrollTop = 0;
    }

    modal.style.display = 'flex';

    if (focusInputId) {
        const inputEl = document.getElementById(focusInputId);
        if (inputEl) {
            setTimeout(() => inputEl.focus(), 60);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.style.display = 'none';

    // Remove body scroll lock if no other modal is visible
    const visibleModals = document.querySelectorAll('.admin-modal[style*="display: flex"], .admin-modal[style*="display:flex"]');
    if (visibleModals.length === 0) {
        document.body.classList.remove('modal-open');
    }
}

function initGlobalModalHandlers() {
    // Escape key listener to close active modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.admin-modal');
            modals.forEach(m => {
                if (m.style.display === 'flex' || m.style.display === 'block') {
                    closeModal(m.id);
                }
            });
        }
    });

    // Backdrop click listener to close modal safely
    document.addEventListener('click', (e) => {
        if (e.target && e.target.classList && e.target.classList.contains('admin-modal')) {
            closeModal(e.target.id);
        }
    });
}

// -----------------------------------------------------------------------------
// 3. ADMIN LOGIN FORM HANDLER
// -----------------------------------------------------------------------------
function initAdminLoginForm() {
    const loginForm = document.getElementById('admin-login-form');
    if (!loginForm) return;

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('login-submit-btn');
    const spinner = document.getElementById('login-spinner');
    const statusBox = document.getElementById('login-status');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailVal = emailInput.value.trim();
        const passVal = passwordInput.value;

        if (!emailVal || !passVal) {
            showStatus(statusBox, 'Please enter both email and password.', 'error');
            return;
        }

        if (submitBtn) submitBtn.disabled = true;
        if (spinner) spinner.style.display = 'inline-block';
        if (statusBox) statusBox.style.display = 'none';

        try {
            const response = await fetch('/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailVal, password: passVal })
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                showStatus(statusBox, result.message || 'Login successful!', 'success');
                setTimeout(() => {
                    window.location.href = result.redirect || '/admin';
                }, 500);
            } else {
                showStatus(statusBox, result.message || 'Invalid email or password.', 'error');
            }
        } catch (err) {
            console.error('Login error:', err);
            showStatus(statusBox, 'An error occurred during authentication. Please try again.', 'error');
        } finally {
            if (submitBtn) submitBtn.disabled = false;
            if (spinner) spinner.style.display = 'none';
        }
    });
}

// -----------------------------------------------------------------------------
// 4. PROJECTS CRUD HANDLERS
// -----------------------------------------------------------------------------
function openProjectModal() {
    const form = document.getElementById('project-form');
    const title = document.getElementById('modal-project-title');
    const statusBox = document.getElementById('proj-status');
    if (form) form.reset();
    if (statusBox) statusBox.style.display = 'none';
    
    const projId = document.getElementById('proj-id');
    if (projId) projId.value = '';
    if (title) title.textContent = 'Add New Project';
    
    openModal('project-modal', 'proj-title');
}

function closeProjectModal() {
    closeModal('project-modal');
}

function editProject(proj) {
    openProjectModal();
    document.getElementById('modal-project-title').textContent = 'Edit Project';
    document.getElementById('proj-id').value = proj.id || '';
    document.getElementById('proj-title').value = proj.title || '';
    document.getElementById('proj-desc').value = proj.description || '';
    
    const techs = Array.isArray(proj.technologies) ? proj.technologies.join(', ') : (proj.technologies || '');
    document.getElementById('proj-techs').value = techs;
    document.getElementById('proj-github').value = proj.github_url || '';
    document.getElementById('proj-live').value = proj.live_url || '';
    document.getElementById('proj-img').value = proj.image_url || '';
}

function initProjectForm() {
    const form = document.getElementById('project-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const projId = document.getElementById('proj-id').value;
        const method = projId ? 'PUT' : 'POST';
        const endpoint = projId ? `/api/admin/projects/${projId}` : '/api/admin/projects';
        const statusBox = document.getElementById('proj-status');
        const saveBtn = document.getElementById('save-project-btn');
        const spinner = document.getElementById('proj-spinner');
        const btnText = saveBtn ? saveBtn.querySelector('.btn-text') : null;

        const githubUrl = document.getElementById('proj-github').value.trim();
        const liveUrl = document.getElementById('proj-live').value.trim();
        const imgUrl = document.getElementById('proj-img').value.trim();

        if (!isValidURL(githubUrl)) {
            if (statusBox) showStatus(statusBox, 'Invalid GitHub URL. Must start with http:// or https://', 'error');
            return;
        }
        if (!isValidURL(liveUrl)) {
            if (statusBox) showStatus(statusBox, 'Invalid Live Demo URL. Must start with http:// or https://', 'error');
            return;
        }
        if (!isValidURL(imgUrl)) {
            if (statusBox) showStatus(statusBox, 'Invalid Image URL. Must start with http:// or https://', 'error');
            return;
        }

        const payload = {
            title: document.getElementById('proj-title').value,
            description: document.getElementById('proj-desc').value,
            technologies: document.getElementById('proj-techs').value,
            github_url: githubUrl,
            live_url: liveUrl,
            image_url: imgUrl
        };

        if (saveBtn) saveBtn.disabled = true;
        if (btnText) btnText.textContent = 'Saving...';
        if (spinner) spinner.style.display = 'inline-block';
        if (statusBox) statusBox.style.display = 'none';

        try {
            const resp = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const res = await resp.json();
            if (resp.ok && res.status === 'success') {
                if (statusBox) showStatus(statusBox, res.message || 'Project saved successfully!', 'success');
                setTimeout(() => {
                    closeProjectModal();
                    window.location.reload();
                }, 400);
            } else {
                if (statusBox) showStatus(statusBox, res.message || 'Error saving project.', 'error');
                if (saveBtn) saveBtn.disabled = false;
                if (btnText) btnText.textContent = 'Save Project';
            }
        } catch (err) {
            console.error('Error saving project:', err);
            if (statusBox) showStatus(statusBox, 'Network connection error. Failed to save.', 'error');
            if (saveBtn) saveBtn.disabled = false;
            if (btnText) btnText.textContent = 'Save Project';
        } finally {
            if (spinner) spinner.style.display = 'none';
        }
    });
}

async function confirmDeleteProject(id, title) {
    if (confirm(`Are you sure you want to delete project "${title}"? This action cannot be undone.`)) {
        try {
            const resp = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
            const res = await resp.json();
            if (resp.ok && res.status === 'success') {
                window.location.reload();
            } else {
                showToast(res.message || 'Error deleting project.', 'error');
            }
        } catch (err) {
            console.error('Delete project error:', err);
            showToast('Network error while deleting project.', 'error');
        }
    }
}

// -----------------------------------------------------------------------------
// 5. SKILLS CRUD HANDLERS
// -----------------------------------------------------------------------------
function openSkillModal() {
    const form = document.getElementById('skill-form');
    const title = document.getElementById('modal-skill-title');
    const statusBox = document.getElementById('skill-status');
    if (form) form.reset();
    if (statusBox) statusBox.style.display = 'none';

    const skillId = document.getElementById('skill-id');
    if (skillId) skillId.value = '';
    if (title) title.textContent = 'Add New Skill';

    openModal('skill-modal', 'skill-name');
}

function closeSkillModal() {
    closeModal('skill-modal');
}

function editSkill(skill) {
    openSkillModal();
    document.getElementById('modal-skill-title').textContent = 'Edit Skill';
    document.getElementById('skill-id').value = skill.id || '';
    document.getElementById('skill-name').value = skill.name || '';
    document.getElementById('skill-category').value = skill.category || 'Programming';
    document.getElementById('skill-level').value = skill.level || 'Learning';
    document.getElementById('skill-icon').value = skill.icon || '';
    document.getElementById('skill-order').value = skill.display_order || 1;
}

function initSkillForm() {
    const form = document.getElementById('skill-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const skillId = document.getElementById('skill-id').value;
        const method = skillId ? 'PUT' : 'POST';
        const endpoint = skillId ? `/api/admin/skills/${skillId}` : '/api/admin/skills';
        const statusBox = document.getElementById('skill-status');
        const saveBtn = document.getElementById('save-skill-btn');
        const spinner = document.getElementById('skill-spinner');
        const btnText = saveBtn ? saveBtn.querySelector('.btn-text') : null;

        const payload = {
            name: document.getElementById('skill-name').value,
            category: document.getElementById('skill-category').value,
            level: document.getElementById('skill-level').value,
            icon: document.getElementById('skill-icon').value,
            display_order: document.getElementById('skill-order').value
        };

        if (saveBtn) saveBtn.disabled = true;
        if (btnText) btnText.textContent = 'Saving...';
        if (spinner) spinner.style.display = 'inline-block';
        if (statusBox) statusBox.style.display = 'none';

        try {
            const resp = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const res = await resp.json();
            if (resp.ok && res.status === 'success') {
                if (statusBox) showStatus(statusBox, res.message || 'Skill saved successfully!', 'success');
                setTimeout(() => {
                    closeSkillModal();
                    window.location.reload();
                }, 400);
            } else {
                if (statusBox) showStatus(statusBox, res.message || 'Error saving skill.', 'error');
                if (saveBtn) saveBtn.disabled = false;
                if (btnText) btnText.textContent = 'Save Skill';
            }
        } catch (err) {
            console.error('Error saving skill:', err);
            if (statusBox) showStatus(statusBox, 'Network error. Failed to save skill.', 'error');
            if (saveBtn) saveBtn.disabled = false;
            if (btnText) btnText.textContent = 'Save Skill';
        } finally {
            if (spinner) spinner.style.display = 'none';
        }
    });
}

async function confirmDeleteSkill(id, name) {
    if (confirm(`Are you sure you want to delete skill "${name}"?`)) {
        try {
            const resp = await fetch(`/api/admin/skills/${id}`, { method: 'DELETE' });
            const res = await resp.json();
            if (resp.ok && res.status === 'success') {
                window.location.reload();
            } else {
                showToast(res.message || 'Error deleting skill.', 'error');
            }
        } catch (err) {
            console.error('Delete skill error:', err);
            showToast('Network error while deleting skill.', 'error');
        }
    }
}

// -----------------------------------------------------------------------------
// 6. ACHIEVEMENTS & CERTIFICATIONS CRUD HANDLERS
// -----------------------------------------------------------------------------
function openAchievementModal() {
    const form = document.getElementById('achievement-form');
    const title = document.getElementById('modal-achievement-title');
    const statusBox = document.getElementById('ach-status');
    if (form) form.reset();
    if (statusBox) statusBox.style.display = 'none';

    const achId = document.getElementById('ach-id');
    if (achId) achId.value = '';
    if (title) title.textContent = 'Add Achievement / Certification';

    openModal('achievement-modal', 'ach-title');
}

function closeAchievementModal() {
    closeModal('achievement-modal');
}

function editAchievement(ach) {
    openAchievementModal();
    document.getElementById('modal-achievement-title').textContent = 'Edit Achievement / Certification';
    document.getElementById('ach-id').value = ach.id || '';
    document.getElementById('ach-title').value = ach.title || '';
    document.getElementById('ach-desc').value = ach.description || '';
    document.getElementById('ach-date').value = ach.date || '';
    
    const catSelect = document.getElementById('ach-category');
    if (catSelect) catSelect.value = ach.category || 'Achievement';
    
    document.getElementById('ach-url').value = ach.certificate_url || '';
    
    const extInput = document.getElementById('ach-external');
    if (extInput) extInput.value = ach.external_url || '';

    const imgInput = document.getElementById('ach-image');
    if (imgInput) imgInput.value = ach.image_url || '';

    document.getElementById('ach-order').value = ach.display_order || 1;
}

function isValidURL(str) {
    if (!str || !str.trim()) return true;
    const trimmed = str.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;
    try {
        new URL(trimmed);
        return true;
    } catch (_) {
        return false;
    }
}

function initAchievementForm() {
    const form = document.getElementById('achievement-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const achId = document.getElementById('ach-id').value;
        const method = achId ? 'PUT' : 'POST';
        const endpoint = achId ? `/api/admin/achievements/${achId}` : '/api/admin/achievements';
        const statusBox = document.getElementById('ach-status');
        const saveBtn = document.getElementById('save-achievement-btn');
        const spinner = document.getElementById('ach-spinner');
        const btnText = saveBtn ? saveBtn.querySelector('.btn-text') : null;

        const certUrl = document.getElementById('ach-url').value.trim();
        const extUrl = document.getElementById('ach-external') ? document.getElementById('ach-external').value.trim() : '';
        const imgUrl = document.getElementById('ach-image') ? document.getElementById('ach-image').value.trim() : '';

        // URL Validation
        if (!isValidURL(certUrl)) {
            if (statusBox) showStatus(statusBox, 'Invalid Certificate URL. Must start with http:// or https://', 'error');
            return;
        }
        if (!isValidURL(extUrl)) {
            if (statusBox) showStatus(statusBox, 'Invalid External/LinkedIn URL. Must start with http:// or https://', 'error');
            return;
        }
        if (!isValidURL(imgUrl)) {
            if (statusBox) showStatus(statusBox, 'Invalid Image URL. Must start with http:// or https://', 'error');
            return;
        }

        const payload = {
            title: document.getElementById('ach-title').value,
            description: document.getElementById('ach-desc').value,
            date: document.getElementById('ach-date').value,
            category: document.getElementById('ach-category').value,
            certificate_url: certUrl,
            external_url: extUrl,
            image_url: imgUrl,
            display_order: document.getElementById('ach-order').value
        };

        if (saveBtn) saveBtn.disabled = true;
        if (btnText) btnText.textContent = 'Saving...';
        if (spinner) spinner.style.display = 'inline-block';
        if (statusBox) statusBox.style.display = 'none';

        try {
            const resp = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const res = await resp.json();
            if (resp.ok && res.status === 'success') {
                if (statusBox) showStatus(statusBox, res.message || 'Saved successfully!', 'success');
                setTimeout(() => {
                    closeAchievementModal();
                    window.location.reload();
                }, 400);
            } else {
                if (statusBox) showStatus(statusBox, res.message || 'Error saving record.', 'error');
                if (saveBtn) saveBtn.disabled = false;
                if (btnText) btnText.textContent = 'Save Achievement';
            }
        } catch (err) {
            console.error('Error saving achievement:', err);
            if (statusBox) showStatus(statusBox, 'Network error. Failed to save.', 'error');
            if (saveBtn) saveBtn.disabled = false;
            if (btnText) btnText.textContent = 'Save Achievement';
        } finally {
            if (spinner) spinner.style.display = 'none';
        }
    });
}

async function confirmDeleteAchievement(id, title) {
    if (confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
        try {
            const resp = await fetch(`/api/admin/achievements/${id}`, { method: 'DELETE' });
            const res = await resp.json();
            if (resp.ok && res.status === 'success') {
                window.location.reload();
            } else {
                showToast(res.message || 'Error deleting achievement.', 'error');
            }
        } catch (err) {
            console.error('Delete achievement error:', err);
            showToast('Network error while deleting achievement.', 'error');
        }
    }
}



// -----------------------------------------------------------------------------
// 7. CONTACT MESSAGES DELETE HANDLER
// -----------------------------------------------------------------------------
async function confirmDeleteContact(id, name) {
    if (confirm(`Are you sure you want to delete message from "${name}"?`)) {
        try {
            const resp = await fetch(`/api/admin/contacts/${id}`, { method: 'DELETE' });
            const res = await resp.json();
            if (resp.ok && res.status === 'success') {
                window.location.reload();
            } else {
                showToast(res.message || 'Error deleting message.', 'error');
            }
        } catch (err) {
            console.error('Delete contact error:', err);
            showToast('Network error while deleting message.', 'error');
        }
    }
}

// -----------------------------------------------------------------------------
// HELPER UTILITIES
// -----------------------------------------------------------------------------
function showStatus(containerEl, message, type) {
    if (!containerEl) return;
    containerEl.textContent = message;
    containerEl.className = `form-status ${type}`;
    containerEl.style.display = 'block';
}

function showToast(message, type = 'error') {
    let toast = document.getElementById('admin-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'admin-toast';
        toast.className = 'admin-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `admin-toast ${type} show`;
    setTimeout(() => {
        toast.className = 'admin-toast';
    }, 3500);
}
