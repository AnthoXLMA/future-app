import React, { useEffect, useState, useRef } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where, doc, getDoc, setDoc } from "firebase/firestore";

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
      // 🔎 Récupérer le profil de l’utilisateur courant par userId
      const qUser = query(collection(db, "Profiles"), where("userId", "==", user.uid));
      const userSnap = await getDocs(qUser);

      if (userSnap.empty) {
        console.error("Profil utilisateur introuvable. Complétez d'abord votre profil !");
        setLoading(false);
        return;
      }

      const userProfile = userSnap.docs[0].data();
      setCurrentUserGender(userProfile.gender);

      // 🔄 Déterminer le genre recherché
      const targetGender = userProfile.gender === "homme" ? "femme" : "homme";

      // 🎯 Charger uniquement les profils du genre opposé
      const q = query(collection(db, "Profiles"), where("gender", "==", targetGender));
      const snapshot = await getDocs(q);

      const filteredProfiles = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(profile => profile.userId !== user.uid); // exclure soi-même

      setProfiles(filteredProfiles);
    } catch (err) {
      console.error("Erreur chargement profils:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchProfiles();
}, [user]);


  const handleAction = async (actionType, profile) => {
    if (!profile || !user) return;

    try {
      const inviteRef = doc(db, "Invites", `${user.uid}_${profile.id}`);
      const payload = {
        fromUserId: user.uid,
        toUserId: profile.id,
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

  const handleTouchStart = e => setDragStart(e.touches[0].clientX);
  const handleTouchMove = e => {
    if (dragStart !== null) setDragOffset(e.touches[0].clientX - dragStart);
  };
  const handleTouchEnd = () => {
    if (dragOffset > 100) handleAction("like", profiles[currentIndex]);
    else if (dragOffset < -100) handleAction("refuse", profiles[currentIndex]);
    else setDragOffset(0);
    setDragStart(null);
  };

  if (loading) return <p className="text-center mt-20 text-lg font-medium">Chargement des profils...</p>;
  if (!profiles.length) return <p className="text-center mt-20 text-lg font-medium">Aucun profil disponible.</p>;

  // HOMME → Carousel
  if (currentUserGender === "homme") {
    const profile = profiles[carouselIndex];
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <h2 className="text-xl font-bold mb-4">Profils féminins disponibles</h2>
        <div className="flex items-center w-full max-w-md space-x-2 overflow-x-auto scroll-smooth snap-x snap-mandatory">
          <button
            className="text-2xl px-2"
            onClick={() => setCarouselIndex((carouselIndex - 1 + profiles.length) % profiles.length)}
          >
            ⬅️
          </button>

          <div className="flex-shrink-0 w-80 h-[70vh] bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center snap-center">
            <img
              src={profile.photoCompleteUrl || "https://via.placeholder.com/300"}
              alt={profile.nom}
              className="w-full h-2/3 object-cover rounded-xl mb-4"
            />
            <div className="text-center space-y-1">
              <h3 className="text-lg font-semibold">{profile.nom}, {profile.age}</h3>
              <p className="text-sm text-gray-600">{profile.ville}</p>
              <p className="text-sm">Lifestyle: {profile.lifestyle}</p>
              <p className="text-sm">Valeurs: {profile.valeurs?.join(", ") || "—"}</p>
              <p className="text-sm">Ambitions: {profile.ambitions?.join(", ") || "—"}</p>
            </div>

            <div className="flex justify-around w-full mt-4 space-x-2">
              <button className="w-14 h-14 rounded-full bg-gray-400 flex items-center justify-center text-xl hover:scale-110"
                onClick={() => handleAction("pass", profile)}>⏭️</button>
              <button className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-xl hover:scale-110"
                onClick={() => handleAction("like", profile)}>❤️</button>
              <button className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-xl hover:scale-110"
                onClick={() => handleAction("invite", profile)}>💌</button>
              <button className="w-14 h-14 rounded-full bg-yellow-400 flex items-center justify-center text-xl hover:scale-110"
                onClick={() => handleAction("premium", profile)}>⭐</button>
            </div>
          </div>

          <button
            className="text-2xl px-2"
            onClick={() => setCarouselIndex((carouselIndex + 1) % profiles.length)}
          >
            ➡️
          </button>
        </div>
      </div>
    );
  }

  // FEMME → Swipe
  const profile = profiles[currentIndex];
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4">
      {currentIndex >= profiles.length ? (
        <p className="text-center text-lg font-medium">Plus de profils à swiper !</p>
      ) : (
        <div
          ref={swipeRef}
          className="w-11/12 max-w-md h-[70vh] bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center"
          style={{ transform: `translateX(${dragOffset}px)`, transition: dragStart ? "none" : "transform 0.3s" }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={profile.photoCompleteUrl || "https://via.placeholder.com/300"}
            alt={profile.nom}
            className="w-full h-2/3 object-cover rounded-xl mb-4"
          />
          <h3 className="text-lg font-semibold">{profile.nom}, {profile.age}</h3>
          <p className="text-sm text-gray-600">{profile.ville}</p>
          <p className="text-sm">Lifestyle: {profile.lifestyle}</p>
          <p className="text-sm">Valeurs: {profile.valeurs?.join(", ") || "—"}</p>
          <p className="text-sm">Ambitions: {profile.ambitions?.join(", ") || "—"}</p>

          <div className="flex justify-around w-full mt-4 space-x-2">
            <button
              className="w-14 h-14 rounded-full bg-blue-400 flex items-center justify-center text-xl hover:scale-110"
              onClick={() => handleAction("wink", profile)}>👋</button>
            <button
              className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-xl hover:scale-110"
              onClick={() => handleAction("like", profile)}>❤️</button>
            <button
              className="w-14 h-14 rounded-full bg-gray-400 flex items-center justify-center text-xl hover:scale-110"
              onClick={() => handleAction("refuse", profile)}>❌</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwipeProfiles;
