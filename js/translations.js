window.appTranslations = {
    // Javascript Alerts & Confirmations
    "Voulez-vous vous déconnecter ?": "هل تريد تسجيل الخروج؟",
    "Rappels envoyés aux 4 résidents en retard.": "تم إرسال تذكيرات إلى 4 سكان متأخرين.",
    "Êtes-vous sûr de vouloir supprimer cette ligne ?": "هل أنت متأكد من الحذف؟",
    "Veuillez remplir tous les champs": "يرجى ملء جميع الخانات",
    "Historique des paiements pour ": "سجل مدفوعات ",
    "Erreur": "خطأ",
    "Montant invalide": "مبلغ غير صحيح",

    // Options et Statuts (Dynamic Data)
    "Non Payé": "غير مدفوع",
    "Payé": "مدفوع",
    "Espèces": "نقدًا",
    "Virement Bancaire": "تحويل بنكي",
    "Chèque": "شيك",
    
    // Types & Catégories
    "Propriétaire Résident": "مالك ومقيم",
    "Propriétaire Non-Résident": "مالك غير مقيم",
    "Locataire": "مكتري",
    "Électricité": "الماء والكهرباء",
    "Nettoyage": "النظافة",
    "Maintenance": "الصيانة",
    "Divers": "متنوعات",
    
    // Mois
    "Janvier": "يناير",
    "Février": "فبراير",
    "Mars": "مارس",
    "Avril": "أبريل",
    "Mai": "مايو",
    "Juin": "يونيو",
    "Juillet": "يوليو",
    "Août": "أغسطس",
    "Septembre": "سبتمبر",
    "Octobre": "أكتوبر",
    "Novembre": "نوفمبر",
    "Décembre": "ديسمبر"
};

window.t = function(frText) {
    if (!frText) return frText;
    const currentLang = localStorage.getItem('lang') || 'fr';
    if (currentLang === 'ar' && window.appTranslations[frText]) {
        return window.appTranslations[frText];
    }
    return frText; // Return French (original) if missing or if language is fr
};

// Overriding alert and confirm for global translation
const originalAlert = window.alert;
window.alert = function(msg) {
    originalAlert(window.t(msg));
};

const originalConfirm = window.confirm;
window.confirm = function(msg) {
    return originalConfirm(window.t(msg));
};

// Translate selects and inputs placeholders dynamically
window.applyTranslationsToElements = function() {
    const currentLang = localStorage.getItem('lang') || 'fr';
    
    // Translate select options
    document.querySelectorAll('option').forEach(opt => {
        // Save original text once
        if (!opt.hasAttribute('data-original-text')) {
            opt.setAttribute('data-original-text', opt.textContent.trim());
        }
        const originalText = opt.getAttribute('data-original-text');
        
        if (currentLang === 'ar' && window.appTranslations[originalText]) {
            opt.textContent = window.appTranslations[originalText];
        } else {
            opt.textContent = originalText;
        }
    });

    // Translate inputs placeholders
    document.querySelectorAll('input[placeholder]').forEach(input => {
        if (!input.hasAttribute('data-original-placeholder')) {
            input.setAttribute('data-original-placeholder', input.getAttribute('placeholder'));
        }
        const originalPlaceholder = input.getAttribute('data-original-placeholder');
        
        if (currentLang === 'ar' && window.appTranslations[originalPlaceholder]) {
            input.setAttribute('placeholder', window.appTranslations[originalPlaceholder]);
        } else {
            input.setAttribute('placeholder', originalPlaceholder);
        }
    });
};

