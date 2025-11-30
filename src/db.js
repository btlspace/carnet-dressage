// src/db.js
// Module de gestion IndexedDB pour Carnet de Dressage (SPA React)

const DB_NAME = 'CarnetDressageDB';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('recherche')) {
        const rechercheStore = db.createObjectStore('recherche', { keyPath: 'id', autoIncrement: true });
        rechercheStore.createIndex('date', 'date', { unique: false });
        rechercheStore.createIndex('type_recherche', 'type_recherche', { unique: false });
      }
      if (!db.objectStoreNames.contains('obeissance')) {
        const obeissanceStore = db.createObjectStore('obeissance', { keyPath: 'id', autoIncrement: true });
        obeissanceStore.createIndex('date_debut', 'date_debut', { unique: false });
        obeissanceStore.createIndex('semaine_numero', 'semaine_numero', { unique: false });
      }
      if (!db.objectStoreNames.contains('divers')) {
        const diversStore = db.createObjectStore('divers', { keyPath: 'id', autoIncrement: true });
        diversStore.createIndex('date_debut', 'date_debut', { unique: false });
        diversStore.createIndex('semaine_numero', 'semaine_numero', { unique: false });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
    };
  });
}

// CRUD générique
export async function addFiche(storeName, data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add({ ...data, created_at: new Date().toISOString() });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getFiche(storeName, id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllFiches(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function updateFiche(storeName, id, data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put({ ...data, id });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteFiche(storeName, id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Paramètres
export async function getSettings() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get(1);
    request.onsuccess = () => {
      // Retourner les données stockées ou un objet vide (pas de données par défaut)
      const settings = request.result || {
        id: 1,
        nom_chien: '',
        substances: [],
        poseurs: [],
        onboarding_done: false
      };
      resolve(settings);
    };
    request.onerror = () => reject(request.error);
  });
}

// Vérifier si l'onboarding a été complété
export async function isOnboardingDone() {
  const settings = await getSettings();
  return settings.onboarding_done === true;
}

export async function saveSettings(settings) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    const request = store.put({ ...settings, id: 1 });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Export de toutes les données (fiches + settings + tirage)
export async function exportAllData() {
  const [recherche, obeissance, divers, settings, tirageData] = await Promise.all([
    getAllFiches('recherche'),
    getAllFiches('obeissance'),
    getAllFiches('divers'),
    getSettings(),
    getTirageData()
  ]);

  return {
    version: 2,
    exportDate: new Date().toISOString(),
    data: {
      recherche,
      obeissance,
      divers,
      settings,
      tirage: tirageData
    }
  };
}

// Import de toutes les données (compatible avec tous les formats)
export async function importAllData(importData) {
  const db = await openDB();
  
  // Compatibilité avec l'ancien format (legacy) et le nouveau format (React)
  // Format legacy: { version: "1.0", settings: {...}, fiches: { recherche: [...] } }
  // Format React v1:  { version: 1, data: { recherche: [...], settings: {...} } }
  // Format React v2:  { version: 2, data: { recherche: [...], settings: {...}, tirage: {...} } }
  let recherche, obeissance, divers, settings, tirage;
  
  if (importData.fiches) {
    // Format legacy
    recherche = importData.fiches.recherche || [];
    obeissance = importData.fiches.obeissance || [];
    divers = importData.fiches.divers || [];
    settings = importData.settings;
    tirage = null;
  } else if (importData.data) {
    // Format React
    recherche = importData.data.recherche || [];
    obeissance = importData.data.obeissance || [];
    divers = importData.data.divers || [];
    settings = importData.data.settings;
    tirage = importData.data.tirage || null;
  } else {
    // Format brut (juste les données)
    recherche = importData.recherche || [];
    obeissance = importData.obeissance || [];
    divers = importData.divers || [];
    settings = importData.settings;
    tirage = importData.tirage || null;
  }

  // Vider et remplir chaque store de fiches
  const stores = [
    { name: 'recherche', data: recherche },
    { name: 'obeissance', data: obeissance },
    { name: 'divers', data: divers }
  ];

  for (const store of stores) {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction([store.name], 'readwrite');
      const objectStore = transaction.objectStore(store.name);
      
      // Vider le store
      const clearRequest = objectStore.clear();
      clearRequest.onsuccess = () => {
        // Ajouter toutes les données
        store.data.forEach(item => {
          objectStore.add(item);
        });
      };
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Importer les settings
  if (settings) {
    await saveSettings(settings);
  }
  
  // Importer les données du tirage
  if (tirage) {
    await saveTirageData(tirage);
  }
}

// ========== TIRAGE AU SORT / ORDRE DE PASSAGE ==========

// Récupérer les données du tirage (participants + stats)
export async function getTirageData() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get('tirage');
    request.onsuccess = () => {
      const data = request.result || {
        id: 'tirage',
        participants: [],
        stats: {} // { "NomParticipant": { positions: [0, 0, 0, ...], total: 0 } }
      };
      resolve(data);
    };
    request.onerror = () => reject(request.error);
  });
}

// Sauvegarder les données du tirage
export async function saveTirageData(data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    const request = store.put({ ...data, id: 'tirage' });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Enregistrer un tirage dans les stats
export async function recordTirageResult(results) {
  const tirageData = await getTirageData();
  const stats = tirageData.stats || {};
  
  results.forEach((name, position) => {
    if (!stats[name]) {
      stats[name] = {
        positions: Array(results.length).fill(0),
        total: 0
      };
    }
    // Ajuster la taille du tableau si nécessaire
    while (stats[name].positions.length < results.length) {
      stats[name].positions.push(0);
    }
    stats[name].positions[position]++;
    stats[name].total++;
  });
  
  tirageData.stats = stats;
  await saveTirageData(tirageData);
  return stats;
}

// ========== RÉINITIALISATION DE LA BASE DE DONNÉES ==========

// Supprimer toutes les données de la base
export async function resetDatabase() {
  const db = await openDB();
  
  const stores = ['recherche', 'obeissance', 'divers', 'settings'];
  
  for (const storeName of stores) {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  return true;
}

