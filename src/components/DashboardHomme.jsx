import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import "../visuels/DashboardHomme.css";

const DashboardHomme = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResponses = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const challengesRef = collection(db, "Challenges");
        const q = query(challengesRef, where("auteurId", "==", user.uid));
        const challengeSnapshot = await getDocs(q);
        const challengeIds = challengeSnapshot.docs.map((doc) => doc.id);

        const responsesRef = collection(db, "Responses");
        const allResponses = [];
        for (let cid of challengeIds) {
          const qRes = query(responsesRef, where("challengeId", "==", cid));
          const resSnap = await getDocs(qRes);
          resSnap.forEach((doc) => allResponses.push({ id: doc.id, ...doc.data() }));
        }
        setResponses(allResponses);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, []);

  const handleLike = async (responseId, classement) => {
    try {
      const responseRef = doc(db, "Responses", responseId);
      await updateDoc(responseRef, { statut: "valide", classement });
      setResponses(responses.map(r => r.id === responseId ? { ...r, statut: "valide", classement } : r));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDisqualify = async (responseId) => {
    try {
      const responseRef = doc(db, "Responses", responseId);
      await updateDoc(responseRef, { statut: "rejetee" });
      setResponses(responses.map(r => r.id === responseId ? { ...r, statut: "rejetee" } : r));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <p>Vos candidates et challenges</p>
      </header>

      {/* Responses List */}
      <main className="dashboard-main">
        {responses.length === 0 && <p className="no-responses">Aucune réponse reçue pour le moment.</p>}

        {responses.map((res, i) => (
          <div key={i} className="response-card">
            <div className="response-info">
              <p><strong>Candidate ID :</strong> {res.candidateId}</p>
              <p><strong>Challenge :</strong> {res.challengeId}</p>
              <p><strong>Réponses :</strong> {res.texte}</p>
              <p><strong>Statut :</strong> {res.statut}</p>

              {res.cases && (
                <ul className="cases-list">
                  {res.cases.map((c, idx) => (
                    <li key={idx}>
                      {c.nomCase} - {c.validee ? "✅ Validée" : "❌ Non validée"}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="response-actions">
              <button className="btn-excellent" onClick={() => handleLike(res.id, "excellent")}>Excellent ✅</button>
              <button className="btn-interessant" onClick={() => handleLike(res.id, "interessant")}>Intéressant 👍</button>
              <button className="btn-moyen" onClick={() => handleLike(res.id, "moyen")}>Moyen ⚖️</button>
              <button className="btn-disqualify" onClick={() => handleDisqualify(res.id)}>Disqualifier ❌</button>
            </div>
          </div>
        ))}
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>© 2025 FUTURE - Tous droits réservés</p>
      </footer>
    </div>
  );
};

export default DashboardHomme;
