import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import * as DB from '../db.js';
import { formatDateCourt, showToast } from '../utils.js';
import '../styles/forms.css';
import '../styles/voir.css';

/**
 * Vue de visualisation d'une fiche d'obéissance
 */
export default function VoirObeissance() {
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

            // Charger les paramètres
            const loadedSettings = await DB.getSettings();
            if (loadedSettings) {
                setSettings(loadedSettings);
            }

            // Charger la fiche
            const loadedFiche = await DB.getFiche('obeissance', parseInt(ficheId));
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

    // Affichage de la semaine
    const getWeekDisplay = () => {
        if (!fiche || !fiche.semaine_numero || !fiche.date_debut || !fiche.date_fin) {
            return '';
        }
        const startFormatted = formatDateCourt(fiche.date_debut);
        const endFormatted = formatDateCourt(fiche.date_fin);
        return `Semaine n° ${fiche.semaine_numero} (du ${startFormatted} au ${endFormatted})`;
    };

    if (loading) {
        return <div className="loading">Chargement...</div>;
    }

    if (!fiche) {
        return null;
    }

    return (
        <>
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
                    <Link to={`/obeissance?id=${ficheId}`} className="toolbar-btn btn-edit">
                        ✏️ Modifier
                    </Link>
                </div>
            </div>

            <div className="page obeissance">
                <div className="header header-obeissance">
                    <h1>🐕 Carnet de dressage de <span>{settings.nom_chien}</span></h1>
                    <h2>Fiche d'obéissance</h2>
                </div>

                {/* Semaine */}
                <div className="week-info-display obeissance">
                    {getWeekDisplay()}
                </div>

                {/* Séance 1 - récupère aussi les anciennes données "observations" pour rétrocompatibilité */}
                <div className="section">
                    <div className="section-title">📋 Séance 1</div>
                    <div className="description-box seance-box readonly">
                        <div className="text-content">{fiche.seance1 || fiche.observations || ''}</div>
                    </div>
                </div>

                {/* Séance 2 */}
                <div className="section">
                    <div className="section-title">📋 Séance 2</div>
                    <div className="description-box seance-box readonly">
                        <div className="text-content">{fiche.seance2 || ''}</div>
                    </div>
                </div>

                {/* Séance 3 */}
                <div className="section">
                    <div className="section-title">📋 Séance 3</div>
                    <div className="description-box seance-box readonly">
                        <div className="text-content">{fiche.seance3 || ''}</div>
                    </div>
                </div>

                {/* Séance 4 */}
                <div className="section">
                    <div className="section-title">📋 Séance 4</div>
                    <div className="description-box seance-box readonly">
                        <div className="text-content">{fiche.seance4 || ''}</div>
                    </div>
                </div>

                {/* Séance 5 */}
                <div className="section">
                    <div className="section-title">📋 Séance 5</div>
                    <div className="description-box seance-box readonly">
                        <div className="text-content">{fiche.seance5 || ''}</div>
                    </div>
                </div>

                <div className="page-footer">monchien.berthel.me</div>
            </div>
        </>
    );
}
