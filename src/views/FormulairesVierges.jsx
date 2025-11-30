import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as DB from '../db.js';
import '../styles/forms.css';
import '../styles/voir.css';

/**
 * Page des formulaires vierges - Réutilise les mêmes structures que les vues de visualisation
 */
export default function FormulairesVierges() {
    const [settings, setSettings] = useState({ nom_chien: '........................' });

    useEffect(() => {
        const loadSettings = async () => {
            const s = await DB.getSettings();
            if (s && s.nom_chien) {
                setSettings(s);
            }
        };
        loadSettings();
    }, []);

    return (
        <>
            <style>{`
                /* ===== Page container - thème violet comme le reste de l'app ===== */
                .formulaires-vierges-page {
                    min-height: calc(100vh - 65px);
                    padding: 20px;
                }
                
                .formulaires-vierges-page .container {
                    max-width: 900px;
                    margin: 0 auto;
                }
                
                /* Header de page */
                .formulaires-vierges-page .page-header {
                    text-align: center;
                    padding: 30px 20px;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    margin-bottom: 25px;
                }
                
                .formulaires-vierges-page .page-header .icon-main {
                    font-size: 4rem;
                    margin-bottom: 15px;
                }
                
                .formulaires-vierges-page .page-header h1 {
                    font-size: 1.8rem;
                    color: #1e293b;
                    margin: 0 0 10px 0;
                }
                
                .formulaires-vierges-page .page-header p {
                    color: #64748b;
                    margin: 0;
                }
                
                /* Actions bar */
                .formulaires-vierges-page .actions-bar {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    margin-bottom: 30px;
                    flex-wrap: wrap;
                }
                
                .formulaires-vierges-page .btn-back {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 24px;
                    background: #64748b;
                    color: white;
                    border-radius: 10px;
                    text-decoration: none;
                    font-weight: 600;
                    transition: all 0.2s ease;
                }
                
                .formulaires-vierges-page .btn-back:hover {
                    background: #475569;
                    transform: translateY(-2px);
                }
                
                .formulaires-vierges-page .btn-print-all {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .formulaires-vierges-page .btn-print-all:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
                }
                
                /* Container des fiches */
                .formulaires-container {
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                }
                
                /* Séparateur entre fiches */
                .page-separator {
                    text-align: center;
                    padding: 15px;
                    color: #94a3b8;
                    font-size: 0.9rem;
                    border-top: 2px dashed #cbd5e1;
                    margin-top: 10px;
                }

                /* ===== Styles spécifiques pour l'impression ===== */
                @media print {
                    body, html {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    
                    .formulaires-vierges-page {
                        background: white !important;
                        padding: 0 !important;
                    }
                    
                    .formulaires-vierges-page .page-header,
                    .formulaires-vierges-page .actions-bar,
                    .page-separator {
                        display: none !important;
                    }
                    
                    .formulaires-container {
                        gap: 0;
                    }
                    
                    .formulaires-container .page {
                        page-break-after: always;
                        page-break-inside: avoid;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        margin: 0 !important;
                        overflow: hidden !important;
                    }
                    
                    /* Dernière page : pas de saut après */
                    .formulaires-container .page:last-of-type {
                        page-break-after: avoid !important;
                    }
                    
                    /* Cacher le footer global */
                    .app-footer {
                        display: none !important;
                    }
                }

                /* ===== Styles Divers (identiques à VoirDivers) ===== */
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
                
                /* ===== Zebra striping pour le tableau des charges ===== */
                table tbody tr:nth-child(odd) {
                    background-color: #ffffff;
                }
                
                table tbody tr:nth-child(even) {
                    background-color: #f0f4f8;
                }
                
                /* ===== Impression : zebra striping visible ===== */
                @media print {
                    table tbody tr:nth-child(even) {
                        background-color: #f0f4f8 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    .lined-view-2::before, .lined-view-3::before, 
                    .lined-view-4::before, .lined-view-10::before,
                    .description-box::before, .seance-box::before {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            <div className="formulaires-vierges-page">
                <div className="container">
                    {/* Header */}
                    <div className="page-header">
                        <div className="icon-main">🖨️</div>
                        <h1>Formulaires Vierges</h1>
                        <p>Imprimez ces 3 fiches pour les remplir à la main</p>
                    </div>

                    {/* Boutons d'action */}
                    <div className="actions-bar">
                        <Link to="/" className="btn-back">← Retour à l'accueil</Link>
                        <button className="btn-print-all" onClick={() => window.print()}>
                            🖨️ Imprimer les 3 formulaires
                        </button>
                    </div>

                    <div className="formulaires-container">
                        {/* ========== FICHE RECHERCHE VIERGE ========== */}
                        <div className="page recherche">
                            <div className="header header-recherche">
                                <h1>🐕 Carnet de dressage de <span>{settings.nom_chien}</span></h1>
                                <h2>Fiche de recherche</h2>
                            </div>

                            {/* Infos générales */}
                            <div className="info-row">
                                <div className="info-item">
                                    <label>Date :</label>
                                    <span className="value-text">........................................</span>
                                </div>
                                <div className="info-item">
                                    <label>⏰ Plage horaire :</label>
                                    <div className="checkbox-group">
                                        <div className="checkbox-item">
                                            <input type="checkbox" readOnly />
                                            <label>🌅 Matin</label>
                                        </div>
                                        <div className="checkbox-item">
                                            <input type="checkbox" readOnly />
                                            <label>☀️ Après-midi</label>
                                        </div>
                                        <div className="checkbox-item">
                                            <input type="checkbox" readOnly />
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
                                            <input type="checkbox" readOnly />
                                            <label>👤 Personne</label>
                                        </div>
                                        <div className="checkbox-item">
                                            <input type="checkbox" readOnly />
                                            <label>🏢 Bâtiment</label>
                                        </div>
                                        <div className="checkbox-item">
                                            <input type="checkbox" readOnly />
                                            <label>💼 Valise</label>
                                        </div>
                                        <div className="checkbox-item">
                                            <input type="checkbox" readOnly />
                                            <label>🚗 Véhicule</label>
                                        </div>
                                        <div className="checkbox-item">
                                            <input type="checkbox" readOnly />
                                            <label>⭐ Spécifique</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="info-row">
                                <div className="info-item">
                                    <label>🔢 Ordre de passage :</label>
                                    <span className="value-text">............</span>
                                </div>
                                <div className="info-item">
                                    <label>👤 Poseur :</label>
                                    <span className="value-text">................................</span>
                                </div>
                                <div className="info-item">
                                    <label>⏱️ Temps de pose (min) :</label>
                                    <span className="value-text">............</span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="section">
                                <div className="section-title">📝 Description de l'exercice</div>
                                <div className="description-box">
                                    <div className="text-content">&nbsp;</div>
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
                                        {Array.from({ length: 10 }, (_, i) => (
                                            <tr key={i}>
                                                <td className="row-number">{i + 1}</td>
                                                <td><span className="cell-text"></span></td>
                                                <td><span className="cell-text"></span></td>
                                                <td>
                                                    <div className="height-checkboxes">
                                                        <input type="checkbox" readOnly />
                                                        <label>↓</label>
                                                        <input type="checkbox" readOnly />
                                                        <label>↔</label>
                                                        <input type="checkbox" readOnly />
                                                        <label>↑</label>
                                                    </div>
                                                </td>
                                                <td><span className="cell-text"></span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Bilan */}
                            <div className="section section-bilan">
                                <div className="section-title">💭 Bilan & observations</div>
                                <div className="description-box bilan-box">
                                    <div className="text-content">&nbsp;</div>
                                </div>
                            </div>

                            <div className="page-footer">monchien.berthel.me</div>
                        </div>

                        <div className="page-separator">✂️ Découper ici — Fiche Obéissance ci-dessous</div>

                        {/* ========== FICHE OBÉISSANCE VIERGE ========== */}
                        <div className="page obeissance">
                            <div className="header header-obeissance">
                                <h1>🐕 Carnet de dressage de <span>{settings.nom_chien}</span></h1>
                                <h2>Fiche d'obéissance</h2>
                            </div>

                            {/* Semaine */}
                            <div className="week-info-display obeissance">
                                Semaine n° .......... (du .......... au ..........)
                            </div>

                            {/* Séance 1 */}
                            <div className="section">
                                <div className="section-title">📋 Séance 1</div>
                                <div className="description-box seance-box readonly">
                                    <div className="text-content">&nbsp;</div>
                                </div>
                            </div>

                            {/* Séance 2 */}
                            <div className="section">
                                <div className="section-title">📋 Séance 2</div>
                                <div className="description-box seance-box readonly">
                                    <div className="text-content">&nbsp;</div>
                                </div>
                            </div>

                            {/* Séance 3 */}
                            <div className="section">
                                <div className="section-title">📋 Séance 3</div>
                                <div className="description-box seance-box readonly">
                                    <div className="text-content">&nbsp;</div>
                                </div>
                            </div>

                            {/* Séance 4 */}
                            <div className="section">
                                <div className="section-title">📋 Séance 4</div>
                                <div className="description-box seance-box readonly">
                                    <div className="text-content">&nbsp;</div>
                                </div>
                            </div>

                            {/* Séance 5 */}
                            <div className="section">
                                <div className="section-title">📋 Séance 5</div>
                                <div className="description-box seance-box readonly">
                                    <div className="text-content">&nbsp;</div>
                                </div>
                            </div>

                            <div className="page-footer">monchien.berthel.me</div>
                        </div>

                        <div className="page-separator">✂️ Découper ici — Fiche Divers ci-dessous</div>

                        {/* ========== FICHE DIVERS VIERGE ========== */}
                        <div className="page divers">
                            <div className="header header-divers">
                                <h1>🐕 Carnet de dressage de <span>{settings.nom_chien}</span></h1>
                                <h2>📋 Fiche de suivi hebdomadaire</h2>
                            </div>

                            {/* Semaine */}
                            <div className="week-info-display divers">
                                Semaine .......... (du .......... au ..........)
                            </div>

                            {/* Ligne 1 : Poids + Toilettage */}
                            <div className="two-columns">
                                <div className="section">
                                    <div className="section-title">⚖️ Poids</div>
                                    <div className="poids-display">
                                        .......... kg
                                    </div>
                                </div>
                                <div className="section">
                                    <div className="section-title">💊 Prophylaxie / Hygiène</div>
                                    <div className="lined-view-2">
                                        <div className="text-content">&nbsp;</div>
                                    </div>
                                </div>
                            </div>

                            {/* Alimentation */}
                            <div className="section">
                                <div className="section-title">🍖 Alimentation</div>
                                <div className="lined-view-3">
                                    <div className="text-content">&nbsp;</div>
                                </div>
                            </div>

                            {/* Suivi vétérinaire */}
                            <div className="section">
                                <div className="section-title">🏥 Suivi vétérinaire</div>
                                <div className="lined-view-4">
                                    <div className="text-content">&nbsp;</div>
                                </div>
                            </div>

                            {/* Activités physiques */}
                            <div className="section">
                                <div className="section-title">🏃 Activités physiques</div>
                                <div className="lined-view-4">
                                    <div className="text-content">&nbsp;</div>
                                </div>
                            </div>

                            {/* Comportement */}
                            <div className="section">
                                <div className="section-title">🧠 Comportement</div>
                                <div className="lined-view-4">
                                    <div className="text-content">&nbsp;</div>
                                </div>
                            </div>

                            {/* Observations générales */}
                            <div className="section">
                                <div className="section-title">📝 Observations générales</div>
                                <div className="lined-view-10">
                                    <div className="text-content">&nbsp;</div>
                                </div>
                            </div>

                            <div className="page-footer">monchien.berthel.me</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
