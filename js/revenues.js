document.addEventListener('DOMContentLoaded', () => {
    
    const userRole = localStorage.getItem('userRole') || 'resident';

    let currentData = [];
    let currentMonth = new Date().getMonth(); // 0 to 11
    let currentYear = new Date().getFullYear(); 

    // Search Elements
    const searchInputs = [
        document.getElementById('search-input-fr'),
        document.getElementById('search-input-ar')
    ];

    // Modals & Forms
    const modal = document.getElementById('modal-add-revenue');
    const inputApt = document.getElementById('rev-apt');
    const inputAmount = document.getElementById('rev-amount');

    const btnClose = document.getElementById('btn-close-revenue');
    const btnCancel = document.getElementById('btn-cancel-revenue');
    const btnCancelAr = document.getElementById('btn-cancel-revenue-ar');
    const btnSave = document.getElementById('btn-save-revenue');
    const btnSaveAr = document.getElementById('btn-save-revenue-ar');

    // New Entry elements
    const newAptInput = document.getElementById('new-apt');
    const newOwnerInput = document.getElementById('new-owner');
    const newAmountInput = document.getElementById('new-amount');
    const newStatusSelect = document.getElementById('new-status');
    const newMonthSelect = document.getElementById('new-month');
    const newYearInput = document.getElementById('new-year');
    const btnAddEntry = document.getElementById('btn-add-entry');
    const btnSearch = document.getElementById('btn-search');
    const btnRefresh = document.getElementById('btn-refresh');

    const currentPeriodFr = document.querySelector('.current-period.lang-fr');
    const currentPeriodAr = document.querySelector('.current-period.lang-ar');
    const periodBtns = document.querySelectorAll('.period-btn');

    let currentRowToUpdate = null; // store ID

    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            loadRevenusFromAPI();
        });
    }

    const monthNamesFr = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    const monthNamesAr = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

    function updatePeriodDisplay() {
        if (currentPeriodFr) currentPeriodFr.textContent = `${monthNamesFr[currentMonth]} ${currentYear}`;
        if (currentPeriodAr) currentPeriodAr.textContent = `${monthNamesAr[currentMonth]} ${currentYear}`;
        loadRevenusFromAPI();
    }

    if (periodBtns.length >= 2) {
        periodBtns[0].addEventListener('click', () => {
            currentMonth--;
            if(currentMonth < 0) { currentMonth = 11; currentYear--; }
            updatePeriodDisplay();
        });
        periodBtns[1].addEventListener('click', () => {
            currentMonth++;
            if(currentMonth > 11) { currentMonth = 0; currentYear++; }
            updatePeriodDisplay();
        });
    }

    // --- API Calls ---
    async function fetchResidents() {
        try {
            const res = await fetch(`${API_URL}/residents`);
            return await res.json();
        } catch(e) {
            console.error("Erreur API:", e);
            return [];
        }
    }

    async function loadRevenusFromAPI() {
        try {
            const response = await fetch(`${API_URL}/revenus`);
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            
            // Filter by month
            const targetMonthYear = `${(currentMonth + 1).toString().padStart(2, '0')}-${currentYear}`;
            currentData = data.filter(d => d.month_year === targetMonthYear);

            renderTable(currentData);
            await updateSummary(currentData);

        } catch (error) {
            console.error("Erreur lors du chargement des revenus:", error);
        }
    }

    async function addRevenu(payload) {
        try {
            const res = await fetch(`${API_URL}/revenus`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            return await res.json();
        } catch(e) { console.error("API error", e); }
    }

    async function updateRevenu(id, payload) {
        try {
            const res = await fetch(`${API_URL}/revenus/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            return await res.json();
        } catch(e) { console.error("API error", e); }
    }

    async function deleteRevenu(id) {
        try {
            const res = await fetch(`${API_URL}/revenus/${id}`, {
                method: "DELETE"
            });
            return await res.json();
        } catch(e) { console.error("API error", e); }
    }

    // --- Rendering ---
    function renderTable(data) {
        const tbody = document.getElementById('revenues-tbody');
        if(!tbody) return;
        tbody.innerHTML = '';

        const currentLang = localStorage.getItem('lang') || 'fr';

        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', item.id);

            const isPaid = item.status && item.status.toLowerCase() === 'paid';
            const apt = item.apt || '-';
            const owner = item.owner || 'Inconnu';
            const amount = item.amount || 0;
            
            const monthName = monthNamesFr[currentMonth];

            let statusHTML = '';
            let actionHTML = '';

            if(isPaid) {
                // Formatting Date
                let dateStr = "";
                if (item.payment_date) {
                    const d = new Date(item.payment_date);
                    dateStr = d.toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit'});
                } else {
                    dateStr = new Date().toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit'});
                }

                statusHTML = `
                    <span class="badge paid lang-fr"><i data-lucide="check" style="width:12px; height:12px; display:inline-block; margin-right:4px;"></i> Payé le ${dateStr}</span>
                    <span class="badge paid lang-ar hidden"><i data-lucide="check" style="width:12px; height:12px; display:inline-block; margin-left:4px;"></i> دُفِع في ${dateStr}</span>
                `;
                actionHTML = `
                    <button class="btn-icon-soft delete-btn" title="Supprimer" style="color: var(--danger);"><i data-lucide="trash-2"></i></button>
                    <button class="btn-icon-soft history-btn" title="Historique"><i data-lucide="history"></i></button>
                `;
            } else {
                statusHTML = `
                    <span class="badge unpaid status-badge lang-fr">Non Payé</span>
                    <span class="badge unpaid status-badge lang-ar hidden">غير مدفوع</span>
                `;
                actionHTML = `
                    <button class="btn-pay mark-paid-btn" title="Encaisser">
                        <i data-lucide="plus-circle"></i>
                        <span class="lang-fr">Encaisser</span>
                        <span class="lang-ar hidden">تحصيل</span>
                    </button>
                    <button class="btn-icon-soft delete-btn" title="Supprimer" style="color: var(--danger);"><i data-lucide="trash-2"></i></button>
                `;
            }

            tr.innerHTML = `
                <td><div class="apt-badge">${apt}</div></td>
                <td><strong>${owner}</strong></td>
                <td>${amount} MAD</td>
                <td>${monthName}</td>
                <td>${currentYear}</td>
                <td>${statusHTML}</td>
                <td class="text-right admin-only action-cell">${actionHTML}</td>
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

        attachTableListeners();
    }

    async function updateSummary(data) {
        // Fetch residents to know expected total
        const residents = await fetchResidents();
        let totalAttendu = 0;
        if (residents && !residents.error) {
            residents.forEach(r => totalAttendu += (parseFloat(r.contribution) || 0));
        }
        
        // Add manual records that don't match residents
        let manualAdded = data.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
        // Better: purely sum from payments for 'expected'. Wait, if a payment is expected, it should be in the DB.
        // Actually, let's just use sum of all amount from `data` as Total Attendu, 
        // because we assume missing records aren't tracked yet or we just track DB sum.
        // But normally missing payments are missing rows.
        // To be safe and reflect residents sum if empty:
        if (totalAttendu === 0) {
            totalAttendu = manualAdded; // fallback
        }

        let totalEncaisse = 0;
        data.forEach(item => {
            if(item.status && item.status.toLowerCase() === 'paid') {
                totalEncaisse += parseFloat(item.amount) || 0;
            }
        });

        const reste = Math.max(0, totalAttendu - totalEncaisse);

        const summaryVals = document.querySelectorAll('.summary-val');
        if (summaryVals.length >= 3) {
            summaryVals[0].innerHTML = `${totalAttendu} <span class="text-sm" style="color: rgba(255,255,255,0.7)">MAD</span>`;
            summaryVals[1].innerHTML = `${totalEncaisse} <span class="text-sm">MAD</span>`;
            summaryVals[2].innerHTML = `${reste} <span class="text-sm">MAD</span>`;
        }
    }

    // --- Search ---
    const performSearch = (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('#revenues-tbody tr').forEach(row => {
            const textContent = row.textContent.toLowerCase();
            row.style.display = textContent.includes(query) ? '' : 'none';
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

    if (btnSearch) {
        btnSearch.addEventListener('click', () => {
            const currentInput = (localStorage.getItem('lang') === 'ar') ? searchInputs[1] : searchInputs[0];
            performSearch({ target: currentInput });
        });
    }

    // --- Modal Logic ---
    const openModal = (id, aptName) => {
        if (userRole === 'syndic') {
            currentRowToUpdate = id;
            if(inputApt) inputApt.value = aptName;
            if(modal) modal.classList.add('active');
            if(inputAmount) inputAmount.focus();
        }
    };

    const closeModal = () => {
        if(modal) modal.classList.remove('active');
        document.getElementById('form-add-revenue').reset();
        currentRowToUpdate = null;
    };

    [btnClose, btnCancel, btnCancelAr].forEach(btn => {
        if (btn) btn.addEventListener('click', closeModal);
    });

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // --- Mark as Paid (Encaisser form save) ---
    const handleSave = async (e) => {
        e.preventDefault();
        if (!currentRowToUpdate) return;
        
        const amount = document.getElementById('rev-amount').value;
        if (!amount || amount <= 0) {
            alert("Montant invalide");
            return;
        }

        const payload = {
            amount: parseFloat(amount),
            status: 'Paid',
            payment_date: new Date().toISOString()
        };

        const res = await updateRevenu(currentRowToUpdate, payload);
        if(!res.error) {
            closeModal();
            loadRevenusFromAPI(); // Refresh
        }
    };

    [btnSave, btnSaveAr].forEach(btn => {
        if (btn) btn.addEventListener('click', handleSave);
    });

    // --- Add New Entry ---
    if (btnAddEntry) {
        btnAddEntry.addEventListener('click', async () => {
            const apt = newAptInput.value;
            const owner = newOwnerInput.value;
            const amount = newAmountInput.value;
            const status = newStatusSelect.value;
            const monthIdx = parseInt(newMonthSelect.value);
            const year = newYearInput.value;

            if (!apt || !owner || !amount || !year) {
                alert("Veuillez remplir tous les champs / يرجى ملء جميع الخانات");
                return;
            }

            const month_year = `${(monthIdx + 1).toString().padStart(2, '0')}-${year}`;

            const payload = {
                apt: apt,
                owner: owner,
                amount: parseFloat(amount),
                month_year: month_year,
                status: status === 'paid' ? 'Paid' : 'Unpaid'
            };

            const res = await addRevenu([payload]);
            if (!res.error) {
                // Reset inputs
                newAptInput.value = '';
                newOwnerInput.value = '';
                newAmountInput.value = '';
                
                loadRevenusFromAPI(); // Refresh
            }
        });
    }

    const attachTableListeners = () => {
        // Encaisser
        document.querySelectorAll('.mark-paid-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tr = e.target.closest('tr');
                const id = tr.getAttribute('data-id');
                const aptName = tr.querySelector('.apt-badge').textContent.trim();
                
                // Pre-fill amount from table text
                const currentAmountText = tr.querySelector('td:nth-child(3)').textContent;
                if(inputAmount) {
                     inputAmount.value = parseFloat(currentAmountText) || 0;
                }
                openModal(id, aptName);
            });
        });

        // Supprimer
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm(localStorage.getItem('lang') === 'ar' ? "هل أنت متأكد من الحذف؟" : "Êtes-vous sûr de vouloir supprimer cette ligne ?")) {
                    const tr = e.target.closest('tr');
                    const id = tr.getAttribute('data-id');
                    await deleteRevenu(id);
                    loadRevenusFromAPI();
                }
            });
        });

        // History
        document.querySelectorAll('.history-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tr = e.target.closest('tr');
                const apt = tr.querySelector('.apt-badge').textContent.trim();
                alert((localStorage.getItem('lang') === 'ar' ? 'سجل مدفوعات ' : 'Historique des paiements pour ') + apt);
            });
        });
    };

    updatePeriodDisplay(); // Trigger initial load implicitly
});
