/**
 * Personal Portfolio Client Script
 * Developer: Ephraim Kumar
 * Title: Java & Python Learner | Aspiring Software Engineer
 */

document.addEventListener('DOMContentLoaded', () => {
    let allProjectsData = [];

    // Auto-update footer copyright year
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // Initialize core components & dynamic API fetching
    initNavbarScroll();
    initMobileMenu();
    initActiveNavHighlight();
    loadProjects();
    loadSkills();
    loadAchievements();
    initContactForm();

    // --------------------------------------------------------------------------
    // NAVBAR & MOBILE MENU
    // --------------------------------------------------------------------------
    function initNavbarScroll() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    function initMobileMenu() {
        const toggleBtn = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        if (!toggleBtn || !navMenu) return;

        toggleBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                if (navMenu.classList.contains('active')) {
                    icon.className = 'fa-solid fa-xmark';
                } else {
                    icon.className = 'fa-solid fa-bars';
                }
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = toggleBtn.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-bars';
            });
        });
    }

    function initActiveNavHighlight() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        window.addEventListener('scroll', () => {
            let currentSectionId = '';
            const scrollY = window.scrollY;

            sections.forEach(section => {
                const sectionTop = section.offsetTop - 120;
                const sectionHeight = section.offsetHeight;
                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    currentSectionId = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    // --------------------------------------------------------------------------
    // DYNAMIC PROJECTS FETCHING FROM REST API
    // --------------------------------------------------------------------------
    async function loadProjects() {
        const projectsGrid = document.getElementById('projects-grid');
        if (!projectsGrid) return;

        try {
            const response = await fetch('/api/projects');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const jsonResult = await response.json();
            if (jsonResult.status === 'success' && Array.isArray(jsonResult.data)) {
                allProjectsData = jsonResult.data;
                renderProjects(allProjectsData);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    }

    function renderProjects(projectsList) {
        const projectsGrid = document.getElementById('projects-grid');
        if (!projectsGrid) return;

        if (!projectsList || projectsList.length === 0) {
            projectsGrid.innerHTML = `
                <div class="glass-card empty-projects-card">
                    <i class="fa-solid fa-laptop-code empty-icon"></i>
                    <h3>Projects Coming Soon</h3>
                    <p>
                        I am currently building and learning through hands-on development in Java, Python, and Flask. 
                        As soon as my projects are complete, they will appear here dynamically from Supabase!
                    </p>
                </div>
            `;
            return;
        }

        const cardsHTML = projectsList.map(proj => {
            const techs = Array.isArray(proj.technologies) 
                ? proj.technologies 
                : (proj.technologies ? proj.technologies.split(',') : []);

            const techPills = techs.map(t => `<span class="tech-tag">${escapeHTML(t.trim())}</span>`).join('');
            const defaultImg = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';
            const imgUrl = (proj.image_url && proj.image_url.trim()) ? proj.image_url.trim() : defaultImg;

            const githubBtn = (proj.github_url && proj.github_url.trim() && proj.github_url.trim() !== '#') ? `
                <a href="${escapeHTML(proj.github_url.trim())}" target="_blank" rel="noopener noreferrer" class="project-link">
                    <i class="fa-brands fa-github"></i> GitHub Repository
                </a>
            ` : '';

            const hasLiveDemo = proj.live_url && 
                                proj.live_url.trim() !== '' && 
                                proj.live_url.trim() !== '#' && 
                                !proj.live_url.trim().toLowerCase().includes('example.com');

            const liveBtn = hasLiveDemo ? `
                <a href="${escapeHTML(proj.live_url.trim())}" target="_blank" rel="noopener noreferrer" class="project-link" style="color: var(--accent);">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Live Demo
                </a>
            ` : '';

            return `
                <article class="glass-card project-card">
                    <div class="project-img-wrapper">
                        <img src="${escapeHTML(imgUrl)}" 
                             alt="${escapeHTML(proj.title || 'Project')}" 
                             class="project-img"
                             loading="lazy"
                             onerror="this.onerror=null; this.src='${defaultImg}';">
                    </div>
                    <div class="project-body">
                        <h3 class="project-title">${escapeHTML(proj.title || 'Project Title')}</h3>
                        <p class="project-desc">${escapeHTML(proj.description || 'Project description.')}</p>
                        <div class="project-techs">${techPills}</div>
                        <div class="project-links">
                            ${githubBtn}
                            ${liveBtn}
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        projectsGrid.innerHTML = cardsHTML;
    }

    // --------------------------------------------------------------------------
    // DYNAMIC SKILLS FETCHING FROM REST API
    // --------------------------------------------------------------------------
    async function loadSkills() {
        try {
            const response = await fetch('/api/skills');
            if (!response.ok) return;

            const json = await response.json();
            if (json.status === 'success' && Array.isArray(json.data)) {
                renderSkillsGrouped(json.data);
            }
        } catch (err) {
            console.error('Error loading skills from API:', err);
        }
    }

    function renderSkillsGrouped(skillsList) {
        const skillsContainer = document.getElementById('skills-grid') || document.querySelector('.skills-grid');
        if (!skillsContainer) return;

        if (!skillsList || skillsList.length === 0) {
            skillsContainer.innerHTML = `
                <div class="glass-card empty-projects-card" style="grid-column: 1 / -1;">
                    <i class="fa-solid fa-sliders empty-icon"></i>
                    <h3>No skills found</h3>
                    <p>Skills added from the Admin Panel will appear here dynamically.</p>
                </div>
            `;
            return;
        }

        const categories = {};
        skillsList.forEach(s => {
            const cat = s.category || 'Other';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(s);
        });

        const iconMap = {
            'Programming': 'fa-code',
            'Backend': 'fa-server',
            'Database': 'fa-database',
            'Tools': 'fa-wrench'
        };

        const html = Object.keys(categories).map(catName => {
            const catIcon = iconMap[catName] || 'fa-sliders';
            const items = categories[catName].map(item => `
                <div class="skill-item">
                    <span class="skill-pill">
                        <i class="${escapeHTML(item.icon || 'fa-solid fa-code')}"></i> 
                        ${escapeHTML(item.name.toUpperCase())}
                    </span>
                    ${item.level ? `<span class="skill-status-tag">${escapeHTML(item.level)}</span>` : ''}
                </div>
            `).join('');

            return `
                <div class="glass-card skill-card">
                    <div class="skill-card-header">
                        <i class="fa-solid ${catIcon} skill-icon"></i>
                        <h3>${escapeHTML(catName)}</h3>
                    </div>
                    <div class="skill-tags">
                        ${items}
                    </div>
                </div>
            `;
        }).join('');

        skillsContainer.innerHTML = html;
    }

    // --------------------------------------------------------------------------
    // DYNAMIC ACHIEVEMENTS FETCHING FROM REST API
    // --------------------------------------------------------------------------

    // --------------------------------------------------------------------------
    // DYNAMIC ACHIEVEMENTS FETCHING FROM REST API
    // --------------------------------------------------------------------------
    async function loadAchievements() {
        const achievementsGrid = document.getElementById('achievements-grid');
        if (!achievementsGrid) return;

        try {
            const response = await fetch('/api/achievements');
            if (!response.ok) return;

            const json = await response.json();
            if (json.status === 'success' && Array.isArray(json.data)) {
                renderAchievements(json.data);
            }
        } catch (err) {
            console.error('Error loading achievements:', err);
        }
    }

    function renderAchievements(achList) {
        const grid = document.getElementById('achievements-grid');
        if (!grid) return;

        if (!achList || achList.length === 0) {
            grid.innerHTML = `
                <div class="glass-card empty-projects-card" style="grid-column: 1 / -1;">
                    <i class="fa-solid fa-trophy empty-icon"></i>
                    <h3>No achievements or certifications added yet.</h3>
                    <p>Certifications, academic accomplishments, and competition recognitions will be displayed here as they are added.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = achList.map(a => {
            const category = escapeHTML(a.category || 'Achievement');
            const title = escapeHTML(a.title || 'Untitled Record');
            const issuer = a.issuer ? escapeHTML(a.issuer) : '';
            const date = escapeHTML(a.date || '');
            const description = escapeHTML(a.description || '');
            const certUrl = a.certificate_url ? escapeHTML(a.certificate_url.trim()) : '';
            const extUrl = a.external_url ? escapeHTML(a.external_url.trim()) : '';
            const imgUrl = a.image_url ? escapeHTML(a.image_url.trim()) : '';

            const isAchievement = category.toLowerCase().includes('achievement');
            const catIcon = isAchievement ? 'fa-trophy' : 'fa-certificate';

            const canOpenCert = certUrl || imgUrl;
            const clickHandler = imgUrl 
                ? `onclick="openCertImageModal('${imgUrl}', '${title}')"` 
                : (certUrl ? `onclick="window.open('${certUrl}', '_blank')"` : '');

            const imageHTML = (imgUrl && imgUrl !== '') ? `
                <div class="achievement-img-wrapper" style="cursor: pointer;" ${clickHandler} title="Click to view full certificate">
                    <img src="${imgUrl}" 
                         alt="${title}" 
                         class="achievement-img"
                         loading="lazy"
                         onerror="this.parentElement.style.display='none';">
                </div>
            ` : '';

            // Action Buttons
            const linkedInBtn = (extUrl && extUrl.toLowerCase().includes('linkedin')) ? `
                <a href="${extUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
                    <i class="fa-brands fa-linkedin"></i> View LinkedIn Post
                </a>
            ` : ((extUrl && extUrl !== '#') ? `
                <a href="${extUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> External Link
                </a>
            ` : '');

            const certBtn = (certUrl && certUrl !== '#') ? `
                <a href="${certUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
                    <i class="fa-solid fa-award"></i> View Certificate
                </a>
            ` : ((imgUrl && imgUrl !== '') ? `
                <button type="button" ${clickHandler} class="btn btn-outline btn-sm">
                    <i class="fa-solid fa-award"></i> View Certificate
                </button>
            ` : '');

            return `
                <div class="glass-card achievement-card">
                    <div class="achievement-header">
                        <div class="achievement-title-area">
                            <span class="achievement-cat-badge"><i class="fa-solid ${catIcon}"></i> ${category}${issuer ? ` • ${issuer}` : ''}</span>
                            <h3 ${canOpenCert ? `style="cursor: pointer;" ${clickHandler} title="Click to view certificate"` : ''}>${title}</h3>
                        </div>
                        ${date ? `<span class="achievement-date"><i class="fa-regular fa-calendar"></i> ${date}</span>` : ''}
                    </div>

                    ${imageHTML}

                    ${description ? `<p class="achievement-desc">${description}</p>` : ''}

                    ${(linkedInBtn || certBtn) ? `
                        <div class="achievement-footer" style="gap: 0.75rem; flex-wrap: wrap;">
                            ${linkedInBtn}
                            ${certBtn}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    // --------------------------------------------------------------------------
    // CONTACT FORM VALIDATION & SUBMISSION
    // --------------------------------------------------------------------------
    function initContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');
        const submitBtn = document.getElementById('submit-btn');
        const formSpinner = document.getElementById('form-spinner');
        const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
        const btnIcon = submitBtn ? submitBtn.querySelector('.btn-icon') : null;
        const formStatus = document.getElementById('form-status');

        [nameInput, emailInput, messageInput].forEach(input => {
            if (!input) return;
            input.addEventListener('input', () => {
                const errEl = document.getElementById(`${input.id}-error`);
                if (errEl) errEl.textContent = '';
                if (formStatus) formStatus.style.display = 'none';
            });
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            let isValid = true;
            const nameVal = nameInput.value.trim();
            const emailVal = emailInput.value.trim();
            const messageVal = messageInput.value.trim();

            if (!nameVal) {
                showError('name-error', 'Please enter your name.');
                isValid = false;
            }

            const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
            if (!emailVal) {
                showError('email-error', 'Please enter your email address.');
                isValid = false;
            } else if (!emailRegex.test(emailVal)) {
                showError('email-error', 'Please enter a valid email address.');
                isValid = false;
            }

            if (!messageVal) {
                showError('message-error', 'Please enter a message.');
                isValid = false;
            } else if (messageVal.length < 5) {
                showError('message-error', 'Message must be at least 5 characters long.');
                isValid = false;
            }

            if (!isValid) return;

            if (submitBtn) submitBtn.disabled = true;
            if (btnText) btnText.textContent = 'Sending...';
            if (btnIcon) btnIcon.style.display = 'none';
            if (formSpinner) formSpinner.style.display = 'inline-block';
            if (formStatus) formStatus.style.display = 'none';

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: nameVal, email: emailVal, message: messageVal })
                });

                const result = await response.json();

                if (response.ok && result.status === 'success') {
                    showStatus(formStatus, 'Thank you! Your message has been sent successfully.', 'success');
                    form.reset();
                } else {
                    showStatus(formStatus, 'Something went wrong. Please try again.', 'error');
                }
            } catch (err) {
                console.error('Contact submission error:', err);
                showStatus(formStatus, 'Something went wrong. Please try again.', 'error');
            } finally {
                if (submitBtn) submitBtn.disabled = false;
                if (btnText) btnText.textContent = 'Send Message';
                if (btnIcon) btnIcon.style.display = 'inline-block';
                if (formSpinner) formSpinner.style.display = 'none';
            }
        });
    }

    function showError(elementId, message) {
        const el = document.getElementById(elementId);
        if (el) el.textContent = message;
    }

    function showStatus(containerEl, message, type) {
        if (!containerEl) return;
        containerEl.textContent = message;
        containerEl.className = `form-status ${type}`;
        containerEl.style.display = 'block';
    }

    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});

// --------------------------------------------------------------------------
// CERTIFICATE LIGHTBOX MODAL HANDLERS
// --------------------------------------------------------------------------
window.openCertImageModal = function(imgUrl, title) {
    const overlay = document.getElementById('cert-modal-overlay');
    const modalImg = document.getElementById('cert-modal-img');
    const modalTitle = document.getElementById('cert-modal-title');
    if (!overlay || !modalImg) {
        window.open(imgUrl, '_blank');
        return;
    }
    modalImg.src = imgUrl;
    if (modalTitle) modalTitle.textContent = title || 'Certificate';
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

window.closeCertImageModal = function() {
    const overlay = document.getElementById('cert-modal-overlay');
    if (overlay) {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    }
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.closeCertImageModal();
    }
});

document.addEventListener('click', (e) => {
    const overlay = document.getElementById('cert-modal-overlay');
    if (overlay && e.target === overlay) {
        window.closeCertImageModal();
    }
});
