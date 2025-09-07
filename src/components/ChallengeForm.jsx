import React, { useState } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";


const ChallengeForm = () => {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [cases, setCases] = useState(["", "", ""]);
  const [message, setMessage] = useState("");

  const handleCaseChange = (index, value) => {
    const newCases = [...cases];
    newCases[index] = value;
    setCases(newCases);
  };

  const handleAddCase = () => {
    setCases([...cases, ""]);
  };

  const handleSaveChallenge = async () => {
    const user = auth.currentUser;
    if (!user) {
      setMessage("Utilisateur non connecté");
      return;
    }

    try {
      const challengeRef = collection(db, "Challenges");
      await addDoc(challengeRef, {
        auteurId: user.uid,
        titre,
        description,
        cases,
        dateCreation: Timestamp.now(),
        dateLimite: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7 jours par défaut
      });
      setMessage("Challenge créé avec succès !");
      // Reset du formulaire
      setTitre("");
      setDescription("");
      setCases(["", "", ""]);
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la création du challenge");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "2rem" }}>
      <h2>Créer un challenge</h2>
      {message && <p>{message}</p>}
      <input type="text" placeholder="Titre du challenge" value={titre} onChange={(e) => setTitre(e.target.value)} style={{ width: "100%", marginBottom: "1rem" }} />
      <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: "100%", marginBottom: "1rem" }} />

      <h4>Cases à valider</h4>
      {cases.map((c, i) => (
        <input
          key={i}
          type="text"
          placeholder={`Case ${i + 1}`}
          value={c}
          onChange={(e) => handleCaseChange(i, e.target.value)}
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />
      ))}
      <button onClick={handleAddCase} style={{ marginBottom: "1rem" }}>Ajouter une case</button>
      <br />
      <button onClick={handleSaveChallenge}>Créer le challenge</button>
    </div>
  );
};

export default ChallengeForm;
