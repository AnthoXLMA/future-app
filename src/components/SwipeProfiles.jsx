import React, { useEffect, useState, useRef } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where, doc, setDoc } from "firebase/firestore";
import "../visuels/Swipe.css";

const SwipeProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentUserGender, setCurrentUserGender] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);

  const user = auth.currentUser;
  const swipeRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const fetchProfiles = async () => {
      try {
        const userSnap = await getDocs(collection(db, "Profiles"));
        const userProfile = userSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .find(p => p.id === user.uid);

        if (!userProfile) {
          console.error("Profil utilisateur introuvable");
          setLoading(false);
          return;
        }

        setCurrentUserGender(userProfile.gender);

        const targetGender = userProfile.gender === "homme" ? "femme" : "homme";

        const q = query(collection(db, "Profiles"), where("gender", "==", targetGender));
        const snapshot = await getDocs(q);

        const filteredProfiles = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(profile => profile.id !== user.uid);

        setProfiles(filteredProfiles);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [user]);

  const handleAction = async (actionType, profile) => {
    if (!profile || !user) return;

    try {
      const inviteRef = doc(db, "Invites", profile.id);
      const payload = {
        fromUserId: user.uid,
        action: actionType,
        date: new Date(),
      };

      if (actionType === "premium") payload.reward = 10;

      await setDoc(inviteRef, payload, { merge: true });
    } catch (err) {
      console.error(err);
    }

    if (currentUserGender === "femme") setCurrentIndex(prev => prev + 1);
    else setCarouselIndex(prev => (prev + 1) % profiles.length);
    setDragOffset(0);
  };

  // Gestion tactile pour swipe femmes
  const handleTouchStart = (e) => setDragStart(e.touches[0].clientX);
  const handleTouchMove = (e) => {
    if (dragStart !== null) setDragOffset(e.touches[0].clientX - dragStart);
  };
  const handleTouchEnd = () => {
    if (dragOffset > 100) handleAction("like", profiles[currentIndex]);
    else if (dragOffset < -100) handleAction("refuse", profiles[currentIndex]);
    else setDragOffset(0);
    setDragStart(null);
  };

  if (loading || !currentUserGender) return <p>Chargement des profils...</p>;
  if (!profiles.length) return <p>Aucun profil disponible.</p>;

  // HOMME → Carousel tactile
  if (currentUserGender === "homme") {
    const profile = profiles[carouselIndex];
    return (
      <div className="carousel-wrapper">
        <h2>Profils féminins disponibles</h2>
        <div className="carousel">
          <button onClick={() => setCarouselIndex((carouselIndex - 1 + profiles.length) % profiles.length)}>⬅️</button>
          <div className="carousel-card">
            <img src={profile.photoCompleteUrl || "https://via.placeholder.com/300"} alt={profile.nom} />
            <h3>{profile.nom}, {profile.age}</h3>
            <p>{profile.ville}</p>
            <p>Lifestyle: {profile.lifestyle}</p>
            <p>Valeurs: {profile.valeurs.join(", ")}</p>
            <p>Ambitions: {profile.ambitions.join(", ")}</p>
            <div className="swipe-buttons">
              <button className="swipe-btn pass" onClick={() => handleAction("pass")}>⏭️</button>
              <button className="swipe-btn like" onClick={() => handleAction("like")}>❤️</button>
              <button className="swipe-btn invite" onClick={() => handleAction("invite")}>💌</button>
              <button className="swipe-btn premium" onClick={() => handleAction("premium")}>⭐</button>
            </div>
          </div>
          <button onClick={() => setCarouselIndex((carouselIndex + 1) % profiles.length)}>➡️</button>
        </div>
      </div>
    );
  }

  // FEMME → Swipe tactile
  const profile = profiles[currentIndex];
  return (
    <div className="swipe-container">
      {currentIndex >= profiles.length ? (
        <p>Plus de profils à swiper !</p>
      ) : (
        <div
          className="profile-card"
          ref={swipeRef}
          style={{ transform: `translateX(${dragOffset}px)`, transition: dragStart ? "none" : "transform 0.3s" }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img src={profile.photoCompleteUrl || "https://via.placeholder.com/300"} alt={profile.nom} />
          <h3>{profile.nom}, {profile.age}</h3>
          <p>{profile.ville}</p>
          <p>Lifestyle: {profile.lifestyle}</p>
          <p>Valeurs: {profile.valeurs.join(", ")}</p>
          <p>Ambitions: {profile.ambitions.join(", ")}</p>

          <div className="swipe-buttons">
            <button onClick={() => handleAction("wink", profile)}>👋 Clin d’œil</button>
            <button onClick={() => handleAction("like", profile)}>❤️ Like</button>
            <button onClick={() => handleAction("refuse", profile)}>❌ Refuser</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwipeProfiles;
