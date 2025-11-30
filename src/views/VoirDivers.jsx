import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import * as DB from '../db.js';
import { formatDateCourt, showToast } from '../utils.js';
import '../styles/forms.css';
import '../styles/voir.css';

/**
 * Vue de visualisation d'une fiche divers - Version modernisée A4
 */
export default function VoirDivers() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const ficheId = searchParams.get('id');
    
    const [settings, setSettings] = useState({ nom_chien: 'Mon chien' });
    const [fiche, setFiche] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            if (!ficheId) {
                showToast('Aucune fiche spécifiée', 'error');
                setTimeout(() => navigate('/liste'), 2000);
                return;
            }

            const loadedSettings = await DB.getSettings();
            if (loadedSettings) {
                setSettings(loadedSettings);
            }

            const loadedFiche = await DB.getFiche('divers', parseInt(ficheId));
            if (loadedFiche) {
                setFiche(loadedFiche);
            } else {
                showToast('Fiche introuvable', 'error');
                setTimeout(() => navigate('/liste'), 2000);
            }
            setLoading(false);
        };
        init();
    }, [ficheId, navigate]);

    const getWeekDisplay = () => {
        if (!fiche || !fiche.semaine_numero || !fiche.date_debut || !fiche.date_fin) {
            return '';
        }
        const startFormatted = formatDateCourt(fiche.date_debut);
        const endFormatted = formatDateCourt(fiche.date_fin);
        return `Semaine ${fiche.semaine_numero} (du ${startFormatted} au ${endFormatted})`;
    };

    if (loading) {
        return <div className="loading">Chargement...</div>;
    }

    if (!fiche) {
        return null;
    }

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
                
                /* Affichage semaine Divers */
                .week-info-display.divers {
                    background: #f0fdf4;
                    border: 1px solid #86efac;
                    color: #059669;
                    font-weight: 600;
                    padding: 12px 15px;
                    border-radius: 8px;
                    margin-bottom: 8px;
                    font-size: 14px;
                }
                
                /* Layout 2 colonnes */
                .two-columns {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }
                
                /* Affichage poids */
                .poids-display {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 10px;
                    font-size: 16px;
                    font-weight: 600;
                    color: #059669;
                    min-height: 32px;
                }
                
                /* Zone texte en lecture - lignes vertes */
                .lined-view-2, .lined-view-3, .lined-view-4, .lined-view-10 {
                    border: 1px solid #ced4da;
                    border-radius: 4px;
                    padding: 6px;
                    font-size: 12px;
                    line-height: 18px;
                    background: white;
                    box-sizing: border-box;
                    overflow: hidden;
                    position: relative;
                }
                
                .lined-view-2 { height: 42px; }
                .lined-view-3 { height: 60px; }
                .lined-view-4 { height: 78px; }
                .lined-view-10 { height: 186px; }
                
                .lined-view-2::before, .lined-view-3::before, 
                .lined-view-4::before, .lined-view-10::before {
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
                
                .lined-view-2 .text-content, .lined-view-3 .text-content,
                .lined-view-4 .text-content, .lined-view-10 .text-content {
                    margin: 0;
                    padding: 0;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    font-size: 12px;
                    line-height: 18px;
                    height: 100%;
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

            {/* Barre d'actions */}
            <div className="fiche-toolbar">
                <div className="toolbar-left">
                    <Link to="/liste" className="toolbar-btn btn-back">← Retour</Link>
                </div>
                <div className="toolbar-center">
                    <button 
                        type="button" 
                        className="toolbar-btn btn-print"
                        onClick={() => window.print()}
                    >
                        🖨️ Imprimer
                    </button>
                </div>
                <div className="toolbar-right">
                    <Link to={`/divers?id=${ficheId}`} className="toolbar-btn btn-edit">
                        ✏️ Modifier
                    </Link>
                </div>
            </div>

            <div className="page divers">
                {/* Header */}
                <div className="header header-divers">
                    <h1>🐕 Carnet de dressage de <span>{settings.nom_chien}</span></h1>
                    <h2>📋 Fiche de suivi hebdomadaire</h2>
                </div>

                {/* Semaine */}
                <div className="week-info-display divers">
                    {getWeekDisplay()}
                </div>

                {/* Ligne 1 : Poids + Toilettage */}
                <div className="two-columns">
                    <div className="section">
                        <div className="section-title">⚖️ Poids</div>
                        <div className="poids-display">
                            {fiche.poids ? `${fiche.poids} kg` : ''}
                        </div>
                    </div>
                    <div className="section">
                        <div className="section-title">💊 Prophylaxie / Hygiène</div>
                        <div className="lined-view-2">
                            <div className="text-content">{fiche.toilettage || ''}</div>
                        </div>
                    </div>
                </div>

                {/* Alimentation */}
                <div className="section">
                    <div className="section-title">🍖 Alimentation</div>
                    <div className="lined-view-3">
                        <div className="text-content">{fiche.alimentation || ''}</div>
                    </div>
                </div>

                {/* Suivi vétérinaire */}
                <div className="section">
                    <div className="section-title">🏥 Suivi vétérinaire</div>
                    <div className="lined-view-4">
                        <div className="text-content">{fiche.suivi_veterinaire || ''}</div>
                    </div>
                </div>

                {/* Activités physiques */}
                <div className="section">
                    <div className="section-title">🏃 Activités physiques</div>
                    <div className="lined-view-4">
                        <div className="text-content">{fiche.activites_physiques || ''}</div>
                    </div>
                </div>

                {/* Comportement */}
                <div className="section">
                    <div className="section-title">🧠 Comportement</div>
                    <div className="lined-view-4">
                        <div className="text-content">{fiche.comportement || ''}</div>
                    </div>
                </div>

                {/* Observations générales */}
                <div className="section">
                    <div className="section-title">📝 Observations générales</div>
                    <div className="lined-view-10">
                        <div className="text-content">{fiche.observations_generales || fiche.points_attention || ''}</div>
                    </div>
                </div>

                <div className="page-footer">monchien.berthel.me</div>
            </div>
        </>
    );
}
