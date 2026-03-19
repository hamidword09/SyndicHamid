document.addEventListener('DOMContentLoaded', () => {

    const userRole = localStorage.getItem('userRole') || 'resident';

    // Search
    const searchInputs = [
        document.getElementById('search-repair'),
        document.getElementById('search-repair-ar')
    ];
    let projectCards = [];

    // Modals
    const modal = document.getElementById('modal-add-project');
    const btnAdd = document.getElementById('btn-add-project');

    // Closer buttons
    const btnClose = document.getElementById('btn-close-project');
    const btnCancel = document.getElementById('btn-cancel-project');
    const btnCancelAr = document.getElementById('btn-cancel-project-ar');
    
    // Save buttons
    const btnSave = document.getElementById('btn-save-project');
    const btnSaveAr = document.getElementById('btn-save-project-ar');

    const grid = document.querySelector('.projects-grid');
    const tbodyDetail = document.querySelector('.data-table tbody');

    let currentProjectId = null;

    // Fetch and render projects
    async function fetchRepairs() {
        try {
            const res = await fetch(`${API_URL}/repairs`);
            const data = await res.json();
            if (!data.error) {
                renderRepairs(data);
            }
        } catch(e) { console.error('Error fetching repairs:', e); }
    }

    function renderRepairs(projects) {
        if(!grid) return;
        grid.innerHTML = ''; // Clear default hardcoded projects
        
        projects.forEach(p => {
            const partAmount = (p.budget / 20).toFixed(2);
            let collected = p.collected || 0;
            let pct = (collected / p.budget) * 100;
            if(pct > 100) pct = 100;
            
            const budgetFormat = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(p.budget);
            const collectedFormat = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(collected);
            const leftFormat = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(p.budget - collected);
            
            let badgeClass = 'pending';
            let badgeTextFr = 'Nouveau';
            let badgeTextAr = 'جديد';
            if (collected > 0) {
                badgeClass = 'active';
                badgeTextFr = 'En cours';
                badgeTextAr = 'جاري';
            }
            if (collected >= p.budget) {
                badgeClass = 'active';
                badgeTextFr = 'Complété';
                badgeTextAr = 'مكتمل';
            }

            const card = document.createElement('div');
            card.className = 'repair-card';
            card.innerHTML = `
                <div class="repair-header">
                    <div class="repair-icon">
                        <i data-lucide="${p.icon || 'folder-plus'}"></i>
                    </div>
                    <span class="status ${badgeClass} lang-fr">${badgeTextFr}</span>
                    <span class="status ${badgeClass} lang-ar hidden">${badgeTextAr}</span>
                </div>
                <h3 class="repair-title">${p.title}</h3>
                <p class="repair-desc">${p.description}</p>
                
                <div class="repair-stats">
                    <div class="stat-item">
                        <span class="stat-label lang-fr">Budget Total</span>
                        <span class="stat-label lang-ar hidden">الميزانية الإجمالية</span>
                        <span class="stat-value total">${budgetFormat} MAD</span>
                    </div>
                    <div class="stat-item" style="align-items: flex-end;">
                        <span class="stat-label lang-fr">Fonds Collectés</span>
                        <span class="stat-label lang-ar hidden">الأموال المجمعة</span>
                        <span class="stat-value collected">${collectedFormat} MAD</span>
                    </div>
                </div>

                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${pct}%; background: ${pct < 100 ? 'var(--warning)' : 'var(--success)'};"></div>
                    </div>
                    <div class="progress-text">
                        <span>${pct.toFixed(0)}% collecté</span>
                        <span class="lang-fr">Reste: ${leftFormat} MAD</span>
                        <span class="lang-ar hidden">الباقي: ${leftFormat} درهم</span>
                    </div>
                </div>

                <div class="repair-actions">
                    <button class="btn-view" onclick="openDetailView('${p.title}', '${partAmount}', ${p.id})">
                        <i data-lucide="eye"></i>
                        <span class="lang-fr">Gérer les Cotisations</span>
                        <span class="lang-ar hidden">إدارة المساهمات</span>
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
        
        projectCards = document.querySelectorAll('.repair-card');
        applyLanguageClasses();
        if (window.lucide) lucide.createIcons();
    }

    // Detail View Logic
    window.openDetailView = async (projectName, partAmount, projectId) => {
        document.getElementById('projects-view').style.display = 'none';
        document.getElementById('detail-view').classList.add('active');
        currentProjectId = projectId;
        
        // Set titles & parts
        document.getElementById('project-name-display-fr').textContent = projectName;
        document.getElementById('project-name-display-ar').textContent = projectName;
        document.getElementById('project-part-fr').textContent = partAmount;
        document.getElementById('project-part-ar').textContent = partAmount;

        tbodyDetail.innerHTML = '<tr><td colspan="5">Chargement... / جاري التحميل...</td></tr>';
        
        // Fetch contributions
        try {
            const res = await fetch(`${API_URL}/repairs/${projectId}/contributions`);
            const data = await res.json();
            if(!data.error) {
                renderDetailTable(data, partAmount);
            }
        } catch(e) { console.error('Error fetching contributions:', e); }
    };

    window.closeDetailView = () => {
        document.getElementById('detail-view').classList.remove('active');
        document.getElementById('projects-view').style.display = 'block';
        currentProjectId = null;
        fetchRepairs(); // Refresh the grid to show any updated collected amounts
    };

    function renderDetailTable(contributions, partAmount) {
        tbodyDetail.innerHTML = '';
        contributions.forEach(c => {
            const isPaid = c.paid;
            let statusHTML = isPaid 
                ? `<span class="status active lang-fr">Payé</span><span class="status active lang-ar hidden">مدفوع</span>`
                : `<span class="status pending lang-fr">Non Payé</span><span class="status pending lang-ar hidden">غير مدفوع</span>`;
            
            let actionTextFr = userRole === 'syndic' ? `Encaisser` : `Encaisser`;
            let actionTextAr = userRole === 'syndic' ? `تحصيل` : `تحصيل`;
            
            let actionHTML = isPaid 
                ? `<button class="btn-icon-soft" disabled style="opacity:0.5"><i data-lucide="check-circle-2"></i></button>`
                : `<button class="btn-primary" onclick="encaisserContribution(${c.id}, this)" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 8px;">
                      <i data-lucide="plus-circle" style="width:14px; height:14px;"></i> <span class="lang-fr">${actionTextFr}</span><span class="lang-ar hidden">${actionTextAr}</span>
                   </button>`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><div class="apt-badge">${c.residents ? c.residents.apt : '?'}</div></td>
                <td><strong>${c.residents ? c.residents.name : '?'}</strong></td>
                <td class="display-part"><strong>${partAmount} MAD</strong></td>
                <td>${statusHTML}</td>
                <td class="text-right admin-only">${actionHTML}</td>
            `;
            tbodyDetail.appendChild(tr);
        });

        applyLanguageClasses();
        if(window.lucide) lucide.createIcons();
    }

    // Pay connection
    window.encaisserContribution = async (contribId, btnEl) => {
        if(confirm((localStorage.getItem('lang') === 'ar' ? 'هل تريد تأكيد التحصيل؟' : 'Confirmer l\'encaissement ?'))) {
            try {
                btnEl.disabled = true;
                const res = await fetch(`${API_URL}/repairs/contributions/${contribId}/pay`, { method: 'POST' });
                const data = await res.json();
                if(!res.error) {
                    const tr = btnEl.closest('tr');
                    const statusTd = tr.querySelector('td:nth-child(4)');
                    const actionTd = tr.querySelector('td:nth-child(5)');
                    statusTd.innerHTML = `<span class="status active lang-fr">Payé</span><span class="status active lang-ar hidden">مدفوع</span>`;
                    actionTd.innerHTML = `<button class="btn-icon-soft" disabled style="opacity:0.5"><i data-lucide="check-circle-2"></i></button>`;
                    applyLanguageClasses(tr);
                    if(window.lucide) lucide.createIcons();
                }
            } catch(e) { console.error('Error paying:', e); btnEl.disabled = false; }
        }
    };

    // Search logic
    const performSearch = (e) => {
        const query = e.target.value.toLowerCase();
        projectCards.forEach(card => {
            const textContent = card.textContent.toLowerCase();
            card.style.display = textContent.includes(query) ? 'block' : 'none';
        });

        searchInputs.forEach(input => {
            if (input && input !== e.target) {
                input.value = e.target.value;
            }
        });
    };

    searchInputs.forEach(input => {
        if (input) input.addEventListener('input', performSearch);
    });

    // Opening Modal
    const openModal = () => {
        if (userRole === 'syndic') {
            modal.classList.add('active');
            document.getElementById('project-title').focus();
        }
    };

    const closeModal = () => {
        modal.classList.remove('active');
        document.getElementById('form-add-project').reset();
    };

    if (btnAdd) btnAdd.addEventListener('click', openModal);

    [btnClose, btnCancel, btnCancelAr].forEach(btn => {
        if (btn) btn.addEventListener('click', closeModal);
    });

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Save Project
    const handleSave = async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('project-title').value;
        const desc = document.getElementById('project-desc').value;
        const budget = parseFloat(document.getElementById('project-budget').value);

        if (!title || !budget || isNaN(budget)) {
            alert("Veuillez remplir le titre et un budget valide.");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/repairs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description: desc,
                    budget,
                    icon: 'tool' // Default icon for new projects
                })
            });
            const data = await res.json();
            if(!res.error) {
                closeModal();
                fetchRepairs();
            }
        } catch(e) { console.error('Error adding project:', e); }
    };

    [btnSave, btnSaveAr].forEach(btn => {
        if (btn) btn.addEventListener('click', handleSave);
    });

    // Handle Language correctly in dynamic elements
    function applyLanguageClasses(container = document) {
        const currentLang = localStorage.getItem('lang') || 'fr';
        if (currentLang === 'ar') {
            container.querySelectorAll('.lang-fr').forEach(el => el.classList.add('hidden'));
            container.querySelectorAll('.lang-ar').forEach(el => el.classList.remove('hidden'));
        } else {
            container.querySelectorAll('.lang-ar').forEach(el => el.classList.add('hidden'));
            container.querySelectorAll('.lang-fr').forEach(el => el.classList.remove('hidden'));
        }
        
        if (userRole === 'resident') {
            container.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
        }
    }

    // Initialize display
    fetchRepairs();
});
