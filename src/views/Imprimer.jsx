import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as DB from '../db.js';
import { formatDateCourt, showToast } from '../utils.js';
import '../styles/forms.css';
import '../styles/voir.css';
import '../styles/imprimer.css';

/**
 * Page d'impression de toutes les fiches complétées
 * Affiche chaque fiche dans son format de visualisation pour impression groupée
 */
export default function Imprimer() {
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({ nom_chien: 'Mon chien' });
    const [fiches, setFiches] = useState({
        recherche: [],
        obeissance: [],
        divers: []
    });

    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        try {
            const [loadedSettings, recherche, obeissance, divers] = await Promise.all([
                DB.getSettings(),
                DB.getAllFiches('recherche'),
                DB.getAllFiches('obeissance'),
                DB.getAllFiches('divers')
            ]);

            if (loadedSettings) {
                setSettings(loadedSettings);
            }
            
            // Trier les fiches par date (plus récentes en premier)
            const sortByDate = (a, b) => {
                const dateA = a.date || a.date_debut || '';
                const dateB = b.date || b.date_debut || '';
                return dateB.localeCompare(dateA);
            };
            
            setFiches({
                recherche: recherche.sort(sortByDate),
                obeissance: obeissance.sort(sortByDate),
                divers: divers.sort(sortByDate)
            });
        } catch (error) {
            console.error('Erreur chargement:', error);
            showToast('Erreur lors du chargement', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const totalFiches = fiches.recherche.length + fiches.obeissance.length + fiches.divers.length;

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
    const isTypeChecked = (fiche, type) => {
        const types = fiche.types_recherche || (fiche.type_recherche ? [fiche.type_recherche] : []);
        return types.includes(type);
    };

    // ========== RENDU FICHE RECHERCHE (identique à VoirRecherche) ==========
    const renderFicheRecherche = (fiche) => (
        <div key={`recherche-${fiche.id}`} className="page recherche">
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
                            <input type="checkbox" checked={isTypeChecked(fiche, 'Personne')} readOnly />
                            <label>👤 Personne</label>
                        </div>
                        <div className="checkbox-item">
                            <input type="checkbox" checked={isTypeChecked(fiche, 'Bâtiment')} readOnly />
                            <label>🏢 Bâtiment</label>
                        </div>
                        <div className="checkbox-item">
                            <input type="checkbox" checked={isTypeChecked(fiche, 'Valise')} readOnly />
                            <label>💼 Valise</label>
                        </div>
                        <div className="checkbox-item">
                            <input type="checkbox" checked={isTypeChecked(fiche, 'Véhicule')} readOnly />
                            <label>🚗 Véhicule</label>
                        </div>
                        <div className="checkbox-item">
                            <input type="checkbox" checked={isTypeChecked(fiche, 'Spécifique')} readOnly />
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
    );

    // ========== RENDU FICHE OBÉISSANCE (identique à VoirObeissance) ==========
    const renderFicheObeissance = (fiche) => {
        const getWeekDisplay = () => {
            if (!fiche.semaine_numero || !fiche.date_debut || !fiche.date_fin) {
                return '';
            }
            const startFormatted = formatDateCourt(fiche.date_debut);
            const endFormatted = formatDateCourt(fiche.date_fin);
            return `Semaine n° ${fiche.semaine_numero} (du ${startFormatted} au ${endFormatted})`;
        };

        return (
            <div key={`obeissance-${fiche.id}`} className="page obeissance">
                <div className="header header-obeissance">
                    <h1>🐕 Carnet de dressage de <span>{settings.nom_chien}</span></h1>
                    <h2>Fiche d'obéissance</h2>
                </div>

                {/* Semaine */}
                <div className="week-info-display obeissance">
                    {getWeekDisplay()}
                </div>

                {/* Séance 1 */}
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
        );
    };

    // ========== RENDU FICHE DIVERS (identique à VoirDivers) ==========
    const renderFicheDivers = (fiche) => {
        const getWeekDisplay = () => {
            if (!fiche.semaine_numero || !fiche.date_debut || !fiche.date_fin) {
                return '';
            }
            const startFormatted = formatDateCourt(fiche.date_debut);
            const endFormatted = formatDateCourt(fiche.date_fin);
            return `Semaine ${fiche.semaine_numero} (du ${startFormatted} au ${endFormatted})`;
        };

        return (
            <div key={`divers-${fiche.id}`} className="page divers">
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
        );
    };

    if (loading) {
        return (
            <div className="imprimer-wrapper">
                <div className="loading">Chargement des fiches...</div>
            </div>
        );
    }

    return (
        <div className="imprimer-wrapper">
            <style>{`
                /* ===== Styles Divers inline (nécessaires car pas dans forms.css) ===== */
                .header-divers {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
                }
                
                .page.divers .section-title {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                }
                
                .week-info-display.divers {
                    background: #f0fdf4;
                    border: 1px solid #86efac;
                    color: #059669;
                    font-weight: 600;
                    padding: 12px 15px;
                    border-radius: 8px;
                    margin-bottom: 8px;
                    font-size: 14px;
                    min-height: 20px;
                }
                
                .two-columns {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }
                
                .poids-display {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 10px;
                    font-size: 16px;
                    font-weight: 600;
                    color: #059669;
                    min-height: 32px;
                    border: 1px solid #ced4da;
                    border-radius: 4px;
                    background: white;
                }
                
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
                
                .page.divers .section {
                    margin-bottom: 6px;
                }
            `}</style>

            {/* Header compact de la page - visible uniquement à l'écran */}
            <div className="print-header no-print">
                <div className="print-header-top">
                    <div className="print-header-info">
                        <span className="print-icon">🖨️</span>
                        <h1>Imprimer ({totalFiches} fiche{totalFiches > 1 ? 's' : ''})</h1>
                    </div>
                    
                    {/* Statistiques */}
                    <div className="print-stats">
                        <span className="stat recherche">🔍 {fiches.recherche.length}</span>
                        <span className="stat obeissance">🎓 {fiches.obeissance.length}</span>
                        <span className="stat divers">📋 {fiches.divers.length}</span>
                    </div>
                    
                    {/* Boutons */}
                    <div className="print-actions">
                        <Link to="/liste" className="btn-action btn-secondary">← Retour</Link>
                        <button className="btn-action btn-primary" onClick={handlePrint} disabled={totalFiches === 0}>
                            🖨️ Imprimer
                        </button>
                    </div>
                </div>
            </div>

            {/* Container des fiches */}
            <div className="fiches-container">
                {totalFiches === 0 ? (
                    <div className="no-fiches no-print">
                        <p>📭 Aucune fiche à imprimer</p>
                        <Link to="/" className="btn-action btn-primary">➕ Créer une fiche</Link>
                    </div>
                ) : (
                    <>
                        {fiches.recherche.map(renderFicheRecherche)}
                        {fiches.obeissance.map(renderFicheObeissance)}
                        {fiches.divers.map(renderFicheDivers)}
                    </>
                )}
            </div>
        </div>
    );
}
