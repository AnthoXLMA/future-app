// InviteFromProfile.jsx
import React, { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const InviteFromProfile = ({ femmeId, challengeId }) => {
  const [message, setMessage] = useState("");
  const [rewardAmount, setRewardAmount] = useState(0);
  const [rewardGift, setRewardGift] = useState("");
  const [rewardSubscription, setRewardSubscription] = useState("premium");
  const [statusMessage, setStatusMessage] = useState("");


  const handleSendInvite = async () => {
    const user = auth.currentUser;
    if (!user) {
      setStatusMessage("Utilisateur non connecté");
      return;
    }

    try {
      const invitesRef = collection(db, "Invites");
      await addDoc(invitesRef, {
        hommeId: user.uid,
        femmeId,
        challengeId,
        message: message || "Ken vous invite à répondre à un challenge !",
        type: "privilège",
        reward: {
          montant: rewardAmount,
          cadeauUrl: rewardGift,
          abonnement: rewardSubscription,
        },
        status: "envoyé",
        dateEnvoi: Timestamp.now()
      });
      setStatusMessage("Invitation envoyée avec succès !");
    } catch (err) {
      console.error(err);
      setStatusMessage("Erreur lors de l'envoi de l'invitation");
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem", marginTop: "1rem" }}>
      <h3>Inviter {femmeId} à un challenge privilège</h3>
      {statusMessage && <p>{statusMessage}</p>}

      <input
        type="text"
        placeholder="Message personnalisé"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: "100%", marginBottom: "0.5rem" }}
      />

      <input
        type="number"
        placeholder="Montant de la récompense (€)"
        value={rewardAmount}
        onChange={(e) => setRewardAmount(parseFloat(e.target.value))}
        style={{ width: "100%", marginBottom: "0.5rem" }}
      />

      <input
        type="text"
        placeholder="URL du cadeau"
        value={rewardGift}
        onChange={(e) => setRewardGift(e.target.value)}
        style={{ width: "100%", marginBottom: "0.5rem" }}
      />

      <select value={rewardSubscription} onChange={(e) => setRewardSubscription(e.target.value)} style={{ width: "100%", marginBottom: "0.5rem" }}>
        <option value="premium">Premium</option>
        <option value="standard">Standard</option>
      </select>

      <button onClick={handleSendInvite} style={{ marginTop: "0.5rem" }}>
        Envoyer le clin d’œil
      </button>
    </div>
  );
};

export default InviteFromProfile;
