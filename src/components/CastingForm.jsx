import React, { useState } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc, Timestamp, doc, updateDoc } from "firebase/firestore";

const CastingForm = () => {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [challenges, setChallenges] = useState([
    { titre: "", description: "", cases: ["", "", ""] },
  ]);
  const [dateLimite, setDateLimite] = useState("");
  const [nbMaxParticipants, setNbMaxParticipants] = useState(5);
  const [recompense, setRecompense] = useState(""); // ✨ Nouveau champ récompense
  const [message, setMessage] = useState("");

  const handleChallengeChange = (index, field, value) => {
    const newChallenges = [...challenges];
    newChallenges[index][field] = value;
    setChallenges(newChallenges);
  };

  const handleCaseChange = (challengeIndex, caseIndex, value) => {
    const newChallenges = [...challenges];
    newChallenges[challengeIndex].cases[caseIndex] = value;
    setChallenges(newChallenges);
  };

  const addChallenge = () => {
    setChallenges([...challenges, { titre: "", description: "", cases: ["", "", ""] }]);
  };

  const addCase = (challengeIndex) => {
    const newChallenges = [...challenges];
    newChallenges[challengeIndex].cases.push("");
    setChallenges(newChallenges);
  };

  const handleSaveCasting = async () => {
    const user = auth.currentUser;
    if (!user) {
      setMessage("Utilisateur non connecté");
      return;
    }

    if (!titre || !description || !dateLimite || challenges.length === 0) {
      setMessage("Veuillez remplir tous les champs.");
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
        statut: "en_cours",
        dateCreation: Timestamp.now(),
        challenges: [],
        recompense: recompense || null, // ✨ Ajouter récompense ici (null si vide)
      });

      // Ajouter les challenges au casting
      const challengesRef = collection(db, "Challenges");
      for (let challenge of challenges) {
        const challengeDoc = await addDoc(challengesRef, {
          castingId: castingDoc.id,
          titre: challenge.titre,
          description: challenge.description,
          cases: challenge.cases,
          dateCreation: Timestamp.now(),
        });
        // Ajouter l'ID du challenge dans le casting
        await updateDoc(doc(db, "Castings", castingDoc.id), {
          challenges: [...(castingDoc.challenges || []), challengeDoc.id],
        });
      }

      setMessage("Casting créé avec succès !");
      // Reset
      setTitre("");
      setDescription("");
      setChallenges([{ titre: "", description: "", cases: ["", "", ""] }]);
      setDateLimite("");
      setNbMaxParticipants(5);
      setRecompense(""); // ✨ Reset récompense
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la création du casting.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-md shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4">Créer un Casting</h2>
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

      <div className="mb-4">
        <label className="block font-semibold mb-1">Nombre maximum de participantes :</label>
        <input
          type="number"
          value={nbMaxParticipants}
          onChange={(e) => setNbMaxParticipants(Number(e.target.value))}
          className="p-2 border rounded w-20"
        />
      </div>

      {/* ✨ Champ optionnel récompense */}
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

      <h3 className="text-xl font-semibold mb-2">Challenges :</h3>

      {challenges.map((challenge, i) => (
        <div key={i} className="mb-6 p-4 border rounded bg-gray-50">
          <input
            type="text"
            placeholder={`Titre du challenge ${i + 1}`}
            value={challenge.titre}
            onChange={(e) => handleChallengeChange(i, "titre", e.target.value)}
            className="w-full p-2 mb-2 border rounded"
          />
          <textarea
            placeholder={`Description du challenge ${i + 1}`}
            value={challenge.description}
            onChange={(e) => handleChallengeChange(i, "description", e.target.value)}
            className="w-full p-2 mb-2 border rounded"
          />
          <h4 className="font-semibold mb-1">Cases :</h4>
          {challenge.cases.map((c, j) => (
            <input
              key={j}
              type="text"
              placeholder={`Case ${j + 1}`}
              value={c}
              onChange={(e) => handleCaseChange(i, j, e.target.value)}
              className="w-full p-2 mb-2 border rounded"
            />
          ))}
          <button
            type="button"
            onClick={() => addCase(i)}
            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Ajouter une case
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addChallenge}
        className="px-4 py-2 mb-4 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Ajouter un challenge
      </button>

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
