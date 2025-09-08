import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import "../visuels/DashboardHomme.css";

const DashboardHomme = () => {
  const [responses, setResponses] = useState([]);
  const [castings, setCastings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // --- Récupérer les notifications ---
        const userRef = doc(db, "Users", user.uid);
        const userSnap = await getDocs(collection(db, "Users"));
        const userData = userSnap.docs.find(d => d.id === user.uid)?.data();
        setNotifications(userData?.notifications?.filter(n => !n.lu) || []);

        // --- Récupérer les castings ---
        const castingsRef = collection(db, "Castings");
        const qCastings = query(castingsRef, where("auteurId", "==", user.uid));
        const castingSnap = await getDocs(qCastings);
        const castingData = castingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCastings(castingData);

        // --- Récupérer les challenges liés à ces castings ---
        const challengesRef = collection(db, "Challenges");
        const challengeIds = [];
        for (let casting of castingData) {
          const qChallenges = query(challengesRef, where("castingId", "==", casting.id));
          const challengeSnap = await getDocs(qChallenges);
          challengeSnap.forEach(doc => challengeIds.push({ id: doc.id, ...doc.data(), castingId: casting.id }));
        }

        // --- Récupérer les réponses liées à ces challenges ---
        const responsesRef = collection(db, "Responses");
        const allResponses = [];
        for (let c of challengeIds) {
          const qRes = query(responsesRef, where("challengeId", "==", c.id));
          const resSnap = await getDocs(qRes);
          resSnap.forEach(doc => allResponses.push({ id: doc.id, ...doc.data(), challenge: c }));
        }
        setResponses(allResponses);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      <header className="dashboard-header">
        <p>Vos castings, challenges et candidates</p>
      </header>

      {/* --- Notifications --- */}
      {notifications.length > 0 && (
        <section className="notifications">
          <h3>🔔 Notifications</h3>
          <ul>
            {notifications.map((n, i) => (
              <li key={i}>
                {n.message} <span className="text-gray-500 text-sm">({n.date.toDate().toLocaleString()})</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <main className="dashboard-main">
        {castings.length === 0 && <p className="no-responses">Vous n'avez pas encore créé de casting.</p>}

        {castings.map((casting) => (
          <div key={casting.id} className="casting-card">
  <h3>{casting.titre} {casting.statut === "clos" && "(Clos)"}</h3>
  <p><strong>Description :</strong> {casting.description}</p>
  <p><strong>Date limite :</strong> {casting.dateLimite?.toDate().toLocaleDateString()}</p>
  <p><strong>Nombre max de participantes :</strong> {casting.nbMaxParticipants}</p>
  {casting.recompense && <p><strong>Récompense :</strong> {casting.recompense}</p>}

  <h4>Challenges :</h4>
  <ul>
    {casting.challenges?.map((cid) => {
      const ch = responses.find(r => r.challengeId === cid)?.challenge;
      return ch ? <li key={cid}>{ch.titre}</li> : null;
    })}
  </ul>

  <h4>Réponses reçues :</h4>
  {responses.filter(r => r.challenge.castingId === casting.id).length === 0 && <p>Aucune réponse pour ce casting.</p>}
  {responses.filter(r => r.challenge.castingId === casting.id).map((res) => (
    <div key={res.id} className="response-card">
      <div className="response-info">
        <p><strong>Candidate ID :</strong> {res.candidateId}</p>
        <p><strong>Challenge :</strong> {res.challenge.titre}</p>
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
        {casting.statut !== "clos" && res.statut === "valide" && (
          <button
            className="btn-reward"
            onClick={async () => {
              const castingRef = doc(db, "Castings", casting.id);
              await updateDoc(castingRef, { gagnanteId: res.candidateId, statut: "clos" });
              alert("Récompense attribuée ! Casting clos.");
            }}
          >
            Attribuer récompense 🏆
          </button>
        )}
      </div>
    </div>
  ))}
</div>

        ))}
      </main>

      <footer className="dashboard-footer">
        <p>© 2025 FUTURE - Tous droits réservés</p>
      </footer>
    </div>
  );
};

export default DashboardHomme;
