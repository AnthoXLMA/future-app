import React, { useState } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useLocation } from "react-router-dom";


const ChallengeForm = () => {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [cases, setCases] = useState(["", "", ""]);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [useAssistant, setUseAssistant] = useState(false)
  const location = useLocation();
  const castingId = location.state?.castingId;


  // --- Fonctions auxiliaires ---
  const handleCaseChange = (index, value) => {
    const newCases = [...cases];
    newCases[index] = value;
    setCases(newCases);
  };

  const handleAddCase = () => setCases([...cases, ""]);

  const handleRemoveCase = (index) => {
    if (cases.length <= 3) return;
    setCases(cases.filter((_, i) => i !== index));
  };

  const generateChallenge = async () => {
    const prompt = "Je veux créer un challenge romantique pour rencontrer une prétendante, avec 3 étapes.";
    try {
      const res = await fetch("http://localhost:5000/api/generate-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.challenge) setDescription(data.challenge);
    } catch (err) {
      console.error("Erreur génération challenge :", err);
    }
  };

  const handleSaveChallenge = async (castingId = null) => {
  const user = auth.currentUser;
  if (!user) {
    setMessage("Utilisateur non connecté");
    setSuccess(false);
    return;
  }

  if (!titre.trim() || !description.trim() || cases.some(c => !c.trim())) {
    setMessage("Tous les champs doivent être remplis et toutes les cases validées !");
    setSuccess(false);
    return;
  }

  try {
    const challengeRef = collection(db, "Challenges");
    await addDoc(challengeRef, {
      auteurId: user.uid,
      titre,
      description,
      cases,
      castingId: castingId || null, // <-- Ici on lie le challenge au casting si présent
      dateCreation: Timestamp.now(),
      dateLimite: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    });

    setMessage("Challenge créé avec succès !");
    setSuccess(true);
    setTitre("");
    setDescription("");
    setCases(["", "", ""]);
      } catch (err) {
        console.error(err);
        setMessage("Erreur lors de la création du challenge");
        setSuccess(false);
      }
    };


  // --- JSX unique return ---
  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-md mt-8">
      <h2 className="text-2xl font-bold mb-4">Créer un challenge</h2>

      {message && (
        <p className={`mb-4 p-2 rounded ${success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message}
        </p>
      )}

      <input
        type="text"
        placeholder="Titre du challenge"
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        className="w-full p-2 mb-3 border rounded"
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 mb-3 border rounded"
      />

      <label className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={useAssistant}
          onChange={(e) => setUseAssistant(e.target.checked)}
          className="mr-2"
        />
        Activer Assistant ChatGPT
      </label>

      {useAssistant && (
        <button
          type="button"
          onClick={generateChallenge}
          className="mb-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Générer description avec ChatGPT
        </button>
      )}

      <h4 className="font-semibold mb-2">Cases à valider</h4>
      {cases.map((c, i) => (
        <div key={i} className="flex mb-2">
          <input
            type="text"
            placeholder={`Case ${i + 1}`}
            value={c}
            onChange={(e) => handleCaseChange(i, e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          {cases.length > 3 && (
            <button
              onClick={() => handleRemoveCase(i)}
              className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Supprimer
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddCase}
        className="px-4 py-2 mb-3 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Ajouter une case
      </button>

      <h4 className="font-semibold mt-4 mb-2">Aperçu du challenge :</h4>
      <div className="mb-4 p-3 border rounded bg-gray-50">
        <p><strong>Titre :</strong> {titre || "–"}</p>
        <p><strong>Description :</strong> {description || "–"}</p>
        <p><strong>Cases :</strong></p>
        <ul className="list-disc list-inside">
          {cases.map((c, i) => <li key={i}>{c || "–"}</li>)}
        </ul>
      </div>

      <button
        onClick={handleSaveChallenge}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full"
      >
        Créer le challenge
      </button>
    </div>
  );
};

export default ChallengeForm;
