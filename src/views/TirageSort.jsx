import { useState, useEffect } from 'react';
import { showToast } from '../utils.js';
import * as DB from '../db.js';
import '../styles/tirage.css';

/**
 * Page ordre de passage - Avec persistance et statistiques
 */
export default function TirageSort() {
    const [participants, setParticipants] = useState([]);
    const [newParticipant, setNewParticipant] = useState('');
    const [results, setResults] = useState([]);
    const [stats, setStats] = useState({});
    const [showStats, setShowStats] = useState(false);
    const [loading, setLoading] = useState(true);

    // Charger les participants sauvegardés au démarrage
    useEffect(() => {
        const loadData = async () => {
            try {
                const tirageData = await DB.getTirageData();
                setParticipants(tirageData.participants || []);
                setStats(tirageData.stats || {});
            } catch (error) {
                console.error('Erreur chargement tirage:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Sauvegarder les participants à chaque modification
    const saveParticipants = async (newList) => {
        try {
            const tirageData = await DB.getTirageData();
            tirageData.participants = newList;
            await DB.saveTirageData(tirageData);
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
        }
    };

    // Réinitialiser les stats (appelé lors de changement de participants)
    const resetStatsOnChange = async () => {
        try {
            const tirageData = await DB.getTirageData();
            tirageData.stats = {};
            await DB.saveTirageData(tirageData);
            setStats({});
        } catch (error) {
            console.error('Erreur reset stats:', error);
        }
    };

    const addParticipant = async () => {
        const name = newParticipant.trim();
        if (!name) return;
        if (participants.some(p => p.toLowerCase() === name.toLowerCase())) {
            showToast('Déjà dans la liste', 'error');
            return;
        }
        const newList = [...participants, name];
        setParticipants(newList);
        await saveParticipants(newList);
        await resetStatsOnChange();
        setNewParticipant('');
        setResults([]);
        showToast(`${name} ajouté`, 'success');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') addParticipant();
    };

    const removeParticipant = async (name) => {
        const newList = participants.filter(p => p !== name);
        setParticipants(newList);
        await saveParticipants(newList);
        await resetStatsOnChange();
        setResults([]);
    };

    const clearAll = async () => {
        setParticipants([]);
        await saveParticipants([]);
        await resetStatsOnChange();
        setResults([]);
        setNewParticipant('');
    };

    const drawOrder = async () => {
        if (participants.length < 2) {
            showToast('Minimum 2 participants', 'error');
            return;
        }
        // Mélange Fisher-Yates
        const shuffled = [...participants];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setResults(shuffled);
        
        // Enregistrer dans les stats
        const newStats = await DB.recordTirageResult(shuffled);
        setStats(newStats);
    };

    const copyResults = async () => {
        const text = results.map((name, i) => `${i + 1}. ${name}`).join('\n');
        try {
            await navigator.clipboard.writeText(text);
            showToast('Copié !', 'success');
        } catch (error) {
            showToast('Erreur copie', 'error');
        }
    };

    const resetStats = async () => {
        if (!window.confirm('Réinitialiser toutes les statistiques ?')) return;
        try {
            const tirageData = await DB.getTirageData();
            tirageData.stats = {};
            await DB.saveTirageData(tirageData);
            setStats({});
            showToast('Stats réinitialisées', 'success');
        } catch (error) {
            showToast('Erreur', 'error');
        }
    };

    // Calculer le pourcentage pour une position
    const getPositionPercent = (name, pos) => {
        const s = stats[name];
        if (!s || s.total === 0) return 0;
        return Math.round((s.positions[pos] / s.total) * 100);
    };

    if (loading) {
        return <div className="tirage-page compact"><div className="container">Chargement...</div></div>;
    }

    return (
        <div className="tirage-page compact">
            <div className="container">
                {/* Header compact */}
                <div className="header-compact">
                    <span className="icon">🎲</span>
                    <h1>Ordre de passage</h1>
                    <span className="count-badge">{participants.length}</span>
                </div>

                {/* Zone d'ajout rapide */}
                <div className="add-row">
                    <input
                        type="text"
                        value={newParticipant}
                        onChange={(e) => setNewParticipant(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ajouter un participant..."
                        autoFocus
                    />
                    <button className="btn-icon btn-add" onClick={addParticipant}>➕</button>
                    {participants.length > 0 && (
                        <button className="btn-icon btn-clear" onClick={clearAll} title="Tout effacer">🗑️</button>
                    )}
                </div>

                {/* Liste compacte des participants */}
                {participants.length > 0 && (
                    <div className="participants-compact">
                        {participants.map((name, index) => (
                            <span key={index} className="participant-tag" onClick={() => removeParticipant(name)}>
                                {name} ×
                            </span>
                        ))}
                    </div>
                )}

                {/* Bouton principal */}
                <button
                    className="btn-draw-main"
                    onClick={drawOrder}
                    disabled={participants.length < 2}
                >
                    🎲 Mélanger
                </button>

                {/* Résultats */}
                {results.length > 0 && (
                    <div className="results-compact">
                        <div className="results-header-compact">
                            <span>🏆 Résultat</span>
                            <button className="btn-copy-small" onClick={copyResults}>📋</button>
                        </div>
                        <div className="results-grid">
                            {results.map((name, index) => (
                                <div key={index} className="result-row">
                                    <span className="pos">{index + 1}</span>
                                    <span className="name">{name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bouton toggle stats */}
                {Object.keys(stats).length > 0 && (
                    <button 
                        className="btn-toggle-stats"
                        onClick={() => setShowStats(!showStats)}
                    >
                        {showStats ? '📊 Masquer stats' : '📊 Voir stats'}
                    </button>
                )}

                {/* Section statistiques */}
                {showStats && Object.keys(stats).length > 0 && (
                    <div className="stats-section">
                        <div className="stats-header">
                            <h3>📊 Statistiques de passage</h3>
                            <button className="btn-reset-stats" onClick={resetStats}>🗑️</button>
                        </div>
                        <p className="stats-explanation">
                            Répartition des positions pour chaque participant (en %)
                        </p>
                        <div className="stats-table">
                            <div className="stats-row stats-header-row">
                                <div className="stats-name">Participant</div>
                                {participants.length > 0 && participants.map((_, i) => (
                                    <div key={i} className="stats-pos">#{i + 1}</div>
                                ))}
                                <div className="stats-total">Total</div>
                            </div>
                            {participants.map((name) => {
                                const s = stats[name];
                                if (!s) return null;
                                return (
                                    <div key={name} className="stats-row">
                                        <div className="stats-name">{name}</div>
                                        {participants.map((_, i) => {
                                            const percent = getPositionPercent(name, i);
                                            return (
                                                <div key={i} className="stats-cell">
                                                    <div 
                                                        className="stats-bar" 
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                    <span className="stats-value">{percent}%</span>
                                                </div>
                                            );
                                        })}
                                        <div className="stats-total-value">{s.total}</div>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="stats-note">
                            💡 Un tirage aléatoire tend vers ~{Math.round(100 / participants.length)}% par position
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
