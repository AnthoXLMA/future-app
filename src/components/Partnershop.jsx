import React, { useState } from "react";

// Exemple catalogue partenaire
const partnerProducts = [
  {
    id: 1,
    title: "Dîner gastronomique",
    partner: "SmartBox",
    price: 80,
    description: "Un dîner pour deux dans un restaurant gastronomique",
    imageUrl: "https://via.placeholder.com/150",
    partnerProductId: "SB123",
  },
  {
    id: 2,
    title: "Nuit insolite",
    partner: "WonderBox",
    price: 150,
    description: "Une nuit dans un lieu insolite",
    imageUrl: "https://via.placeholder.com/150",
    partnerProductId: "WB456",
  },
];

const PartnerShop = ({ cart, setCart }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = partnerProducts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.partner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product) => {
    if (!cart.some((item) => item.id === product.id)) {
      setCart([...cart, product]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

return (
  <div className="mt-6">
    <label className="block mb-2 font-semibold text-gray-700">
      Rechercher des expériences partenaires :
    </label>
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Ex: SmartBox, WonderBox, Spa..."
      className="w-full p-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition mb-6 shadow-sm"
    />

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProducts.map((prod) => (
        <div
          key={prod.id}
          className="flex flex-col justify-between p-4 border rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:scale-105 h-full bg-white"
        >
          <div>
            <div className="w-full h-40 bg-gray-100 rounded-md overflow-hidden mb-3">
              <img
                src={prod.imageUrl}
                alt={prod.title}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="font-semibold text-gray-800 text-lg mb-1">{prod.title}</p>
            <p className="text-gray-600 text-sm line-clamp-3 mb-2">{prod.description}</p>
            <p className="font-bold text-purple-700 text-lg">{prod.price} €</p>
          </div>
          <button
            onClick={() => addToCart(prod)}
            className="mt-4 w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-indigo-600 transition"
          >
            Ajouter au panier
          </button>
        </div>
      ))}
    </div>

    {cart.length > 0 && (
      <div className="mt-6 p-4 border-t border-gray-200 bg-gray-50 rounded-xl shadow-inner">
        <h3 className="font-semibold text-gray-800 mb-3 text-lg">Panier</h3>
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center mb-2 px-2 py-1 bg-white rounded-lg shadow-sm"
          >
            <span className="text-gray-700">{item.title} ({item.partner})</span>
            <button
              onClick={() => removeFromCart(item.id)}
              className="text-red-500 font-bold hover:text-red-600 transition"
            >
              X
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);
}
export default PartnerShop;
