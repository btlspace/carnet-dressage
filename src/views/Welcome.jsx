import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as DB from '../db.js';
import { showToast } from '../utils.js';
import { useInstallPWA } from '../hooks/useInstallPWA.js';
import '../styles/welcome.css';

/**
 * Page de bienvenue - Configuration initiale
 * S'affiche uniquement quand l'onboarding n'a pas été fait
 */
export default function Welcome() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [step, setStep] = useState(1);
    const [isImporting, setIsImporting] = useState(false);
    const { isInstallable, isInstalled, installApp } = useInstallPWA();
    const [settings, setSettings] = useState({
        nom_chien: '',
        substances: [''],
        poseurs: ['']
    });

    // Gestion du nom du chien
    const handleDogName = (e) => {
        setSettings(prev => ({ ...prev, nom_chien: e.target.value }));
    };

    // Gestion des substances
    const addSubstance = () => {
        setSettings(prev => ({ ...prev, substances: [...prev.substances, ''] }));
    };

    const updateSubstance = (index, value) => {
        setSettings(prev => ({
            ...prev,
            substances: prev.substances.map((s, i) => i === index ? value : s)
        }));
    };

    const removeSubstance = (index) => {
        if (settings.substances.length > 1) {
            setSettings(prev => ({
                ...prev,
                substances: prev.substances.filter((_, i) => i !== index)
            }));
        }
    };

    // Gestion des poseurs
    const addPoseur = () => {
        setSettings(prev => ({ ...prev, poseurs: [...prev.poseurs, ''] }));
    };

    const updatePoseur = (index, value) => {
        setSettings(prev => ({
            ...prev,
            poseurs: prev.poseurs.map((p, i) => i === index ? value : p)
        }));
    };

    const removePoseur = (index) => {
        if (settings.poseurs.length > 1) {
            setSettings(prev => ({
                ...prev,
                poseurs: prev.poseurs.filter((_, i) => i !== index)
            }));
        }
    };

    // Navigation entre étapes
    const nextStep = () => {
        if (step === 1 && !settings.nom_chien.trim()) {
            showToast('Veuillez entrer le nom du chien', 'error');
            return;
        }
        setStep(step + 1);
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    // Sauvegarder et terminer
    const finish = async () => {
        try {
            // Filtrer les valeurs vides
            const cleanSettings = {
                nom_chien: settings.nom_chien.trim() || 'Mon chien',
                substances: settings.substances.filter(s => s.trim() !== ''),
                poseurs: settings.poseurs.filter(p => p.trim() !== ''),
                onboarding_done: true
            };

            // Si aucune substance, liste vide
            if (cleanSettings.substances.length === 0) {
                cleanSettings.substances = [];
            }

            // Si aucun poseur, liste vide
            if (cleanSettings.poseurs.length === 0) {
                cleanSettings.poseurs = [];
            }

            await DB.saveSettings(cleanSettings);
            showToast('Configuration terminée !', 'success');
            navigate('/');
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            showToast('Erreur lors de la sauvegarde', 'error');
        }
    };

    // Passer l'assistant (marquer onboarding comme fait avec valeurs par défaut)
    const skipSetup = async () => {
        try {
            const defaultSettings = {
                nom_chien: 'Mon chien',
                substances: [],
                poseurs: [],
                onboarding_done: true
            };
            await DB.saveSettings(defaultSettings);
            navigate('/');
        } catch (error) {
            console.error('Erreur:', error);
            navigate('/');
        }
    };

    // Importer une sauvegarde
    const handleImport = () => {
        fileInputRef.current?.click();
    };

    const processImport = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        try {
            const text = await file.text();
            const importData = JSON.parse(text);
            await DB.importAllData(importData);
            
            // Marquer l'onboarding comme fait
            const currentSettings = await DB.getSettings();
            await DB.saveSettings({ ...currentSettings, onboarding_done: true });
            
            showToast('Sauvegarde restaurée !', 'success');
            navigate('/');
        } catch (error) {
            console.error('Erreur import:', error);
            showToast('Erreur lors de l\'import', 'error');
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Mode démo - Charger des données fictives
    const loadDemoData = async () => {
        try {
            const demoSettings = {
                nom_chien: 'Rex',
                substances: ['Cannabis', 'Cocaïne', 'Héroïne', 'Arme tirée', 'Munitions'],
                poseurs: ['Jean Dupont', 'Marie Martin', 'Pierre Durand'],
                onboarding_done: true,
                demo_mode: true  // Flag pour identifier le mode démo
            };
            await DB.saveSettings(demoSettings);
            
            // Ajouter quelques fiches de démo
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            
            await DB.addFiche('recherche', {
                date: today,
                plage_horaire: 'Matin',
                types_recherche: ['Bâtiment', 'Véhicule'],
                ordre_passage: 1,
                poseur: 'Jean Dupont',
                temps_pose: 15,
                description: 'Recherche dans un entrepôt avec 3 véhicules',
                bilan: 'Rex a trouvé les 2 caches en 8 minutes',
                charges: [
                    { substance: 'Cannabis', quantite: '50g', hauteur: '1m20', commentaire: 'Cache dans coffre' },
                    { substance: 'Cocaïne', quantite: '10g', hauteur: '0m50', commentaire: 'Sous siège' }
                ]
            });

            await DB.addFiche('obeissance', {
                date_debut: yesterday,
                date_fin: today,
                semaine_numero: 48,
                jours: {
                    lundi: { matin: 'Marche en laisse - Bon', soir: 'Rappel - Excellent' },
                    mardi: { matin: 'Position couché - À revoir', soir: 'Socialisation parc' }
                },
                observations: 'Semaine productive, Rex progresse bien sur le rappel.'
            });

            showToast('Mode démo activé !', 'success');
            navigate('/');
        } catch (error) {
            console.error('Erreur mode démo:', error);
            showToast('Erreur lors du chargement démo', 'error');
        }
    };

    return (
        <div className="welcome-page">
            <div className="welcome-container">
                {/* Indicateur d'étapes */}
                <div className="steps-indicator">
                    <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
                    <div className="step-line"></div>
                    <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
                    <div className="step-line"></div>
                    <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
                </div>

                {/* Étape 1: Nom du chien */}
                {step === 1 && (
                    <div className="step-content">
                        <div className="step-icon">🐕</div>
                        <h1>Bienvenue !</h1>
                        <p className="step-description">
                            Configurons votre carnet de dressage.<br />
                            Comment s'appelle votre chien ?
                        </p>
                        
                        <div className="input-group">
                            <input
                                type="text"
                                value={settings.nom_chien}
                                onChange={handleDogName}
                                placeholder="Nom du chien..."
                                autoFocus
                                className="input-large"
                            />
                        </div>

                        <div className="step-actions">
                            <button className="btn-next" onClick={nextStep}>
                                Suivant →
                            </button>
                        </div>
                    </div>
                )}

                {/* Étape 2: Substances */}
                {step === 2 && (
                    <div className="step-content">
                        <div className="step-icon">💊</div>
                        <h1>Matières à rechercher</h1>
                        <p className="step-description">
                            Quelles substances votre chien doit-il détecter ?
                        </p>
                        
                        <div className="items-edit-list">
                            {settings.substances.map((substance, index) => (
                                <div key={index} className="item-row">
                                    <input
                                        type="text"
                                        value={substance}
                                        onChange={(e) => updateSubstance(index, e.target.value)}
                                        placeholder={`Substance ${index + 1}...`}
                                    />
                                    {settings.substances.length > 1 && (
                                        <button 
                                            className="btn-remove-item"
                                            onClick={() => removeSubstance(index)}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button className="btn-add-row" onClick={addSubstance}>
                                ➕ Ajouter une substance
                            </button>
                        </div>

                        <div className="step-actions">
                            <button className="btn-prev" onClick={prevStep}>
                                ← Retour
                            </button>
                            <button className="btn-next" onClick={nextStep}>
                                Suivant →
                            </button>
                        </div>
                    </div>
                )}

                {/* Étape 3: Poseurs */}
                {step === 3 && (
                    <div className="step-content">
                        <div className="step-icon">👥</div>
                        <h1>Équipe de poseurs</h1>
                        <p className="step-description">
                            Qui pose les matières lors des entraînements ?
                        </p>
                        
                        <div className="items-edit-list">
                            {settings.poseurs.map((poseur, index) => (
                                <div key={index} className="item-row">
                                    <input
                                        type="text"
                                        value={poseur}
                                        onChange={(e) => updatePoseur(index, e.target.value)}
                                        placeholder={`Poseur ${index + 1}...`}
                                    />
                                    {settings.poseurs.length > 1 && (
                                        <button 
                                            className="btn-remove-item"
                                            onClick={() => removePoseur(index)}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button className="btn-add-row" onClick={addPoseur}>
                                ➕ Ajouter un poseur
                            </button>
                        </div>

                        <div className="step-actions">
                            <button className="btn-prev" onClick={prevStep}>
                                ← Retour
                            </button>
                            <button className="btn-finish" onClick={finish}>
                                🎉 Terminer
                            </button>
                        </div>
                    </div>
                )}

                {/* Options alternatives */}
                <div className="welcome-options">
                    {/* Bouton d'installation PWA */}
                    {isInstallable && !isInstalled && (
                        <button className="btn-install" onClick={installApp}>
                            📲 Installer l'application sur cet appareil
                        </button>
                    )}
                    
                    {isInstalled && (
                        <p className="installed-message">✅ Application installée</p>
                    )}

                    <div className="option-divider">
                        <span>ou</span>
                    </div>
                    
                    <div className="option-buttons">
                        <button className="btn-option" onClick={handleImport} disabled={isImporting}>
                            📥 {isImporting ? 'Import...' : 'Restaurer une sauvegarde'}
                        </button>
                        <button className="btn-option" onClick={loadDemoData}>
                            🎮 Essayer en mode démo
                        </button>
                    </div>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={processImport}
                        accept=".json"
                        style={{ display: 'none' }}
                    />
                </div>

                {/* Skip option */}
                <div className="skip-setup">
                    <button onClick={skipSetup}>
                        Passer la configuration →
                    </button>
                </div>
            </div>
        </div>
    );
}
