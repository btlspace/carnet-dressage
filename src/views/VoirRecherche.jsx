import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import * as DB from '../db.js';
import { formatDateCourt, showToast } from '../utils.js';
// CSS importé dans App.jsx

/**
 * Vue de visualisation d'une fiche de recherche
 */
export default function VoirRecherche() {
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
            const loadedFiche = await DB.getFiche('recherche', parseInt(ficheId));
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

    // Formatter la date au format français
    const formatDateFr = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Vérifier si un type de recherche est coché
    const isTypeChecked = (type) => {
        if (!fiche) return false;
        const types = fiche.types_recherche || (fiche.type_recherche ? [fiche.type_recherche] : []);
        return types.includes(type);
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
                    <Link to={`/recherche?id=${ficheId}`} className="toolbar-btn btn-edit">
                        ✏️ Modifier
                    </Link>
                </div>
            </div>

            <div className="page recherche">
                <div className="header header-recherche">
                    <h1>🐕 Carnet de dressage de <span>{settings.nom_chien}</span></h1>
                    <h2>Fiche de recherche</h2>
                </div>

                {/* Infos générales */}
                <div className="info-row">
                    <div className="info-item">
                        <label>Date :</label>
                        <span className="value-text">{formatDateFr(fiche.date)}</span>
                    </div>
                    <div className="info-item">
                        <label>⏰ Plage horaire :</label>
                        <div className="checkbox-group">
                            <div className="checkbox-item">
                                <input type="checkbox" checked={fiche.plage_horaire === 'Matin'} readOnly />
                                <label>🌅 Matin</label>
                            </div>
                            <div className="checkbox-item">
                                <input type="checkbox" checked={fiche.plage_horaire === 'Après-midi'} readOnly />
                                <label>☀️ Après-midi</label>
                            </div>
                            <div className="checkbox-item">
                                <input type="checkbox" checked={fiche.plage_horaire === 'Soir'} readOnly />
                                <label>🌙 Soir</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="info-row">
                    <div className="info-item" style={{ width: '100%' }}>
                        <label>🔍 Type de recherche :</label>
                        <div className="checkbox-group">
                            <div className="checkbox-item">
                                <input type="checkbox" checked={isTypeChecked('Personne')} readOnly />
                                <label>👤 Personne</label>
                            </div>
                            <div className="checkbox-item">
                                <input type="checkbox" checked={isTypeChecked('Bâtiment')} readOnly />
                                <label>🏢 Bâtiment</label>
                            </div>
                            <div className="checkbox-item">
                                <input type="checkbox" checked={isTypeChecked('Valise')} readOnly />
                                <label>💼 Valise</label>
                            </div>
                            <div className="checkbox-item">
                                <input type="checkbox" checked={isTypeChecked('Véhicule')} readOnly />
                                <label>🚗 Véhicule</label>
                            </div>
                            <div className="checkbox-item">
                                <input type="checkbox" checked={isTypeChecked('Spécifique')} readOnly />
                                <label>⭐ Spécifique</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="info-row">
                    <div className="info-item">
                        <label>🔢 Ordre de passage :</label>
                        <span className="value-text">{fiche.ordre_passage || '-'}</span>
                    </div>
                    <div className="info-item">
                        <label>👤 Poseur :</label>
                        <span className="value-text">{fiche.poseur || '-'}</span>
                    </div>
                    <div className="info-item">
                        <label>⏱️ Temps de pose (min) :</label>
                        <span className="value-text">{fiche.temps_pose || '-'}</span>
                    </div>
                </div>

                {/* Description */}
                <div className="section">
                    <div className="section-title">📝 Description de l'exercice</div>
                    <div className="description-box">
                        <div className="text-content">{fiche.description || ''}</div>
                    </div>
                </div>

                {/* Tableau des charges - toujours 10 lignes */}
                <div className="section">
                    <div className="section-title">📦 Charges posées</div>
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '5%' }}>#</th>
                                <th style={{ width: '25%' }}>Substance</th>
                                <th style={{ width: '15%' }}>Quantité (g)</th>
                                <th style={{ width: '20%' }}>Hauteur</th>
                                <th style={{ width: '35%' }}>Commentaire</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 10 }, (_, i) => {
                                const charge = fiche.charges?.[i] || {};
                                return (
                                    <tr key={i}>
                                        <td className="row-number">{i + 1}</td>
                                        <td><span className="cell-text">{charge.substance || ''}</span></td>
                                        <td><span className="cell-text">{charge.quantite || ''}</span></td>
                                        <td>
                                            <div className="height-checkboxes">
                                                <input type="checkbox" checked={charge.hauteur === 'bas'} readOnly />
                                                <label>↓</label>
                                                <input type="checkbox" checked={charge.hauteur === 'moyen'} readOnly />
                                                <label>↔</label>
                                                <input type="checkbox" checked={charge.hauteur === 'haut'} readOnly />
                                                <label>↑</label>
                                            </div>
                                        </td>
                                        <td><span className="cell-text">{charge.commentaire || ''}</span></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Bilan */}
                <div className="section section-bilan">
                    <div className="section-title">💭 Bilan & observations</div>
                    <div className="description-box bilan-box">
                        <div className="text-content">{fiche.bilan || ''}</div>
                    </div>
                </div>

                <div className="page-footer">monchien.berthel.me</div>
            </div>
        </>
    );
}
