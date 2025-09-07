import React, { useState } from "react";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // 🔹 importer useNavigate

const ProfileSetup = () => {
  const [nom, setNom] = useState("");
  const [age, setAge] = useState("");
  const [ville, setVille] = useState("");
  const [lifestyle, setLifestyle] = useState("");
  const [valeurs, setValeurs] = useState("");
  const [ambitions, setAmbitions] = useState("");
  const [preferences, setPreferences] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate(); // 🔹 initialiser navigate

  const handleSaveProfile = async () => {
    const user = auth.currentUser;
    if (!user) {
      setMessage("Utilisateur non connecté");
      return;
    }

    try {
      const profilRef = doc(db, "Profiles", user.uid);
      await setDoc(profilRef, {
        profilId: user.uid,
        userId: user.uid,
        nom,
        age: parseInt(age),
        ville,
        lifestyle,
        valeurs: valeurs.split(",").map((v) => v.trim()),
        ambitions: ambitions.split(",").map((a) => a.trim()),
        preferencesMatrimoniales: preferences.split(",").map((p) => p.trim()),
        photoPartielleUrl: "",
        photoCompleteUrl: "",
        aspectsMisEnAvant: []
      });

      setMessage("Profil sauvegardé avec succès !");

      // 🔹 Redirection vers le dashboard
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la sauvegarde du profil");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "2rem" }}>
      {message && <p>{message}</p>}
      <input type="text" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} />
      <input type="number" placeholder="Âge" value={age} onChange={(e) => setAge(e.target.value)} />
      <input type="text" placeholder="Ville" value={ville} onChange={(e) => setVille(e.target.value)} />
      <input type="text" placeholder="Lifestyle" value={lifestyle} onChange={(e) => setLifestyle(e.target.value)} />
      <input type="text" placeholder="Valeurs (séparées par des virgules)" value={valeurs} onChange={(e) => setValeurs(e.target.value)} />
      <input type="text" placeholder="Ambitions (séparées par des virgules)" value={ambitions} onChange={(e) => setAmbitions(e.target.value)} />
      <input type="text" placeholder="Préférences matrimoniales (séparées par des virgules)" value={preferences} onChange={(e) => setPreferences(e.target.value)} />
      <button onClick={handleSaveProfile} style={{ marginTop: "1rem" }}>Sauvegarder le profil</button>
    </div>
  );
};

export default ProfileSetup;
