// Auth.jsx
import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  // Inscription
  const handleSignUp = async () => {
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      console.log("Utilisateur créé :", userCredential.user);
    } catch (err) {
      setError(err.message);
    }
  };

  // Connexion
  const handleSignIn = async () => {
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      console.log("Utilisateur connecté :", userCredential.user);
    } catch (err) {
      setError(err.message);
    }
  };

  // Déconnexion
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      console.log("Utilisateur déconnecté");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "2rem" }}>
      {user ? (
        <div>
          <h2>Bienvenue, {user.email}</h2>
          <button onClick={handleSignOut}>Se déconnecter</button>
        </div>
      ) : (
        <div>
          <h2>Connexion / Inscription</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem" }}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={handleSignIn}>Connexion</button>
            <button onClick={handleSignUp}>Inscription</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
