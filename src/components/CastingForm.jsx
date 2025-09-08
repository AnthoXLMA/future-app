import React, { useState } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import RewardsGallery from "./RewardsGallery";
import PartnerShop from "./Partnershop";

const CastingForm = () => {
  // -----------------------------
  // États
  // -----------------------------
  const navigate = useNavigate();
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [dateLimite, setDateLimite] = useState("");
  const [nbMaxParticipants, setNbMaxParticipants] = useState(5);
  const [recompense, setRecompense] = useState("");
  const [message, setMessage] = useState("");
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(40);
  const [valeursRecherches, setValeursRecherches] = useState("");
  const [interetsRecherches, setInteretsRecherches] = useState("");
  const [objectifDeVie, setObjectifDeVie] = useState("");
  const [selectedRewards, setSelectedRewards] = useState([]);
  const [cart, setCart] = useState([]);


const handleSaveCasting = async () => {
  console.log("Récompenses internes :", selectedRewards);
  console.log("Récompenses partenaires :", cart);
  const user = auth.currentUser;
  if (!user) {
    setMessage("Utilisateur non connecté");
    return;
  }

  if (!titre || !description || !dateLimite) {
    setMessage("Veuillez remplir tous les champs obligatoires.");
    return;
  }

  try {
    const castingRef = collection(db, "Castings");
    const castingDoc = await addDoc(castingRef, {
      auteurId: user.uid,
      titre,
      description,
      dateLimite: Timestamp.fromDate(new Date(dateLimite)),
      nbMaxParticipants,
      participants: [],
      statut: "en_cours",
      ageMin,
      ageMax,
      dateCreation: Timestamp.now(),
      challenges: [],
      recompense: {
        interne: selectedRewards.map(r => ({ id: r.id, title: r.title })),
        partenaires: cart.map(p => ({
          id: p.id,
          title: p.title,
          partner: p.partner,
          price: p.price,
          partnerProductId: p.partnerProductId
        }))
      },
      valeursRecherches: [],
      interetsRecherches: [],
      objectifDeVie: null,
      typeCasting: "matrimonial",
      niveauParticipation: "solo",
      interactionsAutorisees: true,
      trancheAge: `${ageMin}-${ageMax}`,
    });

    setMessage("Casting créé avec succès !");
    setTitre("");
    setDescription("");
    setDateLimite("");
    setNbMaxParticipants(5);
    setRecompense("");
    setSelectedRewards([]);
    setCart([]);

    alert("Casting sauvegardé ! Vérifie la console pour les données.");

    navigate("/challenge", { state: { castingId: castingDoc.id } });
  } catch (err) {
    console.error(err);
    setMessage("Erreur lors de la création du casting.");
  }
}
  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-xl mt-10 border border-gray-200">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-800">Créer un Casting</h2>

      {message && (
        <p className="mb-6 p-3 rounded-lg bg-indigo-50 text-indigo-700 font-medium">
          {message}
        </p>
      )}

      <input
        type="text"
        placeholder="Titre du casting"
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        className="w-full p-3 mb-5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
      />

      <textarea
        placeholder="Description du casting"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-3 mb-5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition resize-none"
      />

      <div className="mb-5 flex flex-col sm:flex-row sm:gap-4">
        <div className="flex-1">
          <label className="block mb-1 font-semibold text-gray-700">Date limite :</label>
          <input
            type="date"
            value={dateLimite}
            onChange={(e) => setDateLimite(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          />
        </div>

        <div className="flex-1 mt-4 sm:mt-0 flex gap-2">
          <div className="flex-1">
            <label className="block mb-1 font-semibold text-gray-700">Âge min :</label>
            <input
              type="number"
              value={ageMin}
              onChange={(e) => setAgeMin(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 font-semibold text-gray-700">Âge max :</label>
            <input
              type="number"
              value={ageMax}
              onChange={(e) => setAgeMax(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            />
          </div>
        </div>
      </div>

      <div className="mb-5">
        <label className="block mb-1 font-semibold text-gray-700">Nombre max de participants :</label>
        <input
          type="number"
          value={nbMaxParticipants}
          onChange={(e) => setNbMaxParticipants(Number(e.target.value))}
          className="w-28 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
        />
      </div>

      <div className="mb-5">
        <label className="block mb-1 font-semibold text-gray-700">Valeurs recherchées :</label>
        <input
          type="text"
          placeholder="Ex: famille, humour, ambition"
          value={valeursRecherches}
          onChange={(e) => setValeursRecherches(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
        />
      </div>

      <div className="mb-5">
        <label className="block mb-1 font-semibold text-gray-700">Centres d’intérêt :</label>
        <input
          type="text"
          placeholder="Ex: lecture, voyage, sport"
          value={interetsRecherches}
          onChange={(e) => setInteretsRecherches(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
        />
      </div>

      <div className="mb-5">
        <label className="block mb-1 font-semibold text-gray-700">Objectif de vie :</label>
        <select
          value={objectifDeVie}
          onChange={(e) => setObjectifDeVie(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
        >
          <option value="">Sélectionner</option>
          <option value="mariage">Mariage</option>
          <option value="carriere">Carrière</option>
          <option value="voyage">Voyage</option>
        </select>
      </div>
      <RewardsGallery
        selectedRewards={selectedRewards}
        setSelectedRewards={setSelectedRewards}
      />
      <PartnerShop cart={cart} setCart={setCart} />
      <button
        type="button"
        onClick={handleSaveCasting}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-2xl shadow-lg hover:scale-105 transition transform"
      >
        Créer le Casting
      </button>
    </div>
  );
};

export default CastingForm;
