import React, { useState } from "react";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal.jsx";

const ProfileSetup = ({ isOpen, onClose, userGender }) => {
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
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    const user = auth.currentUser;
    if (!user) {
      setMessage("Utilisateur non connecté");
      return;
    }

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
          updatedAt: new Date(),
        },
        { merge: true }
      );

      setMessage("Profil sauvegardé avec succès !");
      onClose();
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la sauvegarde du profil");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Complétez votre profil</h2>
        {message && <p className="text-green-600 text-center font-medium">{message}</p>}

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {errors.nom && <p className="text-red-500 text-sm">{errors.nom}</p>}

          <input
            type="number"
            placeholder="Âge"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}

          <input
            type="text"
            placeholder="Ville"
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {errors.ville && <p className="text-red-500 text-sm">{errors.ville}</p>}

          <input
            type="text"
            placeholder="Lifestyle"
            value={lifestyle}
            onChange={(e) => setLifestyle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <input
            type="text"
            placeholder="Valeurs (séparées par des virgules)"
            value={valeurs}
            onChange={(e) => setValeurs(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <input
            type="text"
            placeholder="Ambitions (séparées par des virgules)"
            value={ambitions}
            onChange={(e) => setAmbitions(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <input
            type="text"
            placeholder="Préférences matrimoniales (séparées par des virgules)"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <button
          onClick={handleSaveProfile}
          className="w-full py-3 mt-4 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors"
        >
          Sauvegarder le profil
        </button>
      </div>
    </Modal>
  );
};

export default ProfileSetup;
