import React, { useEffect, useState, useRef } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, getDoc, query, where, doc, setDoc } from "firebase/firestore";


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
        const qUser = query(collection(db, "Profiles"), where("userId", "==", user.uid));
        const userSnap = await getDocs(qUser);

        if (userSnap.empty) {
          console.error("Profil utilisateur introuvable !");
          setLoading(false);
          return;
        }

        const userProfile = userSnap.docs[0].data();
        setCurrentUserGender(userProfile.gender);

        const targetGender = userProfile.gender === "homme" ? "femme" : "homme";

        const q = query(collection(db, "Profiles"), where("gender", "==", targetGender));
        const snapshot = await getDocs(q);

        const filteredProfiles = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(profile => profile.userId !== user.uid);

        setProfiles(filteredProfiles);
      } catch (err) {
        console.error("Erreur chargement profils:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [user]);

  // ===================== ACTIONS =====================
//   const handleAction = async (actionType, profile) => {
//     if (!profile || !user) return; if (actionType === "wink")
//     return sendWink(profile);
//       if (actionType === "castRequest")
//     return requestCasting(profile, castingId);
//   try { const inviteRef = doc(db, "Invites", ${user.uid}_${profile.id});
//   const payload = { fromUserId: user.uid, toUserId: profile.id, action: actionType, date: new Date(), };
//   if (actionType === "premium") payload.reward = 10;
//   await setDoc(inviteRef, payload, { merge: true }); }
//   catch (err) { console.error(err); } if (currentUserGender === "femme") setCurrentIndex(prev => prev + 1);
//   else
//     setCarouselIndex(prev => (prev + 1) % profiles.length); setDragOffset(0);
// };
  const sendWink = async (profile) => {
  if (!profile || !user) return;
  try {
    const fromUserSnap = await getDoc(doc(db, "Users", user.uid));
    const fromUserData = fromUserSnap.exists() ? fromUserSnap.data() : {};
    const ref = doc(db, "Winks", `${user.uid}_${profile.id}`);
    await setDoc(ref, {
      fromUserId: user.uid,
      fromUserName: fromUserData.nom || "Une candidate",
      toUserId: profile.id,
      date: new Date(),
      lu: false,
    }, { merge: true });

    console.log("Clin d'œil envoyé !");
  } catch (err) {
    console.error("Erreur wink :", err);
  }

  // Passe au profil suivant
  setCurrentIndex(prev => prev + 1);
  setDragOffset(0);
};


  const requestCasting = async (profile, castingId) => {
  if (!profile || !user || !castingId) return;
  try {
    const ref = doc(db, "Invites", `${user.uid}_${profile.id}_cast_${castingId}`);
    await setDoc(ref, {
      fromUserId: user.uid,
      fromUserName: profile.nom,
      toUserId: profile.id,
      action: "castRequest",
      castingId,
      date: new Date(),
    }, { merge: true });

    console.log("Demande de participation au casting envoyée !");
  } catch (err) {
    console.error("Erreur casting :", err);
  }

  // Passe au profil suivant
  setCurrentIndex(prev => prev + 1);
  setDragOffset(0);
};

const handleRefuse = () => {
  setCurrentIndex(prev => prev + 1);
  setDragOffset(0);
};

  const handleTouchStart = e => setDragStart(e.touches[0].clientX);
  const handleTouchMove = e => {
    if (dragStart !== null) setDragOffset(e.touches[0].clientX - dragStart);
  };
  const handleTouchEnd = () => {
    if (dragOffset > 100) sendWink(profiles[currentIndex]); // swipe droite = wink
    else if (dragOffset < -100) setCurrentIndex(prev => prev + 1); // swipe gauche = passer
    setDragOffset(0);
    setDragStart(null);
  };

  if (loading) return <p className="text-center mt-20 text-lg font-medium">Chargement des profils...</p>;
  if (!profiles.length) return <p className="text-center mt-20 text-lg font-medium">Aucun profil disponible.</p>;

  // ===================== CÔTÉ HOMME =====================
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
                onClick={() => setCarouselIndex((carouselIndex + 1) % profiles.length)}>⏭️</button>
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

  // ===================== CÔTÉ FEMME =====================
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

        {/* Section Castings / Challenges */}
<div className="mt-2 text-left w-full bg-gray-50 p-2 rounded-lg">
  <h4 className="font-semibold text-sm">Castings & Challenges :</h4>

  {/* Castings */}
  {profile.castings?.length > 0 ? (
    profile.castings.map(c => (
      <p key={c.id} className="text-xs">
        🎬 <a
          href={c.link || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-600 hover:text-blue-800"
        >
          {c.title}
        </a>
        {c.startDate && c.endDate && (
          <> — du {new Date(c.startDate.seconds * 1000).toLocaleDateString()} au {new Date(c.endDate.seconds * 1000).toLocaleDateString()}</>
        )}
      </p>
    ))
  ) : (
    <p className="text-xs text-gray-500">Aucun casting en cours</p>
  )}

  {/* Challenges */}
  {profile.challenges?.length > 0 ? (
    profile.challenges.map(ch => (
      <p key={ch.id} className="text-xs">
        🏆 <a
          href={ch.link || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-green-600 hover:text-green-800"
        >
          {ch.title}
        </a> — {ch.status}
      </p>
    ))
  ) : (
    <p className="text-xs text-gray-500">Aucun challenge en cours</p>
  )}
</div>


        <div className="flex justify-around w-full mt-4 space-x-2">
          <button
            className="w-14 h-14 rounded-full bg-gray-400 flex items-center justify-center text-xl hover:scale-110"
            onClick={() => handleRefuse("refuse", profile)}
          >⏭️</button>
          <button
            className="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center text-xl hover:scale-110"
            onClick={() => requestCasting(profile)}
            title="Participer au casting"
          >📝</button>
          <button
            className="w-14 h-14 rounded-full bg-blue-400 flex items-center justify-center text-xl hover:scale-110"
            onClick={() => sendWink(profile)}
          >😉</button>
        </div>
      </div>
    )}
  </div>
  );
};

export default SwipeProfiles;
