document.addEventListener('DOMContentLoaded', () => {

    const userRole = localStorage.getItem('userRole') || 'resident';

    // --- DOM Elements for Search ---
    const searchInputs = [
        document.getElementById('search-input-fr'),
        document.getElementById('search-input-ar')
    ];

    // --- DOM Elements for Add Modal ---
    const btnAdd = document.getElementById('btn-add-resident');
    const modal = document.getElementById('modal-add-resident');
    
    // Closer buttons
    const btnClose = document.getElementById('btn-close-modal');
    const btnCancel = document.getElementById('btn-cancel-modal');
    const btnCancelAr = document.getElementById('btn-cancel-modal-ar');
    
    // Save buttons
    const btnSave = document.getElementById('btn-save-resident');
    const btnSaveAr = document.getElementById('btn-save-resident-ar');

    const form = document.getElementById('form-add-resident');

    // --- DOM Elements for Edit Modal ---
    const editModal = document.getElementById('modal-edit-resident');
    const btnCloseEdit = document.getElementById('btn-close-edit-modal');
    const btnCancelEdit = document.getElementById('btn-cancel-edit');
    const btnSaveEdit = document.getElementById('btn-save-edit');
    const editForm = document.getElementById('form-edit-resident');

    let editingRowId = null; // track id for edit

    // --- API Calls ---
    async function fetchResidents() {
        try {
            const res = await fetch(`${API_URL}/residents`);
            const data = await res.json();
            if(!data.error) {
                renderResidents(data);
            }
        } catch(e) {
            console.error("Erreur API:", e);
        }
    }

    async function addResident(payload) {
        try {
            const res = await fetch(`${API_URL}/residents`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            return await res.json();
        } catch(e) {
            console.error("Erreur API:", e);
        }
    }

    async function updateResident(id, payload) {
        try {
            const res = await fetch(`${API_URL}/residents/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            return await res.json();
        } catch(e) {
            console.error("Erreur API:", e);
        }
    }

    async function deleteResident(id) {
        try {
            const res = await fetch(`${API_URL}/residents/${id}`, {
                method: "DELETE"
            });
            return await res.json();
        } catch(e) {
            console.error("Erreur API:", e);
        }
    }

    // --- Render Table ---
    function renderResidents(residents) {
        const tbody = document.querySelector('.data-table tbody');
        tbody.innerHTML = '';

        const currentLang = localStorage.getItem('lang') || 'fr';

        residents.forEach(r => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', r.id);

            const apt = r.apt || '';
            const name = r.name || 'Inconnu';
            const type = r.type || '';
            const phone = r.phone || '-';
            const email = r.email || '-';
            const contrib = r.contribution || 0;
            const status = r.status || 'À jour';

            const statusClass = status === 'À jour' ? 'active' : 'pending';

            tr.innerHTML = `
                <td>
                    <div class="apt-badge">${apt}</div>
                </td>
                <td>
                    <div class="user-desc">
                        <strong>${name}</strong>
                        <span class="text-sm">${type}</span>
                    </div>
                </td>
                <td>
                    <div class="contact-info">
                        <span><i data-lucide="phone" class="icon-sm"></i> ${phone}</span>
                        <span><i data-lucide="mail" class="icon-sm"></i> ${email}</span>
                        <span class="text-xs">Cotisation: <strong>${contrib} MAD</strong></span>
                    </div>
                </td>
                <td>
                    <span class="status ${statusClass} lang-fr">${status}</span>
                    <span class="status ${statusClass} lang-ar hidden">${status === 'À jour' ? 'مُحدَّث' : 'تأخير'}</span>
                </td>
                <td class="text-right admin-only">
                    <button class="btn-icon-soft btn-edit-resident" title="Modifier" data-id="${r.id}"><i data-lucide="edit"></i></button>
                    <button class="btn-icon-soft btn-del-resident" title="Supprimer" data-id="${r.id}" style="color:var(--danger);"><i data-lucide="trash-2"></i></button>
                </td>
            `;

            if (currentLang === 'ar') {
                tr.querySelectorAll('.lang-fr').forEach(el => el.classList.add('hidden'));
                tr.querySelectorAll('.lang-ar').forEach(el => el.classList.remove('hidden'));
            }

            tbody.appendChild(tr);
        });

        if (window.lucide) {
            lucide.createIcons();
        }

        attachActionsListeners(residents);
    }

    // --- Search functionality ---
    const performSearch = (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('.data-table tbody tr').forEach(row => {
            const textContent = row.textContent.toLowerCase();
            row.style.display = textContent.includes(query) ? '' : 'none';
        });

        // Sync both inputs
        searchInputs.forEach(input => {
            if (input && input !== e.target) {
                input.value = e.target.value;
            }
        });
    };

    searchInputs.forEach(input => {
        if (input) input.addEventListener('input', performSearch);
    });

    // --- Add Modal functionality ---
    const openModal = () => {
        if (userRole === 'syndic') {
            modal.classList.add('active');
            document.getElementById('input-name').focus();
        }
    };

    const closeModal = () => {
        modal.classList.remove('active');
        form.reset();
    };

    if (btnAdd) btnAdd.addEventListener('click', openModal);
    
    [btnClose, btnCancel, btnCancelAr].forEach(btn => {
        if (btn) btn.addEventListener('click', closeModal);
    });

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // --- Handle Save (Add New) ---
    const handleSave = async (e) => {
        e.preventDefault();

        const name = document.getElementById('input-name').value;
        const apt = document.getElementById('input-apt').value;
        const phone = document.getElementById('input-phone').value;
        const email = document.getElementById('input-email').value;
        const contribution = document.getElementById('input-contribution').value;
        const type = document.getElementById('input-type').value;

        if (!name || !apt) {
            alert('Veuillez remplir le nom et l\'appartement. / يرجى ملء الاسم والشقة.');
            return;
        }

        const payload = {
            name, apt, phone, email, type,
            contribution: parseFloat(contribution) || 0,
            status: "À jour"
        };

        const res = await addResident([payload]);
        if (!res.error) {
            closeModal();
            fetchResidents(); // reload
        }
    };

    [btnSave, btnSaveAr].forEach(btn => {
        if (btn) btn.addEventListener('click', handleSave);
    });

    // ═══════════════════════════════════════
    //  EDIT & DELETE FUNCTIONALITY
    // ═══════════════════════════════════════

    const openEditModal = (resident) => {
        editingRowId = resident.id;

        document.getElementById('edit-apt').value = resident.apt || '';
        document.getElementById('edit-name').value = resident.name || '';
        document.getElementById('edit-phone').value = resident.phone || '';
        document.getElementById('edit-email').value = resident.email || '';
        document.getElementById('edit-contribution').value = resident.contribution || '';
        
        const typeSelect = document.getElementById('edit-type');
        for (let i = 0; i < typeSelect.options.length; i++) {
            if (typeSelect.options[i].value === resident.type) {
                typeSelect.selectedIndex = i;
                break;
            }
        }

        editModal.classList.add('active');
        document.getElementById('edit-name').focus();
    };

    const closeEditModal = () => {
        editModal.classList.remove('active');
        editForm.reset();
        editingRowId = null;
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        if (!editingRowId) return;

        const payload = {
            name: document.getElementById('edit-name').value.trim(),
            apt: document.getElementById('edit-apt').value.trim(),
            phone: document.getElementById('edit-phone').value.trim(),
            email: document.getElementById('edit-email').value.trim(),
            contribution: parseFloat(document.getElementById('edit-contribution').value.trim()) || 0,
            type: document.getElementById('edit-type').value
        };

        if (!payload.name || !payload.apt) {
            alert('Veuillez remplir le nom et l\'appartement. / يرجى ملء الاسم والشقة.');
            return;
        }

        const res = await updateResident(editingRowId, payload);
        if (!res.error) {
            closeEditModal();
            fetchResidents(); // refresh
        }
    };

    [btnCloseEdit, btnCancelEdit].forEach(btn => {
        if (btn) btn.addEventListener('click', closeEditModal);
    });

    if (btnSaveEdit) btnSaveEdit.addEventListener('click', handleEditSave);

    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) closeEditModal();
        });
    }

    const attachActionsListeners = (residentsData) => {
        // Édition
        document.querySelectorAll('.btn-edit-resident').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const resident = residentsData.find(r => r.id === id);
                if (resident) openEditModal(resident);
            });
        });

        // Suppression
        document.querySelectorAll('.btn-del-resident').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if (confirm(localStorage.getItem('lang') === 'ar' ? "هل أنت متأكد من الحذف؟" : "Êtes-vous sûr de vouloir supprimer ce propriétaire ?")) {
                    await deleteResident(id);
                    fetchResidents(); // Refresh
                }
            });
        });
    };

    // Initial Load
    fetchResidents();
});
