// InvitesList.jsx
import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";


const InvitesList = () => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  const db = getFirestore();
  const user = auth.currentUser;

  useEffect(() => {
  // ton code
}, [auth, db]); // ajoute auth et db comme dépendances


  useEffect(() => {
    const fetchInvites = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const invitesRef = collection(db, "Invites");
        const q = query(invitesRef, where("femmeId", "==", user.uid), where("status", "==", "envoyé"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setInvites(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvites();
  }, []);

  const handleAccept = async (invite) => {
    try {
      const inviteRef = doc(db, "Invites", invite.id);
      await updateDoc(inviteRef, { status: "accepté" });

      // TODO: Débloquer challenge privilège pour cette candidate
      // Ajouter récompense à son profil / wallet / abonnement
      alert(`Challenge débloqué ! Récompense : ${JSON.stringify(invite.reward)}`);

      setInvites(invites.filter((i) => i.id !== invite.id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRefuse = async (invite) => {
    try {
      const inviteRef = doc(db, "Invites", invite.id);
      await updateDoc(inviteRef, { status: "refusé" });
      setInvites(invites.filter((i) => i.id !== invite.id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Chargement des invitations...</p>;
  if (invites.length === 0) return <p>Aucune invitation en attente.</p>;

  return (
    <div>
      <h2>Invitations reçues</h2>
      {invites.map((invite) => (
        <div key={invite.id} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
          <p><strong>{invite.message}</strong></p>
          <p>Récompense : {invite.reward.montant} €, Cadeau : {invite.reward.cadeauUrl}, Abonnement : {invite.reward.abonnement}</p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button onClick={() => handleAccept(invite)}>Accepter ✅</button>
            <button onClick={() => handleRefuse(invite)}>Refuser ❌</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InvitesList;
