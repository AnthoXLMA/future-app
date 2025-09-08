// src/components/SettingsModal.jsx
import React, { useState } from "react";
import "../visuels/SettingsModal.css";
import "../visuels/Modal.css";
import Modal from "./Modal.jsx";

const SettingsModal = ({ isOpen, onClose, userData, onSave }) => {
  const [username, setUsername] = useState(userData?.username || "");
  const [email, setEmail] = useState(userData?.email || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !email) return alert("Veuillez remplir tous les champs.");
    onSave({ username, email });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="settings-modal">
        <h2>Réglages du profil</h2>
        <form onSubmit={handleSubmit} className="settings-form">
          <label>
            Nom d'utilisateur
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Votre nom"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre email"
            />
          </label>
          <div className="settings-actions">
            <button type="submit">Enregistrer</button>
            <button type="button" onClick={onClose} className="cancel-button">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default SettingsModal;

