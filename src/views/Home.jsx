import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSettings, isOnboardingDone } from "../db.js";
import { useInstallPWA } from "../hooks/useInstallPWA.js";

// La vue Accueil du Carnet de Dressage
const Home = () => {
  const [dogName, setDogName] = useState("Chargement...");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isInstallable, isInstalled, installApp } = useInstallPWA();

  useEffect(() => {
    // Vérifier l'onboarding et charger le nom du chien
    const checkAndLoad = async () => {
      try {
        // Vérifier si l'onboarding a été fait
        const onboardingDone = await isOnboardingDone();
        if (!onboardingDone) {
          navigate("/welcome");
          return;
        }

        // Charger les paramètres
        const settings = await getSettings();
        // Afficher "Mon chien" si aucun nom n'est configuré
        setDogName(settings.nom_chien?.trim() || "Mon chien");
      } catch (error) {
        console.error("Erreur chargement settings:", error);
        // En cas d'erreur (DB vierge), rediriger vers Welcome
        navigate("/welcome");
        return;
      }
      setIsLoading(false);
    };
    checkAndLoad();
  }, [navigate]);

  // Afficher un écran de chargement pendant la vérification
  if (isLoading) {
    return (
      <div className="home-page container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '48px' }}>🐕</span>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page container">
      <div className="header">
        <span className="dog-emoji">🐕</span>
        <h1>Carnet de dressage</h1>
        <span className="dog-name">{dogName}</span>
      </div>
      <div className="section-title">➕ Créer une fiche</div>
      <div className="create-cards">
        <Link to="/recherche" className="create-card recherche">
          <span className="add-badge">+</span>
          <div className="icon">🔍</div>
          <div className="content">
            <h3>Recherche</h3>
            <p>Session</p>
          </div>
        </Link>
        <Link to="/obeissance" className="create-card obeissance">
          <span className="add-badge">+</span>
          <div className="icon">📋</div>
          <div className="content">
            <h3>Obéissance</h3>
            <p>Hebdo</p>
          </div>
        </Link>
        <Link to="/divers" className="create-card divers">
          <span className="add-badge">+</span>
          <div className="icon">📝</div>
          <div className="content">
            <h3>Divers</h3>
            <p>Notes</p>
          </div>
        </Link>
      </div>
      <div className="section-title">🛠️ Outils</div>
      <div className="tools-grid">
        <Link to="/liste" className="tool-card">
          <span className="icon">📁</span>
          <div className="info">
            <h4>Mes fiches</h4>
            <p>Voir et gérer toutes les fiches</p>
          </div>
        </Link>
        <Link to="/imprimer" className="tool-card">
          <span className="icon">🖨️</span>
          <div className="info">
            <h4>Imprimer tout</h4>
            <p>Impression globale</p>
          </div>
        </Link>
        <Link to="/tirage" className="tool-card">
          <span className="icon">🎲</span>
          <div className="info">
            <h4>Ordre de passage</h4>
            <p>Mélanger les participants</p>
          </div>
        </Link>
        <Link to="/reglages" className="tool-card">
          <span className="icon">⚙️</span>
          <div className="info">
            <h4>Paramètres</h4>
            <p>Configurer l'application</p>
          </div>
        </Link>
      </div>
      
      {/* Bouton d'installation PWA - affiché seulement si installable */}
      {isInstallable && !isInstalled && (
        <button className="install-btn" onClick={installApp}>
          📲 Installer l'application
        </button>
      )}
      
      {isInstalled && (
        <p className="installed-message">✅ Application installée</p>
      )}
    </div>
  );
};

export default Home;
