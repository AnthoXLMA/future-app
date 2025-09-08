import React, { useState, useEffect } from "react";
import { collection, addDoc, doc, getDoc, Timestamp, updateDoc, arrayUnion } from "firebase/firestore";
import { auth, db } from "../firebase";

const ResponseForm = ({ challengeId }) => {
  const [challenge, setChallenge] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // Charger le challenge depuis Firestore
  useEffect(() => {
    const fetchChallenge = async () => {
      if (!challengeId) return;
      try {
        const challengeRef = doc(db, "Challenges", challengeId);
        const snapshot = await getDoc(challengeRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setChallenge(data);
          setAnswers(data.cases.map(() => "")); // Initialiser les réponses
        } else {
          setMessage("Challenge introuvable");
        }
      } catch (err) {
        console.error(err);
        setMessage("Erreur lors du chargement du challenge");
      }
    };
    fetchChallenge();
  }, [challengeId]);

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      setMessage("Utilisateur non connecté");
      setSuccess(false);
      return;
    }

    // Validation : aucune réponse vide
    if (answers.some(a => !a.trim())) {
      setMessage("Veuillez remplir toutes les réponses avant de soumettre !");
      setSuccess(false);
      return;
    }

    try {
      const responsesRef = collection(db, "Responses");
      const caseObjects = answers.map((a) => ({
        nomCase: a,
        validee: false,
        pointsDeblocage: 10
      }));

      // Ajouter la réponse
      const responseDoc = await addDoc(responsesRef, {
        challengeId,
        candidateId: user.uid,
        texte: answers.join(" | "),
        casesValidees: [],
        statut: "en_attente",
        dateSoumission: Timestamp.now(),
        cases: caseObjects
      });

      setMessage("Réponses envoyées avec succès !");
      setSuccess(true);
      setAnswers(challenge.cases.map(() => ""));

      // --- Notification automatique à l’homme ---
      const auteurRef = doc(db, "Users", challenge.auteurId); // Assumons que les utilisateurs sont dans collection "Users"
      await updateDoc(auteurRef, {
        notifications: arrayUnion({
          type: "response",
          challengeId,
          responseId: responseDoc.id,
          candidateId: user.uid,
          message: `${user.email || user.uid} a répondu à votre challenge "${challenge.titre}"`,
          date: Timestamp.now(),
          lu: false
        })
      });

    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de l'envoi des réponses");
      setSuccess(false);
    }
  };

  if (!challenge) return <p className="text-center mt-4">Chargement du challenge...</p>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-md mt-8">
      <h2 className="text-2xl font-bold mb-4">Répondre au challenge : {challenge.titre}</h2>

      {message && (
        <p className={`mb-4 p-2 rounded ${success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message}
        </p>
      )}

      <p className="mb-4">{challenge.description}</p>

      {challenge.cases.map((c, i) => (
        <div key={i} className="mb-4">
          <label className="block font-semibold mb-1">Case {i + 1} :</label>
          <input
            type="text"
            placeholder={`Réponse à "${c}"`}
            value={answers[i]}
            onChange={(e) => handleAnswerChange(i, e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Envoyer les réponses
      </button>
    </div>
  );
};

export default ResponseForm;
