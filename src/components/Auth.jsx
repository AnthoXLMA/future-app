import React, { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

const Auth = ({ onSignUp }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Inscription
  const handleSignUp = async () => {
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Utilisateur créé :", userCredential.user);

      if (onSignUp) {
        onSignUp(userCredential.user); // 🚀 ouvre GenderModal via App.jsx
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Connexion
  const handleSignIn = async () => {
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Utilisateur connecté !");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "2rem" }}>
      <h2>Connexion - Inscription</h2>
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
  );
};

export default Auth;
