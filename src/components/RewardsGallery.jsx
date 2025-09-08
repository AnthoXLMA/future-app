import React, { useState } from "react";

const gifts = [
  {
    id: 1,
    title: "Dîner romantique",
    description: "Un dîner dans un restaurant gastronomique pour deux.",
    icon: "🍽️",
    partnerUrl: "https://restaurant-partenaire.com/reservation",
    price: "80€",
    category: "restaurant",
  },
  {
    id: 2,
    title: "Nuit insolite",
    description: "Une nuit dans un lieu insolite à deux.",
    icon: "🏕️",
    partnerUrl: "https://restaurant-partenaire.com/reservation",
    price: "80€",
    category: "Hôtel",
  },
  {
    id: 3,
    title: "Bijou unique",
    description: "Un bijou artisanal et personnalisé.",
    icon: "💎",
    partnerUrl: "https://restaurant-partenaire.com/reservation",
    price: "80€",
    category: "Accessoires",
  },
  {
    id: 4,
    title: "Spa & bien-être",
    description: "Une journée spa pour se détendre et se ressourcer.",
    icon: "🛀",
    partnerUrl: "https://restaurant-partenaire.com/reservation",
    price: "80€",
    category: "Expériences",
  },
  {
    id: 5,
    title: "Coffret expérience",
    description: "Une activité originale au choix (pilotage, gastronomie…).",
    icon: "🎁",
    partnerUrl: "https://restaurant-partenaire.com/reservation",
    price: "80€",
    category: "Expérience",
  },
];


const RewardsGallery = ({ selectedRewards, setSelectedRewards }) => {
  const toggleReward = (gift) => {
    if (selectedRewards.some((r) => r.id === gift.id)) {
      setSelectedRewards(selectedRewards.filter((r) => r.id !== gift.id));
    } else {
      setSelectedRewards([...selectedRewards, gift]);
    }
  };

  return (
    <div className="mb-6">
      <p className="mb-3 font-semibold text-gray-700">Sélectionnez des récompenses :</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gifts.map((gift) => {
          const isSelected = selectedRewards.some((r) => r.id === gift.id);
          return (
            <div
              key={gift.id}
              onClick={() => toggleReward(gift)}
              className={`cursor-pointer p-4 rounded-xl border transition transform hover:scale-105 ${
                isSelected
                  ? "bg-purple-50 border-purple-400 shadow-lg"
                  : "bg-white border-gray-300 hover:shadow-md"
              }`}
            >
              <div className="text-3xl mb-2">{gift.icon}</div>
              <p className="font-semibold text-gray-800">{gift.title}</p>
              <p className="text-gray-600 text-sm">{gift.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RewardsGallery;
