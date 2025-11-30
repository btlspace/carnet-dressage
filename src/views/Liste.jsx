import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as DB from '../db.js';
import { formatDateCourt, showToast, confirmAction } from '../utils.js';
import '../styles/liste.css';

/**
 * Page de liste des fiches par catégorie
 */
export default function Liste() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('all');
    const [fiches, setFiches] = useState({
        recherche: [],
        obeissance: [],
        divers: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFiches();
    }, []);

    const loadFiches = async () => {
        try {
            const [recherche, obeissance, divers] = await Promise.all([
                DB.getAllFiches('recherche'),
                DB.getAllFiches('obeissance'),
                DB.getAllFiches('divers')
            ]);
            setFiches({ recherche, obeissance, divers });
        } catch (error) {
            console.error('Erreur chargement fiches:', error);
            showToast('Erreur chargement des fiches', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Supprimer une fiche
    const handleDelete = async (type, id, e) => {
        e.stopPropagation();
        e.preventDefault();
        
        if (!confirmAction('Êtes-vous sûr de vouloir supprimer cette fiche ?')) {
            return;
        }

        try {
            await DB.deleteFiche(type, id);
            showToast('Fiche supprimée', 'success');
            loadFiches(); // Recharger la liste
        } catch (error) {
            console.error('Erreur suppression:', error);
            showToast('Erreur lors de la suppression', 'error');
        }
    };

    // Compter les fiches
    const counts = {
        all: fiches.recherche.length + fiches.obeissance.length + fiches.divers.length,
        recherche: fiches.recherche.length,
        obeissance: fiches.obeissance.length,
        divers: fiches.divers.length
    };

    // Formatter le titre d'une fiche selon son type
    const getFicheTitle = (fiche, type) => {
        switch (type) {
            case 'recherche':
                return fiche.date ? `Recherche du ${formatDateCourt(fiche.date)}` : 'Fiche de recherche';
            case 'obeissance':
                return fiche.semaine_numero 
                    ? `Semaine ${fiche.semaine_numero}` 
                    : 'Fiche d\'obéissance';
            case 'divers':
                return fiche.semaine_numero 
                    ? `Semaine ${fiche.semaine_numero}` 
                    : 'Fiche divers';
            default:
                return 'Fiche';
        }
    };

    // Formatter les métadonnées d'une fiche
    const getFicheMeta = (fiche, type) => {
        const meta = [];
        
        if (type === 'recherche') {
            if (fiche.plage_horaire) meta.push(`⏰ ${fiche.plage_horaire}`);
            if (fiche.poseur) meta.push(`👤 ${fiche.poseur}`);
            if (fiche.types_recherche?.length) {
                meta.push(`🔍 ${fiche.types_recherche.join(', ')}`);
            }
        } else if (type === 'obeissance' || type === 'divers') {
            if (fiche.date_debut && fiche.date_fin) {
                meta.push(`📅 ${formatDateCourt(fiche.date_debut)} - ${formatDateCourt(fiche.date_fin)}`);
            }
        }
        
        return meta.join(' • ');
    };

    // Obtenir toutes les fiches triées par date décroissante
    const getAllFichesSorted = () => {
        const all = [
            ...fiches.recherche.map(f => ({ ...f, _type: 'recherche' })),
            ...fiches.obeissance.map(f => ({ ...f, _type: 'obeissance' })),
            ...fiches.divers.map(f => ({ ...f, _type: 'divers' }))
        ];

        return all.sort((a, b) => {
            const dateA = a.date || a.date_debut || '';
            const dateB = b.date || b.date_debut || '';
            return dateB.localeCompare(dateA);
        });
    };

    // Rendu d'une carte de fiche
    const renderFicheCard = (fiche, type) => {
        const viewUrl = `/voir-${type}?id=${fiche.id}`;
        const editUrl = `/${type}?id=${fiche.id}`;

        return (
            <div
                key={`${type}-${fiche.id}`}
                className={`fiche-card ${type}`}
                onClick={() => navigate(viewUrl)}
            >
                <div className="fiche-content">
                    <div className="fiche-info">
                        <div className="fiche-title">{getFicheTitle(fiche, type)}</div>
                        <div className="fiche-meta">{getFicheMeta(fiche, type)}</div>
                    </div>
                    <div className="fiche-actions">
                        <Link
                            to={viewUrl}
                            className="btn btn-icon btn-view"
                            onClick={(e) => e.stopPropagation()}
                        >
                            👁️
                        </Link>
                        <Link
                            to={editUrl}
                            className="btn btn-icon btn-edit"
                            onClick={(e) => e.stopPropagation()}
                        >
                            ✏️
                        </Link>
                        <button
                            className="btn btn-icon btn-delete"
                            onClick={(e) => handleDelete(type, fiche.id, e)}
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Rendu d'un panel de catégorie
    const renderPanel = (category, categoryTitle, categoryIcon, categoryClass, createUrl) => {
        const categoryFiches = category === 'all'
            ? getAllFichesSorted()
            : fiches[category] || [];

        const isEmpty = categoryFiches.length === 0;

        return (
            <div className={`category-panel ${activeTab === (category === 'all' ? 'all' : category) ? 'active' : ''}`}>
                <div className="category-card">
                    <div className={`category-header ${categoryClass}`}>
                        <span className="category-icon">{categoryIcon}</span>
                        <div className="category-title">
                            <h2>{categoryTitle}</h2>
                            <p>{category === 'all' ? 'Triées par date décroissante' : `${categoryFiches.length} fiche(s)`}</p>
                        </div>
                        {category !== 'all' && (
                            <Link to={createUrl} className="btn btn-create">➕ Nouvelle</Link>
                        )}
                    </div>

                    {isEmpty ? (
                        <div className="empty-state">
                            <div className="icon">📭</div>
                            <p>Aucune fiche dans cette catégorie</p>
                            {category !== 'all' && (
                                <Link to={createUrl} className="btn btn-empty">
                                    ➕ Créer une fiche
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="fiches-container">
                            <div className="fiche-list">
                                {category === 'all'
                                    ? categoryFiches.map(f => renderFicheCard(f, f._type))
                                    : categoryFiches.map(f => renderFicheCard(f, category))
                                }
                            </div>
                        </div>
                    )}

                    {!isEmpty && (
                        <div className="pagination-info">
                            {categoryFiches.length} fiche(s) au total
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="loading">Chargement...</div>;
    }

    return (
        <div className="liste-page">
            <div className="container">
                <div className="header">
                    <div className="icon-main">📁</div>
                    <h1>Mes fiches</h1>
                    <p>Gérez toutes vos fiches de dressage</p>
                </div>

                <div className="quick-actions">
                    <Link to="/imprimer" className="btn btn-print">
                        🖨️ Imprimer toutes les fiches
                    </Link>
                </div>

                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        📚 Toutes <span className="badge">{counts.all}</span>
                    </button>
                    <button
                        className={`tab recherche ${activeTab === 'recherche' ? 'active' : ''}`}
                        onClick={() => setActiveTab('recherche')}
                    >
                        🔍 Recherche <span className="badge">{counts.recherche}</span>
                    </button>
                    <button
                        className={`tab obeissance ${activeTab === 'obeissance' ? 'active' : ''}`}
                        onClick={() => setActiveTab('obeissance')}
                    >
                        📋 Obéissance <span className="badge">{counts.obeissance}</span>
                    </button>
                    <button
                        className={`tab divers ${activeTab === 'divers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('divers')}
                    >
                        📝 Divers <span className="badge">{counts.divers}</span>
                    </button>
                </div>

                {activeTab === 'all' && renderPanel('all', 'Toutes les fiches', '📚', '', '')}
                {activeTab === 'recherche' && renderPanel('recherche', 'Fiches de recherche', '🔍', 'recherche', '/recherche')}
                {activeTab === 'obeissance' && renderPanel('obeissance', 'Fiches d\'obéissance', '📋', 'obeissance', '/obeissance')}
                {activeTab === 'divers' && renderPanel('divers', 'Fiches divers', '📝', 'divers', '/divers')}
            </div>
        </div>
    );
}
