/**
 * Module utilitaire pour le Carnet de Dressage
 * Contient les fonctions helpers : dates, toast, etc.
 */

/**
 * Calcule le numéro de semaine ISO d'une date
 * @param {Date} date 
 * @returns {number}
 */
export function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Retourne les dates de début (lundi) et fin (dimanche) de la semaine
 * @param {Date} date 
 * @returns {{start: string, end: string}} Dates au format YYYY-MM-DD
 */
export function getWeekRange(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi
    const monday = new Date(d.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
        start: formatDateISO(monday),
        end: formatDateISO(sunday)
    };
}

/**
 * Formate une date au format YYYY-MM-DD
 * @param {Date|string} date 
 * @returns {string}
 */
export function formatDateISO(date) {
    const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Formate une date au format court français (ex: 01/01/2024)
 * @param {string|Date} date 
 * @returns {string}
 */
export function formatDateCourt(date) {
    const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Formate une date au format long français (ex: lundi 1 janvier 2024)
 * @param {string|Date} date 
 * @returns {string}
 */
export function formatDateLong(date) {
    const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
    return d.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

/**
 * Affiche un toast/notification
 * @param {string} message 
 * @param {'success'|'error'|'info'} type 
 */
export function showToast(message, type = 'info') {
    // Créer le container de toast s'il n'existe pas
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }

    // Créer le toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const colors = {
        success: { bg: '#10b981', icon: '✅' },
        error: { bg: '#ef4444', icon: '❌' },
        info: { bg: '#3b82f6', icon: 'ℹ️' }
    };
    
    const { bg, icon } = colors[type] || colors.info;
    
    toast.style.cssText = `
        background: ${bg};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        animation: slideUp 0.3s ease;
    `;
    
    toast.innerHTML = `<span>${icon}</span> ${message}`;
    container.appendChild(toast);

    // Retirer après 3 secondes
    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Demande une confirmation à l'utilisateur
 * @param {string} message 
 * @returns {boolean}
 */
export function confirmAction(message) {
    return window.confirm(message);
}

export default {
    getWeekNumber,
    getWeekRange,
    formatDateISO,
    formatDateCourt,
    formatDateLong,
    showToast,
    confirmAction
};
