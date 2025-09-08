import React, { useState, useEffect } from "react";
import { collection, addDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const ResponseForm = ({ challengeId }) => {
  const [challenge, setChallenge] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [message, setMessage] = useState("");


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
      return;
    }

    try {
      const responsesRef = collection(db, "Responses");
      const caseObjects = answers.map((a) => ({
        nomCase: a,
        validee: false,
        pointsDeblocage: 10
      }));

      await addDoc(responsesRef, {
        challengeId,
        candidateId: user.uid,
        texte: answers.join(" | "),
        casesValidees: [],
        statut: "en_attente",
        dateSoumission: Timestamp.now(), // 🔹 timestamp Firestore
        cases: caseObjects
      });

      setMessage("Réponses envoyées avec succès !");
      setAnswers(challenge.cases.map(() => ""));
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de l'envoi des réponses");
    }
  };

  if (!challenge) return <p>Chargement du challenge...</p>;

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "2rem" }}>
      <h2>Répondre au challenge : {challenge.titre}</h2>
      {message && <p>{message}</p>}
      <p>{challenge.description}</p>

      {challenge.cases.map((c, i) => (
        <div key={i} style={{ marginBottom: "1rem" }}>
          <label>Case {i + 1} :</label>
          <input
            type="text"
            placeholder={`Réponse à "${c}"`}
            value={answers[i]}
            onChange={(e) => handleAnswerChange(i, e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
      ))}

      <button onClick={handleSubmit}>Envoyer les réponses</button>
    </div>
  );
};

export default ResponseForm;
