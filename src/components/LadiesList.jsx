import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import "../visuels/LadiesList.css"; // On peut styliser le carousel ici

const LadiesList = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const q = query(collection(db, "Profiles"), where("gender", "==", "femme"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Profils féminins récupérés :", data); // debug
        setProfiles(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % profiles.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + profiles.length) % profiles.length);
  };

  if (loading) return <p>Chargement des profils...</p>;
  if (!profiles.length) return <p>Aucun profil féminin trouvé.</p>;

  const currentProfile = profiles[currentIndex];

  return (
    <div className="carousel-container">
      <button className="carousel-btn prev" onClick={handlePrev}>⬅️</button>

      <div className="carousel-card">
        <img
          src={currentProfile.photoCompleteUrl || "https://via.placeholder.com/300"}
          alt={currentProfile.nom}
        />
        <h3>{currentProfile.nom}, {currentProfile.age}</h3>
        <p>{currentProfile.ville}</p>
        <p>Lifestyle: {currentProfile.lifestyle}</p>
        <p>Valeurs: {currentProfile.valeurs.join(", ")}</p>
        <p>Ambitions: {currentProfile.ambitions.join(", ")}</p>
      </div>

      <button className="carousel-btn next" onClick={handleNext}>➡️</button>
    </div>
  );
};

export default LadiesList;
