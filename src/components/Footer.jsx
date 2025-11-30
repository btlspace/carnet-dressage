import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
return (
    <footer className="app-footer">
        <div className="footer-content">
            <span className="footer-icon">🐕</span>
            <span>Carnet de Dressage</span>
            <span>•</span>
            <a href="https://github.com/btlspace/carnet-dressage/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">
                CC BY-NC-SA 4.0
            </a>
            <span>•</span>
            <a href="https://github.com/btlspace/carnet-dressage" target="_blank" rel="noopener noreferrer">
                GitHub
            </a>
            <span>•</span>
            <Link to="/faq" className="footer-link">
                FAQ
            </Link>
        </div>
    </footer>
);
};

export default Footer;
