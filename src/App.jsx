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

import "./visuels/BottomNav.css";
import "./App.css";

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
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (userGender === "homme") navigate("/dashboard");
    else if (userGender === "femme") navigate("/dashboard-femme");
  }, [userGender, navigate]);

  if (loading) return <p className="loading">Chargement...</p>;

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
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <h1>🌌 FUTURE</h1>
        </div>

        {user && (
          <div className="profile-actions">
            <span className="user-name" style={{ marginRight: "1rem", fontWeight: "bold" }}>
              {user.displayName || user.email}
            </span>

            <button onClick={() => setOpenModal("settings")} className="settings-icon" aria-label="Réglages">
              ⚙️
            </button>

            <button onClick={() => setOpenModal("profile")} className="profile-icon" aria-label="Profil" style={{ marginRight: "1rem" }}>
              👤
            </button>

            <button onClick={handleSignOut} className="logout-button">
              Se déconnecter
            </button>
          </div>
        )}
      </header>

      <main className="app-main">
        <Routes>
          {!user ? (
            <>
              <Route
                path="/auth"
                element={
                  <Auth
                    onSignUp={(newUser) => {
                      setUser(newUser);
                      setOpenModal("gender"); // ouvre GenderModal après inscription
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
                    <p>Invitez des profils à vous rencontrer.</p>
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

      {/* ProfileSetup modal */}
      <Modal isOpen={openModal === "profile"} onClose={() => setOpenModal(null)}>
        <ProfileSetup userGender={userGender} />
      </Modal>

      {/* Settings modal */}
      <SettingsModal
        isOpen={openModal === "settings"}
        onClose={() => setOpenModal(null)}
        userData={{ username: user?.displayName, email: user?.email }}
        onSave={(updatedData) => console.log("Profil mis à jour :", updatedData)}
      />

{/*     {openModal === "gender" && (
        <GenderModal
          isOpen
          onClose={() => setOpenModal(null)}
          onSubmit={(gender) => {
            setUserGender(gender);
            setOpenModal("profile");
          }}
        />
      )}}*/}

      {/* Bottom navigation */}
      {user && (
        <nav className="bottom-nav">
          <button onClick={() => navigate("/dashboard")} className="bottom-nav-button">🏠<span>Dashboard</span></button>
          <button onClick={() => navigate("/challenge")} className="bottom-nav-button">✏️<span>Challenge</span></button>
          <button onClick={() => navigate("/invite")} className="bottom-nav-button">💌<span>Inviter</span></button>
          <button onClick={() => navigate("/response")} className="bottom-nav-button">📨<span>Réponses</span></button>
          <button onClick={() => navigate("/swipe")} className="bottom-nav-button swipe">🔄<span>Swipe</span></button>
        </nav>
      )}
    </div>
  );
};

export default App;
