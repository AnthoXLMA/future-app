// src/components/CastingsEnCours.jsx
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function CastingsEnCours() {
  const [castings, setCastings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCastings = async () => {
      try {
        const castingsRef = collection(db, "castings");
        // Récupère uniquement les castings en cours
        const q = query(castingsRef, where("statut", "==", "en_cours"));
        const snapshot = await getDocs(q);
        const castingsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCastings(castingsData);
      } catch (err) {
        console.error("Erreur lors de la récupération des castings :", err);
        setError("Impossible de charger les castings pour le moment.");
      } finally {
        setLoading(false);
      }
    };

    fetchCastings();
  }, []);

  if (loading) return <p className="text-center mt-8">Chargement des castings...</p>;
  if (error) return <p className="text-center mt-8 text-red-600">{error}</p>;
  if (castings.length === 0) return <p className="text-center mt-8">Aucun casting en cours pour le moment.</p>;

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Castings en cours</h2>
      {castings.map(casting => (
        <div key={casting.id} className="p-4 mb-4 border rounded shadow hover:shadow-md transition">
          <h3 className="font-bold text-lg">{casting.titre}</h3>
          <p className="text-gray-700 mt-1">{casting.description}</p>
          <p className="mt-2 text-sm text-gray-600">
            Âge requis : {casting.ageMin} - {casting.ageMax} ans
          </p>
          <p className="text-sm text-gray-600">
            Nombre max de participantes : {casting.nbMaxParticipants}
          </p>
          <p className="text-sm text-gray-600">
            Récompense : {casting.recompense || "Aucune"}
          </p>
          {casting.valeursRecherches?.length > 0 && (
            <p className="text-sm text-gray-600">
              Valeurs recherchées : {casting.valeursRecherches.join(", ")}
            </p>
          )}
          {casting.interetsRecherches?.length > 0 && (
            <p className="text-sm text-gray-600">
              Centres d’intérêt : {casting.interetsRecherches.join(", ")}
            </p>
          )}
          {casting.objectifDeVie && (
            <p className="text-sm text-gray-600">Objectif de vie : {casting.objectifDeVie}</p>
          )}
        </div>
      ))}
    </div>
  );
}
