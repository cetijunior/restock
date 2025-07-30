// File: src/App.jsx
import { useEffect, useState } from "react";
import data from "./data/market_items.json";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaTrash, FaFilePdf, FaSearch, FaPlus, FaMinus, FaTimesCircle } from "react-icons/fa";
import MarketLogo from "./assets/MarketLogo.png";

import { useRef } from "react";


export default function App() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);

  // Modal state & logic variables (add inside App component below useState lines)
  const [showModal, setShowModal] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newBuyPrice, setNewBuyPrice] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [allItems, setAllItems] = useState([...data]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredItems(
      allItems.filter((item) =>
        item.name.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, allItems]);

  useEffect(() => {
    setFilteredItems(allItems);
  }, []);

  const handleAddNewProduct = () => {
    if (newProductName && newBuyPrice && newQuantity) {
      const item = {
        name: newProductName,
        buy_price: parseFloat(newBuyPrice),
        sell_price: 0,
      };
      setAllItems(prev => [...prev, item]);
      setSelectedItems(prev => [...prev, item]);
      setQuantities(prev => ({
        ...prev,
        [item.name]: parseInt(newQuantity)
      }));
      setShowModal(false);
      setNewProductName("");
      setNewBuyPrice("");
      setNewQuantity("");
    }
  };



  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredItems(
      data.filter((item) => item.name.toLowerCase().includes(term))
    );
  }, [searchTerm]);

  useEffect(() => {
    setFilteredItems(data);
  }, []);

  const toggleItem = (item) => {
    if (selectedItems.includes(item)) {
      setSelectedItems((prev) => prev.filter((i) => i !== item));
      setQuantities((prev) => {
        const copy = { ...prev };
        delete copy[item.name];
        return copy;
      });
    } else {
      setSelectedItems((prev) => [...prev, item]);
      setQuantities((prev) => ({ ...prev, [item.name]: 1 }));
    }
  };

  const updateQuantity = (item, change) => {
    setQuantities((prev) => {
      const newQty = Math.max((prev[item.name] || 1) + change, 1);
      return { ...prev, [item.name]: newQty };
    });
  };

  const setFixedQuantity = (item, amount) => {
    setQuantities((prev) => ({ ...prev, [item.name]: amount }));
  };

  const handleInputChange = (item, value) => {
    const num = parseInt(value);
    if (!isNaN(num) && num > 0) {
      setFixedQuantity(item, num);
    }
  };

  const clearAll = () => {
    setSelectedItems([]);
    setQuantities({});
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString();

    doc.setFontSize(18);
    doc.text("Lista e Produkteve për Furnizim", 14, 20);
    doc.setFontSize(12);
    doc.text(`Gjeneruar më: ${currentDate}`, 14, 28);

    const tableData = selectedItems.map((item) => [
      item.name,
      `${item.buy_price} L`,
      `${quantities[item.name] || 1}`,
      `${item.buy_price * (quantities[item.name] || 1)} L`
    ]);

    autoTable(doc, {
      head: [["Produkt", "Çmimi Blerjes", "Sasia", "Totali"]],
      body: tableData,
      startY: 35,
    });

    const totalAmount = selectedItems.reduce(
      (sum, item) => sum + item.buy_price * (quantities[item.name] || 1),
      0
    );

    doc.text(`Totali i Përgjithshëm: ${totalAmount} L`, 14, doc.lastAutoTable.finalY + 10);
    doc.save(`Furnizim_${currentDate.replace(/\//g, '-')}.pdf`);
  };

  const total = selectedItems.reduce(
    (sum, item) => sum + item.buy_price * (quantities[item.name] || 1),
    0
  );

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="min-h-screen bg-gray-100 pb-32 px-4 pt-6 text-lg">
      <div className="sticky top-0 bg-gray-100 z-40 pt-2 pb-4">
        <div className="flex justify-center items-center gap-4 mb-4 cursor-pointer" onClick={scrollToTop}>
          <img src={MarketLogo} alt="Market Logo" className="size-20 rounded-full" />
          <h1 className="text-3xl text-center font-bold">Market Lami Furnizim</h1>
        </div>

        <div className="max-w-md mx-auto mb-4 flex items-center gap-2 relative">
          <FaSearch className="text-gray-500 text-xl absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Kërko produkte..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-3 px-4 text-lg border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {searchTerm && (
            <FaTimesCircle
              className="text-gray-500 text-xl absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer hover:text-red-500"
              onClick={clearSearch}
            />
          )}
        </div>

        <div className="flex justify-center border-b-4 border-green-500 rounded-2xl pb-2 gap-4">
          <button
            onClick={clearAll}
            className="flex items-center gap-2 bg-red-500 text-white px-5 py-2 rounded-xl font-semibold shadow hover:bg-red-600"
          >
            <FaTrash /> Pastro
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl font-semibold shadow hover:bg-blue-700"
          >
            <FaFilePdf /> Eksporto
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-xl font-semibold shadow hover:bg-green-700"
          >
            <FaPlus /> Shto Produkt
          </button>

        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-6">
        {filteredItems.map((item, index) => {
          const isSelected = selectedItems.includes(item);
          return (
            <div
              key={index}
              onClick={() => toggleItem(item)}
              className={`cursor-pointer text-left rounded-2xl px-5 py-4 shadow-lg transition-transform duration-200 active:scale-95 ${isSelected ? "bg-green-200 border-2 border-green-600" : "bg-white border border-gray-300"}`}
            >
              <h2 className="font-bold text-xl mb-1">🛒 {item.name}</h2>
              <p className="text-gray-600 text-base">💵 Shitje: {item.sell_price} Lek</p>
              <p className="text-gray-800 text-xl font-semibold">📦 Blerje: {item.buy_price} Lek</p>

              {isSelected && (
                <div className="mt-4 space-y-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between bg-white border border-gray-300 rounded-lg px-3 py-2 gap-2">
                    <button onClick={() => updateQuantity(item, -1)} className="bg-red-500 text-white px-3 py-1 rounded-full text-lg">
                      <FaMinus />
                    </button>
                    <input
                      type="number"
                      value={quantities[item.name] || 1}
                      min={1}
                      onChange={(e) => handleInputChange(item, e.target.value)}
                      className="w-16 text-center border border-gray-300 rounded-md py-1 text-lg"
                    />
                    <button onClick={() => updateQuantity(item, 1)} className="bg-green-600 text-white px-3 py-1 rounded-full text-lg">
                      <FaPlus />
                    </button>
                  </div>
                  <div className="flex justify-center gap-2">
                    {[3, 5, 10].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setFixedQuantity(item, amt)}
                        className="bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded-full font-medium"
                      >
                        {amt}x
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 p-5 shadow-xl text-center z-50">
        <p className="text-2xl font-bold">
          🧮 Totali: <span className="text-green-700">{total} L</span>
        </p>
      </div>



      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md text-center space-y-4">
            <h2 className="text-xl font-bold">Shto Produkt të Ri</h2>
            <input
              type="text"
              placeholder="Emri i produktit"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded"
            />
            <input
              type="number"
              placeholder="Çmimi Blerjes"
              value={newBuyPrice}
              onChange={(e) => setNewBuyPrice(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded"
            />
            <input
              type="number"
              placeholder="Sasia"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded"
            />
            <div className="flex justify-between gap-4 pt-2">
              <button
                onClick={handleAddNewProduct}
                className="bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700"
              >
                Shto
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-2 rounded-xl font-semibold hover:bg-gray-400"
              >
                Anulo
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
} 