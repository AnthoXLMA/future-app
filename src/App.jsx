import React, { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Auth from "./components/Auth.jsx";
import ProfileSetup from "./components/ProfileSetup.jsx";
import ChallengeForm from "./components/ChallengeForm.jsx";
import ResponseForm from "./components/ResponseForm.jsx";
import DashboardHomme from "./components/DashboardHomme.jsx";
import DashboardFemme from "./components/DashboardFemme.jsx";
import InvitesList from "./components/InvitesList.jsx";
import InviteFormProfile from "./components/InviteFormProfile.jsx";
import GenderModal from "./components/GenderModal.jsx";
import SwipeProfiles from "./components/SwipeProfiles.jsx";
import Modal from "./components/Modal.jsx";
import SettingsModal from "./components/SettingsModal.jsx";

const App = () => {
  const [user, setUser] = useState(null);
  const [challengeId, setChallengeId] = useState(null);
  const [profileFemmeId, setProfileFemmeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userGender, setUserGender] = useState('gender');
  const [openModal, setOpenModal] = useState(null);

  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (userGender === "homme") navigate("/dashboard");
    else if (userGender === "femme") navigate("/dashboard-femme");
  }, [userGender, navigate]);

  if (loading) return <p className="text-center mt-20 text-lg font-medium">Chargement...</p>;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserGender(null);
      setOpenModal(null);
      navigate("/auth");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex justify-between items-center bg-gradient-to-r from-purple-700 to-blue-500 text-white p-4 shadow-md">
        <div className="text-xl font-bold">🌌 FUTURE</div>

        {user && (
          <div className="flex items-center space-x-4">
            <span className="font-semibold">{user.displayName || user.email}</span>

            <button
              onClick={() => setOpenModal("settings")}
              className="text-xl hover:text-purple-200 transition-transform transform hover:rotate-90"
              aria-label="Réglages"
            >
              ⚙️
            </button>

            <button
              onClick={() => setOpenModal("profile")}
              className="text-xl hover:text-purple-200"
              aria-label="Profil"
            >
              👤
            </button>

            <button
              onClick={handleSignOut}
              className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-md font-medium hover:bg-opacity-40 transition"
            >
              Se déconnecter
            </button>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 overflow-auto p-4">
        <Routes>
          {!user ? (
            <>
              <Route
                path="/auth"
                element={
                  <Auth
                    onSignUp={(newUser) => {
                      setUser(newUser);
                      setOpenModal("gender");
                    }}
                  />
                }
              />
              <Route path="*" element={<Navigate to="/auth" />} />
            </>
          ) : (
            <>
              <Route path="/profile" element={<ProfileSetup userGender={userGender} />} />
              <Route path="/dashboard" element={<DashboardHomme />} />
              <Route path="/dashboard-femme" element={<DashboardFemme />} />
              <Route path="/challenge" element={<ChallengeForm />} />
              <Route path="/response" element={<ResponseForm challengeId={challengeId} />} />
              <Route
                path="/invite"
                element={
                  profileFemmeId && challengeId ? (
                    <InviteFormProfile femmeId={profileFemmeId} challengeId={challengeId} />
                  ) : (
                    <p className="text-center text-gray-500 mt-10">Invitez des profils à vous rencontrer.</p>
                  )
                }
              />
              <Route path="/swipe" element={<SwipeProfiles currentUserGender={userGender} />} />
              <Route path="/invites" element={<InvitesList />} />
              <Route path="*" element={<Navigate to="/profile" />} />
            </>
          )}
        </Routes>
      </main>

      {/* ProfileSetup Modal */}
      <Modal isOpen={openModal === "profile"} onClose={() => setOpenModal(null)}>
        <ProfileSetup userGender={userGender} />
      </Modal>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={openModal === "settings"}
        onClose={() => setOpenModal(null)}
        userData={{ username: user?.displayName, email: user?.email }}
        onSave={(updatedData) => console.log("Profil mis à jour :", updatedData)}
      />

      {/* Gender Modal (optionnel) */}
      {openModal === "gender" && (
        <GenderModal
          isOpen
          onClose={() => setOpenModal(null)}
          onSubmit={(gender) => {
            setUserGender(gender);
            setOpenModal("profile");
          }}
        />
      )}

      {/* Bottom Navigation */}
      {/* Bottom Navigation */}
{user && (
  <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-t p-2 flex justify-around items-center rounded-t-xl">
    <button
      onClick={() => navigate("/dashboard")}
      className="flex flex-col items-center text-purple-700 hover:text-purple-900"
    >
      🏠<span className="text-xs">Dashboard</span>
    </button>

    <button
      onClick={() => navigate("/challenge")}
      className="flex flex-col items-center text-purple-700 hover:text-purple-900"
    >
      ✏️<span className="text-xs">Challenge</span>
    </button>

    <button
      onClick={() => {
        if (user?.premium) navigate("/casting");
        else alert("Création de casting réservée aux abonnés premium !");
      }}
      className={`flex flex-col items-center ${
        user?.premium ? "text-purple-700 hover:text-purple-900" : "text-gray-400 cursor-not-allowed"
      }`}
    >
      🎬<span className="text-xs">Casting</span>
    </button>

    <button
      onClick={() => navigate("/invite")}
      className="flex flex-col items-center text-purple-700 hover:text-purple-900"
    >
      💌<span className="text-xs">Inviter</span>
    </button>

    <button
      onClick={() => navigate("/response")}
      className="flex flex-col items-center text-purple-700 hover:text-purple-900"
    >
      📨<span className="text-xs">Réponses</span>
    </button>

    <button
      onClick={() => navigate("/swipe")}
      className="flex flex-col items-center text-purple-700 hover:text-purple-900"
    >
      🔄<span className="text-xs">Swipe</span>
    </button>
  </nav>
)}

    </div>
  );
};

export default App;
