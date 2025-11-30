import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import * as DB from '../db.js';
import { getWeekNumber, getWeekRange, formatDateCourt, showToast, confirmAction } from '../utils.js';
import '../styles/forms.css';

/**
 * Formulaire de création/édition d'une fiche divers - Version modernisée A4
 */
export default function DiversForm() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const ficheId = searchParams.get('id');
    
    const [settings, setSettings] = useState({ nom_chien: 'Mon chien' });
    const [formData, setFormData] = useState({
        semaine_numero: '',
        date_debut: '',
        date_fin: '',
        poids: '',
        toilettage: '',
        alimentation: '',
        suivi_veterinaire: '',
        activites_physiques: '',
        comportement: '',
        observations_generales: ''
    });
    const [weekDate, setWeekDate] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);

    // Initialisation
    useEffect(() => {
        const init = async () => {
            const loadedSettings = await DB.getSettings();
            if (loadedSettings) {
                setSettings(loadedSettings);
            }

            if (ficheId) {
                setIsEditMode(true);
                const fiche = await DB.getFiche('divers', parseInt(ficheId));
                if (fiche) {
                    setFormData({
                        semaine_numero: fiche.semaine_numero || '',
                        date_debut: fiche.date_debut || '',
                        date_fin: fiche.date_fin || '',
                        poids: fiche.poids || '',
                        toilettage: fiche.toilettage || '',
                        alimentation: fiche.alimentation || '',
                        suivi_veterinaire: fiche.suivi_veterinaire || '',
                        activites_physiques: fiche.activites_physiques || '',
                        comportement: fiche.comportement || '',
                        // Rétrocompatibilité avec les anciennes fiches
                        observations_generales: fiche.observations_generales || fiche.points_attention || ''
                    });
                    if (fiche.date_debut) {
                        setWeekDate(fiche.date_debut);
                    }
                } else {
                    showToast('Fiche introuvable', 'error');
                    navigate('/liste');
                }
            } else {
                const today = new Date();
                const todayStr = today.toISOString().split('T')[0];
                setWeekDate(todayStr);
                updateWeekInfo(today);
            }
        };
        init();
    }, [ficheId, navigate]);

    const updateWeekInfo = (date) => {
        const weekNum = getWeekNumber(date);
        const weekRange = getWeekRange(date);
        setFormData(prev => ({
            ...prev,
            semaine_numero: weekNum.toString(),
            date_debut: weekRange.start,
            date_fin: weekRange.end
        }));
    };

    const handleWeekChange = (e) => {
        const value = e.target.value;
        setWeekDate(value);
        if (value) {
            const selectedDate = new Date(value + 'T00:00:00');
            updateWeekInfo(selectedDate);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Limiter le nombre de lignes dans un textarea
    const handleTextareaChange = (e, maxLines) => {
        const { name, value } = e.target;
        const lines = value.split('\n');
        if (lines.length <= maxLines) {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (isEditMode && ficheId) {
                await DB.updateFiche('divers', parseInt(ficheId), formData);
                showToast('Fiche mise à jour', 'success');
                setTimeout(() => navigate(`/voir-divers?id=${ficheId}`), 500);
            } else {
                const id = await DB.addFiche('divers', formData);
                showToast('Fiche créée', 'success');
                setTimeout(() => navigate(`/voir-divers?id=${id}`), 500);
            }
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            showToast('Erreur lors de la sauvegarde', 'error');
        }
    };

    const handleDelete = async () => {
        if (!ficheId) return;
        
        if (!confirmAction('Êtes-vous sûr de vouloir supprimer cette fiche ?')) {
            return;
        }

        try {
            await DB.deleteFiche('divers', parseInt(ficheId));
            showToast('Fiche supprimée', 'success');
            setTimeout(() => navigate('/liste'), 1000);
        } catch (error) {
            console.error('Erreur suppression:', error);
            showToast('Erreur lors de la suppression', 'error');
        }
    };

    const getWeekDisplay = () => {
        if (!formData.semaine_numero || !formData.date_debut || !formData.date_fin) {
            return 'Sélectionnez une date';
        }
        const startFormatted = formatDateCourt(formData.date_debut);
        const endFormatted = formatDateCourt(formData.date_fin);
        return `Semaine ${formData.semaine_numero} (du ${startFormatted} au ${endFormatted})`;
    };

    return (
        <>
            <style>{`
                /* Header Divers - vert */
                .header-divers {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
                }
                
                /* Titres de section Divers */
                .page.divers .section-title {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                }
                
                /* Sélecteur de semaine Divers - aligné droite */
                .week-selector.divers {
                    background: #f0fdf4;
                    border: 1px solid #86efac;
                    padding: 10px 15px;
                    border-radius: 8px;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                }
                
                .week-selector.divers .week-display {
                    color: #059669;
                    font-weight: 600;
                    font-size: 14px;
                    white-space: nowrap;
                }
                
                .week-selector.divers .week-selector-input {
                    border: 1px solid #86efac;
                    padding: 4px 6px;
                    border-radius: 5px;
                    font-size: 12px;
                    width: 130px;
                    flex-shrink: 0;
                }
                
                /* Layout 2 colonnes */
                .two-columns {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }
                
                /* Section poids avec input ligne */
                .poids-section {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 10px;
                    height: 100%;
                }
                
                .poids-section input {
                    width: 80px;
                    text-align: center;
                    font-size: 16px;
                    font-weight: 600;
                    border-bottom: 2px solid #10b981 !important;
                }
                
                .poids-section .unit {
                    font-weight: 600;
                    color: #666;
                }
                
                /* Zone texte avec lignes vertes - 2 lignes */
                .lined-textarea-2 {
                    border: 1px solid #ced4da;
                    border-radius: 4px;
                    height: 42px;
                    padding: 6px;
                    font-size: 12px;
                    line-height: 18px;
                    background: white;
                    box-sizing: border-box;
                    overflow: hidden;
                    position: relative;
                }
                
                .lined-textarea-2::before {
                    content: '';
                    position: absolute;
                    top: 6px;
                    left: 6px;
                    right: 6px;
                    bottom: 0;
                    background-image: repeating-linear-gradient(
                        to bottom,
                        transparent 0px,
                        transparent 17px,
                        #d1fae5 17px,
                        #d1fae5 18px
                    );
                    background-size: 100% 18px;
                    pointer-events: none;
                }
                
                .lined-textarea-2 textarea {
                    width: 100%;
                    height: 100%;
                    border: none;
                    padding: 0;
                    margin: 0;
                    font-family: inherit;
                    font-size: 12px;
                    line-height: 18px;
                    resize: none;
                    background: transparent;
                    box-sizing: border-box;
                    overflow: hidden;
                    position: relative;
                }
                
                /* Zone texte avec lignes vertes - 3 lignes */
                .lined-textarea-3 {
                    border: 1px solid #ced4da;
                    border-radius: 4px;
                    height: 60px;
                    padding: 6px;
                    font-size: 12px;
                    line-height: 18px;
                    background: white;
                    box-sizing: border-box;
                    overflow: hidden;
                    position: relative;
                }
                
                .lined-textarea-3::before {
                    content: '';
                    position: absolute;
                    top: 6px;
                    left: 6px;
                    right: 6px;
                    bottom: 0;
                    background-image: repeating-linear-gradient(
                        to bottom,
                        transparent 0px,
                        transparent 17px,
                        #d1fae5 17px,
                        #d1fae5 18px
                    );
                    background-size: 100% 18px;
                    pointer-events: none;
                }
                
                .lined-textarea-3 textarea {
                    width: 100%;
                    height: 100%;
                    border: none;
                    padding: 0;
                    margin: 0;
                    font-family: inherit;
                    font-size: 12px;
                    line-height: 18px;
                    resize: none;
                    background: transparent;
                    box-sizing: border-box;
                    overflow: hidden;
                    position: relative;
                }
                
                /* Zone texte avec lignes vertes - 4 lignes */
                .lined-textarea-4 {
                    border: 1px solid #ced4da;
                    border-radius: 4px;
                    height: 78px;
                    padding: 6px;
                    font-size: 12px;
                    line-height: 18px;
                    background: white;
                    box-sizing: border-box;
                    overflow: hidden;
                    position: relative;
                }
                
                .lined-textarea-4::before {
                    content: '';
                    position: absolute;
                    top: 6px;
                    left: 6px;
                    right: 6px;
                    bottom: 0;
                    background-image: repeating-linear-gradient(
                        to bottom,
                        transparent 0px,
                        transparent 17px,
                        #d1fae5 17px,
                        #d1fae5 18px
                    );
                    background-size: 100% 18px;
                    pointer-events: none;
                }
                
                .lined-textarea-4 textarea {
                    width: 100%;
                    height: 100%;
                    border: none;
                    padding: 0;
                    margin: 0;
                    font-family: inherit;
                    font-size: 12px;
                    line-height: 18px;
                    resize: none;
                    background: transparent;
                    box-sizing: border-box;
                    overflow: hidden;
                    position: relative;
                }
                
                /* Zone texte observations - 10 lignes pour remplir */
                .lined-textarea-10 {
                    border: 1px solid #ced4da;
                    border-radius: 4px;
                    height: 186px;
                    padding: 6px;
                    font-size: 12px;
                    line-height: 18px;
                    background: white;
                    box-sizing: border-box;
                    overflow: hidden;
                    position: relative;
                }
                
                .lined-textarea-10::before {
                    content: '';
                    position: absolute;
                    top: 6px;
                    left: 6px;
                    right: 6px;
                    bottom: 0;
                    background-image: repeating-linear-gradient(
                        to bottom,
                        transparent 0px,
                        transparent 17px,
                        #d1fae5 17px,
                        #d1fae5 18px
                    );
                    background-size: 100% 18px;
                    pointer-events: none;
                }
                
                .lined-textarea-10 textarea {
                    width: 100%;
                    height: 100%;
                    border: none;
                    padding: 0;
                    margin: 0;
                    font-family: inherit;
                    font-size: 12px;
                    line-height: 18px;
                    resize: none;
                    background: transparent;
                    box-sizing: border-box;
                    overflow: hidden;
                    position: relative;
                }
                
                /* Ajuster sections Divers */
                .page.divers .section {
                    margin-bottom: 6px;
                }
                
                .page.divers .section:last-child {
                    margin-bottom: 0;
                }
            `}</style>

            {/* Barre d'actions avec titre */}
            <div className="fiche-toolbar no-print">
                <div className="toolbar-left">
                    <Link 
                        to={isEditMode ? `/voir-divers?id=${ficheId}` : '/liste'} 
                        className="toolbar-btn btn-cancel"
                    >
                        ← Annuler
                    </Link>
                </div>
                <div className="toolbar-center">
                    <span className="toolbar-title divers">📝 Fiche Divers</span>
                </div>
                <div className="toolbar-right">
                    <button type="submit" form="formDivers" className="toolbar-btn btn-save">
                        💾 Enregistrer
                    </button>
                </div>
            </div>

            <form id="formDivers" onSubmit={handleSubmit}>
                <div className="page divers">
                    {/* Header */}
                    <div className="header header-divers">
                        <h1>🐕 Carnet de dressage de <span>{settings.nom_chien}</span></h1>
                        <h2>📋 Fiche de suivi hebdomadaire</h2>
                    </div>

                    {/* Sélecteur de semaine */}
                    <div className="week-selector divers">
                        <div className="week-display">{getWeekDisplay()}</div>
                        <input 
                            type="date" 
                            value={weekDate}
                            onChange={handleWeekChange}
                            className="week-selector-input"
                        />
                    </div>

                    {/* Ligne 1 : Poids + Toilettage */}
                    <div className="two-columns">
                        <div className="section">
                            <div className="section-title">⚖️ Poids</div>
                            <div className="poids-section">
                                <input 
                                    type="text" 
                                    name="poids"
                                    value={formData.poids}
                                    onChange={handleChange}
                                    placeholder="--"
                                />
                                <span className="unit">kg</span>
                            </div>
                        </div>
                        <div className="section">
                            <div className="section-title">💊 Prophylaxie / Hygiène</div>
                            <div className="lined-textarea-2">
                                <textarea 
                                    name="toilettage"
                                    value={formData.toilettage}
                                    onChange={(e) => handleTextareaChange(e, 2)}
                                    placeholder="Vermifuge, antiparasitaire, brossage..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Alimentation */}
                    <div className="section">
                        <div className="section-title">🍖 Alimentation</div>
                        <div className="lined-textarea-3">
                            <textarea 
                                name="alimentation"
                                value={formData.alimentation}
                                onChange={(e) => handleTextareaChange(e, 3)}
                                placeholder="Type de nourriture, quantité, fréquence, changements..."
                            />
                        </div>
                    </div>

                    {/* Suivi vétérinaire */}
                    <div className="section">
                        <div className="section-title">🏥 Suivi vétérinaire</div>
                        <div className="lined-textarea-4">
                            <textarea 
                                name="suivi_veterinaire"
                                value={formData.suivi_veterinaire}
                                onChange={(e) => handleTextareaChange(e, 4)}
                                placeholder="Vaccins, traitements, RDV, médicaments..."
                            />
                        </div>
                    </div>

                    {/* Activités physiques */}
                    <div className="section">
                        <div className="section-title">🏃 Activités physiques</div>
                        <div className="lined-textarea-4">
                            <textarea 
                                name="activites_physiques"
                                value={formData.activites_physiques}
                                onChange={(e) => handleTextareaChange(e, 4)}
                                placeholder="Promenades, jeux, natation, course..."
                            />
                        </div>
                    </div>

                    {/* Comportement */}
                    <div className="section">
                        <div className="section-title">🧠 Comportement</div>
                        <div className="lined-textarea-4">
                            <textarea 
                                name="comportement"
                                value={formData.comportement}
                                onChange={(e) => handleTextareaChange(e, 4)}
                                placeholder="Humeur, interactions, progrès, difficultés..."
                            />
                        </div>
                    </div>

                    {/* Observations générales - section plus grande */}
                    <div className="section">
                        <div className="section-title">📝 Observations générales</div>
                        <div className="lined-textarea-10">
                            <textarea 
                                name="observations_generales"
                                value={formData.observations_generales}
                                onChange={(e) => handleTextareaChange(e, 10)}
                                placeholder="Notes diverses, points d'attention, événements marquants..."
                            />
                        </div>
                    </div>

                    <div className="page-footer">monchien.berthel.me</div>
                </div>

                {/* Boutons d'action */}
                <div className="form-actions">
                    <button type="submit" className="btn-action btn-save">
                        💾 Enregistrer
                    </button>
                    {isEditMode && (
                        <button 
                            type="button" 
                            className="btn-action btn-delete"
                            onClick={handleDelete}
                        >
                            🗑️ Supprimer
                        </button>
                    )}
                </div>
            </form>
        </>
    );
}
