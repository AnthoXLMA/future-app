import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";

import "../visuels/DashboardHomme.css";

const DashboardHomme = () => {
  const [responses, setResponses] = useState([]);
  const [castings, setCastings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [winks, setWinks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // --- Notifications existantes ---
        const userSnap = await getDocs(collection(db, "Users"));
        const userData = userSnap.docs.find(d => d.id === user.uid)?.data();
        setNotifications(userData?.notifications?.filter(n => !n.lu) || []);

        // --- Castings ---
        const castingsRef = collection(db, "Castings");
        const qCastings = query(castingsRef, where("auteurId", "==", user.uid));
        const castingSnap = await getDocs(qCastings);
        const castingData = castingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCastings(castingData);

        // --- Challenges ---
        const challengesRef = collection(db, "Challenges");
        const challengeIds = [];
        for (let casting of castingData) {
          const qChallenges = query(challengesRef, where("castingId", "==", casting.id));
          const challengeSnap = await getDocs(qChallenges);
          challengeSnap.forEach(doc => challengeIds.push({ id: doc.id, ...doc.data(), castingId: casting.id }));
        }

        // --- Responses ---
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

  // --- NOUVEAU : Listener temps réel pour les invites (wink / castRequest) ---
useEffect(() => {
  const user = auth.currentUser;
  if (!user) return;

  const q = query(
    collection(db, "Winks"),
    where("toUserId", "==", user.uid),
    where("lu", "==", false)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const newWinks = [];
    snapshot.docChanges().forEach(change => {
      if (change.type === "added") {
        const data = { id: change.doc.id, ...change.doc.data() };

        newWinks.push(data);
        toast(`😉 ${data.fromUserName || "Une candidate"} t’a envoyé un clin d’œil !`);
      }
    });

    if (newWinks.length > 0) {
      setWinks(prev => [...prev, ...newWinks]); // on ajoute aux winks existants
    }
  });

  return () => unsubscribe();
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
  <div className="min-h-screen bg-gray-100 p-6">
    <Toaster position="top-right" reverseOrder={false} />

    {/* --- Header --- */}
    <header className="mb-6">
      <h1 className="text-2xl font-bold text-gray-800">
        🎬 Dashboard Séduction
      </h1>
      <p className="text-gray-600">Vos castings, challenges et interactions</p>
    </header>

    {/* --- Statistiques --- */}
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white shadow rounded-2xl p-4 text-center">
        <p className="text-xl font-bold text-purple-600">{castings.length}</p>
        <p className="text-sm text-gray-500">Castings créés</p>
      </div>
      <div className="bg-white shadow rounded-2xl p-4 text-center">
        <p className="text-xl font-bold text-blue-600">{responses.length}</p>
        <p className="text-sm text-gray-500">Réponses reçues</p>
      </div>
      <div className="bg-white shadow rounded-2xl p-4 text-center">
        <p className="text-xl font-bold text-pink-600">{notifications.length}</p>
        <p className="text-sm text-gray-500">Notifications</p>
      </div>
      <div className="bg-white shadow rounded-2xl p-4 text-center">
        <Link to="/winks" className="block">
        <p className="text-xl font-bold text-yellow-600">{winks.length}</p>
        <p className="text-sm text-gray-500">Clins d’œil reçus</p>
        </Link>
      </div>
    </section>

    {/* --- Notifications --- */}
    {notifications.length > 0 && (
      <section className="bg-white rounded-2xl shadow p-4 mb-8">
        <h3 className="font-semibold text-gray-800 mb-2">🔔 Notifications</h3>
        <ul className="space-y-1">
          {notifications.map((n, i) => (
            <li key={i} className="text-sm text-gray-600">
              {n.message}{" "}
              <span className="text-gray-400 text-xs">
                ({n.date.toDate().toLocaleString()})
              </span>
            </li>
          ))}
        </ul>
      </section>
    )}

    {/* --- Castings --- */}
    <main className="space-y-6">
      {castings.length === 0 && (
        <p className="text-gray-500 italic">
          Vous n’avez pas encore créé de casting.
        </p>
      )}

      {castings.map((casting) => (
        <div
          key={casting.id}
          className="bg-white shadow rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {casting.titre}{" "}
            {casting.statut === "clos" && (
              <span className="text-red-500 text-sm">(Clos)</span>
            )}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {casting.description}
          </p>
          <p className="text-xs text-gray-500">
            📅 Jusqu’au{" "}
            {casting.dateLimite?.toDate().toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500">
            👥 {casting.nbMaxParticipants} participantes max
          </p>
          {casting.recompense && (
            <p className="text-xs text-yellow-600">
              🏆 Récompense : {casting.recompense}
            </p>
          )}

          {/* Challenges */}
          <div className="mt-3">
            <h4 className="font-semibold text-sm">Challenges :</h4>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {casting.challenges?.map((cid) => {
                const ch = responses.find(
                  (r) => r.challengeId === cid
                )?.challenge;
                return ch ? <li key={cid}>{ch.titre}</li> : null;
              })}
            </ul>
          </div>

          {/* Réponses */}
          <div className="mt-3">
            <h4 className="font-semibold text-sm">Réponses :</h4>
            {responses.filter(
              (r) => r.challenge.castingId === casting.id
            ).length === 0 && (
              <p className="text-xs text-gray-400">
                Aucune réponse pour ce casting.
              </p>
            )}
            <div className="space-y-3">
              {responses
                .filter((r) => r.challenge.castingId === casting.id)
                .map((res) => (
                  <div
                    key={res.id}
                    className="bg-gray-50 rounded-xl p-3 shadow-sm"
                  >
                    <p className="text-sm">
                      <strong>Candidature :</strong> {res.candidateId}
                    </p>
                    <p className="text-sm">
                      <strong>Challenge :</strong> {res.challenge.titre}
                    </p>
                    <p className="text-sm">
                      <strong>Réponse :</strong> {res.texte}
                    </p>
                    <p className="text-sm">
                      <strong>Statut :</strong> {res.statut}
                    </p>

                    {/* Actions */}
                    <div className="flex space-x-2 mt-2">
                      <button
                        className="px-2 py-1 bg-green-100 text-green-700 rounded"
                        onClick={() => handleLike(res.id, "excellent")}
                      >
                        Excellent ✅
                      </button>
                      <button
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded"
                        onClick={() =>
                          handleLike(res.id, "interessant")
                        }
                      >
                        Intéressant 👍
                      </button>
                      <button
                        className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded"
                        onClick={() => handleLike(res.id, "moyen")}
                      >
                        Moyen ⚖️
                      </button>
                      <button
                        className="px-2 py-1 bg-red-100 text-red-700 rounded"
                        onClick={() => handleDisqualify(res.id)}
                      >
                        Disqualifier ❌
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ))}
    </main>
  </div>
);
}

export default DashboardHomme;
