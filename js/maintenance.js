document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('userRole') || 'resident';
    const userName = localStorage.getItem('userName') || 'Résident';
    
    const list = document.getElementById('maintenance-list');
    const searchInput = document.getElementById('search-maintenance');
    const btnAdd = document.getElementById('btn-add-maintenance');
    const modal = document.getElementById('modal-add-maintenance');
    const btnClose = document.getElementById('btn-close-modal');
    const btnCancel = document.getElementById('btn-cancel-modal');
    const btnSave = document.getElementById('btn-save-maintenance');
    const form = document.getElementById('form-add-maintenance');

    // --- Fetch Logic ---
    async function fetchMaintenance() {
        try {
            const res = await fetch(`${API_URL}/maintenance`);
            const data = await res.json();
            if(!data.error) {
                renderList(data);
            }
        } catch(e) { console.error('Error fetching maintenance:', e); }
    }

    // --- Render Logic ---
    function renderList(items) {
        list.innerHTML = '';
        items.forEach(item => {
            const date = new Date(item.created_at || Date.now()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
            
            let statusFr = '', statusAr = '', statusClass = '';
            if (item.status === 'pending') {
                statusFr = 'En attente'; statusAr = 'في الانتظار'; statusClass = 'status-pending';
            } else if (item.status === 'in-progress') {
                statusFr = 'En cours'; statusAr = 'قيد التنفيذ'; statusClass = 'status-in-progress';
            } else {
                statusFr = 'Résolu'; statusAr = 'تم الحل'; statusClass = 'status-resolved';
            }

            const card = document.createElement('div');
            card.className = 'maintenance-card glass-panel';
            card.setAttribute('data-id', item.id);
            card.innerHTML = `
                <div class="maintenance-header">
                    <span class="maintenance-id">${item.ticket_id}</span>
                    <span class="maintenance-status ${statusClass} lang-fr">${statusFr}</span>
                    <span class="maintenance-status ${statusClass} lang-ar hidden">${statusAr}</span>
                </div>
                <h3 class="maintenance-title">${item.category}: ${item.title}</h3>
                <div class="maintenance-info">
                    <div class="info-item">
                        <i data-lucide="user"></i>
                        <span>Signalé par: ${item.residents ? item.residents.name : userName}</span>
                    </div>
                    <div class="info-item">
                        <i data-lucide="calendar"></i>
                        <span>Date: ${date}</span>
                    </div>
                </div>
                <p class="maintenance-desc">${item.description}</p>
                <div class="maintenance-footer admin-only">
                    <button class="btn-status-change" onclick="changeStatus(${item.id}, '${item.status}')">
                        <i data-lucide="refresh-cw"></i>
                        <span class="lang-fr">Changer Statut</span>
                        <span class="lang-ar hidden">تغيير الحالة</span>
                    </button>
                </div>
            `;
            list.appendChild(card);

            if (userRole === 'resident') {
                card.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
            }
            
            const currentLang = localStorage.getItem('lang') || 'fr';
            if (currentLang === 'ar') {
                card.querySelectorAll('.lang-fr').forEach(el => el.classList.add('hidden'));
                card.querySelectorAll('.lang-ar').forEach(el => el.classList.remove('hidden'));
            }
        });
        if (window.lucide) lucide.createIcons();
    }

    // --- Modal Logic ---
    const openModal = () => modal.classList.add('active');
    const closeModal = () => {
        modal.classList.remove('active');
        form.reset();
    };

    if(btnAdd) btnAdd.addEventListener('click', openModal);
    [btnClose, btnCancel].forEach(btn => { if(btn) btn.addEventListener('click', closeModal); });

    // --- Save Logic ---
    if(btnSave) {
        btnSave.addEventListener('click', async (e) => {
            e.preventDefault();
            const title = document.getElementById('m-title').value;
            const desc = document.getElementById('m-desc').value;
            const cat = document.getElementById('m-category').value;

            if (!title || !desc) {
                alert("Veuillez remplir tous les champs.");
                return;
            }

            try {
                const res = await fetch(`${API_URL}/maintenance`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: title,
                        category: cat,
                        description: desc,
                        resident_id: null // Optionally handle resident ID if known
                    })
                });
                const data = await res.json();
                if(!res.error) {
                    closeModal();
                    fetchMaintenance();
                }
            } catch(e) { console.error('Error saving:', e); }
        });
    }

    // --- Search Logic ---
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('.maintenance-card').forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(query) ? 'flex' : 'none';
            });
        });
    }

    // --- Status Change Logic ---
    window.changeStatus = async (id, currentStatus) => {
        let newStatus = 'pending';
        if (currentStatus === 'pending') newStatus = 'in-progress';
        else if (currentStatus === 'in-progress') newStatus = 'resolved';
        else newStatus = 'pending';

        try {
            const res = await fetch(`${API_URL}/maintenance/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if(res.ok) fetchMaintenance();
        } catch(e) { console.error('Error updating status:', e); }
    };

    // Initial Fetch
    fetchMaintenance();
});
