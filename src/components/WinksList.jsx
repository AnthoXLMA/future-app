import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WinksList = () => {
  const [winks, setWinks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWinks = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const q = query(
          collection(db, "Winks"),
          where("toUserId", "==", user.uid)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setWinks(data);
      } catch (err) {
        console.error("Erreur récupération winks :", err);
      }
    };

    fetchWinks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header avec retour */}
      <div className="flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-purple-600 hover:text-purple-800"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Retour
        </button>
      </div>

      <h1 className="text-xl font-bold text-gray-800 mb-4">
        😉 Clins d’œil reçus
      </h1>

      {winks.length === 0 ? (
        <p className="text-gray-500 italic text-center">
          Aucun clin d’œil pour le moment...
        </p>
      ) : (
        <ul className="space-y-3">
          {winks.map((wink) => (
            <li
              key={wink.id}
              className="bg-white rounded-xl shadow p-4 flex flex-col"
            >
              <p className="text-sm font-semibold text-gray-800">
                {wink.fromUserName || "Candidat(e) inconnu(e)"}
              </p>
              <p className="text-xs text-gray-500">
                {wink.date?.toDate
                  ? wink.date.toDate().toLocaleString()
                  : "Date inconnue"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WinksList;
