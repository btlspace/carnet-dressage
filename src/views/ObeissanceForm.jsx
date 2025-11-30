import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import * as DB from '../db.js';
import { getWeekNumber, getWeekRange, formatDateCourt, showToast, confirmAction } from '../utils.js';
// CSS importé dans App.jsx

/**
 * Formulaire de création/édition d'une fiche d'obéissance
 */
export default function ObeissanceForm() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const ficheId = searchParams.get('id');
    
    const [settings, setSettings] = useState({ nom_chien: 'Mon chien' });
    const [formData, setFormData] = useState({
        semaine_numero: '',
        date_debut: '',
        date_fin: '',
        seance1: '',
        seance2: '',
        seance3: '',
        seance4: '',
        seance5: ''
    });
    const [weekDate, setWeekDate] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);

    // Initialisation
    useEffect(() => {
        const init = async () => {
            // Charger les paramètres
            const loadedSettings = await DB.getSettings();
            if (loadedSettings) {
                setSettings(loadedSettings);
            }

            // Charger la fiche si on est en mode édition
            if (ficheId) {
                setIsEditMode(true);
                const fiche = await DB.getFiche('obeissance', parseInt(ficheId));
                if (fiche) {
                    // Rétrocompatibilité : si ancien format avec "observations", le mettre dans seance1
                    const seance1Value = fiche.seance1 || fiche.observations || '';
                    
                    setFormData({
                        semaine_numero: fiche.semaine_numero || '',
                        date_debut: fiche.date_debut || '',
                        date_fin: fiche.date_fin || '',
                        seance1: seance1Value,
                        seance2: fiche.seance2 || '',
                        seance3: fiche.seance3 || '',
                        seance4: fiche.seance4 || '',
                        seance5: fiche.seance5 || ''
                    });
                    if (fiche.date_debut) {
                        setWeekDate(fiche.date_debut);
                    }
                } else {
                    showToast('Fiche introuvable', 'error');
                    navigate('/liste');
                }
            } else {
                // Nouvelle fiche : initialiser avec la date du jour
                const today = new Date();
                const todayStr = today.toISOString().split('T')[0];
                setWeekDate(todayStr);
                updateWeekInfo(today);
            }
        };
        init();
    }, [ficheId, navigate]);

    // Mettre à jour les infos de semaine quand la date change
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

    // Gérer le changement de date
    const handleWeekChange = (e) => {
        const value = e.target.value;
        setWeekDate(value);
        if (value) {
            const selectedDate = new Date(value + 'T00:00:00');
            updateWeekInfo(selectedDate);
        }
    };

    // Gérer les changements de champs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Soumettre le formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (isEditMode && ficheId) {
                await DB.updateFiche('obeissance', parseInt(ficheId), formData);
                showToast('Fiche mise à jour', 'success');
                setTimeout(() => navigate(`/voir-obeissance?id=${ficheId}`), 500);
            } else {
                const id = await DB.addFiche('obeissance', formData);
                showToast('Fiche créée', 'success');
                setTimeout(() => navigate(`/voir-obeissance?id=${id}`), 500);
            }
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            showToast('Erreur lors de la sauvegarde', 'error');
        }
    };

    // Supprimer la fiche
    const handleDelete = async () => {
        if (!ficheId) return;
        
        if (!confirmAction('Êtes-vous sûr de vouloir supprimer cette fiche ?')) {
            return;
        }

        try {
            await DB.deleteFiche('obeissance', parseInt(ficheId));
            showToast('Fiche supprimée', 'success');
            setTimeout(() => navigate('/liste'), 1000);
        } catch (error) {
            console.error('Erreur suppression:', error);
            showToast('Erreur lors de la suppression', 'error');
        }
    };

    // Affichage de la semaine
    const getWeekDisplay = () => {
        if (!formData.semaine_numero || !formData.date_debut || !formData.date_fin) {
            return 'Sélectionnez une date';
        }
        const startFormatted = formatDateCourt(formData.date_debut);
        const endFormatted = formatDateCourt(formData.date_fin);
        return `Semaine n° ${formData.semaine_numero} (du ${startFormatted} au ${endFormatted})`;
    };

    return (
        <>
            <style>{`
                /* Sélecteur de semaine Obéissance - aligné droite */
                .week-info.obeissance {
                    background: #ede9fe;
                    border: 1px solid #c4b5fd;
                    padding: 10px 15px;
                    border-radius: 8px;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                }
                
                .week-info.obeissance .week-display {
                    color: #7c3aed;
                    font-weight: 600;
                    font-size: 14px;
                    white-space: nowrap;
                }
                
                .week-info.obeissance .week-selector-input {
                    border: 1px solid #c4b5fd;
                    padding: 4px 6px;
                    border-radius: 5px;
                    font-size: 12px;
                    width: 130px;
                    flex-shrink: 0;
                }
            `}</style>

            {/* Barre d'actions avec titre */}
            <div className="fiche-toolbar no-print">
                <div className="toolbar-left">
                    <Link 
                        to={isEditMode ? `/voir-obeissance?id=${ficheId}` : '/liste'} 
                        className="toolbar-btn btn-cancel"
                    >
                        ← Annuler
                    </Link>
                </div>
                <div className="toolbar-center">
                    <span className="toolbar-title obeissance">🎓 Fiche Obéissance</span>
                </div>
                <div className="toolbar-right">
                    <button type="submit" form="formObeissance" className="toolbar-btn btn-save">
                        💾 Enregistrer
                    </button>
                </div>
            </div>

            <form id="formObeissance" onSubmit={handleSubmit}>
                <div className="page obeissance">
                    <div className="header header-obeissance">
                        <h1>🐕 Carnet de dressage de <span>{settings.nom_chien}</span></h1>
                        <h2>Fiche d'obéissance</h2>
                    </div>

                    {/* Sélecteur de semaine */}
                    <div className="week-info obeissance">
                        <div className="week-display">{getWeekDisplay()}</div>
                        <input 
                            type="date" 
                            value={weekDate}
                            onChange={handleWeekChange}
                            className="week-selector-input"
                        />
                    </div>

                    {/* Séance 1 */}
                    <div className="section">
                        <div className="section-title">📋 Séance 1</div>
                        <div className="description-box seance-box">
                            <textarea 
                                name="seance1"
                                value={formData.seance1}
                                onChange={handleChange}
                                placeholder="Notes sur la séance 1..."
                            />
                        </div>
                    </div>

                    {/* Séance 2 */}
                    <div className="section">
                        <div className="section-title">📋 Séance 2</div>
                        <div className="description-box seance-box">
                            <textarea 
                                name="seance2"
                                value={formData.seance2}
                                onChange={handleChange}
                                placeholder="Notes sur la séance 2..."
                            />
                        </div>
                    </div>

                    {/* Séance 3 */}
                    <div className="section">
                        <div className="section-title">📋 Séance 3</div>
                        <div className="description-box seance-box">
                            <textarea 
                                name="seance3"
                                value={formData.seance3}
                                onChange={handleChange}
                                placeholder="Notes sur la séance 3..."
                            />
                        </div>
                    </div>

                    {/* Séance 4 */}
                    <div className="section">
                        <div className="section-title">📋 Séance 4</div>
                        <div className="description-box seance-box">
                            <textarea 
                                name="seance4"
                                value={formData.seance4}
                                onChange={handleChange}
                                placeholder="Notes sur la séance 4..."
                            />
                        </div>
                    </div>

                    {/* Séance 5 */}
                    <div className="section">
                        <div className="section-title">📋 Séance 5</div>
                        <div className="description-box seance-box">
                            <textarea 
                                name="seance5"
                                value={formData.seance5}
                                onChange={handleChange}
                                placeholder="Notes sur la séance 5..."
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
