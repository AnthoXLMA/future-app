// App.jsx
import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { Routes, Route, Navigate, Link } from "react-router-dom";

import Auth from "./components/Auth.jsx";
import ProfileSetup from "./components/ProfileSetup.jsx";
import ChallengeForm from "./components/ChallengeForm.jsx";
import ResponseForm from "./components/ResponseForm.jsx";
import DashboardHomme from "./components/DashboardHomme.jsx";
import InvitesList from "./components/InvitesList.jsx";
import InviteFormProfile from "./components/InviteFormProfile.jsx";

import "./App.css"; // CSS global pour l'app

const App = () => {
  const [user, setUser] = useState(null);
  const [challengeId, setChallengeId] = useState(null);
  const [profileFemmeId, setProfileFemmeId] = useState(null);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, [auth]);

  if (user === null) return <p className="loading">Chargement...</p>;

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <h1>🌌 FUTURE</h1>
        </div>
        {user && (
          <Link to="/profile" className="profile-icon">
            <span role="img" aria-label="profile">👤</span>
          </Link>
        )}
      </header>

      <main className="app-main">
        <Routes>
          {!user ? (
            <>
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<Navigate to="/auth" />} />
            </>
          ) : (
            <>
              <Route path="/profile" element={<ProfileSetup />} />
              <Route path="/dashboard" element={<DashboardHomme />} />
              <Route path="/challenge" element={<ChallengeForm />} />
              <Route path="/response" element={<ResponseForm challengeId={challengeId} />} />
              <Route path="/invite" element={
                profileFemmeId && challengeId ?
                  <InviteFormProfile femmeId={profileFemmeId} challengeId={challengeId} />
                  : <p>Invitez des profils à vous rencontrer.</p>
              }/>
              <Route path="/invites" element={<InvitesList />} />
              <Route path="*" element={<Navigate to="/profile" />} />
            </>
          )}
        </Routes>
      </main>

      {user && (
        <nav className="bottom-nav">
          <Link to="/dashboard">🏠 Dashboard</Link>
          <Link to="/challenge">✏️ Challenge</Link>
          <Link to="/invite">💌 Inviter</Link>
          <Link to="/response">📨 Réponses</Link>
        </nav>
      )}
    </div>
  );
};

export default App;
