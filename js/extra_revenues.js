document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('userRole') || 'resident';
    const listContainer = document.getElementById('extra-revenues-list');
    const modal = document.getElementById('modal-revenue-extra');
    const form = document.getElementById('form-revenue-extra');
    const modalTitle = document.getElementById('modal-title-text');
    
    // Form fields
    const fId = document.getElementById('edit-id');
    const fTitle = document.getElementById('rev-title');
    const fDate = document.getElementById('rev-date');
    const fPayer = document.getElementById('rev-payer');
    const fAmount = document.getElementById('rev-amount');
    const fCategory = document.getElementById('rev-category');

    // Buttons
    const btnAdd = document.getElementById('btn-add-revenue-extra');
    const btnClose = document.getElementById('btn-close-modal');
    const btnCancel = document.getElementById('btn-cancel');
    const btnSave = document.getElementById('btn-save');

    let isEditing = false;

    // --- Dropdown Management ---
    const attachDropdowns = () => {
        document.querySelectorAll('.btn-dropdown-toggle').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const menu = btn.nextElementSibling;
                const isOpen = menu.classList.contains('open');
                document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('open'));
                if (!isOpen) menu.classList.add('open');
            };
        });
    };

    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('open'));
    });

    // --- Modal Logic ---
    const openModal = (data = null) => {
        if (userRole !== 'syndic') return;
        
        isEditing = !!data;
        modalTitle.textContent = isEditing ? 'Modifier le Revenu' : 'Ajouter un Revenu';
        
        if (data) {
            fId.value = data.id;
            fTitle.value = data.title;
            fDate.value = data.date;
            fPayer.value = data.payer;
            fAmount.value = data.amount;
            fCategory.value = data.category;
        } else {
            form.reset();
            fId.value = '';
            fDate.value = new Date().toISOString().split('T')[0];
        }
        
        modal.classList.add('active');
        fTitle.focus();
    };

    const closeModal = () => {
        modal.classList.remove('active');
        form.reset();
    };

    // --- CRUD Actions ---
    const deleteRevenue = (id) => {
        if (confirm('Supprimer ce revenu ?')) {
            const card = document.querySelector(`.revenue-card[data-id="${id}"]`);
            if (card) card.remove();
        }
    };

    const saveRevenue = (e) => {
        e.preventDefault();
        
        const data = {
            id: fId.value || Date.now(),
            title: fTitle.value,
            date: fDate.value,
            payer: fPayer.value || '-',
            amount: fAmount.value,
            category: fCategory.value
        };

        if (isEditing) {
            const card = document.querySelector(`.revenue-card[data-id="${data.id}"]`);
            updateCardUI(card, data);
        } else {
            createNewCard(data);
        }

        closeModal();
    };

    const updateCardUI = (card, data) => {
        card.querySelector('.revenue-title').textContent = data.title;
        card.querySelector('.revenue-amount').textContent = `+ ${data.amount} MAD`;
        const meta = card.querySelector('.revenue-meta');
        meta.innerHTML = `
            <span><i data-lucide="calendar"></i> ${data.date}</span>
            <span><i data-lucide="user"></i> ${data.payer}</span>
        `;
        if (window.lucide) lucide.createIcons();
    };

    const createNewCard = (data) => {
        const div = document.createElement('div');
        div.className = 'revenue-card';
        div.dataset.id = data.id;
        
        // Category icon logic
        let icon = 'dollar-sign';
        if (data.category === 'rent') icon = 'home';
        if (data.category === 'donation') icon = 'heart';
        if (data.category === 'interest') icon = 'trending-up';

        div.innerHTML = `
            <div class="revenue-icon"><i data-lucide="${icon}"></i></div>
            <div class="revenue-details">
                <div class="revenue-title">${data.title}</div>
                <div class="revenue-meta">
                    <span><i data-lucide="calendar"></i> ${data.date}</span>
                    <span><i data-lucide="user"></i> ${data.payer}</span>
                </div>
            </div>
            <div class="revenue-amount">+ ${data.amount} MAD</div>
            <div class="dropdown-wrapper admin-only">
                <button class="btn-icon-soft btn-dropdown-toggle"><i data-lucide="more-vertical"></i></button>
                <div class="dropdown-menu">
                    <button class="dropdown-item btn-edit"><i data-lucide="pencil"></i><span>Modifier</span></button>
                    <button class="dropdown-item btn-delete danger"><i data-lucide="trash-2"></i><span>Supprimer</span></button>
                </div>
            </div>
        `;
        listContainer.prepend(div);
        attachListenersToCard(div);
        if (window.lucide) lucide.createIcons();
    };

    const attachListenersToCard = (card) => {
        const id = card.dataset.id;
        card.querySelector('.btn-edit').onclick = () => {
            const amountStr = card.querySelector('.revenue-amount').textContent.replace('+ ', '').replace(' MAD', '');
            const date = card.querySelector('.revenue-meta span:first-child').textContent.trim();
            const payer = card.querySelector('.revenue-meta span:last-child').textContent.trim();
            
            openModal({
                id: id,
                title: card.querySelector('.revenue-title').textContent,
                date: date,
                payer: payer,
                amount: amountStr,
                category: 'other' // simplified for mock
            });
        };
        card.querySelector('.btn-delete').onclick = () => deleteRevenue(id);
        
        // Re-attach dropdown logic
        const toggle = card.querySelector('.btn-dropdown-toggle');
        toggle.onclick = (e) => {
            e.stopPropagation();
            const menu = toggle.nextElementSibling;
            const isOpen = menu.classList.contains('open');
            document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('open'));
            if (!isOpen) menu.classList.add('open');
        };
    };

    // --- Init ---
    if (btnAdd) btnAdd.addEventListener('click', () => openModal());
    btnClose.onclick = closeModal;
    btnCancel.onclick = closeModal;
    btnSave.onclick = saveRevenue;

    // Existing cards
    document.querySelectorAll('.revenue-card').forEach(attachListenersToCard);
    
    // Role handling
    if (userRole !== 'syndic') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }
});
