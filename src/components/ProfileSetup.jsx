import React, { useState } from "react";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal.jsx";
import "../visuels/ProfileSetup.css";

const ProfileSetup = ({ userGender }) => {
  const [nom, setNom] = useState("");
  const [age, setAge] = useState("");
  const [ville, setVille] = useState("");
  const [lifestyle, setLifestyle] = useState("");
  const [valeurs, setValeurs] = useState("");
  const [ambitions, setAmbitions] = useState("");
  const [preferences, setPreferences] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const validateForm = () => {
    let newErrors = {};

    if (!nom.trim()) newErrors.nom = "Le nom est obligatoire.";
    if (!age || isNaN(age) || parseInt(age) <= 0)
      newErrors.age = "Un âge valide est obligatoire.";
    if (!ville.trim()) newErrors.ville = "La ville est obligatoire.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // true si pas d'erreurs
  };

  const handleSaveProfile = async () => {
    const user = auth.currentUser;
    if (!user) {
      setMessage("Utilisateur non connecté");
      return;
    }

    // ✅ Validation avant Firestore
    if (!validateForm()) return;

    try {
      const profilRef = doc(db, "Profiles", user.uid);
      await setDoc(
        profilRef,
        {
          profilId: user.uid,
          userId: user.uid,
          nom,
          age: parseInt(age),
          ville,
          lifestyle,
          valeurs: valeurs.split(",").map((v) => v.trim()).filter(Boolean),
          ambitions: ambitions.split(",").map((a) => a.trim()).filter(Boolean),
          gender: userGender,
          preferencesMatrimoniales: preferences.split(",").map((p) => p.trim()).filter(Boolean),
          photoPartielleUrl: "",
          photoCompleteUrl: "",
          aspectsMisEnAvant: [],
          updatedAt: new Date()
        },
        { merge: true }
      );

      setMessage("Profil sauvegardé avec succès !");
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la sauvegarde du profil");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "2rem" }}>
      <h2>Complétez votre profil</h2>
      {message && <p>{message}</p>}

      <input
        type="text"
        placeholder="Nom"
        value={nom}
        onChange={(e) => setNom(e.target.value)}
        style={{ display: "block", marginBottom: "0.5rem", width: "100%" }}
      />
      {errors.nom && <p style={{ color: "red" }}>{errors.nom}</p>}

      <input
        type="number"
        placeholder="Âge"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        style={{ display: "block", marginBottom: "0.5rem", width: "100%" }}
      />
      {errors.age && <p style={{ color: "red" }}>{errors.age}</p>}

      <input
        type="text"
        placeholder="Ville"
        value={ville}
        onChange={(e) => setVille(e.target.value)}
        style={{ display: "block", marginBottom: "0.5rem", width: "100%" }}
      />
      {errors.ville && <p style={{ color: "red" }}>{errors.ville}</p>}

      <input
        type="text"
        placeholder="Lifestyle"
        value={lifestyle}
        onChange={(e) => setLifestyle(e.target.value)}
        style={{ display: "block", marginBottom: "0.5rem", width: "100%" }}
      />

      <input
        type="text"
        placeholder="Valeurs (séparées par des virgules)"
        value={valeurs}
        onChange={(e) => setValeurs(e.target.value)}
        style={{ display: "block", marginBottom: "0.5rem", width: "100%" }}
      />

      <input
        type="text"
        placeholder="Ambitions (séparées par des virgules)"
        value={ambitions}
        onChange={(e) => setAmbitions(e.target.value)}
        style={{ display: "block", marginBottom: "0.5rem", width: "100%" }}
      />

      <input
        type="text"
        placeholder="Préférences matrimoniales (séparées par des virgules)"
        value={preferences}
        onChange={(e) => setPreferences(e.target.value)}
        style={{ display: "block", marginBottom: "0.5rem", width: "100%" }}
      />

      <button
        onClick={handleSaveProfile}
        style={{
          marginTop: "1rem",
          padding: "0.7rem 1.5rem",
          backgroundColor: "#2575fc",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        Sauvegarder le profil
      </button>
    </div>
  );
};

export default ProfileSetup;
