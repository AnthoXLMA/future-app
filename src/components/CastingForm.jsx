import React, { useState } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const CastingForm = () => {
  const navigate = useNavigate();
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [dateLimite, setDateLimite] = useState("");
  const [nbMaxParticipants, setNbMaxParticipants] = useState(5);
  const [recompense, setRecompense] = useState(""); // Champ optionnel
  const [message, setMessage] = useState("");
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(40);
  const [valeursRecherches, setValeursRecherches] = useState("");
  const [interetsRecherches, setInteretsRecherches] = useState("");
  const [objectifDeVie, setObjectifDeVie] = useState("");


  const handleSaveCasting = async () => {
    const user = auth.currentUser;
    if (!user) {
      setMessage("Utilisateur non connecté");
      return;
    }

    if (!titre || !description || !dateLimite) {
      setMessage("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      const castingRef = collection(db, "Castings");
      const castingDoc = await addDoc(castingRef, {
        auteurId: user.uid,
        titre,
        description,
        dateLimite: Timestamp.fromDate(new Date(dateLimite)),
        nbMaxParticipants,
        participants: [],
        statut: "en_cours",          // "en_cours", "termine", "annule"
        ageMin,
        ageMax,
        dateCreation: Timestamp.now(),
        challenges: [],               // Liste des challenges associés
        recompense: recompense || null,
        valeursRecherches: [],        // ex: ["famille", "humour", "ambition"]
        interetsRecherches: [],       // ex: ["lecture", "voyage", "sport"]
        objectifDeVie: null,          // ex: "mariage"
        typeCasting: "matrimonial",   // Type de casting pour filtrage
        niveauParticipation: "solo",  // ou "groupe" selon le format
        interactionsAutorisees: true, // si les candidates peuvent poser des questions
        trancheAge: `${ageMin}-${ageMax}`, // pour affichage simple
      });


      setMessage("Casting créé avec succès !");
      // Reset du formulaire
      setTitre("");
      setDescription("");
      setDateLimite("");
      setNbMaxParticipants(5);
      setRecompense("");

      // 🔹 Redirection vers ChallengeForm avec castingId
      navigate("/challenge", { state: { castingId: castingDoc.id } });

    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la création du casting.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-md shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4">Créer un Casting Matrimonial</h2>
      {message && <p className="mb-4 p-2 rounded bg-blue-100 text-blue-700">{message}</p>}

      <input
        type="text"
        placeholder="Titre du casting"
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />

      <textarea
        placeholder="Description du casting"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />

      <div className="mb-4">
        <label className="block font-semibold mb-1">Date limite :</label>
        <input
          type="date"
          value={dateLimite}
          onChange={(e) => setDateLimite(e.target.value)}
          className="p-2 border rounded"
        />
      </div>

      <div className="mb-4 flex gap-4">
        <div>
          <label className="block font-semibold mb-1">Âge minimum :</label>
          <input
            type="number"
            value={ageMin}
            onChange={(e) => setAgeMin(Number(e.target.value))}
            className="p-2 border rounded w-20"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Âge maximum :</label>
          <input
            type="number"
            value={ageMax}
            onChange={(e) => setAgeMax(Number(e.target.value))}
            className="p-2 border rounded w-20"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Nombre maximum de participants :</label>
        <input
          type="number"
          value={nbMaxParticipants}
          onChange={(e) => setNbMaxParticipants(Number(e.target.value))}
          className="p-2 border rounded w-20"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Valeurs recherchées (séparées par des virgules) :</label>
        <input
          type="text"
          placeholder="Ex: famille, humour, ambition"
          value={valeursRecherches}
          onChange={(e) => setValeursRecherches(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Centres d’intérêt (séparés par des virgules) :</label>
        <input
          type="text"
          placeholder="Ex: lecture, voyage, sport"
          value={interetsRecherches}
          onChange={(e) => setInteretsRecherches(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Objectif de vie :</label>
        <select
          value={objectifDeVie}
          onChange={(e) => setObjectifDeVie(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Sélectionner</option>
          <option value="mariage">Mariage</option>
          <option value="carriere">Carrière</option>
          <option value="voyage">Voyage</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Récompense (optionnel) :</label>
        <input
          type="text"
          placeholder="Ex: Dîner, cadeau, voyage..."
          value={recompense}
          onChange={(e) => setRecompense(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        type="button"
        onClick={handleSaveCasting}
        className="w-full py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
      >
        Créer le Casting
      </button>
    </div>
  );
};

export default CastingForm;
