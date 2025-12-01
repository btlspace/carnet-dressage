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
    const { name, value, type, checked } = e.target;
    
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

          <div className="info-row">
            <div className="info-item">
              <label>Date :</label>
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
              <div className="checkbox-group">
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
            </div>
          </div>

          <div className="info-row">
            <div className="info-item" style={{ width: "100%" }}>
              <label>🔍 Type de recherche :</label>
              <div className="checkbox-group">
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
                style={{ width: "80px" }}
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
                style={{ width: "80px" }}
              />
            </div>
          </div>

          <div className="section">
            <div className="section-title">📝 Description de l'exercice</div>
            <div className="description-box">
              <textarea 
                name="description" 
                rows="3"
                value={formData.description}
                onChange={(e) => {
                  // Limiter à 3 lignes
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
              />
            </div>
          </div>

          <div className="section">
            <div className="section-title">📦 Charges posées</div>
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
                    <td className="row-number" data-label="#">{i + 1}</td>
                    <td data-label={`Substance ${i + 1}`}>
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
                    <td data-label="Quantité">
                      <input 
                        type="text"
                        value={charge.quantite}
                        onChange={(e) => handleChargeChange(i, "quantite", e.target.value)}
                      />
                    </td>
                    <td data-label="Hauteur">
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
                    <td data-label="Commentaire">
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
          </div>

          <div className="section section-bilan">
            <div className="section-title">💭 Bilan & observations</div>
            <div className="description-box bilan-box">
              <textarea 
                name="bilan" 
                rows="12"
                value={formData.bilan}
                onChange={(e) => {
                  // Limiter à 9 lignes (hauteur du bilan-box)
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
              />
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
