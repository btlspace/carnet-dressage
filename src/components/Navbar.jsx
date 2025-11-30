import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getSettings } from "../db.js";

const Navbar = () => {
  const [dogName, setDogName] = useState("Chargement...");
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Récupérer le nom du chien depuis IndexedDB
    const fetchDogName = async () => {
      try {
        const settings = await getSettings();
        setDogName(settings.nom_chien || "Mon chien");
      } catch (error) {
        console.error("Erreur chargement settings:", error);
        setDogName("Mon chien");
      }
    };
    fetchDogName();
  }, [location.pathname]); // Recharger si on change de page (ex: après modification réglages)

  // Fermer le menu au changement de route
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="app-navbar">
      <Link to="/" className="navbar-brand">
        <span className="app-logo">🐕</span>
        <div className="app-info">
          <span className="app-title">Carnet de dressage</span>
          <span className="dog-name">{dogName}</span>
        </div>
      </Link>
      <button
        className={`hamburger${menuOpen ? " active" : ""}`}
        id="hamburger"
        aria-label="Menu"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div className={`navbar-menu${menuOpen ? " active" : ""}`} id="navbarMenu">
        <div className="navbar-links">
          <Link to="/" className={`nav-link${location.pathname === "/" ? " active" : ""}`}>
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Accueil</span>
          </Link>
          <Link to="/liste" className={`nav-link${location.pathname === "/liste" ? " active" : ""}`}>
            <span className="nav-icon">📁</span>
            <span className="nav-text">Mes fiches</span>
          </Link>
          <div className="nav-separator"></div>
          <div className="nav-group-title">Créer une fiche</div>
          <Link to="/recherche" className={`nav-link${location.pathname === "/recherche" ? " active" : ""}`}>
            <span className="nav-icon">🔍</span>
            <span className="nav-text">Recherche</span>
            <span className="nav-badge-new">+</span>
          </Link>
          <Link to="/obeissance" className={`nav-link${location.pathname === "/obeissance" ? " active" : ""}`}>
            <span className="nav-icon">📋</span>
            <span className="nav-text">Obéissance</span>
            <span className="nav-badge-new">+</span>
          </Link>
          <Link to="/divers" className={`nav-link${location.pathname === "/divers" ? " active" : ""}`}>
            <span className="nav-icon">📝</span>
            <span className="nav-text">Divers</span>
            <span className="nav-badge-new">+</span>
          </Link>
          <div className="nav-separator"></div>
          <Link to="/tirage" className={`nav-link${location.pathname === "/tirage" ? " active" : ""}`}>
            <span className="nav-icon">🎲</span>
            <span className="nav-text">Ordre de passage</span>
          </Link>
          <Link to="/reglages" className={`nav-link${location.pathname === "/reglages" ? " active" : ""}`}>
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Paramètres</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
