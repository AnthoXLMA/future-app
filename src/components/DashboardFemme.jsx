// DashboardFemme.jsx
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where, updateDoc, doc, arrayUnion } from "firebase/firestore";

const DashboardFemme = () => {
  const [castings, setCastings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid);
      fetchCastings();
    } else {
      setMessage("Veuillez vous connecter pour voir les castings.");
      setLoading(false);
    }
  }, []);

  const fetchCastings = async () => {
    try {
      const q = query(collection(db, "Castings"), where("statut", "==", "en_cours"));
      const querySnapshot = await getDocs(q);
      const castingsData = [];
      querySnapshot.forEach((doc) => {
        castingsData.push({ id: doc.id, ...doc.data() });
      });
      setCastings(castingsData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors du chargement des castings.");
      setLoading(false);
    }
  };

  const joinCasting = async (castingId) => {
    if (!userId) return;
    try {
      const castingRef = doc(db, "Castings", castingId);
      await updateDoc(castingRef, {
        participants: arrayUnion(userId),
      });
      setMessage("Vous avez rejoint le casting !");
      // Mise à jour locale pour l'UI
      setCastings(castings.map(c =>
        c.id === castingId ? { ...c, participants: [...(c.participants || []), userId] } : c
      ));
    } catch (err) {
      console.error(err);
      setMessage("Impossible de rejoindre le casting.");
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 mt-8">
      <h2 className="text-2xl font-bold mb-4">Castings ouverts</h2>
      {message && <p className="mb-4 p-2 rounded bg-blue-100 text-blue-700">{message}</p>}

      {castings.length === 0 ? (
        <p>Aucun casting ouvert pour le moment.</p>
      ) : (
        castings.map((casting) => (
          <div key={casting.id} className="mb-4 p-4 border rounded bg-gray-50">
            <h3 className="font-semibold">{casting.titre}</h3>
            <p>{casting.description}</p>
            <p>Date limite : {casting.dateLimite?.toDate().toLocaleDateString()}</p>
            <p>
              Participants : {casting.participants?.length || 0} / {casting.nbMaxParticipants}
            </p>
            {!casting.participants?.includes(userId) && (
              <button
                onClick={() => joinCasting(casting.id)}
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Rejoindre le casting
              </button>
            )}
            {casting.participants?.includes(userId) && (
              <span className="mt-2 inline-block px-3 py-1 bg-gray-200 rounded">Vous participez</span>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default DashboardFemme;
