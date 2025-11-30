import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { addFiche, getFiche, updateFiche, deleteFiche, getSettings } from "../db.js";
// CSS importé dans App.jsx

const RechercheForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ficheId = searchParams.get("id");
  const isEdit = !!ficheId;

  const [dogName, setDogName] = useState("Chargement...");
  const [poseurs, setPoseurs] = useState([]);
  const [substances, setSubstances] = useState([]);
  
  // Wizard step state for mobile
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4; // Info, Charges, Description, Bilan

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    plage_horaire: "",
    types_recherche: [],
    ordre_passage: "",
    poseur: "",
    temps_pose: "",
    description: "",
    bilan: "",
    charges: Array(10).fill(null).map(() => ({
      substance: "",
      quantite: "",
      hauteur: "",
      commentaire: ""
    }))
  });

  // Charger les paramètres et la fiche si édition
  useEffect(() => {
    const loadData = async () => {
      const settings = await getSettings();
      setDogName(settings.nom_chien || "Mon chien");
      setPoseurs(settings.poseurs || []);
      setSubstances(settings.substances || []);

      if (ficheId) {
        const fiche = await getFiche("recherche", parseInt(ficheId));
        if (fiche) {
          const charges = Array(10).fill(null).map((_, i) => 
            fiche.charges?.[i] || { substance: "", quantite: "", hauteur: "", commentaire: "" }
          );
          setFormData({
            date: fiche.date || "",
            plage_horaire: fiche.plage_horaire || "",
            types_recherche: fiche.types_recherche || [],
            ordre_passage: fiche.ordre_passage || "",
            poseur: fiche.poseur || "",
            temps_pose: fiche.temps_pose || "",
            description: fiche.description || "",
            bilan: fiche.bilan || "",
            charges
          });
        }
      }
    };
    loadData();
  }, [ficheId]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    
    if (name === "plage_horaire") {
      setFormData(prev => ({ ...prev, plage_horaire: checked ? value : "" }));
    } else if (name === "type_recherche") {
      setFormData(prev => ({
        ...prev,
        types_recherche: checked 
          ? [...prev.types_recherche, value]
          : prev.types_recherche.filter(t => t !== value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Toggle handlers for mobile buttons
  const handlePlageToggle = (value) => {
    setFormData(prev => ({ 
      ...prev, 
      plage_horaire: prev.plage_horaire === value ? "" : value 
    }));
  };

  const handleTypeToggle = (value) => {
    setFormData(prev => ({
      ...prev,
      types_recherche: prev.types_recherche.includes(value)
        ? prev.types_recherche.filter(t => t !== value)
        : [...prev.types_recherche, value]
    }));
  };

  const handleChargeChange = (index, field, value) => {
    setFormData(prev => {
      const charges = [...prev.charges];
      charges[index] = { ...charges[index], [field]: value };
      return { ...prev, charges };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Filtrer les charges vides
    const filteredCharges = formData.charges.filter(c => c.substance);
    const dataToSave = { ...formData, charges: filteredCharges };

    try {
      if (isEdit) {
        await updateFiche("recherche", parseInt(ficheId), dataToSave);
        navigate(`/voir-recherche?id=${ficheId}`);
      } else {
        const id = await addFiche("recherche", dataToSave);
        navigate(`/voir-recherche?id=${id}`);
      }
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      alert("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async () => {
    if (!ficheId) return;
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette fiche ?")) return;
    
    try {
      await deleteFiche("recherche", parseInt(ficheId));
      navigate("/liste");
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  // Wizard navigation
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));
  const goToStep = (step) => setCurrentStep(step);

  const plagesHoraires = [
    { value: "Matin", label: "🌅 Matin" },
    { value: "Après-midi", label: "☀️ Après-midi" },
    { value: "Soir", label: "🌙 Soir" }
  ];

  const typesRecherche = [
    { value: "Personne", label: "👤 Personne" },
    { value: "Bâtiment", label: "🏢 Bâtiment" },
    { value: "Valise", label: "💼 Valise" },
    { value: "Véhicule", label: "🚗 Véhicule" },
    { value: "Spécifique", label: "⭐ Spécifique" }
  ];

  return (
    <>
      {/* Barre d'actions avec titre */}
      <div className="fiche-toolbar no-print">
        <div className="toolbar-left">
          <Link to={isEdit ? `/voir-recherche?id=${ficheId}` : "/liste"} className="toolbar-btn btn-cancel">
            ← Annuler
          </Link>
        </div>
        <div className="toolbar-center">
          <span className="toolbar-title recherche">🔍 Fiche Recherche</span>
        </div>
        <div className="toolbar-right">
          <button type="submit" form="formRecherche" className="toolbar-btn btn-save">
            💾 Enregistrer
          </button>
        </div>
      </div>

      <form id="formRecherche" onSubmit={handleSubmit}>
        <div className="page recherche">
          <div className="header header-recherche">
            <h1>🐕 Carnet de dressage de {dogName}</h1>
            <h2>Fiche de recherche</h2>
          </div>

          {/* Wizard steps indicator - visible on mobile */}
          <div className="wizard-steps-indicator" role="tablist" aria-label="Étapes du formulaire">
            {[0, 1, 2, 3].map(step => {
              const stepLabels = ['Informations', 'Charges', 'Description', 'Bilan'];
              return (
                <button 
                  key={step}
                  type="button"
                  role="tab"
                  aria-selected={currentStep === step}
                  aria-label={`Étape ${step + 1}: ${stepLabels[step]}`}
                  className={`wizard-step-dot ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
                  onClick={() => goToStep(step)}
                />
              );
            })}
          </div>

          {/* Step 1: Informations de base */}
          <div className={`wizard-step ${currentStep === 0 ? 'active' : ''}`}>
            <div className="info-row">
              <div className="info-item">
                <label>📅 Date :</label>
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="info-item">
                <label>⏰ Plage horaire :</label>
                {/* Desktop checkboxes */}
                <div className="checkbox-group mobile-toggles">
                  {plagesHoraires.map(ph => (
                    <div className="checkbox-item" key={ph.value}>
                      <input 
                        type="checkbox" 
                        name="plage_horaire" 
                        value={ph.value}
                        id={ph.value}
                        checked={formData.plage_horaire === ph.value}
                        onChange={handleChange}
                      />
                      <label htmlFor={ph.value}>{ph.label}</label>
                    </div>
                  ))}
                </div>
                {/* Mobile toggle buttons */}
                <div className="toggle-group mobile-only">
                  {plagesHoraires.map(ph => (
                    <button
                      key={ph.value}
                      type="button"
                      aria-pressed={formData.plage_horaire === ph.value}
                      className={`toggle-btn ${formData.plage_horaire === ph.value ? 'selected' : ''}`}
                      onClick={() => handlePlageToggle(ph.value)}
                    >
                      {ph.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="info-row">
              <div className="info-item" style={{ width: "100%" }}>
                <label>🔍 Type de recherche :</label>
                {/* Desktop checkboxes */}
                <div className="checkbox-group mobile-toggles">
                  {typesRecherche.map(tr => (
                    <div className="checkbox-item" key={tr.value}>
                      <input 
                        type="checkbox" 
                        name="type_recherche" 
                        value={tr.value}
                        id={`type_${tr.value}`}
                        checked={formData.types_recherche.includes(tr.value)}
                        onChange={handleChange}
                      />
                      <label htmlFor={`type_${tr.value}`}>{tr.label}</label>
                    </div>
                  ))}
                </div>
                {/* Mobile toggle buttons */}
                <div className="toggle-group mobile-only">
                  {typesRecherche.map(tr => (
                    <button
                      key={tr.value}
                      type="button"
                      aria-pressed={formData.types_recherche.includes(tr.value)}
                      className={`toggle-btn ${formData.types_recherche.includes(tr.value) ? 'selected' : ''}`}
                      onClick={() => handleTypeToggle(tr.value)}
                    >
                      {tr.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="info-row">
              <div className="info-item">
                <label>🔢 Ordre de passage :</label>
                <input 
                  type="number" 
                  name="ordre_passage" 
                  min="1" 
                  value={formData.ordre_passage}
                  onChange={handleChange}
                />
              </div>
              <div className="info-item">
                <label>👤 Poseur :</label>
                <select name="poseur" value={formData.poseur} onChange={handleChange}>
                  <option value="">-- Sélectionner --</option>
                  {poseurs.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="info-item">
                <label>⏱️ Temps de pose (min) :</label>
                <input 
                  type="number" 
                  name="temps_pose" 
                  min="1"
                  value={formData.temps_pose}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Wizard navigation for step 1 */}
            <div className="wizard-navigation">
              <button type="button" className="wizard-btn wizard-btn-next" onClick={nextStep}>
                Suivant →
              </button>
            </div>
          </div>

          {/* Step 2: Charges posées */}
          <div className={`wizard-step ${currentStep === 1 ? 'active' : ''}`}>
            <div className="section">
              <div className="section-title">📦 Charges posées</div>
            {/* Desktop table layout */}
            <table className="charges-table">
              <thead>
                <tr>
                  <th style={{ width: "5%" }}>#</th>
                  <th style={{ width: "25%" }}>Substance</th>
                  <th style={{ width: "15%" }}>Quantité (g)</th>
                  <th style={{ width: "20%" }}>Hauteur</th>
                  <th style={{ width: "35%" }}>Commentaire</th>
                </tr>
              </thead>
              <tbody>
                {formData.charges.map((charge, i) => (
                  <tr key={i}>
                    <td className="row-number">{i + 1}</td>
                    <td>
                      <select 
                        value={charge.substance}
                        onChange={(e) => handleChargeChange(i, "substance", e.target.value)}
                      >
                        <option value="">--</option>
                        {substances.map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input 
                        type="text"
                        value={charge.quantite}
                        onChange={(e) => handleChargeChange(i, "quantite", e.target.value)}
                      />
                    </td>
                    <td>
                      <div className="height-checkboxes">
                        <input 
                          type="checkbox"
                          checked={charge.hauteur === "bas"}
                          onChange={() => handleChargeChange(i, "hauteur", charge.hauteur === "bas" ? "" : "bas")}
                        />
                        <label>↓</label>
                        <input 
                          type="checkbox"
                          checked={charge.hauteur === "moyen"}
                          onChange={() => handleChargeChange(i, "hauteur", charge.hauteur === "moyen" ? "" : "moyen")}
                        />
                        <label>↔</label>
                        <input 
                          type="checkbox"
                          checked={charge.hauteur === "haut"}
                          onChange={() => handleChargeChange(i, "hauteur", charge.hauteur === "haut" ? "" : "haut")}
                        />
                        <label>↑</label>
                      </div>
                    </td>
                    <td>
                      <input 
                        type="text"
                        value={charge.commentaire}
                        onChange={(e) => handleChargeChange(i, "commentaire", e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Mobile card layout */}
            <div className="charges-mobile">
              {formData.charges.map((charge, i) => (
                <div key={i} className="charge-card">
                  <div className="charge-card-header">
                    <div className="charge-card-number">{i + 1}</div>
                    <div className="height-selector" role="group" aria-label="Sélection de la hauteur">
                      <button
                        type="button"
                        aria-label="Hauteur basse"
                        aria-pressed={charge.hauteur === "bas"}
                        className={`height-btn ${charge.hauteur === "bas" ? 'selected' : ''}`}
                        onClick={() => handleChargeChange(i, "hauteur", charge.hauteur === "bas" ? "" : "bas")}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        aria-label="Hauteur moyenne"
                        aria-pressed={charge.hauteur === "moyen"}
                        className={`height-btn ${charge.hauteur === "moyen" ? 'selected' : ''}`}
                        onClick={() => handleChargeChange(i, "hauteur", charge.hauteur === "moyen" ? "" : "moyen")}
                      >
                        ↔
                      </button>
                      <button
                        type="button"
                        aria-label="Hauteur haute"
                        aria-pressed={charge.hauteur === "haut"}
                        className={`height-btn ${charge.hauteur === "haut" ? 'selected' : ''}`}
                        onClick={() => handleChargeChange(i, "hauteur", charge.hauteur === "haut" ? "" : "haut")}
                      >
                        ↑
                      </button>
                    </div>
                  </div>
                  <div className="charge-card-body">
                    <div className="charge-card-row">
                      <label>Substance</label>
                      <select 
                        value={charge.substance}
                        onChange={(e) => handleChargeChange(i, "substance", e.target.value)}
                      >
                        <option value="">-- Sélectionner --</option>
                        {substances.map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                    <div className="charge-card-inline">
                      <div className="charge-card-row">
                        <label>Quantité (g)</label>
                        <input 
                          type="text"
                          value={charge.quantite}
                          onChange={(e) => handleChargeChange(i, "quantite", e.target.value)}
                          placeholder="--"
                        />
                      </div>
                      <div className="charge-card-row">
                        <label>Commentaire</label>
                        <input 
                          type="text"
                          value={charge.commentaire}
                          onChange={(e) => handleChargeChange(i, "commentaire", e.target.value)}
                          placeholder="--"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
            
          {/* Wizard navigation for step 2 */}
          <div className="wizard-navigation">
            <button type="button" className="wizard-btn wizard-btn-prev" onClick={prevStep}>
              ← Précédent
            </button>
            <button type="button" className="wizard-btn wizard-btn-next" onClick={nextStep}>
              Suivant →
            </button>
          </div>
        </div>

          {/* Step 3: Description */}
          <div className={`wizard-step ${currentStep === 2 ? 'active' : ''}`}>
            <div className="section">
              <div className="section-title">📝 Description de l'exercice</div>
              <div className="description-box">
                <textarea 
                  name="description" 
                  rows="3"
                  value={formData.description}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n');
                    if (lines.length <= 3) {
                      handleChange(e);
                    }
                  }}
                  onKeyDown={(e) => {
                    const lines = formData.description.split('\n');
                    if (e.key === 'Enter' && lines.length >= 3) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Décrivez l'exercice..."
                />
              </div>
            </div>
            
            {/* Wizard navigation for step 3 */}
            <div className="wizard-navigation">
              <button type="button" className="wizard-btn wizard-btn-prev" onClick={prevStep}>
                ← Précédent
              </button>
              <button type="button" className="wizard-btn wizard-btn-next" onClick={nextStep}>
                Suivant →
              </button>
            </div>
          </div>

          {/* Step 4: Bilan */}
          <div className={`wizard-step ${currentStep === 3 ? 'active' : ''}`}>
            <div className="section section-bilan">
              <div className="section-title">💭 Bilan & observations</div>
              <div className="description-box bilan-box">
                <textarea 
                  name="bilan" 
                  rows="12"
                  value={formData.bilan}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n');
                    if (lines.length <= 9) {
                      handleChange(e);
                    }
                  }}
                  onKeyDown={(e) => {
                    const lines = formData.bilan.split('\n');
                    if (e.key === 'Enter' && lines.length >= 9) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Notez vos observations..."
                />
              </div>
            </div>
            
            {/* Wizard navigation for step 4 - with submit */}
            <div className="wizard-navigation">
              <button type="button" className="wizard-btn wizard-btn-prev" onClick={prevStep}>
                ← Précédent
              </button>
              <button type="submit" className="wizard-btn wizard-btn-submit">
                💾 Enregistrer
              </button>
            </div>
          </div>

          <div className="page-footer">monchien.berthel.me</div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-action btn-save">
            💾 Enregistrer
          </button>
          {isEdit && (
            <button type="button" className="btn-action btn-delete" onClick={handleDelete}>
              🗑️ Supprimer
            </button>
          )}
        </div>
      </form>
    </>
  );
};

export default RechercheForm;
