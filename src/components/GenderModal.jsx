import React, { useState } from "react";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import Modal from "./Modal";

const GenderModal = ({ isOpen, onClose, onSubmit }) => {
  const [selectedGender, setSelectedGender] = useState("");

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user || !selectedGender) return;

    try {
      await setDoc(
        doc(db, "Users", user.uid),
        {
          userId: user.uid,
          email: user.email,
          gender: selectedGender,
          createdAt: new Date(),
        },
        { merge: true }
      );

      // 👉 onSubmit vient de App.jsx et déclenche l’ouverture du ProfileSetup
      onSubmit(selectedGender);
      // onClose();
    } catch (err) {
      console.error("Erreur Firestore:", err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Quel est votre genre ?
        </h2>

        <div className="flex gap-6">
          {/* Choix Homme */}
          <div
            className={`flex flex-col items-center justify-center p-6 rounded-xl cursor-pointer transition-transform duration-200 ${
              selectedGender === "homme"
                ? "bg-purple-700 text-white scale-105"
                : "bg-gray-100 text-gray-800 hover:scale-105"
            }`}
            onClick={() => setSelectedGender("homme")}
          >
            🧑
            <span className="mt-2 font-semibold">Homme</span>
          </div>

          {/* Choix Femme */}
          <div
            className={`flex flex-col items-center justify-center p-6 rounded-xl cursor-pointer transition-transform duration-200 ${
              selectedGender === "femme"
                ? "bg-pink-500 text-white scale-105"
                : "bg-gray-100 text-gray-800 hover:scale-105"
            }`}
            onClick={() => setSelectedGender("femme")}
          >
            👩
            <span className="mt-2 font-semibold">Femme</span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selectedGender}
          className={`w-full py-3 rounded-lg font-semibold transition-colors ${
            selectedGender
              ? "bg-purple-600 text-white hover:bg-purple-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Confirmer
        </button>
      </div>
    </Modal>
  );
};

export default GenderModal;
