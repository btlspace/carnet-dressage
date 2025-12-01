import { useState, useEffect, useRef } from 'react';
import * as DB from '../db.js';
import { showToast } from '../utils.js';
import { version } from '../../package.json';
import '../styles/reglages.css';

/**
 * Page de réglages (paramètres)
 */
export default function Reglages() {
    const [activePanel, setActivePanel] = useState(null);
    const [settings, setSettings] = useState({
        nom_chien: '',
        substances: [],
        poseurs: [],
        onboarding_done: true
    });
    const fileInputRef = useRef(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const loaded = await DB.getSettings();
        if (loaded) {
            setSettings({
                nom_chien: loaded.nom_chien || '',
                substances: loaded.substances || [],
                poseurs: loaded.poseurs || [],
                onboarding_done: loaded.onboarding_done !== undefined ? loaded.onboarding_done : true
            });
        }
    };

    // Ouvrir/fermer un panel
    const showPanel = (panel) => {
        setActivePanel(panel);
    };

    const closePanel = () => {
        setActivePanel(null);
    };

    // Sauvegarder le nom du chien
    const saveChien = async (e) => {
        e.preventDefault();
        try {
            await DB.saveSettings({ ...settings });
            showToast('Nom du chien enregistré', 'success');
            closePanel();
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            showToast('Erreur lors de la sauvegarde', 'error');
        }
    };

    // Gestion des substances
    const addSubstance = () => {
        setSettings(prev => ({
            ...prev,
            substances: [...prev.substances, '']
        }));
    };

    const updateSubstance = (index, value) => {
        setSettings(prev => ({
            ...prev,
            substances: prev.substances.map((s, i) => i === index ? value : s)
        }));
    };

    const removeSubstance = (index) => {
        setSettings(prev => ({
            ...prev,
            substances: prev.substances.filter((_, i) => i !== index)
        }));
    };

    const saveSubstances = async (e) => {
        e.preventDefault();
        try {
            // Filtrer les valeurs vides
            const filtered = settings.substances.filter(s => s.trim() !== '');
            await DB.saveSettings({ ...settings, substances: filtered });
            setSettings(prev => ({ ...prev, substances: filtered }));
            showToast('Substances enregistrées', 'success');
            closePanel();
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            showToast('Erreur lors de la sauvegarde', 'error');
        }
    };

    // Gestion des poseurs
    const addPoseur = () => {
        setSettings(prev => ({
            ...prev,
            poseurs: [...prev.poseurs, '']
        }));
    };

    const updatePoseur = (index, value) => {
        setSettings(prev => ({
            ...prev,
            poseurs: prev.poseurs.map((p, i) => i === index ? value : p)
        }));
    };

    const removePoseur = (index) => {
        setSettings(prev => ({
            ...prev,
            poseurs: prev.poseurs.filter((_, i) => i !== index)
        }));
    };

    const savePoseurs = async (e) => {
        e.preventDefault();
        try {
            // Filtrer les valeurs vides
            const filtered = settings.poseurs.filter(p => p.trim() !== '');
            await DB.saveSettings({ ...settings, poseurs: filtered });
            setSettings(prev => ({ ...prev, poseurs: filtered }));
            showToast('Poseurs enregistrés', 'success');
            closePanel();
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            showToast('Erreur lors de la sauvegarde', 'error');
        }
    };

    // Export de la base de données
    const exportDatabase = async () => {
        try {
            const data = await DB.exportAllData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `carnet-dressage-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('Export réussi', 'success');
        } catch (error) {
            console.error('Erreur export:', error);
            showToast('Erreur lors de l\'export', 'error');
        }
    };

    // Import de la base de données
    const importDatabase = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            // Valider le format (legacy ou React)
            const isLegacyFormat = !!data.fiches;
            const isReactFormat = !!data.data;
            
            if (!isLegacyFormat && !isReactFormat && !data.recherche) {
                throw new Error('Format de fichier invalide');
            }
            
            // Calculer le nombre de fiches
            let fichesRecherche, fichesObeissance, fichesDivers, settingsData;
            if (isLegacyFormat) {
                fichesRecherche = data.fiches.recherche || [];
                fichesObeissance = data.fiches.obeissance || [];
                fichesDivers = data.fiches.divers || [];
                settingsData = data.settings;
            } else if (isReactFormat) {
                fichesRecherche = data.data.recherche || [];
                fichesObeissance = data.data.obeissance || [];
                fichesDivers = data.data.divers || [];
                settingsData = data.data.settings;
            } else {
                fichesRecherche = data.recherche || [];
                fichesObeissance = data.obeissance || [];
                fichesDivers = data.divers || [];
                settingsData = data.settings;
            }
            
            const totalFiches = fichesRecherche.length + fichesObeissance.length + fichesDivers.length;
            const nomChien = settingsData?.nom_chien || 'Inconnu';
            
            // Demander confirmation
            const confirmMsg = `⚠️ Cette opération va remplacer toutes les données existantes.\n\n` +
                `Données à importer :\n` +
                `• Chien : ${nomChien}\n` +
                `• ${fichesRecherche.length} fiche(s) recherche\n` +
                `• ${fichesObeissance.length} fiche(s) obéissance\n` +
                `• ${fichesDivers.length} fiche(s) divers\n` +
                `• Total : ${totalFiches} fiches\n\n` +
                `Continuer ?`;
            
            if (!window.confirm(confirmMsg)) {
                e.target.value = '';
                return;
            }
            
            await DB.importAllData(data);
            showToast('Import réussi ! Rechargement...', 'success');
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            console.error('Erreur import:', error);
            showToast('Erreur lors de l\'import: ' + error.message, 'error');
        }

        // Reset l'input pour permettre un nouvel import
        e.target.value = '';
    };

    // Réinitialiser la base de données
    const resetDatabase = async () => {
        const confirmMsg = `⚠️ ATTENTION - Action irréversible !\n\n` +
            `Cette action va supprimer TOUTES les données :\n` +
            `• Toutes les fiches (recherche, obéissance, divers)\n` +
            `• Tous les paramètres (nom du chien, substances, poseurs)\n` +
            `• Les données du tirage au sort\n\n` +
            `Cette action est IRRÉVERSIBLE.\n\n` +
            `Êtes-vous absolument sûr de vouloir continuer ?`;
        
        if (!window.confirm(confirmMsg)) return;
        
        // Double confirmation
        const doubleConfirm = window.prompt(
            'Pour confirmer, tapez "SUPPRIMER" en majuscules :'
        );
        
        if (doubleConfirm !== 'SUPPRIMER') {
            showToast('Réinitialisation annulée', 'info');
            return;
        }
        
        try {
            await DB.resetDatabase();
            showToast('Base de données réinitialisée ! Rechargement...', 'success');
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            console.error('Erreur réinitialisation:', error);
            showToast('Erreur lors de la réinitialisation', 'error');
        }
    };

    return (
        <div className="reglages-page">
            <div className="container">
                <div className="header">
                    <span className="icon-main">⚙️</span>
                    <h1>Paramètres</h1>
                    <p>Personnalisez votre carnet</p>
                </div>

                <div className="section-title">📂 Catégories</div>

                <div className="settings-categories">
                    <div 
                        className={`category-card chien ${activePanel === 'chien' ? 'active' : ''}`}
                        onClick={() => showPanel('chien')}
                    >
                        <div className="category-header">
                            <span className="category-icon">🐕</span>
                            <div className="category-info">
                                <h3>Mon chien</h3>
                                <p>Nom</p>
                            </div>
                        </div>
                    </div>

                    <div 
                        className={`category-card substances ${activePanel === 'substances' ? 'active' : ''}`}
                        onClick={() => showPanel('substances')}
                    >
                        <span className="category-badge">{settings.substances.length}</span>
                        <div className="category-header">
                            <span className="category-icon">💊</span>
                            <div className="category-info">
                                <h3>Substances</h3>
                                <p>Matières à rechercher</p>
                            </div>
                        </div>
                    </div>

                    <div 
                        className={`category-card poseurs ${activePanel === 'poseurs' ? 'active' : ''}`}
                        onClick={() => showPanel('poseurs')}
                    >
                        <span className="category-badge">{settings.poseurs.length}</span>
                        <div className="category-header">
                            <span className="category-icon">👤</span>
                            <div className="category-info">
                                <h3>Poseurs</h3>
                                <p>Poseurs de matières</p>
                            </div>
                        </div>
                    </div>

                    <div 
                        className={`category-card backup ${activePanel === 'backup' ? 'active' : ''}`}
                        onClick={() => showPanel('backup')}
                    >
                        <div className="category-header">
                            <span className="category-icon">💾</span>
                            <div className="category-info">
                                <h3>Données</h3>
                                <p>Sauvegarde et restauration</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel Chien */}
                <div className={`settings-panel ${activePanel === 'chien' ? 'active' : ''}`}>
                    <div className="panel-header">
                        <span className="panel-icon">🐕</span>
                        <h2>Mon chien</h2>
                        <button className="btn-close-panel" onClick={closePanel}>✕</button>
                    </div>

                    <form onSubmit={saveChien}>
                        <div className="form-group">
                            <label htmlFor="nom_chien">Nom du chien</label>
                            <input
                                type="text"
                                id="nom_chien"
                                value={settings.nom_chien}
                                onChange={(e) => setSettings(prev => ({ ...prev, nom_chien: e.target.value }))}
                                placeholder="Ex: Max, Bella..."
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-save">💾 Enregistrer</button>
                    </form>
                </div>

                {/* Panel Substances */}
                <div className={`settings-panel ${activePanel === 'substances' ? 'active' : ''}`}>
                    <div className="panel-header">
                        <span className="panel-icon">💊</span>
                        <h2>Substances</h2>
                        <button className="btn-close-panel" onClick={closePanel}>✕</button>
                    </div>

                    <form onSubmit={saveSubstances}>
                        <div className="items-list">
                            {settings.substances.map((substance, index) => (
                                <div key={index} className="list-item">
                                    <input
                                        type="text"
                                        value={substance}
                                        onChange={(e) => updateSubstance(index, e.target.value)}
                                        placeholder="Substance..."
                                    />
                                    <button
                                        type="button"
                                        className="btn-remove"
                                        onClick={() => removeSubstance(index)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        <div className="panel-actions">
                            <button type="button" className="btn-add-item" onClick={addSubstance}>
                                ➕ Ajouter
                            </button>
                            <button type="submit" className="btn btn-save">💾 Enregistrer</button>
                        </div>
                    </form>
                </div>

                {/* Panel Poseurs */}
                <div className={`settings-panel ${activePanel === 'poseurs' ? 'active' : ''}`}>
                    <div className="panel-header">
                        <span className="panel-icon">👤</span>
                        <h2>Poseurs</h2>
                        <button className="btn-close-panel" onClick={closePanel}>✕</button>
                    </div>

                    <form onSubmit={savePoseurs}>
                        <div className="items-list">
                            {settings.poseurs.map((poseur, index) => (
                                <div key={index} className="list-item">
                                    <input
                                        type="text"
                                        value={poseur}
                                        onChange={(e) => updatePoseur(index, e.target.value)}
                                        placeholder="Poseur..."
                                    />
                                    <button
                                        type="button"
                                        className="btn-remove"
                                        onClick={() => removePoseur(index)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="panel-actions">
                            <button type="button" className="btn-add-item" onClick={addPoseur}>
                                ➕ Ajouter
                            </button>
                            <button type="submit" className="btn btn-save">💾 Enregistrer</button>
                        </div>
                    </form>
                </div>

                {/* Panel Backup */}
                <div className={`settings-panel ${activePanel === 'backup' ? 'active' : ''}`}>
                    <div className="panel-header">
                        <span className="panel-icon">💾</span>
                        <h2>Données</h2>
                        <button className="btn-close-panel" onClick={closePanel}>✕</button>
                    </div>

                    <div className="backup-actions">
                        <button className="backup-btn export" onClick={exportDatabase}>
                            <span className="icon">📥</span>
                            <div className="info">
                                <h4>Exporter</h4>
                            </div>
                        </button>

                        <label className="backup-btn import" htmlFor="importFile">
                            <span className="icon">📤</span>
                            <div className="info">
                                <h4>Importer</h4>
                            </div>
                        </label>
                        <input
                            type="file"
                            id="importFile"
                            ref={fileInputRef}
                            accept=".json"
                            style={{ display: 'none' }}
                            onChange={importDatabase}
                        />

                        <div className="backup-separator">
                            <span>Zone dangereuse</span>
                        </div>

                        <button className="backup-btn reset" onClick={resetDatabase}>
                            <span className="icon">🗑️</span>
                            <div className="info">
                                <h4>Tout supprimer</h4>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Version de l'application */}
                <div className="app-version">
                    <span>Carnet de Dressage v{version}</span>
                </div>
            </div>
        </div>
    );
}
