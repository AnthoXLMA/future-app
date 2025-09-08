// src/components/GenderModal.jsx
import React, { useState } from "react";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import "../visuels/GenderModal.css";

const GenderModal = ({ isOpen, onClose, onSubmit }) => {
  const [selectedGender, setSelectedGender] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user || !selectedGender) return;

    try {
      // 🔥 Crée un doc minimal si pas encore existant
      await setDoc(
        doc(db, "Profiles", user.uid),
        {
          userId: user.uid,
          email: user.email,
          gender: selectedGender,
          createdAt: new Date(),
        },
        { merge: true } // ne pas écraser si déjà présent
      );

      onSubmit(selectedGender);
      onClose();
    } catch (err) {
      console.error("Erreur Firestore:", err);
    }
  };

  return (
    <div className="modal">
      <h2>Vous êtes ?</h2>
      <button onClick={() => setSelectedGender("homme")}>Un homme</button>
      <button onClick={() => setSelectedGender("femme")}>Une femme</button>
      <br />
      <button onClick={handleSubmit} disabled={!selectedGender}>
        Confirmer
      </button>
    </div>
  );
};

export default GenderModal;
